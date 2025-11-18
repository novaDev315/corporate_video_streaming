import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Video } from './video.entity';
import { User } from './user.entity';

export enum EditOperation {
  TRIM = 'trim',
  CUT = 'cut',
  MERGE = 'merge',
  ADD_INTRO = 'add_intro',
  ADD_OUTRO = 'add_outro',
  AUDIO_LEVEL = 'audio_level',
  ADD_WATERMARK = 'add_watermark',
  CROP = 'crop',
  ROTATE = 'rotate',
}

export enum EditStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('video_edits')
export class VideoEdit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  videoId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: EditOperation,
  })
  operation: EditOperation;

  @Column({ type: 'jsonb' })
  parameters: any; // Operation-specific parameters

  @Column({
    type: 'enum',
    enum: EditStatus,
    default: EditStatus.PENDING,
  })
  status: EditStatus;

  @Column({ type: 'uuid', nullable: true })
  resultVideoId: string; // New video created from edit

  @Column({ type: 'varchar', length: 500, nullable: true })
  errorMessage: string;

  @Column({ type: 'int', default: 0 })
  progress: number; // 0-100

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Video, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'videoId' })
  video: Video;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
