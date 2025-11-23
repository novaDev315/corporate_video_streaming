import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In } from 'typeorm';
import { Video } from '../../database/entities/video.entity';
import { VideoTranscript } from '../../database/entities/video-transcript.entity';
import { VideoChapter } from '../../database/entities/video-chapter.entity';

interface SearchResult {
  type: 'video' | 'transcript' | 'chapter';
  videoId: string;
  video?: Video;
  match: string;
  timestamp?: number;
  score: number;
}

interface TranscriptMatch {
  text: string;
  startTime: number;
  endTime: number;
}

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    @InjectRepository(VideoTranscript)
    private transcriptRepository: Repository<VideoTranscript>,
    @InjectRepository(VideoChapter)
    private chapterRepository: Repository<VideoChapter>,
  ) {}

  async searchAll(
    organizationId: string,
    query: string,
    options: {
      limit?: number;
      offset?: number;
      includeTranscripts?: boolean;
      includeChapters?: boolean;
      category?: string;
      tags?: string[];
    },
  ): Promise<{ results: SearchResult[]; total: number }> {
    const {
      limit = 20,
      offset = 0,
      includeTranscripts = true,
      includeChapters = true,
      category,
      tags,
    } = options;

    const results: SearchResult[] = [];

    // Search videos (title, description)
    const videoResults = await this.searchVideos(organizationId, query, {
      category,
      tags,
    });
    results.push(...videoResults);

    // Search transcripts
    if (includeTranscripts) {
      const transcriptResults = await this.searchTranscripts(
        organizationId,
        query,
      );
      results.push(...transcriptResults);
    }

    // Search chapters
    if (includeChapters) {
      const chapterResults = await this.searchChapters(organizationId, query);
      results.push(...chapterResults);
    }

    // Sort by score and dedupe
    const sortedResults = results
      .sort((a, b) => b.score - a.score)
      .slice(offset, offset + limit);

    return { results: sortedResults, total: results.length };
  }

  async searchVideos(
    organizationId: string,
    query: string,
    filters?: { category?: string; tags?: string[] },
  ): Promise<SearchResult[]> {
    const queryBuilder = this.videoRepository
      .createQueryBuilder('video')
      .where('video.organizationId = :organizationId', { organizationId })
      .andWhere('video.status = :status', { status: 'published' })
      .andWhere(
        '(video.title ILIKE :query OR video.description ILIKE :query)',
        { query: `%${query}%` },
      );

    if (filters?.category) {
      queryBuilder.andWhere('video.category = :category', {
        category: filters.category,
      });
    }

    const videos = await queryBuilder.getMany();

    return videos.map((video) => {
      const titleMatch = video.title.toLowerCase().includes(query.toLowerCase());
      const score = titleMatch ? 100 : 50;

      return {
        type: 'video' as const,
        videoId: video.id,
        video,
        match: titleMatch ? video.title : video.description?.substring(0, 200) || '',
        score,
      };
    });
  }

  async searchTranscripts(
    organizationId: string,
    query: string,
  ): Promise<SearchResult[]> {
    const transcripts = await this.transcriptRepository
      .createQueryBuilder('transcript')
      .innerJoin('transcript.video', 'video')
      .where('video.organizationId = :organizationId', { organizationId })
      .andWhere('transcript.text ILIKE :query', { query: `%${query}%` })
      .leftJoinAndSelect('transcript.video', 'v')
      .getMany();

    return transcripts.map((transcript) => ({
      type: 'transcript' as const,
      videoId: transcript.videoId,
      video: transcript.video,
      match: this.extractMatchContext(transcript.text, query),
      timestamp: transcript.startTime,
      score: 70,
    }));
  }

  async searchChapters(
    organizationId: string,
    query: string,
  ): Promise<SearchResult[]> {
    const chapters = await this.chapterRepository
      .createQueryBuilder('chapter')
      .innerJoin('chapter.video', 'video')
      .where('video.organizationId = :organizationId', { organizationId })
      .andWhere(
        '(chapter.title ILIKE :query OR chapter.description ILIKE :query)',
        { query: `%${query}%` },
      )
      .leftJoinAndSelect('chapter.video', 'v')
      .getMany();

    return chapters.map((chapter) => ({
      type: 'chapter' as const,
      videoId: chapter.videoId,
      video: chapter.video,
      match: chapter.title,
      timestamp: chapter.startTime,
      score: 80,
    }));
  }

  async searchInVideo(
    videoId: string,
    query: string,
  ): Promise<TranscriptMatch[]> {
    const transcripts = await this.transcriptRepository.find({
      where: { videoId },
      order: { startTime: 'ASC' },
    });

    const matches: TranscriptMatch[] = [];
    const lowerQuery = query.toLowerCase();

    transcripts.forEach((t) => {
      if (t.text.toLowerCase().includes(lowerQuery)) {
        matches.push({
          text: t.text,
          startTime: t.startTime,
          endTime: t.endTime,
        });
      }
    });

    return matches;
  }

  async getSuggestions(
    organizationId: string,
    partialQuery: string,
    limit = 10,
  ): Promise<string[]> {
    const videos = await this.videoRepository.find({
      where: {
        organizationId,
        title: ILike(`%${partialQuery}%`),
        status: 'published',
      },
      select: ['title'],
      take: limit,
    });

    return videos.map((v) => v.title);
  }

  async getPopularSearches(organizationId: string): Promise<string[]> {
    // This would typically be tracked in a search analytics table
    // For now, return categories as popular searches
    const videos = await this.videoRepository
      .createQueryBuilder('video')
      .select('DISTINCT video.category', 'category')
      .where('video.organizationId = :organizationId', { organizationId })
      .andWhere('video.category IS NOT NULL')
      .getRawMany();

    return videos.map((v) => v.category).filter(Boolean);
  }

  private extractMatchContext(text: string, query: string): string {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    if (index === -1) return text.substring(0, 200);

    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + query.length + 50);

    let context = text.substring(start, end);
    if (start > 0) context = '...' + context;
    if (end < text.length) context = context + '...';

    return context;
  }
}
