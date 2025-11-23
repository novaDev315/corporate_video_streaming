import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Repository } from 'typeorm';
import { Queue } from 'bull';
import { VideoChapter } from '../../database/entities/video-chapter.entity';
import { Video } from '../../database/entities/video.entity';
import { VideoTranscript } from '../../database/entities/video-transcript.entity';

@Injectable()
export class AutoChaptersService {
  constructor(
    @InjectRepository(VideoChapter)
    private chapterRepository: Repository<VideoChapter>,
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    @InjectRepository(VideoTranscript)
    private transcriptRepository: Repository<VideoTranscript>,
    @InjectQueue('chapter-generation')
    private chapterQueue: Queue,
  ) {}

  async generateChapters(
    videoId: string,
    options: {
      minChapterLength?: number;
      maxChapters?: number;
      useTranscript?: boolean;
    } = {},
  ): Promise<{ message: string; jobId: string }> {
    const video = await this.videoRepository.findOne({ where: { id: videoId } });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    // Get transcript if available and requested
    let transcript = null;
    if (options.useTranscript !== false) {
      const transcripts = await this.transcriptRepository.find({
        where: { videoId },
        order: { startTime: 'ASC' },
      });

      if (transcripts.length > 0) {
        transcript = transcripts.map((t) => ({
          text: t.text,
          startTime: t.startTime,
          endTime: t.endTime,
        }));
      }
    }

    const job = await this.chapterQueue.add('generate-chapters', {
      videoId,
      videoUrl: video.originalUrl,
      duration: video.duration,
      transcript,
      minChapterLength: options.minChapterLength || 60,
      maxChapters: options.maxChapters || 10,
    });

    return { message: 'Chapter generation started', jobId: job.id.toString() };
  }

  async saveChapter(data: {
    videoId: string;
    title: string;
    startTime: number;
    endTime?: number;
    description?: string;
    thumbnailUrl?: string;
  }): Promise<VideoChapter> {
    // Get max order
    const lastChapter = await this.chapterRepository.findOne({
      where: { videoId: data.videoId },
      order: { orderIndex: 'DESC' },
    });

    const chapter = this.chapterRepository.create({
      ...data,
      orderIndex: (lastChapter?.orderIndex || 0) + 1,
    });

    return this.chapterRepository.save(chapter);
  }

  async getChapters(videoId: string): Promise<VideoChapter[]> {
    return this.chapterRepository.find({
      where: { videoId },
      order: { startTime: 'ASC' },
    });
  }

  async updateChapter(
    chapterId: string,
    data: {
      title?: string;
      description?: string;
      startTime?: number;
      endTime?: number;
    },
  ): Promise<VideoChapter> {
    const chapter = await this.chapterRepository.findOne({
      where: { id: chapterId },
    });

    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }

    if (data.title) chapter.title = data.title;
    if (data.description !== undefined) chapter.description = data.description;
    if (data.startTime !== undefined) chapter.startTime = data.startTime;
    if (data.endTime !== undefined) chapter.endTime = data.endTime;

    return this.chapterRepository.save(chapter);
  }

  async deleteChapter(chapterId: string): Promise<void> {
    const result = await this.chapterRepository.delete({ id: chapterId });
    if (result.affected === 0) {
      throw new NotFoundException('Chapter not found');
    }
  }

  async deleteAllChapters(videoId: string): Promise<void> {
    await this.chapterRepository.delete({ videoId });
  }

  async reorderChapters(
    videoId: string,
    chapterIds: string[],
  ): Promise<VideoChapter[]> {
    const chapters = await this.chapterRepository.find({
      where: { videoId },
    });

    const chapterMap = new Map(chapters.map((c) => [c.id, c]));

    const updates = chapterIds.map((id, index) => {
      const chapter = chapterMap.get(id);
      if (chapter) {
        chapter.orderIndex = index;
        return chapter;
      }
      return null;
    }).filter(Boolean) as VideoChapter[];

    return this.chapterRepository.save(updates);
  }
}
