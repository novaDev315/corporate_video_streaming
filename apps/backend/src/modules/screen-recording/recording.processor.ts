import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { exec } from 'child_process';
import { promisify } from 'util';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScreenRecordingService } from './screen-recording.service';
import { RecordingStatus } from '../../database/entities/screen-recording.entity';
import { Video } from '../../database/entities/video.entity';

const execAsync = promisify(exec);

@Processor('recording-processing')
export class RecordingProcessor {
  constructor(
    private readonly screenRecordingService: ScreenRecordingService,
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
  ) {}

  @Process('process-recording')
  async handleProcessing(job: Job) {
    const { recordingId, rawVideoUrl } = job.data;

    try {
      await this.screenRecordingService.updateRecordingStatus(
        recordingId,
        RecordingStatus.PROCESSING,
      );

      await job.progress(10);

      // Process the recording (normalize audio, optimize, etc.)
      const processedUrl = await this.processRecording(rawVideoUrl, recordingId);

      await job.progress(90);

      await this.screenRecordingService.updateRecordingStatus(
        recordingId,
        RecordingStatus.READY,
        processedUrl,
      );

      await job.progress(100);

      return { success: true, recordingId, processedUrl };
    } catch (error) {
      console.error('Recording processing failed:', error);
      await this.screenRecordingService.updateRecordingStatus(
        recordingId,
        RecordingStatus.FAILED,
      );
      throw error;
    }
  }

  @Process('convert-to-video')
  async handleConvertToVideo(job: Job) {
    const { recordingId, userId, organizationId, title, description, publish } =
      job.data;

    try {
      const recording = await this.screenRecordingService.getRecording(recordingId);

      await job.progress(20);

      // Create video from recording
      const video = this.videoRepository.create({
        title,
        description,
        organizationId,
        uploadedById: userId,
        originalUrl: recording.processedVideoUrl || recording.rawVideoUrl,
        duration: recording.duration,
        status: publish ? 'published' : 'draft',
        source: 'screen_recording',
      });

      const savedVideo = await this.videoRepository.save(video);

      await job.progress(80);

      // Link recording to video
      await this.screenRecordingService.linkToVideo(recordingId, savedVideo.id);

      await job.progress(100);

      return { success: true, videoId: savedVideo.id };
    } catch (error) {
      console.error('Convert to video failed:', error);
      throw error;
    }
  }

  private async processRecording(
    rawVideoUrl: string,
    recordingId: string,
  ): Promise<string> {
    // In production, this would:
    // 1. Download the raw recording
    // 2. Normalize audio levels
    // 3. Optimize video encoding
    // 4. Upload to S3/CDN

    // For now, return a placeholder URL
    return `https://cdn.example.com/recordings/${recordingId}/processed.mp4`;
  }
}
