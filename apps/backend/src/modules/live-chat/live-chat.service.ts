import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { LiveChatMessage, ChatMessageType } from '../../database/entities/live-chat-message.entity';
import { LiveStream } from '../../database/entities/live-stream.entity';

@Injectable()
export class LiveChatService {
  constructor(
    @InjectRepository(LiveChatMessage)
    private chatRepository: Repository<LiveChatMessage>,
    @InjectRepository(LiveStream)
    private streamRepository: Repository<LiveStream>,
  ) {}

  async sendMessage(
    streamId: string,
    userId: string,
    data: {
      message: string;
      type?: ChatMessageType;
      replyToId?: string;
      metadata?: any;
    },
  ): Promise<LiveChatMessage> {
    const stream = await this.streamRepository.findOne({
      where: { id: streamId },
    });

    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    if (stream.status !== 'live') {
      throw new ForbiddenException('Chat is only available during live streams');
    }

    const chatMessage = this.chatRepository.create({
      streamId,
      userId,
      message: data.message,
      type: data.type || ChatMessageType.TEXT,
      replyToId: data.replyToId,
      metadata: data.metadata,
    });

    return this.chatRepository.save(chatMessage);
  }

  async getMessages(
    streamId: string,
    options: { limit?: number; before?: string; after?: string },
  ): Promise<{ messages: LiveChatMessage[]; hasMore: boolean }> {
    const { limit = 50, before, after } = options;

    const queryBuilder = this.chatRepository
      .createQueryBuilder('message')
      .where('message.streamId = :streamId', { streamId })
      .andWhere('message.isDeleted = :isDeleted', { isDeleted: false })
      .leftJoinAndSelect('message.user', 'user')
      .orderBy('message.createdAt', 'DESC')
      .take(limit + 1);

    if (before) {
      queryBuilder.andWhere('message.createdAt < :before', {
        before: new Date(before),
      });
    }

    if (after) {
      queryBuilder.andWhere('message.createdAt > :after', {
        after: new Date(after),
      });
    }

    const messages = await queryBuilder.getMany();
    const hasMore = messages.length > limit;

    return {
      messages: messages.slice(0, limit).reverse(),
      hasMore,
    };
  }

  async pinMessage(
    streamId: string,
    messageId: string,
    userId: string,
  ): Promise<LiveChatMessage> {
    // Unpin existing pinned message
    await this.chatRepository.update(
      { streamId, isPinned: true },
      { isPinned: false },
    );

    const message = await this.chatRepository.findOne({
      where: { id: messageId, streamId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    message.isPinned = true;
    message.type = ChatMessageType.PINNED;
    return this.chatRepository.save(message);
  }

  async unpinMessage(streamId: string, messageId: string): Promise<void> {
    await this.chatRepository.update(
      { id: messageId, streamId },
      { isPinned: false, type: ChatMessageType.TEXT },
    );
  }

  async deleteMessage(
    messageId: string,
    userId: string,
    isAdmin = false,
  ): Promise<void> {
    const message = await this.chatRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.userId !== userId && !isAdmin) {
      throw new ForbiddenException('Cannot delete this message');
    }

    message.isDeleted = true;
    await this.chatRepository.save(message);
  }

  async getPinnedMessage(streamId: string): Promise<LiveChatMessage | null> {
    return this.chatRepository.findOne({
      where: { streamId, isPinned: true, isDeleted: false },
      relations: ['user'],
    });
  }

  async getRecentMessages(streamId: string, limit = 100): Promise<LiveChatMessage[]> {
    return this.chatRepository.find({
      where: { streamId, isDeleted: false },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async highlightMessage(messageId: string): Promise<LiveChatMessage> {
    const message = await this.chatRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    message.type = ChatMessageType.HIGHLIGHT;
    return this.chatRepository.save(message);
  }

  async getMessageCount(streamId: string): Promise<number> {
    return this.chatRepository.count({
      where: { streamId, isDeleted: false },
    });
  }
}
