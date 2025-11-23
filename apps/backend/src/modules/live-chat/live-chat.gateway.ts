import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LiveChatService } from './live-chat.service';

@WebSocketGateway({
  namespace: '/live-chat',
  cors: { origin: '*' },
})
export class LiveChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, Set<string>> = new Map();

  constructor(private readonly liveChatService: LiveChatService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Remove from all rooms
    this.userSockets.forEach((sockets, streamId) => {
      sockets.delete(client.id);
    });
  }

  @SubscribeMessage('join-stream')
  async handleJoinStream(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { streamId: string; userId: string },
  ) {
    const { streamId, userId } = data;
    client.join(`stream:${streamId}`);

    if (!this.userSockets.has(streamId)) {
      this.userSockets.set(streamId, new Set());
    }
    this.userSockets.get(streamId)?.add(client.id);

    // Send recent messages
    const messages = await this.liveChatService.getRecentMessages(streamId, 50);
    client.emit('recent-messages', messages);

    // Notify others
    this.server.to(`stream:${streamId}`).emit('user-joined', {
      userId,
      viewerCount: this.userSockets.get(streamId)?.size || 0,
    });
  }

  @SubscribeMessage('leave-stream')
  handleLeaveStream(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { streamId: string; userId: string },
  ) {
    const { streamId, userId } = data;
    client.leave(`stream:${streamId}`);
    this.userSockets.get(streamId)?.delete(client.id);

    this.server.to(`stream:${streamId}`).emit('user-left', {
      userId,
      viewerCount: this.userSockets.get(streamId)?.size || 0,
    });
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      streamId: string;
      userId: string;
      message: string;
      replyToId?: string;
    },
  ) {
    try {
      const chatMessage = await this.liveChatService.sendMessage(
        data.streamId,
        data.userId,
        {
          message: data.message,
          replyToId: data.replyToId,
        },
      );

      this.server.to(`stream:${data.streamId}`).emit('new-message', chatMessage);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('delete-message')
  async handleDeleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { streamId: string; messageId: string; userId: string; isAdmin: boolean },
  ) {
    try {
      await this.liveChatService.deleteMessage(
        data.messageId,
        data.userId,
        data.isAdmin,
      );

      this.server.to(`stream:${data.streamId}`).emit('message-deleted', {
        messageId: data.messageId,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('pin-message')
  async handlePinMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { streamId: string; messageId: string; userId: string },
  ) {
    try {
      const pinnedMessage = await this.liveChatService.pinMessage(
        data.streamId,
        data.messageId,
        data.userId,
      );

      this.server.to(`stream:${data.streamId}`).emit('message-pinned', pinnedMessage);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // Emit to all clients in a stream
  broadcastToStream(streamId: string, event: string, data: any) {
    this.server.to(`stream:${streamId}`).emit(event, data);
  }
}
