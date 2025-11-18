import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Video } from './video.entity';

@Entity('video_transcripts')
export class VideoTranscript {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  videoId: string;

  @Column({ type: 'varchar', length: 10, default: 'en' })
  language: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  words: any[]; // Array of word objects with timestamps

  @Column({ type: 'varchar', length: 500, nullable: true })
  vttUrl: string; // WebVTT subtitle file URL

  @Column({ type: 'boolean', default: false })
  isEdited: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Video, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'videoId' })
  video: Video;
}
