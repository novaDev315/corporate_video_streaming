import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Video } from './video.entity';

export enum AccessType {
  VIEW = 'view',
  EDIT = 'edit',
  ADMIN = 'admin',
}

@Entity('video_access')
export class VideoAccess {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  videoId: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department: string;

  @Column({
    type: 'enum',
    enum: AccessType,
    default: AccessType.VIEW,
  })
  accessType: AccessType;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Video, (video) => video.accessControls, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'videoId' })
  video: Video;
}
