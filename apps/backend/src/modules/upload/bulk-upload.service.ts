import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video, VideoStatus } from '../../database/entities';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

interface BulkUploadJob {
  files: Array<{
    fileName: string;
    s3Key: string;
    title: string;
    description?: string;
    category?: string;
  }>;
  orgId: string;
  createdById: string;
}

@Injectable()
export class BulkUploadService {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    @InjectQueue('video-processing')
    private readonly videoQueue: Queue,
  ) {}

  async bulkUpload(uploadJob: BulkUploadJob) {
    const results = [];

    for (const file of uploadJob.files) {
      try {
        // Create video entry
        const video = this.videoRepository.create({
          title: file.title,
          description: file.description,
          category: file.category,
          s3Key: file.s3Key,
          orgId: uploadJob.orgId,
          createdById: uploadJob.createdById,
          status: VideoStatus.PROCESSING,
        });

        const savedVideo = await this.videoRepository.save(video);

        // Queue for processing
        await this.videoQueue.add('transcode', {
          videoId: savedVideo.id,
          s3Key: file.s3Key,
        });

        results.push({
          fileName: file.fileName,
          videoId: savedVideo.id,
          status: 'queued',
          success: true,
        });
      } catch (error) {
        results.push({
          fileName: file.fileName,
          status: 'failed',
          success: false,
          error: error.message,
        });
      }
    }

    return {
      total: uploadJob.files.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  }

  async getUploadProgress(jobId: string) {
    // Get job from queue
    const job = await this.videoQueue.getJob(jobId);

    if (!job) {
      return { status: 'not_found' };
    }

    return {
      status: await job.getState(),
      progress: job.progress(),
      data: job.data,
    };
  }
}
