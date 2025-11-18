import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoComment, VideoReaction } from '../../database/entities';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(VideoComment)
    private readonly commentRepository: Repository<VideoComment>,
    @InjectRepository(VideoReaction)
    private readonly reactionRepository: Repository<VideoReaction>,
  ) {}

  async findByVideo(videoId: string): Promise<VideoComment[]> {
    return this.commentRepository.find({
      where: { videoId, isModerated: false },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(createData: Partial<VideoComment>): Promise<VideoComment> {
    const comment = this.commentRepository.create(createData);
    return this.commentRepository.save(comment);
  }

  async update(
    id: string,
    updateData: Partial<VideoComment>,
  ): Promise<VideoComment> {
    await this.commentRepository.update(id, updateData);
    return this.commentRepository.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.commentRepository.delete(id);
  }

  async moderate(id: string, isModerated: boolean) {
    await this.commentRepository.update(id, { isModerated });
    return { success: true, message: 'Comment moderated' };
  }

  async addReaction(reactionData: Partial<VideoReaction>) {
    // Check if user already reacted
    const existing = await this.reactionRepository.findOne({
      where: {
        videoId: reactionData.videoId,
        userId: reactionData.userId,
      },
    });

    if (existing) {
      // Update existing reaction
      await this.reactionRepository.update(existing.id, {
        type: reactionData.type,
      });
      return { success: true, message: 'Reaction updated' };
    }

    const reaction = this.reactionRepository.create(reactionData);
    await this.reactionRepository.save(reaction);
    return { success: true, message: 'Reaction added' };
  }

  async getReactionsSummary(videoId: string) {
    const reactions = await this.reactionRepository.find({
      where: { videoId },
    });

    const summary = reactions.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {});

    return {
      total: reactions.length,
      breakdown: summary,
    };
  }
}
