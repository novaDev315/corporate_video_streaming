import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { VideoAnalytics } from '../../database/entities';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(VideoAnalytics)
    private readonly analyticsRepository: Repository<VideoAnalytics>,
  ) {}

  async getVideoAnalytics(videoId: string) {
    const analytics = await this.analyticsRepository.find({
      where: { videoId },
      relations: ['user'],
    });

    const totalViews = analytics.length;
    const uniqueViewers = new Set(analytics.map((a) => a.userId)).size;
    const totalWatchTime = analytics.reduce((sum, a) => sum + a.watchTime, 0);
    const avgCompletionRate =
      analytics.reduce((sum, a) => sum + a.completionPercentage, 0) /
      totalViews;

    return {
      totalViews,
      uniqueViewers,
      totalWatchTime,
      avgCompletionRate,
      deviceBreakdown: this.getDeviceBreakdown(analytics),
      topViewers: this.getTopViewers(analytics),
    };
  }

  async getOrganizationAnalytics(
    orgId: string,
    dateRange?: { startDate?: Date; endDate?: Date },
  ) {
    const where: any = {};

    if (dateRange?.startDate && dateRange?.endDate) {
      where.watchedAt = Between(dateRange.startDate, dateRange.endDate);
    }

    const analytics = await this.analyticsRepository.find({
      where,
      relations: ['video', 'user'],
    });

    // Filter by org
    const orgAnalytics = analytics.filter(
      (a) => a.video?.organization?.id === orgId,
    );

    const totalViews = orgAnalytics.length;
    const totalWatchTime = orgAnalytics.reduce(
      (sum, a) => sum + a.watchTime,
      0,
    );
    const uniqueViewers = new Set(orgAnalytics.map((a) => a.userId)).size;

    return {
      totalViews,
      totalWatchTime,
      uniqueViewers,
      avgWatchTime: totalWatchTime / totalViews,
      topVideos: this.getTopVideos(orgAnalytics),
    };
  }

  async getUserAnalytics(userId: string) {
    const analytics = await this.analyticsRepository.find({
      where: { userId },
      relations: ['video'],
      order: { watchedAt: 'DESC' },
    });

    const totalVideosWatched = analytics.length;
    const totalWatchTime = analytics.reduce((sum, a) => sum + a.watchTime, 0);
    const avgCompletionRate =
      analytics.reduce((sum, a) => sum + a.completionPercentage, 0) /
      totalVideosWatched;

    return {
      totalVideosWatched,
      totalWatchTime,
      avgCompletionRate,
      recentlyWatched: analytics.slice(0, 10),
    };
  }

  private getDeviceBreakdown(analytics: VideoAnalytics[]) {
    const devices = {};
    analytics.forEach((a) => {
      devices[a.deviceType] = (devices[a.deviceType] || 0) + 1;
    });
    return devices;
  }

  private getTopViewers(analytics: VideoAnalytics[]) {
    const viewers = {};
    analytics.forEach((a) => {
      if (!viewers[a.userId]) {
        viewers[a.userId] = { count: 0, totalWatchTime: 0 };
      }
      viewers[a.userId].count++;
      viewers[a.userId].totalWatchTime += a.watchTime;
    });

    return Object.entries(viewers)
      .sort(([, a]: any, [, b]: any) => b.totalWatchTime - a.totalWatchTime)
      .slice(0, 10);
  }

  private getTopVideos(analytics: VideoAnalytics[]) {
    const videos = {};
    analytics.forEach((a) => {
      if (!videos[a.videoId]) {
        videos[a.videoId] = { views: 0, watchTime: 0 };
      }
      videos[a.videoId].views++;
      videos[a.videoId].watchTime += a.watchTime;
    });

    return Object.entries(videos)
      .sort(([, a]: any, [, b]: any) => b.views - a.views)
      .slice(0, 10);
  }
}
