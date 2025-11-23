import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import { ClipsService } from './clips.service';
import { ClipStatus } from '../../database/entities/video-clip.entity';

const execAsync = promisify(exec);

@Processor('clip-generation')
export class ClipProcessor {
  constructor(private readonly clipsService: ClipsService) {}

  @Process('generate-clip')
  async handleClipGeneration(job: Job) {
    const { clipId, sourceVideoUrl, startTime, endTime } = job.data;

    try {
      await this.clipsService.updateClipStatus(clipId, ClipStatus.PROCESSING);

      const duration = endTime - startTime;
      const outputPath = path.join('/tmp', `clip_${clipId}.mp4`);
      const thumbnailPath = path.join('/tmp', `clip_thumb_${clipId}.jpg`);

      // Extract clip using FFmpeg
      await job.progress(10);

      const clipCommand = `ffmpeg -ss ${startTime} -i "${sourceVideoUrl}" -t ${duration} -c:v libx264 -c:a aac -strict experimental -y "${outputPath}"`;
      await execAsync(clipCommand);

      await job.progress(70);

      // Generate thumbnail from middle of clip
      const thumbTime = Math.floor(duration / 2);
      const thumbCommand = `ffmpeg -ss ${thumbTime} -i "${outputPath}" -vframes 1 -q:v 2 -y "${thumbnailPath}"`;
      await execAsync(thumbCommand);

      await job.progress(90);

      // In production, upload to S3/CloudFront
      const clipUrl = await this.uploadClip(outputPath, clipId);
      const thumbnailUrl = await this.uploadThumbnail(thumbnailPath, clipId);

      // Update clip with URLs
      await this.clipsService.updateClipStatus(
        clipId,
        ClipStatus.READY,
        clipUrl,
        thumbnailUrl,
      );

      // Clean up temp files
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      if (fs.existsSync(thumbnailPath)) fs.unlinkSync(thumbnailPath);

      await job.progress(100);

      return { success: true, clipId, clipUrl };
    } catch (error) {
      console.error('Clip generation failed:', error);
      await this.clipsService.updateClipStatus(clipId, ClipStatus.FAILED);
      throw error;
    }
  }

  private async uploadClip(filePath: string, clipId: string): Promise<string> {
    // In production, upload to S3
    return `https://cdn.example.com/clips/${clipId}/clip.mp4`;
  }

  private async uploadThumbnail(filePath: string, clipId: string): Promise<string> {
    // In production, upload to S3
    return `https://cdn.example.com/clips/${clipId}/thumbnail.jpg`;
  }
}
