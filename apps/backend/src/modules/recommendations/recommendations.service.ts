import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { WatchHistory } from '../../database/entities/watch-history.entity';
import { Video } from '../../database/entities/video.entity';
import { VideoBookmark } from '../../database/entities/video-bookmark.entity';
import { VideoAnalytics } from '../../database/entities/video-analytics.entity';

interface RecommendedVideo extends Video {
  score: number;
  reason: string;
}

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectRepository(WatchHistory)
    private watchHistoryRepository: Repository<WatchHistory>,
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    @InjectRepository(VideoBookmark)
    private bookmarkRepository: Repository<VideoBookmark>,
    @InjectRepository(VideoAnalytics)
    private analyticsRepository: Repository<VideoAnalytics>,
  ) {}

  async getPersonalizedRecommendations(
    userId: string,
    organizationId: string,
    limit = 10,
  ): Promise<RecommendedVideo[]> {
    // Get user's watch history
    const watchHistory = await this.watchHistoryRepository.find({
      where: { userId },
      relations: ['video'],
      order: { lastWatchedAt: 'DESC' },
      take: 50,
    });

    const watchedVideoIds = watchHistory.map((h) => h.videoId);
    const watchedCategories = new Map<string, number>();
    const watchedTags = new Map<string, number>();

    // Analyze user preferences
    watchHistory.forEach((h) => {
      if (h.video?.category) {
        watchedCategories.set(
          h.video.category,
          (watchedCategories.get(h.video.category) || 0) + 1,
        );
      }
      if (h.video?.tags) {
        h.video.tags.forEach((tag: string) => {
          watchedTags.set(tag, (watchedTags.get(tag) || 0) + 1);
        });
      }
    });

    // Get videos not yet watched
    const candidateVideos = await this.videoRepository.find({
      where: {
        organizationId,
        id: watchedVideoIds.length > 0 ? Not(In(watchedVideoIds)) : undefined,
        status: 'published',
      },
      take: 100,
    });

    // Score and rank videos
    const scoredVideos: RecommendedVideo[] = candidateVideos.map((video) => {
      let score = 0;
      let reason = '';

      // Category match
      if (video.category && watchedCategories.has(video.category)) {
        const categoryWeight = watchedCategories.get(video.category) || 0;
        score += categoryWeight * 10;
        reason = `Based on your interest in ${video.category}`;
      }

      // Tag matches
      if (video.tags) {
        video.tags.forEach((tag: string) => {
          if (watchedTags.has(tag)) {
            score += (watchedTags.get(tag) || 0) * 5;
            if (!reason) reason = `Similar to videos you've watched`;
          }
        });
      }

      // Recency boost
      const daysSincePublish =
        (Date.now() - new Date(video.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSincePublish < 7) {
        score += 20;
        if (!reason) reason = 'Recently published';
      }

      // Popularity boost
      if (video.viewCount > 100) {
        score += Math.min(video.viewCount / 10, 30);
        if (!reason) reason = 'Popular in your organization';
      }

      return { ...video, score, reason: reason || 'Recommended for you' };
    });

    // Sort by score and return top results
    return scoredVideos
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async getTrendingVideos(
    organizationId: string,
    limit = 10,
  ): Promise<Video[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get videos with most views in last 7 days
    const trending = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .select('analytics.videoId', 'videoId')
      .addSelect('COUNT(*)', 'viewCount')
      .where('analytics.createdAt > :since', { since: sevenDaysAgo })
      .groupBy('analytics.videoId')
      .orderBy('viewCount', 'DESC')
      .limit(limit)
      .getRawMany();

    if (trending.length === 0) {
      return this.videoRepository.find({
        where: { organizationId, status: 'published' },
        order: { viewCount: 'DESC' },
        take: limit,
      });
    }

    const videoIds = trending.map((t) => t.videoId);
    return this.videoRepository.find({
      where: { id: In(videoIds) },
    });
  }

  async getSimilarVideos(videoId: string, limit = 10): Promise<Video[]> {
    const video = await this.videoRepository.findOne({
      where: { id: videoId },
    });

    if (!video) return [];

    // Find videos with similar tags or category
    const query = this.videoRepository
      .createQueryBuilder('video')
      .where('video.id != :videoId', { videoId })
      .andWhere('video.organizationId = :orgId', { orgId: video.organizationId })
      .andWhere('video.status = :status', { status: 'published' });

    if (video.category) {
      query.andWhere('video.category = :category', { category: video.category });
    }

    return query.orderBy('video.viewCount', 'DESC').take(limit).getMany();
  }

  async getNewReleases(organizationId: string, limit = 10): Promise<Video[]> {
    return this.videoRepository.find({
      where: { organizationId, status: 'published' },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getMostWatched(organizationId: string, limit = 10): Promise<Video[]> {
    return this.videoRepository.find({
      where: { organizationId, status: 'published' },
      order: { viewCount: 'DESC' },
      take: limit,
    });
  }

  async getBasedOnBookmarks(userId: string, limit = 10): Promise<Video[]> {
    const bookmarks = await this.bookmarkRepository.find({
      where: { userId },
      relations: ['video'],
      take: 20,
    });

    if (bookmarks.length === 0) return [];

    const categories = bookmarks
      .map((b) => b.video?.category)
      .filter(Boolean) as string[];

    if (categories.length === 0) return [];

    const bookmarkedIds = bookmarks.map((b) => b.videoId);

    return this.videoRepository.find({
      where: {
        category: In(categories),
        id: Not(In(bookmarkedIds)),
        status: 'published',
      },
      order: { viewCount: 'DESC' },
      take: limit,
    });
  }
}
