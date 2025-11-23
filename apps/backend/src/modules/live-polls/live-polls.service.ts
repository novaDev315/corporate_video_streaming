import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { LivePoll, LivePollVote, PollStatus, PollOption } from '../../database/entities/live-poll.entity';

@Injectable()
export class LivePollsService {
  constructor(
    @InjectRepository(LivePoll)
    private pollRepository: Repository<LivePoll>,
    @InjectRepository(LivePollVote)
    private voteRepository: Repository<LivePollVote>,
  ) {}

  async createPoll(
    streamId: string,
    userId: string,
    data: {
      question: string;
      options: string[];
      allowMultipleVotes?: boolean;
      durationSeconds?: number;
    },
  ): Promise<LivePoll> {
    if (data.options.length < 2) {
      throw new BadRequestException('Poll must have at least 2 options');
    }

    const options: PollOption[] = data.options.map((text) => ({
      id: uuidv4(),
      text,
      votes: 0,
    }));

    const poll = this.pollRepository.create({
      streamId,
      createdById: userId,
      question: data.question,
      options,
      allowMultipleVotes: data.allowMultipleVotes || false,
      durationSeconds: data.durationSeconds,
      status: PollStatus.DRAFT,
    });

    return this.pollRepository.save(poll);
  }

  async startPoll(pollId: string): Promise<LivePoll> {
    const poll = await this.pollRepository.findOne({ where: { id: pollId } });

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    if (poll.status !== PollStatus.DRAFT) {
      throw new BadRequestException('Poll has already been started');
    }

    poll.status = PollStatus.ACTIVE;
    poll.startedAt = new Date();

    return this.pollRepository.save(poll);
  }

  async closePoll(pollId: string): Promise<LivePoll> {
    const poll = await this.pollRepository.findOne({ where: { id: pollId } });

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    poll.status = PollStatus.CLOSED;
    poll.closedAt = new Date();

    return this.pollRepository.save(poll);
  }

  async vote(
    pollId: string,
    userId: string,
    optionId: string,
  ): Promise<LivePoll> {
    const poll = await this.pollRepository.findOne({ where: { id: pollId } });

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    if (poll.status !== PollStatus.ACTIVE) {
      throw new BadRequestException('Poll is not active');
    }

    // Check for existing vote
    const existingVote = await this.voteRepository.findOne({
      where: { pollId, userId },
    });

    if (existingVote && !poll.allowMultipleVotes) {
      throw new ConflictException('You have already voted');
    }

    // Validate option
    const optionIndex = poll.options.findIndex((o) => o.id === optionId);
    if (optionIndex === -1) {
      throw new BadRequestException('Invalid option');
    }

    // Record vote
    const vote = this.voteRepository.create({
      pollId,
      userId,
      optionId,
    });
    await this.voteRepository.save(vote);

    // Update poll counts
    poll.options[optionIndex].votes += 1;
    poll.totalVotes += 1;

    return this.pollRepository.save(poll);
  }

  async getPoll(pollId: string): Promise<LivePoll> {
    const poll = await this.pollRepository.findOne({
      where: { id: pollId },
      relations: ['createdBy'],
    });

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    return poll;
  }

  async getStreamPolls(streamId: string): Promise<LivePoll[]> {
    return this.pollRepository.find({
      where: { streamId },
      order: { createdAt: 'DESC' },
    });
  }

  async getActivePoll(streamId: string): Promise<LivePoll | null> {
    return this.pollRepository.findOne({
      where: { streamId, status: PollStatus.ACTIVE },
    });
  }

  async hasVoted(pollId: string, userId: string): Promise<boolean> {
    const vote = await this.voteRepository.findOne({
      where: { pollId, userId },
    });
    return !!vote;
  }

  async getPollResults(pollId: string): Promise<{
    poll: LivePoll;
    percentages: { optionId: string; percentage: number }[];
  }> {
    const poll = await this.getPoll(pollId);

    const percentages = poll.options.map((option) => ({
      optionId: option.id,
      percentage:
        poll.totalVotes > 0
          ? Math.round((option.votes / poll.totalVotes) * 100)
          : 0,
    }));

    return { poll, percentages };
  }

  async deletePoll(pollId: string): Promise<void> {
    const result = await this.pollRepository.delete({ id: pollId });
    if (result.affected === 0) {
      throw new NotFoundException('Poll not found');
    }
  }
}
