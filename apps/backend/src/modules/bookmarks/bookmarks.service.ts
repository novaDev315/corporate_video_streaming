import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoBookmark } from '../../database/entities/video-bookmark.entity';
import { Video } from '../../database/entities/video.entity';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectRepository(VideoBookmark)
    private bookmarkRepository: Repository<VideoBookmark>,
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
  ) {}

  async addBookmark(
    userId: string,
    data: {
      videoId: string;
      note?: string;
      timestampSeconds?: number;
      collection?: string;
    },
  ): Promise<VideoBookmark> {
    const existing = await this.bookmarkRepository.findOne({
      where: { userId, videoId: data.videoId },
    });

    if (existing) {
      throw new ConflictException('Video already bookmarked');
    }

    const video = await this.videoRepository.findOne({
      where: { id: data.videoId },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    const bookmark = this.bookmarkRepository.create({
      userId,
      ...data,
    });

    return this.bookmarkRepository.save(bookmark);
  }

  async removeBookmark(userId: string, videoId: string): Promise<void> {
    const result = await this.bookmarkRepository.delete({ userId, videoId });
    if (result.affected === 0) {
      throw new NotFoundException('Bookmark not found');
    }
  }

  async getBookmarks(
    userId: string,
    options: { limit?: number; offset?: number; collection?: string },
  ): Promise<{ items: VideoBookmark[]; total: number }> {
    const { limit = 20, offset = 0, collection } = options;

    const whereCondition: any = { userId };
    if (collection) {
      whereCondition.collection = collection;
    }

    const [items, total] = await this.bookmarkRepository.findAndCount({
      where: whereCondition,
      relations: ['video'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { items, total };
  }

  async isBookmarked(userId: string, videoId: string): Promise<boolean> {
    const bookmark = await this.bookmarkRepository.findOne({
      where: { userId, videoId },
    });
    return !!bookmark;
  }

  async updateBookmark(
    userId: string,
    videoId: string,
    data: { note?: string; collection?: string },
  ): Promise<VideoBookmark> {
    const bookmark = await this.bookmarkRepository.findOne({
      where: { userId, videoId },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    if (data.note !== undefined) bookmark.note = data.note;
    if (data.collection !== undefined) bookmark.collection = data.collection;

    return this.bookmarkRepository.save(bookmark);
  }

  async getCollections(userId: string): Promise<string[]> {
    const result = await this.bookmarkRepository
      .createQueryBuilder('bookmark')
      .select('DISTINCT bookmark.collection', 'collection')
      .where('bookmark.userId = :userId', { userId })
      .andWhere('bookmark.collection IS NOT NULL')
      .getRawMany();

    return result.map((r) => r.collection);
  }

  async moveToCollection(
    userId: string,
    videoId: string,
    collection: string,
  ): Promise<VideoBookmark> {
    return this.updateBookmark(userId, videoId, { collection });
  }
}
