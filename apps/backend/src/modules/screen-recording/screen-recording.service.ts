import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Repository } from 'typeorm';
import { Queue } from 'bull';
import {
  ScreenRecording,
  RecordingStatus,
  RecordingSource,
} from '../../database/entities/screen-recording.entity';
import { Video } from '../../database/entities/video.entity';

@Injectable()
export class ScreenRecordingService {
  constructor(
    @InjectRepository(ScreenRecording)
    private recordingRepository: Repository<ScreenRecording>,
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    @InjectQueue('recording-processing')
    private recordingQueue: Queue,
  ) {}

  async startRecording(
    userId: string,
    organizationId: string,
    data: {
      title: string;
      source: RecordingSource;
      includeAudio?: boolean;
      includeWebcam?: boolean;
      resolution?: string;
      frameRate?: number;
      metadata?: any;
    },
  ): Promise<ScreenRecording> {
    const recording = this.recordingRepository.create({
      userId,
      organizationId,
      title: data.title,
      source: data.source,
      status: RecordingStatus.RECORDING,
      includeAudio: data.includeAudio ?? true,
      includeWebcam: data.includeWebcam ?? false,
      resolution: data.resolution || '1080p',
      frameRate: data.frameRate || 30,
      metadata: data.metadata,
      startedAt: new Date(),
    });

    return this.recordingRepository.save(recording);
  }

  async pauseRecording(recordingId: string, userId: string): Promise<ScreenRecording> {
    const recording = await this.findUserRecording(recordingId, userId);

    if (recording.status !== RecordingStatus.RECORDING) {
      throw new ForbiddenException('Recording is not in progress');
    }

    recording.status = RecordingStatus.PAUSED;
    return this.recordingRepository.save(recording);
  }

  async resumeRecording(recordingId: string, userId: string): Promise<ScreenRecording> {
    const recording = await this.findUserRecording(recordingId, userId);

    if (recording.status !== RecordingStatus.PAUSED) {
      throw new ForbiddenException('Recording is not paused');
    }

    recording.status = RecordingStatus.RECORDING;
    return this.recordingRepository.save(recording);
  }

  async stopRecording(
    recordingId: string,
    userId: string,
    data: { rawVideoUrl: string; duration: number; fileSize: number },
  ): Promise<ScreenRecording> {
    const recording = await this.findUserRecording(recordingId, userId);

    recording.status = RecordingStatus.STOPPED;
    recording.stoppedAt = new Date();
    recording.rawVideoUrl = data.rawVideoUrl;
    recording.duration = data.duration;
    recording.fileSize = data.fileSize;

    const savedRecording = await this.recordingRepository.save(recording);

    // Queue processing
    await this.recordingQueue.add('process-recording', {
      recordingId: savedRecording.id,
      rawVideoUrl: data.rawVideoUrl,
    });

    return savedRecording;
  }

  async getRecording(recordingId: string): Promise<ScreenRecording> {
    const recording = await this.recordingRepository.findOne({
      where: { id: recordingId },
      relations: ['user', 'convertedVideo'],
    });

    if (!recording) {
      throw new NotFoundException('Recording not found');
    }

    return recording;
  }

  async getUserRecordings(
    userId: string,
    options: { limit?: number; offset?: number; status?: RecordingStatus },
  ): Promise<{ recordings: ScreenRecording[]; total: number }> {
    const { limit = 20, offset = 0, status } = options;

    const whereCondition: any = { userId };
    if (status) whereCondition.status = status;

    const [recordings, total] = await this.recordingRepository.findAndCount({
      where: whereCondition,
      relations: ['convertedVideo'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { recordings, total };
  }

  async convertToVideo(
    recordingId: string,
    userId: string,
    data: { title?: string; description?: string; publish?: boolean },
  ): Promise<{ message: string }> {
    const recording = await this.findUserRecording(recordingId, userId);

    if (recording.status !== RecordingStatus.READY) {
      throw new ForbiddenException('Recording is not ready for conversion');
    }

    await this.recordingQueue.add('convert-to-video', {
      recordingId,
      userId,
      organizationId: recording.organizationId,
      title: data.title || recording.title,
      description: data.description,
      publish: data.publish ?? false,
    });

    return { message: 'Conversion to video started' };
  }

  async updateRecordingStatus(
    recordingId: string,
    status: RecordingStatus,
    processedUrl?: string,
  ): Promise<ScreenRecording> {
    const recording = await this.recordingRepository.findOne({
      where: { id: recordingId },
    });

    if (!recording) {
      throw new NotFoundException('Recording not found');
    }

    recording.status = status;
    if (processedUrl) recording.processedVideoUrl = processedUrl;

    return this.recordingRepository.save(recording);
  }

  async linkToVideo(recordingId: string, videoId: string): Promise<ScreenRecording> {
    const recording = await this.recordingRepository.findOne({
      where: { id: recordingId },
    });

    if (!recording) {
      throw new NotFoundException('Recording not found');
    }

    recording.convertedVideoId = videoId;
    return this.recordingRepository.save(recording);
  }

  async deleteRecording(recordingId: string, userId: string): Promise<void> {
    const recording = await this.findUserRecording(recordingId, userId);
    await this.recordingRepository.delete({ id: recording.id });
  }

  private async findUserRecording(
    recordingId: string,
    userId: string,
  ): Promise<ScreenRecording> {
    const recording = await this.recordingRepository.findOne({
      where: { id: recordingId, userId },
    });

    if (!recording) {
      throw new NotFoundException('Recording not found');
    }

    return recording;
  }
}
