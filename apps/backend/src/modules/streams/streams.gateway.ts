import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/streams',
})
export class StreamsGateway {
  @WebSocketServer()
  server: Server;

  private viewers = new Map<string, Set<string>>();

  @SubscribeMessage('join-stream')
  handleJoinStream(
    @MessageBody() data: { streamId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { streamId } = data;

    if (!this.viewers.has(streamId)) {
      this.viewers.set(streamId, new Set());
    }

    this.viewers.get(streamId).add(client.id);
    client.join(streamId);

    // Emit viewer count update
    this.server.to(streamId).emit('viewer-count', {
      count: this.viewers.get(streamId).size,
    });

    return { success: true };
  }

  @SubscribeMessage('leave-stream')
  handleLeaveStream(
    @MessageBody() data: { streamId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { streamId } = data;

    if (this.viewers.has(streamId)) {
      this.viewers.get(streamId).delete(client.id);
      client.leave(streamId);

      // Emit viewer count update
      this.server.to(streamId).emit('viewer-count', {
        count: this.viewers.get(streamId).size,
      });
    }

    return { success: true };
  }

  @SubscribeMessage('send-chat')
  handleChat(
    @MessageBody() data: { streamId: string; message: string; user: any },
    @ConnectedSocket() client: Socket,
  ) {
    const { streamId, message, user } = data;

    this.server.to(streamId).emit('chat-message', {
      id: Date.now(),
      message,
      user,
      timestamp: new Date(),
    });

    return { success: true };
  }

  @SubscribeMessage('ask-question')
  handleQuestion(
    @MessageBody() data: { streamId: string; question: string; user: any },
  ) {
    const { streamId, question, user } = data;

    this.server.to(streamId).emit('new-question', {
      id: Date.now(),
      question,
      user,
      timestamp: new Date(),
    });

    return { success: true };
  }
}
