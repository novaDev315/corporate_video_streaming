import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { VideoChapter } from '../../database/entities/video-chapter.entity';
import { Video } from '../../database/entities/video.entity';
import { VideoTranscript } from '../../database/entities/video-transcript.entity';
import { AutoChaptersService } from './auto-chapters.service';
import { AutoChaptersController } from './auto-chapters.controller';
import { ChapterGeneratorProcessor } from './chapter-generator.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([VideoChapter, Video, VideoTranscript]),
    BullModule.registerQueue({
      name: 'chapter-generation',
    }),
  ],
  controllers: [AutoChaptersController],
  providers: [AutoChaptersService, ChapterGeneratorProcessor],
  exports: [AutoChaptersService],
})
export class AutoChaptersModule {}
