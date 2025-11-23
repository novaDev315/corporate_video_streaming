import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LivePollsService } from './live-polls.service';

@WebSocketGateway({
  namespace: '/live-polls',
  cors: { origin: '*' },
})
export class LivePollsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly pollsService: LivePollsService) {}

  @SubscribeMessage('join-poll')
  async handleJoinPoll(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { pollId: string },
  ) {
    client.join(`poll:${data.pollId}`);
    const poll = await this.pollsService.getPoll(data.pollId);
    client.emit('poll-state', poll);
  }

  @SubscribeMessage('vote')
  async handleVote(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { pollId: string; userId: string; optionId: string },
  ) {
    try {
      const updatedPoll = await this.pollsService.vote(
        data.pollId,
        data.userId,
        data.optionId,
      );

      this.server.to(`poll:${data.pollId}`).emit('poll-updated', updatedPoll);
    } catch (error) {
      client.emit('vote-error', { message: error.message });
    }
  }

  // Broadcast poll start to stream
  broadcastPollStart(streamId: string, poll: any) {
    this.server.to(`stream:${streamId}`).emit('poll-started', poll);
  }

  // Broadcast poll end to stream
  broadcastPollEnd(streamId: string, poll: any) {
    this.server.to(`stream:${streamId}`).emit('poll-ended', poll);
  }

  // Broadcast real-time results
  broadcastResults(pollId: string, results: any) {
    this.server.to(`poll:${pollId}`).emit('poll-results', results);
  }
}
