import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { LiveStream } from './live-stream.entity';

export enum PollStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  CLOSED = 'closed',
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

@Entity('live_polls')
@Index(['streamId', 'status'])
export class LivePoll {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  streamId: string;

  @Column({ type: 'uuid' })
  createdById: string;

  @Column({ type: 'varchar', length: 500 })
  question: string;

  @Column({ type: 'jsonb' })
  options: PollOption[];

  @Column({
    type: 'enum',
    enum: PollStatus,
    default: PollStatus.DRAFT,
  })
  status: PollStatus;

  @Column({ type: 'boolean', default: false })
  allowMultipleVotes: boolean;

  @Column({ type: 'boolean', default: true })
  showResults: boolean;

  @Column({ type: 'int', default: 0 })
  totalVotes: number;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date;

  @Column({ type: 'int', nullable: true })
  durationSeconds: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => LiveStream, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'streamId' })
  stream: LiveStream;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;
}

@Entity('live_poll_votes')
@Index(['pollId', 'userId'], { unique: true })
export class LivePollVote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  pollId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 100 })
  optionId: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => LivePoll, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pollId' })
  poll: LivePoll;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
