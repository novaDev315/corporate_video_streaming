import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum AuditAction {
  VIDEO_VIEWED = 'video_viewed',
  VIDEO_UPLOADED = 'video_uploaded',
  VIDEO_DELETED = 'video_deleted',
  VIDEO_EDITED = 'video_edited',
  USER_LOGIN = 'user_login',
  USER_CREATED = 'user_created',
  USER_DELETED = 'user_deleted',
  PERMISSION_CHANGED = 'permission_changed',
  SETTINGS_CHANGED = 'settings_changed',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @Column({ type: 'uuid' })
  orgId: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resourceType: string;

  @Column({ type: 'uuid', nullable: true })
  resourceId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
