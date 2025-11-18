import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoChapter } from '../../database/entities';

@Injectable()
export class ChaptersService {
  constructor(
    @InjectRepository(VideoChapter)
    private readonly chapterRepository: Repository<VideoChapter>,
  ) {}

  async findByVideo(videoId: string): Promise<VideoChapter[]> {
    return this.chapterRepository.find({
      where: { videoId },
      order: { order: 'ASC' },
    });
  }

  async create(createData: Partial<VideoChapter>): Promise<VideoChapter> {
    const chapter = this.chapterRepository.create(createData);
    return this.chapterRepository.save(chapter);
  }

  async update(
    id: string,
    updateData: Partial<VideoChapter>,
  ): Promise<VideoChapter> {
    await this.chapterRepository.update(id, updateData);
    return this.chapterRepository.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.chapterRepository.delete(id);
  }
}
