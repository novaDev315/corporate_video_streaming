import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { LiveStream } from './live-stream.entity';

export enum ChatMessageType {
  TEXT = 'text',
  EMOJI = 'emoji',
  SYSTEM = 'system',
  PINNED = 'pinned',
  HIGHLIGHT = 'highlight',
}

@Entity('live_chat_messages')
@Index(['streamId', 'createdAt'])
@Index(['userId', 'streamId'])
export class LiveChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  streamId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: ChatMessageType,
    default: ChatMessageType.TEXT,
  })
  type: ChatMessageType;

  @Column({ type: 'boolean', default: false })
  isPinned: boolean;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @Column({ type: 'uuid', nullable: true })
  replyToId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    emoji?: string;
    color?: string;
    badges?: string[];
  };

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => LiveStream, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'streamId' })
  stream: LiveStream;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
