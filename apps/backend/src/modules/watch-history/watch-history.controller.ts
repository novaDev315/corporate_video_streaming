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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WatchHistoryService } from './watch-history.service';

@ApiTags('Watch History')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('watch-history')
export class WatchHistoryController {
  constructor(private readonly watchHistoryService: WatchHistoryService) {}

  @Post('progress')
  @ApiOperation({ summary: 'Update watch progress for a video' })
  async updateProgress(
    @Request() req,
    @Body()
    body: {
      videoId: string;
      watchedSeconds: number;
      totalDuration?: number;
      deviceType?: string;
    },
  ) {
    return this.watchHistoryService.updateProgress(req.user.id, body.videoId, {
      watchedSeconds: body.watchedSeconds,
      totalDuration: body.totalDuration,
      deviceType: body.deviceType,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get user watch history' })
  async getHistory(
    @Request() req,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('completed') completed?: boolean,
  ) {
    return this.watchHistoryService.getHistory(req.user.id, {
      limit,
      offset,
      completed,
    });
  }

  @Get('continue-watching')
  @ApiOperation({ summary: 'Get videos to continue watching' })
  async getContinueWatching(@Request() req, @Query('limit') limit?: number) {
    return this.watchHistoryService.getContinueWatching(req.user.id, limit);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recently watched videos' })
  async getRecentlyWatched(@Request() req, @Query('days') days?: number) {
    return this.watchHistoryService.getRecentlyWatched(req.user.id, days);
  }

  @Get(':videoId/resume')
  @ApiOperation({ summary: 'Get resume position for a video' })
  async getResumePosition(@Request() req, @Param('videoId') videoId: string) {
    const position = await this.watchHistoryService.getResumePosition(
      req.user.id,
      videoId,
    );
    return { resumePosition: position };
  }

  @Post(':videoId/complete')
  @ApiOperation({ summary: 'Mark a video as completed' })
  async markCompleted(@Request() req, @Param('videoId') videoId: string) {
    return this.watchHistoryService.markCompleted(req.user.id, videoId);
  }

  @Delete(':videoId')
  @ApiOperation({ summary: 'Remove a video from watch history' })
  async removeFromHistory(@Request() req, @Param('videoId') videoId: string) {
    await this.watchHistoryService.removeFromHistory(req.user.id, videoId);
    return { message: 'Removed from history' };
  }

  @Delete()
  @ApiOperation({ summary: 'Clear all watch history' })
  async clearHistory(@Request() req) {
    await this.watchHistoryService.clearHistory(req.user.id);
    return { message: 'Watch history cleared' };
  }
}
