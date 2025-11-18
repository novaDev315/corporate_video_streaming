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

export enum ReactionType {
  LIKE = 'like',
  LOVE = 'love',
  CLAP = 'clap',
  IDEA = 'idea',
  QUESTION = 'question',
}

@Entity('video_reactions')
export class VideoReaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  videoId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: ReactionType,
  })
  type: ReactionType;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Video, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'videoId' })
  video: Video;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
