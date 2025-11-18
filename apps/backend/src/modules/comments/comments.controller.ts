import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities';

@ApiTags('Comments & Reactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('videos/:videoId')
  @ApiOperation({ summary: 'Get all comments for a video' })
  async getComments(@Param('videoId') videoId: string) {
    return this.commentsService.findByVideo(videoId);
  }

  @Post()
  @ApiOperation({ summary: 'Add comment to video' })
  async addComment(@CurrentUser() user: User, @Body() createData: any) {
    return this.commentsService.create({
      ...createData,
      userId: user.id,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Edit comment' })
  async updateComment(@Param('id') id: string, @Body() updateData: any) {
    return this.commentsService.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete comment' })
  async deleteComment(@Param('id') id: string) {
    return this.commentsService.delete(id);
  }

  @Post('reactions')
  @ApiOperation({ summary: 'Add reaction to video' })
  async addReaction(@CurrentUser() user: User, @Body() reactionData: any) {
    return this.commentsService.addReaction({
      ...reactionData,
      userId: user.id,
    });
  }

  @Get('videos/:videoId/reactions')
  @ApiOperation({ summary: 'Get reaction summary for video' })
  async getReactions(@Param('videoId') videoId: string) {
    return this.commentsService.getReactionsSummary(videoId);
  }

  @Put('moderate/:id')
  @ApiOperation({ summary: 'Moderate comment (admin only)' })
  async moderateComment(@Param('id') id: string, @Body() data: any) {
    return this.commentsService.moderate(id, data.isModerated);
  }
}
