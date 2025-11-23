import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WatchHistory } from '../../database/entities/watch-history.entity';
import { Video } from '../../database/entities/video.entity';
import { WatchHistoryService } from './watch-history.service';
import { WatchHistoryController } from './watch-history.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WatchHistory, Video])],
  controllers: [WatchHistoryController],
  providers: [WatchHistoryService],
  exports: [WatchHistoryService],
})
export class WatchHistoryModule {}
