import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { VideoEdit, Video } from '../../database/entities';
import { EditingController } from './editing.controller';
import { EditingService } from './editing.service';
import { VideoEditorProcessor } from './video-editor.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([VideoEdit, Video]),
    BullModule.registerQueue({
      name: 'video-editing',
    }),
  ],
  controllers: [EditingController],
  providers: [EditingService, VideoEditorProcessor],
  exports: [EditingService],
})
export class EditingModule {}
