import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WatchHistory } from '../../database/entities/watch-history.entity';
import { Video } from '../../database/entities/video.entity';
import { VideoBookmark } from '../../database/entities/video-bookmark.entity';
import { VideoAnalytics } from '../../database/entities/video-analytics.entity';
import { RecommendationsService } from './recommendations.service';
import { RecommendationsController } from './recommendations.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([WatchHistory, Video, VideoBookmark, VideoAnalytics]),
  ],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}
