import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Video } from '../../database/entities';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { BulkUploadService } from './bulk-upload.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Video]),
    BullModule.registerQueue({
      name: 'video-processing',
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService, BulkUploadService],
  exports: [UploadService, BulkUploadService],
})
export class UploadModule {}
