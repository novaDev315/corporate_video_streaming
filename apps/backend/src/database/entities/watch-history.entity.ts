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

@Entity('watch_history')
@Index(['userId', 'videoId'], { unique: true })
@Index(['userId', 'lastWatchedAt'])
export class WatchHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  videoId: string;

  @Column({ type: 'int', default: 0 })
  watchedSeconds: number;

  @Column({ type: 'int', default: 0 })
  totalDuration: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progressPercentage: number;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @Column({ type: 'int', default: 1 })
  watchCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastWatchedAt: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  deviceType: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Video, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'videoId' })
  video: Video;
}
