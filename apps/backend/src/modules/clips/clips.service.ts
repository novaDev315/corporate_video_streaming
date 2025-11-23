import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Repository } from 'typeorm';
import { Queue } from 'bull';
import { v4 as uuidv4 } from 'uuid';
import { VideoClip, ClipStatus, ClipVisibility } from '../../database/entities/video-clip.entity';
import { Video } from '../../database/entities/video.entity';

@Injectable()
export class ClipsService {
  constructor(
    @InjectRepository(VideoClip)
    private clipRepository: Repository<VideoClip>,
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    @InjectQueue('clip-generation')
    private clipQueue: Queue,
  ) {}

  async createClip(
    userId: string,
    data: {
      sourceVideoId: string;
      title: string;
      description?: string;
      startTime: number;
      endTime: number;
      visibility?: ClipVisibility;
    },
  ): Promise<VideoClip> {
    const video = await this.videoRepository.findOne({
      where: { id: data.sourceVideoId },
    });

    if (!video) {
      throw new NotFoundException('Source video not found');
    }

    const duration = data.endTime - data.startTime;

    if (duration <= 0) {
      throw new ForbiddenException('End time must be after start time');
    }

    if (duration > 300) {
      throw new ForbiddenException('Clip cannot exceed 5 minutes');
    }

    const clip = this.clipRepository.create({
      sourceVideoId: data.sourceVideoId,
      userId,
      title: data.title,
      description: data.description,
      startTime: data.startTime,
      endTime: data.endTime,
      duration,
      visibility: data.visibility || ClipVisibility.PRIVATE,
      shareToken: uuidv4(),
      status: ClipStatus.PENDING,
    });

    const savedClip = await this.clipRepository.save(clip);

    // Queue clip generation
    await this.clipQueue.add('generate-clip', {
      clipId: savedClip.id,
      sourceVideoUrl: video.originalUrl,
      startTime: data.startTime,
      endTime: data.endTime,
    });

    return savedClip;
  }

  async getClip(clipId: string): Promise<VideoClip> {
    const clip = await this.clipRepository.findOne({
      where: { id: clipId },
      relations: ['sourceVideo', 'user'],
    });

    if (!clip) {
      throw new NotFoundException('Clip not found');
    }

    return clip;
  }

  async getClipByShareToken(shareToken: string): Promise<VideoClip> {
    const clip = await this.clipRepository.findOne({
      where: { shareToken },
      relations: ['sourceVideo'],
    });

    if (!clip) {
      throw new NotFoundException('Clip not found');
    }

    if (clip.visibility === ClipVisibility.PRIVATE) {
      throw new ForbiddenException('This clip is private');
    }

    // Increment view count
    clip.viewCount += 1;
    await this.clipRepository.save(clip);

    return clip;
  }

  async getUserClips(
    userId: string,
    options: { limit?: number; offset?: number },
  ): Promise<{ clips: VideoClip[]; total: number }> {
    const { limit = 20, offset = 0 } = options;

    const [clips, total] = await this.clipRepository.findAndCount({
      where: { userId },
      relations: ['sourceVideo'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { clips, total };
  }

  async getVideoClips(videoId: string): Promise<VideoClip[]> {
    return this.clipRepository.find({
      where: {
        sourceVideoId: videoId,
        visibility: ClipVisibility.PUBLIC,
        status: ClipStatus.READY,
      },
      relations: ['user'],
      order: { viewCount: 'DESC' },
    });
  }

  async updateClip(
    clipId: string,
    userId: string,
    data: { title?: string; description?: string; visibility?: ClipVisibility },
  ): Promise<VideoClip> {
    const clip = await this.clipRepository.findOne({
      where: { id: clipId, userId },
    });

    if (!clip) {
      throw new NotFoundException('Clip not found');
    }

    if (data.title) clip.title = data.title;
    if (data.description !== undefined) clip.description = data.description;
    if (data.visibility) clip.visibility = data.visibility;

    return this.clipRepository.save(clip);
  }

  async deleteClip(clipId: string, userId: string): Promise<void> {
    const clip = await this.clipRepository.findOne({
      where: { id: clipId, userId },
    });

    if (!clip) {
      throw new NotFoundException('Clip not found');
    }

    await this.clipRepository.delete({ id: clipId });
  }

  async updateClipStatus(
    clipId: string,
    status: ClipStatus,
    clipUrl?: string,
    thumbnailUrl?: string,
  ): Promise<VideoClip> {
    const clip = await this.clipRepository.findOne({ where: { id: clipId } });

    if (!clip) {
      throw new NotFoundException('Clip not found');
    }

    clip.status = status;
    if (clipUrl) clip.clipUrl = clipUrl;
    if (thumbnailUrl) clip.thumbnailUrl = thumbnailUrl;

    return this.clipRepository.save(clip);
  }

  async incrementShareCount(clipId: string): Promise<void> {
    await this.clipRepository.increment({ id: clipId }, 'shareCount', 1);
  }

  async getShareUrl(clipId: string, userId: string): Promise<string> {
    const clip = await this.clipRepository.findOne({
      where: { id: clipId, userId },
    });

    if (!clip) {
      throw new NotFoundException('Clip not found');
    }

    await this.incrementShareCount(clipId);

    return `https://app.example.com/clips/share/${clip.shareToken}`;
  }
}
