import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { StreamHost, HostRole, HostStatus } from '../../database/entities/stream-host.entity';
import { LiveStream } from '../../database/entities/live-stream.entity';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class MultiHostService {
  constructor(
    @InjectRepository(StreamHost)
    private hostRepository: Repository<StreamHost>,
    @InjectRepository(LiveStream)
    private streamRepository: Repository<LiveStream>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async inviteHost(
    streamId: string,
    inviterId: string,
    data: {
      userId: string;
      role: HostRole;
      displayName?: string;
      permissions?: {
        canSpeak?: boolean;
        canShareScreen?: boolean;
        canManageParticipants?: boolean;
        canManageChat?: boolean;
        canCreatePolls?: boolean;
      };
    },
  ): Promise<StreamHost> {
    const stream = await this.streamRepository.findOne({
      where: { id: streamId },
    });

    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    // Check if already invited
    const existing = await this.hostRepository.findOne({
      where: { streamId, userId: data.userId },
    });

    if (existing) {
      throw new ConflictException('User already invited as host');
    }

    const user = await this.userRepository.findOne({
      where: { id: data.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const host = this.hostRepository.create({
      streamId,
      userId: data.userId,
      role: data.role,
      status: HostStatus.INVITED,
      displayName: data.displayName || user.name,
      streamKey: this.generateStreamKey(),
      canSpeak: data.permissions?.canSpeak ?? true,
      canShareScreen: data.permissions?.canShareScreen ?? true,
      canManageParticipants: data.permissions?.canManageParticipants ?? false,
      canManageChat: data.permissions?.canManageChat ?? false,
      canCreatePolls: data.permissions?.canCreatePolls ?? false,
    });

    return this.hostRepository.save(host);
  }

  async respondToInvitation(
    hostId: string,
    userId: string,
    accept: boolean,
  ): Promise<StreamHost> {
    const host = await this.hostRepository.findOne({
      where: { id: hostId, userId },
    });

    if (!host) {
      throw new NotFoundException('Invitation not found');
    }

    if (host.status !== HostStatus.INVITED) {
      throw new ForbiddenException('Invitation already responded');
    }

    host.status = accept ? HostStatus.ACCEPTED : HostStatus.DECLINED;
    return this.hostRepository.save(host);
  }

  async joinStream(hostId: string, userId: string): Promise<StreamHost> {
    const host = await this.hostRepository.findOne({
      where: { id: hostId, userId },
    });

    if (!host) {
      throw new NotFoundException('Host not found');
    }

    if (host.status !== HostStatus.ACCEPTED) {
      throw new ForbiddenException('Must accept invitation first');
    }

    host.status = HostStatus.JOINED;
    host.joinedAt = new Date();
    return this.hostRepository.save(host);
  }

  async leaveStream(hostId: string, userId: string): Promise<StreamHost> {
    const host = await this.hostRepository.findOne({
      where: { id: hostId, userId },
    });

    if (!host) {
      throw new NotFoundException('Host not found');
    }

    host.status = HostStatus.LEFT;
    host.leftAt = new Date();
    return this.hostRepository.save(host);
  }

  async getStreamHosts(streamId: string): Promise<StreamHost[]> {
    return this.hostRepository.find({
      where: { streamId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async getActiveHosts(streamId: string): Promise<StreamHost[]> {
    return this.hostRepository.find({
      where: { streamId, status: HostStatus.JOINED },
      relations: ['user'],
    });
  }

  async getUserInvitations(userId: string): Promise<StreamHost[]> {
    return this.hostRepository.find({
      where: { userId, status: HostStatus.INVITED },
      relations: ['stream'],
    });
  }

  async updateHostPermissions(
    hostId: string,
    permissions: {
      canSpeak?: boolean;
      canShareScreen?: boolean;
      canManageParticipants?: boolean;
      canManageChat?: boolean;
      canCreatePolls?: boolean;
    },
  ): Promise<StreamHost> {
    const host = await this.hostRepository.findOne({ where: { id: hostId } });

    if (!host) {
      throw new NotFoundException('Host not found');
    }

    if (permissions.canSpeak !== undefined) host.canSpeak = permissions.canSpeak;
    if (permissions.canShareScreen !== undefined) host.canShareScreen = permissions.canShareScreen;
    if (permissions.canManageParticipants !== undefined) host.canManageParticipants = permissions.canManageParticipants;
    if (permissions.canManageChat !== undefined) host.canManageChat = permissions.canManageChat;
    if (permissions.canCreatePolls !== undefined) host.canCreatePolls = permissions.canCreatePolls;

    return this.hostRepository.save(host);
  }

  async updateHostRole(hostId: string, role: HostRole): Promise<StreamHost> {
    const host = await this.hostRepository.findOne({ where: { id: hostId } });

    if (!host) {
      throw new NotFoundException('Host not found');
    }

    host.role = role;
    return this.hostRepository.save(host);
  }

  async removeHost(hostId: string): Promise<void> {
    const result = await this.hostRepository.delete({ id: hostId });
    if (result.affected === 0) {
      throw new NotFoundException('Host not found');
    }
  }

  async getHostByStreamKey(streamKey: string): Promise<StreamHost | null> {
    return this.hostRepository.findOne({
      where: { streamKey },
      relations: ['stream', 'user'],
    });
  }

  private generateStreamKey(): string {
    return `host_${uuidv4().replace(/-/g, '')}`;
  }
}
