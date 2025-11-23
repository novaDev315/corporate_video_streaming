import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { QAQueueService } from './qa-queue.service';

@WebSocketGateway({
  namespace: '/qa-queue',
  cors: { origin: '*' },
})
export class QAQueueGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly qaService: QAQueueService) {}

  @SubscribeMessage('join-qa')
  async handleJoinQA(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { streamId: string },
  ) {
    client.join(`qa:${data.streamId}`);
    const questions = await this.qaService.getQuestions(data.streamId, {});
    client.emit('questions-list', questions);
  }

  @SubscribeMessage('submit-question')
  async handleSubmitQuestion(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { streamId: string; userId: string; question: string; isAnonymous?: boolean },
  ) {
    try {
      const question = await this.qaService.submitQuestion(
        data.streamId,
        data.userId,
        { question: data.question, isAnonymous: data.isAnonymous },
      );

      this.server.to(`qa:${data.streamId}`).emit('new-question', question);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('upvote-question')
  async handleUpvote(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { streamId: string; questionId: string; userId: string },
  ) {
    try {
      const question = await this.qaService.upvoteQuestion(
        data.questionId,
        data.userId,
      );

      this.server.to(`qa:${data.streamId}`).emit('question-updated', question);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // Broadcast question answered
  broadcastQuestionAnswered(streamId: string, question: any) {
    this.server.to(`qa:${streamId}`).emit('question-answered', question);
  }

  // Broadcast pinned question
  broadcastPinnedQuestion(streamId: string, question: any) {
    this.server.to(`qa:${streamId}`).emit('question-pinned', question);
  }
}
