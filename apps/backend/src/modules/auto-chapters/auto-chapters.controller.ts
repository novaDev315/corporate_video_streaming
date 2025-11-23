import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AutoChaptersService } from './auto-chapters.service';

@ApiTags('Auto Chapters')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('videos/:videoId/auto-chapters')
export class AutoChaptersController {
  constructor(private readonly autoChaptersService: AutoChaptersService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate AI chapters for a video' })
  async generateChapters(
    @Param('videoId') videoId: string,
    @Body()
    body: {
      minChapterLength?: number;
      maxChapters?: number;
      useTranscript?: boolean;
    },
  ) {
    return this.autoChaptersService.generateChapters(videoId, body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all chapters for a video' })
  async getChapters(@Param('videoId') videoId: string) {
    return this.autoChaptersService.getChapters(videoId);
  }

  @Post()
  @ApiOperation({ summary: 'Add a manual chapter' })
  async addChapter(
    @Param('videoId') videoId: string,
    @Body()
    body: {
      title: string;
      startTime: number;
      endTime?: number;
      description?: string;
      thumbnailUrl?: string;
    },
  ) {
    return this.autoChaptersService.saveChapter({ videoId, ...body });
  }

  @Put(':chapterId')
  @ApiOperation({ summary: 'Update a chapter' })
  async updateChapter(
    @Param('chapterId') chapterId: string,
    @Body()
    body: {
      title?: string;
      description?: string;
      startTime?: number;
      endTime?: number;
    },
  ) {
    return this.autoChaptersService.updateChapter(chapterId, body);
  }

  @Put('reorder')
  @ApiOperation({ summary: 'Reorder chapters' })
  async reorderChapters(
    @Param('videoId') videoId: string,
    @Body() body: { chapterIds: string[] },
  ) {
    return this.autoChaptersService.reorderChapters(videoId, body.chapterIds);
  }

  @Delete(':chapterId')
  @ApiOperation({ summary: 'Delete a chapter' })
  async deleteChapter(@Param('chapterId') chapterId: string) {
    await this.autoChaptersService.deleteChapter(chapterId);
    return { message: 'Chapter deleted' };
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all chapters for a video' })
  async deleteAllChapters(@Param('videoId') videoId: string) {
    await this.autoChaptersService.deleteAllChapters(videoId);
    return { message: 'All chapters deleted' };
  }
}
