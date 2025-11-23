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

export enum HostRole {
  PRIMARY = 'primary',
  CO_HOST = 'co_host',
  PRESENTER = 'presenter',
  MODERATOR = 'moderator',
  GUEST = 'guest',
}

export enum HostStatus {
  INVITED = 'invited',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  JOINED = 'joined',
  LEFT = 'left',
}

@Entity('stream_hosts')
@Index(['streamId', 'userId'], { unique: true })
@Index(['streamId', 'role'])
export class StreamHost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  streamId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: HostRole,
    default: HostRole.CO_HOST,
  })
  role: HostRole;

  @Column({
    type: 'enum',
    enum: HostStatus,
    default: HostStatus.INVITED,
  })
  status: HostStatus;

  @Column({ type: 'boolean', default: true })
  canSpeak: boolean;

  @Column({ type: 'boolean', default: true })
  canShareScreen: boolean;

  @Column({ type: 'boolean', default: false })
  canManageParticipants: boolean;

  @Column({ type: 'boolean', default: false })
  canManageChat: boolean;

  @Column({ type: 'boolean', default: false })
  canCreatePolls: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  displayName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  streamKey: string;

  @Column({ type: 'timestamp', nullable: true })
  joinedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  leftAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => LiveStream, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'streamId' })
  stream: LiveStream;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
