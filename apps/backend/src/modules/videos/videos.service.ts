import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Video, VideoAnalytics, VideoStatus } from '../../database/entities';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    @InjectRepository(VideoAnalytics)
    private readonly analyticsRepository: Repository<VideoAnalytics>,
    @InjectQueue('video-processing')
    private readonly videoQueue: Queue,
  ) {}

  async findAll(
    orgId: string,
    filters: { category?: string; search?: string } = {},
  ): Promise<Video[]> {
    const where: any = { orgId };

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.search) {
      where.title = Like(`%${filters.search}%`);
    }

    return this.videoRepository.find({
      where,
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Video> {
    const video = await this.videoRepository.findOne({
      where: { id },
      relations: ['createdBy', 'organization'],
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    return video;
  }

  async create(createData: Partial<Video>): Promise<Video> {
    const video = this.videoRepository.create(createData);
    return this.videoRepository.save(video);
  }

  async update(id: string, updateData: Partial<Video>): Promise<Video> {
    await this.videoRepository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    // TODO: Delete from S3 as well
    await this.videoRepository.delete(id);
  }

  async processVideo(id: string) {
    const video = await this.findById(id);

    await this.videoRepository.update(id, {
      status: VideoStatus.PROCESSING,
    });

    // Add to processing queue
    await this.videoQueue.add('transcode', {
      videoId: id,
      s3Key: video.s3Key,
    });

    return { message: 'Video processing started' };
  }

  async trackView(
    videoId: string,
    userId: string,
    trackingData: {
      watchTime: number;
      completionPercentage: number;
      deviceType?: string;
    },
  ) {
    // Create or update analytics record
    const analytics = this.analyticsRepository.create({
      videoId,
      userId,
      ...trackingData,
    });

    await this.analyticsRepository.save(analytics);

    // Increment view count
    await this.videoRepository.increment({ id: videoId }, 'viewCount', 1);

    return { success: true };
  }
}
