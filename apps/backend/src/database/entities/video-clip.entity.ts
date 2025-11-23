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
import { Video } from './video.entity';

export enum ClipStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
}

export enum ClipVisibility {
  PRIVATE = 'private',
  UNLISTED = 'unlisted',
  PUBLIC = 'public',
}

@Entity('video_clips')
@Index(['sourceVideoId', 'userId'])
@Index(['userId', 'createdAt'])
export class VideoClip {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  sourceVideoId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int' })
  startTime: number;

  @Column({ type: 'int' })
  endTime: number;

  @Column({ type: 'int' })
  duration: number;

  @Column({
    type: 'enum',
    enum: ClipStatus,
    default: ClipStatus.PENDING,
  })
  status: ClipStatus;

  @Column({
    type: 'enum',
    enum: ClipVisibility,
    default: ClipVisibility.PRIVATE,
  })
  visibility: ClipVisibility;

  @Column({ type: 'varchar', length: 500, nullable: true })
  clipUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  shareCount: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  shareToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Video, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sourceVideoId' })
  sourceVideo: Video;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
