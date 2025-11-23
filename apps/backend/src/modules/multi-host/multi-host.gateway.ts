import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MultiHostService } from './multi-host.service';

@WebSocketGateway({
  namespace: '/multi-host',
  cors: { origin: '*' },
})
export class MultiHostGateway {
  @WebSocketServer()
  server: Server;

  private hostConnections: Map<string, Set<string>> = new Map();

  constructor(private readonly multiHostService: MultiHostService) {}

  @SubscribeMessage('host-join')
  async handleHostJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { streamId: string; hostId: string; userId: string },
  ) {
    try {
      const host = await this.multiHostService.joinStream(data.hostId, data.userId);
      client.join(`host-room:${data.streamId}`);

      if (!this.hostConnections.has(data.streamId)) {
        this.hostConnections.set(data.streamId, new Set());
      }
      this.hostConnections.get(data.streamId)?.add(client.id);

      // Notify all hosts
      this.server.to(`host-room:${data.streamId}`).emit('host-joined', {
        host,
        activeHosts: await this.multiHostService.getActiveHosts(data.streamId),
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('host-leave')
  async handleHostLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { streamId: string; hostId: string; userId: string },
  ) {
    try {
      const host = await this.multiHostService.leaveStream(data.hostId, data.userId);
      client.leave(`host-room:${data.streamId}`);
      this.hostConnections.get(data.streamId)?.delete(client.id);

      this.server.to(`host-room:${data.streamId}`).emit('host-left', {
        host,
        activeHosts: await this.multiHostService.getActiveHosts(data.streamId),
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('signal')
  handleSignal(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { streamId: string; targetHostId: string; signal: any },
  ) {
    // WebRTC signaling for multi-host
    this.server.to(`host-room:${data.streamId}`).emit('signal', {
      from: client.id,
      signal: data.signal,
      targetHostId: data.targetHostId,
    });
  }

  @SubscribeMessage('mute-host')
  async handleMuteHost(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { streamId: string; hostId: string; muted: boolean },
  ) {
    this.server.to(`host-room:${data.streamId}`).emit('host-muted', {
      hostId: data.hostId,
      muted: data.muted,
    });
  }

  // Broadcast to viewers
  broadcastHostUpdate(streamId: string, event: string, data: any) {
    this.server.to(`stream:${streamId}`).emit(event, data);
  }
}
