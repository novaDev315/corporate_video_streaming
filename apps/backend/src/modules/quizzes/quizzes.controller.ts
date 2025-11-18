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
import { QuizzesService } from './quizzes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Video Quizzes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get('videos/:videoId')
  @ApiOperation({ summary: 'Get all quizzes for a video' })
  async getQuizzes(@Param('videoId') videoId: string) {
    return this.quizzesService.findByVideo(videoId);
  }

  @Post()
  @ApiOperation({ summary: 'Create quiz question' })
  async createQuiz(@Body() createData: any) {
    return this.quizzesService.create(createData);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update quiz' })
  async updateQuiz(@Param('id') id: string, @Body() updateData: any) {
    return this.quizzesService.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete quiz' })
  async deleteQuiz(@Param('id') id: string) {
    return this.quizzesService.delete(id);
  }

  @Post(':id/check-answer')
  @ApiOperation({ summary: 'Check quiz answer' })
  async checkAnswer(@Param('id') id: string, @Body() data: any) {
    return this.quizzesService.checkAnswer(id, data.answer);
  }
}
