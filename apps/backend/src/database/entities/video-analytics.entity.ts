import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Video } from './video.entity';
import { User } from './user.entity';

@Entity('video_analytics')
export class VideoAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  videoId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'int', default: 0 })
  watchTime: number; // in seconds

  @Column({ type: 'int', default: 0 })
  completionPercentage: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  deviceType: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  browser: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location: string;

  @Column({ type: 'jsonb', nullable: true })
  heatmapData: any; // Array of timestamps where user engaged

  @CreateDateColumn()
  watchedAt: Date;

  @ManyToOne(() => Video, (video) => video.analytics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'videoId' })
  video: Video;

  @ManyToOne(() => User, (user) => user.watchHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
