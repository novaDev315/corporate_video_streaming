import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LivePollsService } from './live-polls.service';
import { LivePollsGateway } from './live-polls.gateway';

@ApiTags('Live Polls')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('streams/:streamId/polls')
export class LivePollsController {
  constructor(
    private readonly pollsService: LivePollsService,
    private readonly pollsGateway: LivePollsGateway,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a poll' })
  async createPoll(
    @Request() req,
    @Param('streamId') streamId: string,
    @Body()
    body: {
      question: string;
      options: string[];
      allowMultipleVotes?: boolean;
      durationSeconds?: number;
    },
  ) {
    return this.pollsService.createPoll(streamId, req.user.id, body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all polls for a stream' })
  async getPolls(@Param('streamId') streamId: string) {
    return this.pollsService.getStreamPolls(streamId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active poll' })
  async getActivePoll(@Param('streamId') streamId: string) {
    return this.pollsService.getActivePoll(streamId);
  }

  @Get(':pollId')
  @ApiOperation({ summary: 'Get poll details' })
  async getPoll(@Param('pollId') pollId: string) {
    return this.pollsService.getPoll(pollId);
  }

  @Get(':pollId/results')
  @ApiOperation({ summary: 'Get poll results' })
  async getResults(@Param('pollId') pollId: string) {
    return this.pollsService.getPollResults(pollId);
  }

  @Post(':pollId/start')
  @ApiOperation({ summary: 'Start a poll' })
  async startPoll(
    @Param('streamId') streamId: string,
    @Param('pollId') pollId: string,
  ) {
    const poll = await this.pollsService.startPoll(pollId);
    this.pollsGateway.broadcastPollStart(streamId, poll);
    return poll;
  }

  @Post(':pollId/close')
  @ApiOperation({ summary: 'Close a poll' })
  async closePoll(
    @Param('streamId') streamId: string,
    @Param('pollId') pollId: string,
  ) {
    const poll = await this.pollsService.closePoll(pollId);
    this.pollsGateway.broadcastPollEnd(streamId, poll);
    return poll;
  }

  @Post(':pollId/vote')
  @ApiOperation({ summary: 'Vote on a poll' })
  async vote(
    @Request() req,
    @Param('pollId') pollId: string,
    @Body() body: { optionId: string },
  ) {
    return this.pollsService.vote(pollId, req.user.id, body.optionId);
  }

  @Get(':pollId/voted')
  @ApiOperation({ summary: 'Check if user has voted' })
  async hasVoted(@Request() req, @Param('pollId') pollId: string) {
    const voted = await this.pollsService.hasVoted(pollId, req.user.id);
    return { voted };
  }

  @Delete(':pollId')
  @ApiOperation({ summary: 'Delete a poll' })
  async deletePoll(@Param('pollId') pollId: string) {
    await this.pollsService.deletePoll(pollId);
    return { message: 'Poll deleted' };
  }
}
