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

export enum DownloadQuality {
  LOW = '360p',
  MEDIUM = '480p',
  HIGH = '720p',
  HD = '1080p',
}

export enum DownloadStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

@Entity('video_downloads')
export class VideoDownload {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  videoId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: DownloadQuality,
    default: DownloadQuality.MEDIUM,
  })
  quality: DownloadQuality;

  @Column({
    type: 'enum',
    enum: DownloadStatus,
    default: DownloadStatus.PENDING,
  })
  status: DownloadStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  downloadUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  downloadToken: string;

  @Column({ type: 'bigint', default: 0 })
  fileSize: number;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  downloadedAt: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  deviceId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  deviceType: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Video, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'videoId' })
  video: Video;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
