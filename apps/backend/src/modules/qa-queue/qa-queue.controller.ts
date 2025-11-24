import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { QAQueueService } from './qa-queue.service';
import { QAQueueGateway } from './qa-queue.gateway';
import { QuestionStatus } from '../../database/entities/qa-question.entity';

@ApiTags('Q&A Queue')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('streams/:streamId/qa')
export class QAQueueController {
  constructor(
    private readonly qaService: QAQueueService,
    private readonly qaGateway: QAQueueGateway,
  ) {}

  @Post('questions')
  @ApiOperation({ summary: 'Submit a question' })
  async submitQuestion(
    @Request() req,
    @Param('streamId') streamId: string,
    @Body() body: { question: string; isAnonymous?: boolean },
  ) {
    return this.qaService.submitQuestion(streamId, req.user.id, body);
  }

  @Get('questions')
  @ApiOperation({ summary: 'Get questions' })
  async getQuestions(
    @Param('streamId') streamId: string,
    @Query('status') status?: QuestionStatus,
    @Query('sortBy') sortBy?: 'upvotes' | 'createdAt',
    @Query('limit') limit?: number,
  ) {
    return this.qaService.getQuestions(streamId, { status, sortBy, limit });
  }

  @Get('questions/pinned')
  @ApiOperation({ summary: 'Get pinned question' })
  async getPinnedQuestion(@Param('streamId') streamId: string) {
    return this.qaService.getPinnedQuestion(streamId);
  }

  @Post('questions/:questionId/approve')
  @ApiOperation({ summary: 'Approve a question' })
  async approveQuestion(@Param('questionId') questionId: string) {
    return this.qaService.approveQuestion(questionId);
  }

  @Post('questions/:questionId/dismiss')
  @ApiOperation({ summary: 'Dismiss a question' })
  async dismissQuestion(@Param('questionId') questionId: string) {
    return this.qaService.dismissQuestion(questionId);
  }

  @Post('questions/:questionId/answer')
  @ApiOperation({ summary: 'Answer a question' })
  async answerQuestion(
    @Request() req,
    @Param('streamId') streamId: string,
    @Param('questionId') questionId: string,
    @Body() body: { answer: string },
  ) {
    const question = await this.qaService.answerQuestion(
      questionId,
      req.user.id,
      body.answer,
    );
    this.qaGateway.broadcastQuestionAnswered(streamId, question);
    return question;
  }

  @Post('questions/:questionId/upvote')
  @ApiOperation({ summary: 'Upvote a question' })
  async upvoteQuestion(
    @Request() req,
    @Param('questionId') questionId: string,
  ) {
    return this.qaService.upvoteQuestion(questionId, req.user.id);
  }

  @Delete('questions/:questionId/upvote')
  @ApiOperation({ summary: 'Remove upvote' })
  async removeUpvote(
    @Request() req,
    @Param('questionId') questionId: string,
  ) {
    return this.qaService.removeUpvote(questionId, req.user.id);
  }

  @Post('questions/:questionId/pin')
  @ApiOperation({ summary: 'Pin a question' })
  async pinQuestion(
    @Param('streamId') streamId: string,
    @Param('questionId') questionId: string,
  ) {
    const question = await this.qaService.pinQuestion(questionId);
    this.qaGateway.broadcastPinnedQuestion(streamId, question);
    return question;
  }

  @Get('questions/:questionId/upvoted')
  @ApiOperation({ summary: 'Check if user has upvoted' })
  async hasUpvoted(@Request() req, @Param('questionId') questionId: string) {
    const upvoted = await this.qaService.hasUpvoted(questionId, req.user.id);
    return { upvoted };
  }

  @Delete('questions/:questionId')
  @ApiOperation({ summary: 'Delete a question' })
  async deleteQuestion(@Param('questionId') questionId: string) {
    await this.qaService.deleteQuestion(questionId);
    return { message: 'Question deleted' };
  }
}
