import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { WatchHistory } from '../../database/entities/watch-history.entity';
import { Video } from '../../database/entities/video.entity';

@Injectable()
export class WatchHistoryService {
  constructor(
    @InjectRepository(WatchHistory)
    private watchHistoryRepository: Repository<WatchHistory>,
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
  ) {}

  async updateProgress(
    userId: string,
    videoId: string,
    data: {
      watchedSeconds: number;
      totalDuration?: number;
      deviceType?: string;
    },
  ): Promise<WatchHistory> {
    let history = await this.watchHistoryRepository.findOne({
      where: { userId, videoId },
    });

    const progressPercentage = data.totalDuration
      ? (data.watchedSeconds / data.totalDuration) * 100
      : history?.totalDuration
        ? (data.watchedSeconds / history.totalDuration) * 100
        : 0;

    const completed = progressPercentage >= 95;

    if (history) {
      history.watchedSeconds = data.watchedSeconds;
      history.progressPercentage = Math.min(progressPercentage, 100);
      history.completed = completed;
      history.lastWatchedAt = new Date();
      history.watchCount = history.watchCount + 1;
      if (data.totalDuration) history.totalDuration = data.totalDuration;
      if (data.deviceType) history.deviceType = data.deviceType;
    } else {
      history = this.watchHistoryRepository.create({
        userId,
        videoId,
        watchedSeconds: data.watchedSeconds,
        totalDuration: data.totalDuration || 0,
        progressPercentage: Math.min(progressPercentage, 100),
        completed,
        lastWatchedAt: new Date(),
        deviceType: data.deviceType,
      });
    }

    return this.watchHistoryRepository.save(history);
  }

  async getHistory(
    userId: string,
    options: { limit?: number; offset?: number; completed?: boolean },
  ): Promise<{ items: WatchHistory[]; total: number }> {
    const { limit = 20, offset = 0, completed } = options;

    const whereCondition: any = { userId };
    if (completed !== undefined) {
      whereCondition.completed = completed;
    }

    const [items, total] = await this.watchHistoryRepository.findAndCount({
      where: whereCondition,
      relations: ['video'],
      order: { lastWatchedAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { items, total };
  }

  async getContinueWatching(userId: string, limit = 10): Promise<WatchHistory[]> {
    return this.watchHistoryRepository.find({
      where: {
        userId,
        completed: false,
        progressPercentage: MoreThan(5),
      },
      relations: ['video'],
      order: { lastWatchedAt: 'DESC' },
      take: limit,
    });
  }

  async getResumePosition(userId: string, videoId: string): Promise<number> {
    const history = await this.watchHistoryRepository.findOne({
      where: { userId, videoId },
    });
    return history?.watchedSeconds || 0;
  }

  async markCompleted(userId: string, videoId: string): Promise<WatchHistory> {
    const history = await this.watchHistoryRepository.findOne({
      where: { userId, videoId },
    });

    if (!history) {
      throw new NotFoundException('Watch history not found');
    }

    history.completed = true;
    history.progressPercentage = 100;
    return this.watchHistoryRepository.save(history);
  }

  async clearHistory(userId: string): Promise<void> {
    await this.watchHistoryRepository.delete({ userId });
  }

  async removeFromHistory(userId: string, videoId: string): Promise<void> {
    await this.watchHistoryRepository.delete({ userId, videoId });
  }

  async getRecentlyWatched(userId: string, days = 7): Promise<WatchHistory[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.watchHistoryRepository.find({
      where: {
        userId,
        lastWatchedAt: MoreThan(since),
      },
      relations: ['video'],
      order: { lastWatchedAt: 'DESC' },
    });
  }
}
