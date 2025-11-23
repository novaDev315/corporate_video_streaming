import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LivePoll, LivePollVote } from '../../database/entities/live-poll.entity';
import { LiveStream } from '../../database/entities/live-stream.entity';
import { LivePollsService } from './live-polls.service';
import { LivePollsController } from './live-polls.controller';
import { LivePollsGateway } from './live-polls.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([LivePoll, LivePollVote, LiveStream])],
  controllers: [LivePollsController],
  providers: [LivePollsService, LivePollsGateway],
  exports: [LivePollsService],
})
export class LivePollsModule {}
