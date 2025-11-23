import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Video } from './video.entity';

@Entity('video_bookmarks')
@Index(['userId', 'videoId'], { unique: true })
@Index(['userId', 'createdAt'])
export class VideoBookmark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  videoId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  note: string;

  @Column({ type: 'int', nullable: true })
  timestampSeconds: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  collection: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Video, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'videoId' })
  video: Video;
}
