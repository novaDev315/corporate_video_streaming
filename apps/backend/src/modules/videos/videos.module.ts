import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Video, VideoAccess, VideoAnalytics } from '../../database/entities';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { VideoProcessorService } from './video-processor.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Video, VideoAccess, VideoAnalytics]),
    BullModule.registerQueue({
      name: 'video-processing',
    }),
  ],
  controllers: [VideosController],
  providers: [VideosService, VideoProcessorService],
  exports: [VideosService],
})
export class VideosModule {}
