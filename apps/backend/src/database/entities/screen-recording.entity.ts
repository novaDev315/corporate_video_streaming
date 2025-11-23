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
import { Organization } from './organization.entity';
import { Video } from './video.entity';

export enum RecordingStatus {
  RECORDING = 'recording',
  PAUSED = 'paused',
  STOPPED = 'stopped',
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
}

export enum RecordingSource {
  SCREEN = 'screen',
  WEBCAM = 'webcam',
  SCREEN_AND_WEBCAM = 'screen_and_webcam',
  WINDOW = 'window',
  TAB = 'tab',
}

@Entity('screen_recordings')
@Index(['userId', 'createdAt'])
@Index(['organizationId', 'status'])
export class ScreenRecording {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({
    type: 'enum',
    enum: RecordingStatus,
    default: RecordingStatus.RECORDING,
  })
  status: RecordingStatus;

  @Column({
    type: 'enum',
    enum: RecordingSource,
    default: RecordingSource.SCREEN,
  })
  source: RecordingSource;

  @Column({ type: 'int', default: 0 })
  duration: number;

  @Column({ type: 'bigint', default: 0 })
  fileSize: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  rawVideoUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  processedVideoUrl: string;

  @Column({ type: 'uuid', nullable: true })
  convertedVideoId: string;

  @Column({ type: 'boolean', default: true })
  includeAudio: boolean;

  @Column({ type: 'boolean', default: false })
  includeWebcam: boolean;

  @Column({ type: 'varchar', length: 20, default: '1080p' })
  resolution: string;

  @Column({ type: 'int', default: 30 })
  frameRate: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    browserInfo?: string;
    screenResolution?: string;
    audioDevice?: string;
    webcamDevice?: string;
  };

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  stoppedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @ManyToOne(() => Video, { nullable: true })
  @JoinColumn({ name: 'convertedVideoId' })
  convertedVideo: Video;
}
