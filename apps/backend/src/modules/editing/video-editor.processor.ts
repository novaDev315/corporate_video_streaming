import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video, VideoEdit, EditOperation, VideoStatus } from '../../database/entities';
import { EditingService } from './editing.service';
import * as ffmpeg from 'fluent-ffmpeg';

@Processor('video-editing')
@Injectable()
export class VideoEditorProcessor {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    private readonly editingService: EditingService,
  ) {}

  @Process('process-edit')
  async handleEdit(job: Job) {
    const { editId, videoId, operation, parameters } = job.data;

    try {
      console.log(`Processing edit ${editId} with operation ${operation}`);

      // Update status to processing
      await this.editingService.updateEditProgress(editId, 0);

      let resultVideoId: string;

      switch (operation) {
        case EditOperation.TRIM:
          resultVideoId = await this.processTrim(videoId, parameters, editId);
          break;
        case EditOperation.CUT:
          resultVideoId = await this.processCut(videoId, parameters, editId);
          break;
        case EditOperation.MERGE:
          resultVideoId = await this.processMerge(parameters, editId);
          break;
        case EditOperation.ADD_INTRO:
          resultVideoId = await this.processAddIntro(videoId, parameters, editId);
          break;
        case EditOperation.ADD_OUTRO:
          resultVideoId = await this.processAddOutro(videoId, parameters, editId);
          break;
        case EditOperation.AUDIO_LEVEL:
          resultVideoId = await this.processAudioLevel(videoId, parameters, editId);
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      await this.editingService.completeEdit(editId, resultVideoId);

      console.log(`Edit ${editId} completed successfully`);
    } catch (error) {
      console.error(`Error processing edit ${editId}:`, error);
      await this.editingService.failEdit(editId, error.message);
      throw error;
    }
  }

  private async processTrim(
    videoId: string,
    parameters: any,
    editId: string,
  ): Promise<string> {
    const video = await this.videoRepository.findOne({ where: { id: videoId } });
    const { startTime, endTime, outputName } = parameters;

    // TODO: Implement actual FFmpeg trim
    // ffmpeg -i input.mp4 -ss START_TIME -to END_TIME -c copy output.mp4

    // Simulate processing
    await this.simulateProgress(editId);

    // Create new video record
    const newVideo = this.videoRepository.create({
      title: outputName || `${video.title} (Trimmed)`,
      description: `Trimmed from ${startTime}s to ${endTime}s`,
      orgId: video.orgId,
      createdById: video.createdById,
      status: VideoStatus.READY,
      duration: endTime - startTime,
    });

    const savedVideo = await this.videoRepository.save(newVideo);
    return savedVideo.id;
  }

  private async processCut(
    videoId: string,
    parameters: any,
    editId: string,
  ): Promise<string> {
    const video = await this.videoRepository.findOne({ where: { id: videoId } });
    const { cuts, outputName } = parameters;

    // TODO: Implement actual FFmpeg cut
    // Use filter_complex to remove sections

    await this.simulateProgress(editId);

    const newVideo = this.videoRepository.create({
      title: outputName || `${video.title} (Cut)`,
      description: `Cut ${cuts.length} sections`,
      orgId: video.orgId,
      createdById: video.createdById,
      status: VideoStatus.READY,
    });

    const savedVideo = await this.videoRepository.save(newVideo);
    return savedVideo.id;
  }

  private async processMerge(parameters: any, editId: string): Promise<string> {
    const { videoIds, outputName, transitions } = parameters;

    // TODO: Implement actual FFmpeg merge
    // ffmpeg -i input1.mp4 -i input2.mp4 -filter_complex concat output.mp4

    await this.simulateProgress(editId);

    const firstVideo = await this.videoRepository.findOne({
      where: { id: videoIds[0] },
    });

    const newVideo = this.videoRepository.create({
      title: outputName || 'Merged Video',
      description: `Merged ${videoIds.length} videos`,
      orgId: firstVideo.orgId,
      createdById: firstVideo.createdById,
      status: VideoStatus.READY,
    });

    const savedVideo = await this.videoRepository.save(newVideo);
    return savedVideo.id;
  }

  private async processAddIntro(
    videoId: string,
    parameters: any,
    editId: string,
  ): Promise<string> {
    const video = await this.videoRepository.findOne({ where: { id: videoId } });
    const { introVideoId, outputName } = parameters;

    // TODO: Implement actual FFmpeg concat
    await this.simulateProgress(editId);

    const newVideo = this.videoRepository.create({
      title: outputName || `${video.title} (with Intro)`,
      description: 'Video with intro added',
      orgId: video.orgId,
      createdById: video.createdById,
      status: VideoStatus.READY,
    });

    const savedVideo = await this.videoRepository.save(newVideo);
    return savedVideo.id;
  }

  private async processAddOutro(
    videoId: string,
    parameters: any,
    editId: string,
  ): Promise<string> {
    const video = await this.videoRepository.findOne({ where: { id: videoId } });
    const { outroVideoId, outputName } = parameters;

    // TODO: Implement actual FFmpeg concat
    await this.simulateProgress(editId);

    const newVideo = this.videoRepository.create({
      title: outputName || `${video.title} (with Outro)`,
      description: 'Video with outro added',
      orgId: video.orgId,
      createdById: video.createdById,
      status: VideoStatus.READY,
    });

    const savedVideo = await this.videoRepository.save(newVideo);
    return savedVideo.id;
  }

  private async processAudioLevel(
    videoId: string,
    parameters: any,
    editId: string,
  ): Promise<string> {
    const video = await this.videoRepository.findOne({ where: { id: videoId } });
    const { volume, normalize, outputName } = parameters;

    // TODO: Implement actual FFmpeg audio processing
    // ffmpeg -i input.mp4 -af "volume=2.0" output.mp4
    // or ffmpeg -i input.mp4 -af loudnorm output.mp4

    await this.simulateProgress(editId);

    const newVideo = this.videoRepository.create({
      title: outputName || `${video.title} (Audio Adjusted)`,
      description: normalize ? 'Audio normalized' : `Volume adjusted to ${volume}`,
      orgId: video.orgId,
      createdById: video.createdById,
      status: VideoStatus.READY,
    });

    const savedVideo = await this.videoRepository.save(newVideo);
    return savedVideo.id;
  }

  private async simulateProgress(editId: string) {
    // Simulate progress updates
    for (let i = 0; i <= 100; i += 20) {
      await this.editingService.updateEditProgress(editId, i);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}
