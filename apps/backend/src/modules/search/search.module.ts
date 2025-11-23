import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from '../../database/entities/video.entity';
import { VideoTranscript } from '../../database/entities/video-transcript.entity';
import { VideoChapter } from '../../database/entities/video-chapter.entity';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Video, VideoTranscript, VideoChapter])],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
