import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubtitlesService } from './subtitles.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Subtitles & Transcripts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subtitles')
export class SubtitlesController {
  constructor(private readonly subtitlesService: SubtitlesService) {}

  @Get('videos/:videoId')
  @ApiOperation({ summary: 'Get transcript for video' })
  async getTranscript(
    @Param('videoId') videoId: string,
    @Param('language') language?: string,
  ) {
    return this.subtitlesService.getTranscript(videoId, language || 'en');
  }

  @Post()
  @ApiOperation({ summary: 'Create or update transcript' })
  async saveTranscript(@Body() transcriptData: any) {
    return this.subtitlesService.saveTranscript(transcriptData);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Edit transcript' })
  async editTranscript(@Param('id') id: string, @Body() updateData: any) {
    return this.subtitlesService.editTranscript(id, updateData);
  }

  @Get(':id/vtt')
  @ApiOperation({ summary: 'Get WebVTT subtitle file' })
  async getVTT(@Param('id') id: string) {
    return this.subtitlesService.generateVTT(id);
  }

  @Get('videos/:videoId/search')
  @ApiOperation({ summary: 'Search within transcript' })
  async searchTranscript(
    @Param('videoId') videoId: string,
    @Body() searchQuery: { query: string },
  ) {
    return this.subtitlesService.searchTranscript(videoId, searchQuery.query);
  }
}
