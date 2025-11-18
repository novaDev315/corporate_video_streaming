import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Organization } from './organization.entity';
import { User } from './user.entity';
import { VideoAccess } from './video-access.entity';
import { VideoAnalytics } from './video-analytics.entity';

export enum VideoStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
  ARCHIVED = 'archived',
}

export enum VideoPrivacy {
  PUBLIC = 'public',
  PRIVATE = 'private',
  RESTRICTED = 'restricted',
}

@Entity('videos')
export class Video {
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
    enum: VideoStatus,
    default: VideoStatus.UPLOADING,
  })
  status: VideoStatus;

  @Column({
    type: 'enum',
    enum: VideoPrivacy,
    default: VideoPrivacy.PRIVATE,
  })
  privacy: VideoPrivacy;

  @Column({ type: 'int', default: 0 })
  duration: number; // in seconds

  @Column({ type: 'bigint', default: 0 })
  fileSize: number; // in bytes

  @Column({ type: 'varchar', length: 500, nullable: true })
  s3Key: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  hlsUrl: string;

  @Column({ type: 'text', nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'uuid' })
  createdById: string;

  @Column({ type: 'boolean', default: false })
  hasTranscript: boolean;

  @Column({ type: 'text', nullable: true })
  transcriptUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Organization, (org) => org.videos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orgId' })
  organization: Organization;

  @ManyToOne(() => User, (user) => user.videos)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @OneToMany(() => VideoAccess, (access) => access.video)
  accessControls: VideoAccess[];

  @OneToMany(() => VideoAnalytics, (analytics) => analytics.video)
  analytics: VideoAnalytics[];
}
