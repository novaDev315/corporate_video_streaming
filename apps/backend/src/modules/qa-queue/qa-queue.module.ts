import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QAQuestion, QAQuestionUpvote } from '../../database/entities/qa-question.entity';
import { LiveStream } from '../../database/entities/live-stream.entity';
import { QAQueueService } from './qa-queue.service';
import { QAQueueController } from './qa-queue.controller';
import { QAQueueGateway } from './qa-queue.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([QAQuestion, QAQuestionUpvote, LiveStream])],
  controllers: [QAQueueController],
  providers: [QAQueueService, QAQueueGateway],
  exports: [QAQueueService],
})
export class QAQueueModule {}
