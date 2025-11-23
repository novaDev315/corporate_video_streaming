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
import { LiveStream } from './live-stream.entity';

export enum QuestionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  ANSWERED = 'answered',
  DISMISSED = 'dismissed',
}

@Entity('qa_questions')
@Index(['streamId', 'status'])
@Index(['streamId', 'upvotes'])
export class QAQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  streamId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'text' })
  question: string;

  @Column({
    type: 'enum',
    enum: QuestionStatus,
    default: QuestionStatus.PENDING,
  })
  status: QuestionStatus;

  @Column({ type: 'int', default: 0 })
  upvotes: number;

  @Column({ type: 'boolean', default: false })
  isAnonymous: boolean;

  @Column({ type: 'text', nullable: true })
  answer: string;

  @Column({ type: 'uuid', nullable: true })
  answeredById: string;

  @Column({ type: 'timestamp', nullable: true })
  answeredAt: Date;

  @Column({ type: 'boolean', default: false })
  isPinned: boolean;

  @Column({ type: 'int', nullable: true })
  priority: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => LiveStream, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'streamId' })
  stream: LiveStream;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'answeredById' })
  answeredBy: User;
}

@Entity('qa_question_upvotes')
@Index(['questionId', 'userId'], { unique: true })
export class QAQuestionUpvote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  questionId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => QAQuestion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionId' })
  question: QAQuestion;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
