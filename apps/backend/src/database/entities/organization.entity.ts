import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Video } from './video.entity';
import { LiveStream } from './live-stream.entity';

export enum PlanType {
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
  CUSTOM = 'custom',
}

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  domain: string;

  @Column({
    type: 'enum',
    enum: PlanType,
    default: PlanType.STARTER,
  })
  planType: PlanType;

  @Column({ type: 'bigint', default: 536870912000 }) // 500GB in bytes
  storageLimit: number;

  @Column({ type: 'bigint', default: 0 })
  storageUsed: number;

  @Column({ type: 'int', default: 100 })
  maxUsers: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => User, (user) => user.organization)
  users: User[];

  @OneToMany(() => Video, (video) => video.organization)
  videos: Video[];

  @OneToMany(() => LiveStream, (stream) => stream.organization)
  liveStreams: LiveStream[];
}
