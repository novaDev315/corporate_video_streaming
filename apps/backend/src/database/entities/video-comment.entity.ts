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

@Entity('video_comments')
export class VideoComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  videoId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'int', nullable: true })
  timestamp: number; // Video timestamp in seconds

  @Column({ type: 'uuid', nullable: true })
  parentId: string; // For threaded replies

  @Column({ type: 'boolean', default: false })
  isModerated: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Video, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'videoId' })
  video: Video;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
