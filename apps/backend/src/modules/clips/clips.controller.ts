import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ClipsService } from './clips.service';
import { ClipVisibility } from '../../database/entities/video-clip.entity';

@ApiTags('Video Clips')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clips')
export class ClipsController {
  constructor(private readonly clipsService: ClipsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a clip from a video' })
  async createClip(
    @Request() req,
    @Body()
    body: {
      sourceVideoId: string;
      title: string;
      description?: string;
      startTime: number;
      endTime: number;
      visibility?: ClipVisibility;
    },
  ) {
    return this.clipsService.createClip(req.user.id, body);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my clips' })
  async getMyClips(
    @Request() req,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.clipsService.getUserClips(req.user.id, { limit, offset });
  }

  @Get(':clipId')
  @ApiOperation({ summary: 'Get clip details' })
  async getClip(@Param('clipId') clipId: string) {
    return this.clipsService.getClip(clipId);
  }

  @Get('share/:shareToken')
  @ApiOperation({ summary: 'Get clip by share token (public)' })
  async getClipByShareToken(@Param('shareToken') shareToken: string) {
    return this.clipsService.getClipByShareToken(shareToken);
  }

  @Get('video/:videoId')
  @ApiOperation({ summary: 'Get public clips for a video' })
  async getVideoClips(@Param('videoId') videoId: string) {
    return this.clipsService.getVideoClips(videoId);
  }

  @Put(':clipId')
  @ApiOperation({ summary: 'Update clip' })
  async updateClip(
    @Request() req,
    @Param('clipId') clipId: string,
    @Body()
    body: {
      title?: string;
      description?: string;
      visibility?: ClipVisibility;
    },
  ) {
    return this.clipsService.updateClip(clipId, req.user.id, body);
  }

  @Get(':clipId/share-url')
  @ApiOperation({ summary: 'Get shareable URL for clip' })
  async getShareUrl(@Request() req, @Param('clipId') clipId: string) {
    const url = await this.clipsService.getShareUrl(clipId, req.user.id);
    return { shareUrl: url };
  }

  @Delete(':clipId')
  @ApiOperation({ summary: 'Delete a clip' })
  async deleteClip(@Request() req, @Param('clipId') clipId: string) {
    await this.clipsService.deleteClip(clipId, req.user.id);
    return { message: 'Clip deleted' };
  }
}
