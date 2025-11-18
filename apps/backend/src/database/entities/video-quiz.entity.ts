import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Video } from './video.entity';

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
}

@Entity('video_quizzes')
export class VideoQuiz {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  videoId: string;

  @Column({ type: 'varchar', length: 500 })
  question: string;

  @Column({
    type: 'enum',
    enum: QuestionType,
  })
  type: QuestionType;

  @Column({ type: 'jsonb' })
  options: string[]; // Array of answer options

  @Column({ type: 'varchar', length: 500 })
  correctAnswer: string;

  @Column({ type: 'int' })
  timestamp: number; // When to show in video (seconds)

  @Column({ type: 'boolean', default: false })
  isPauseRequired: boolean; // Pause video until answered

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Video, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'videoId' })
  video: Video;
}
