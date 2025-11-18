import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organization } from './organization.entity';

export enum StreamStatus {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  ENDED = 'ended',
  RECORDING_PROCESSING = 'recording_processing',
}

@Entity('live_streams')
export class LiveStream {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  orgId: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: StreamStatus,
    default: StreamStatus.SCHEDULED,
  })
  status: StreamStatus;

  @Column({ type: 'varchar', length: 255, unique: true })
  streamKey: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  rtmpUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  hlsUrl: string;

  @Column({ type: 'int', default: 0 })
  currentViewers: number;

  @Column({ type: 'int', default: 0 })
  maxViewers: number;

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  recordingVideoId: string; // References Video entity after stream ends

  @Column({ type: 'boolean', default: true })
  enableChat: boolean;

  @Column({ type: 'boolean', default: true })
  enableQA: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Organization, (org) => org.liveStreams, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orgId' })
  organization: Organization;
}
