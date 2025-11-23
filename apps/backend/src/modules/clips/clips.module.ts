import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { VideoClip } from '../../database/entities/video-clip.entity';
import { Video } from '../../database/entities/video.entity';
import { ClipsService } from './clips.service';
import { ClipsController } from './clips.controller';
import { ClipProcessor } from './clip.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([VideoClip, Video]),
    BullModule.registerQueue({
      name: 'clip-generation',
    }),
  ],
  controllers: [ClipsController],
  providers: [ClipsService, ClipProcessor],
  exports: [ClipsService],
})
export class ClipsModule {}
