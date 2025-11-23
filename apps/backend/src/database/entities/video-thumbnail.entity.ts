import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Video } from './video.entity';

export enum ThumbnailType {
  AUTO_GENERATED = 'auto_generated',
  AI_SELECTED = 'ai_selected',
  CUSTOM = 'custom',
  FRAME_CAPTURE = 'frame_capture',
}

@Entity('video_thumbnails')
@Index(['videoId', 'isActive'])
export class VideoThumbnail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  videoId: string;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({
    type: 'enum',
    enum: ThumbnailType,
    default: ThumbnailType.AUTO_GENERATED,
  })
  type: ThumbnailType;

  @Column({ type: 'int', nullable: true })
  timestampSeconds: number;

  @Column({ type: 'int', default: 1280 })
  width: number;

  @Column({ type: 'int', default: 720 })
  height: number;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  qualityScore: number;

  @Column({ type: 'jsonb', nullable: true })
  aiAnalysis: {
    hasText?: boolean;
    hasFaces?: boolean;
    dominantColors?: string[];
    sceneType?: string;
    engagementScore?: number;
  };

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Video, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'videoId' })
  video: Video;
}
