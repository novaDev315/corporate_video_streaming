import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ScreenRecording } from '../../database/entities/screen-recording.entity';
import { Video } from '../../database/entities/video.entity';
import { ScreenRecordingService } from './screen-recording.service';
import { ScreenRecordingController } from './screen-recording.controller';
import { RecordingProcessor } from './recording.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScreenRecording, Video]),
    BullModule.registerQueue({
      name: 'recording-processing',
    }),
  ],
  controllers: [ScreenRecordingController],
  providers: [ScreenRecordingService, RecordingProcessor],
  exports: [ScreenRecordingService],
})
export class ScreenRecordingModule {}
