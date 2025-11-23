import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QAQuestion, QAQuestionUpvote, QuestionStatus } from '../../database/entities/qa-question.entity';

@Injectable()
export class QAQueueService {
  constructor(
    @InjectRepository(QAQuestion)
    private questionRepository: Repository<QAQuestion>,
    @InjectRepository(QAQuestionUpvote)
    private upvoteRepository: Repository<QAQuestionUpvote>,
  ) {}

  async submitQuestion(
    streamId: string,
    userId: string,
    data: { question: string; isAnonymous?: boolean },
  ): Promise<QAQuestion> {
    const question = this.questionRepository.create({
      streamId,
      userId,
      question: data.question,
      isAnonymous: data.isAnonymous || false,
      status: QuestionStatus.PENDING,
    });

    return this.questionRepository.save(question);
  }

  async getQuestions(
    streamId: string,
    options: {
      status?: QuestionStatus;
      sortBy?: 'upvotes' | 'createdAt';
      limit?: number;
    },
  ): Promise<QAQuestion[]> {
    const { status, sortBy = 'upvotes', limit = 50 } = options;

    const queryBuilder = this.questionRepository
      .createQueryBuilder('question')
      .where('question.streamId = :streamId', { streamId })
      .leftJoinAndSelect('question.user', 'user');

    if (status) {
      queryBuilder.andWhere('question.status = :status', { status });
    }

    if (sortBy === 'upvotes') {
      queryBuilder.orderBy('question.upvotes', 'DESC');
    } else {
      queryBuilder.orderBy('question.createdAt', 'DESC');
    }

    return queryBuilder.take(limit).getMany();
  }

  async approveQuestion(questionId: string): Promise<QAQuestion> {
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    question.status = QuestionStatus.APPROVED;
    return this.questionRepository.save(question);
  }

  async dismissQuestion(questionId: string): Promise<QAQuestion> {
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    question.status = QuestionStatus.DISMISSED;
    return this.questionRepository.save(question);
  }

  async answerQuestion(
    questionId: string,
    userId: string,
    answer: string,
  ): Promise<QAQuestion> {
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    question.status = QuestionStatus.ANSWERED;
    question.answer = answer;
    question.answeredById = userId;
    question.answeredAt = new Date();

    return this.questionRepository.save(question);
  }

  async upvoteQuestion(questionId: string, userId: string): Promise<QAQuestion> {
    const existing = await this.upvoteRepository.findOne({
      where: { questionId, userId },
    });

    if (existing) {
      throw new ConflictException('Already upvoted');
    }

    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    const upvote = this.upvoteRepository.create({ questionId, userId });
    await this.upvoteRepository.save(upvote);

    question.upvotes += 1;
    return this.questionRepository.save(question);
  }

  async removeUpvote(questionId: string, userId: string): Promise<QAQuestion> {
    const upvote = await this.upvoteRepository.findOne({
      where: { questionId, userId },
    });

    if (!upvote) {
      throw new NotFoundException('Upvote not found');
    }

    await this.upvoteRepository.delete({ questionId, userId });

    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });

    if (question) {
      question.upvotes = Math.max(0, question.upvotes - 1);
      return this.questionRepository.save(question);
    }

    throw new NotFoundException('Question not found');
  }

  async pinQuestion(questionId: string): Promise<QAQuestion> {
    // Unpin existing
    await this.questionRepository.update(
      { isPinned: true },
      { isPinned: false },
    );

    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    question.isPinned = true;
    return this.questionRepository.save(question);
  }

  async getPinnedQuestion(streamId: string): Promise<QAQuestion | null> {
    return this.questionRepository.findOne({
      where: { streamId, isPinned: true },
      relations: ['user', 'answeredBy'],
    });
  }

  async getQueuePosition(questionId: string): Promise<number> {
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    const count = await this.questionRepository.count({
      where: {
        streamId: question.streamId,
        status: QuestionStatus.APPROVED,
        upvotes: question.upvotes,
      },
    });

    return count;
  }

  async hasUpvoted(questionId: string, userId: string): Promise<boolean> {
    const upvote = await this.upvoteRepository.findOne({
      where: { questionId, userId },
    });
    return !!upvote;
  }

  async deleteQuestion(questionId: string): Promise<void> {
    const result = await this.questionRepository.delete({ id: questionId });
    if (result.affected === 0) {
      throw new NotFoundException('Question not found');
    }
  }
}
