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
import { ChaptersService } from './chapters.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Video Chapters')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Get('videos/:videoId')
  @ApiOperation({ summary: 'Get all chapters for a video' })
  async getChapters(@Param('videoId') videoId: string) {
    return this.chaptersService.findByVideo(videoId);
  }

  @Post()
  @ApiOperation({ summary: 'Create video chapter' })
  async createChapter(@Body() createData: any) {
    return this.chaptersService.create(createData);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update chapter' })
  async updateChapter(@Param('id') id: string, @Body() updateData: any) {
    return this.chaptersService.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete chapter' })
  async deleteChapter(@Param('id') id: string) {
    return this.chaptersService.delete(id);
  }
}
