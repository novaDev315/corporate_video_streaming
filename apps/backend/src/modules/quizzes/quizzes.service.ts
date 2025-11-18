import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoQuiz } from '../../database/entities';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(VideoQuiz)
    private readonly quizRepository: Repository<VideoQuiz>,
  ) {}

  async findByVideo(videoId: string): Promise<VideoQuiz[]> {
    return this.quizRepository.find({
      where: { videoId },
      order: { timestamp: 'ASC' },
    });
  }

  async create(createData: Partial<VideoQuiz>): Promise<VideoQuiz> {
    const quiz = this.quizRepository.create(createData);
    return this.quizRepository.save(quiz);
  }

  async update(id: string, updateData: Partial<VideoQuiz>): Promise<VideoQuiz> {
    await this.quizRepository.update(id, updateData);
    return this.quizRepository.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.quizRepository.delete(id);
  }

  async checkAnswer(id: string, answer: string) {
    const quiz = await this.quizRepository.findOne({ where: { id } });

    if (!quiz) {
      return { correct: false, message: 'Quiz not found' };
    }

    const isCorrect = quiz.correctAnswer.toLowerCase() === answer.toLowerCase();

    return {
      correct: isCorrect,
      correctAnswer: isCorrect ? undefined : quiz.correctAnswer,
      message: isCorrect ? 'Correct!' : 'Incorrect. Try again.',
    };
  }
}
