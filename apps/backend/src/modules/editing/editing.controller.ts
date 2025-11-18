import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EditingService } from './editing.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities';

@ApiTags('Video Editing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('editing')
export class EditingController {
  constructor(private readonly editingService: EditingService) {}

  @Post('trim')
  @ApiOperation({ summary: 'Trim video' })
  async trimVideo(@CurrentUser() user: User, @Body() trimData: any) {
    return this.editingService.trimVideo({
      ...trimData,
      userId: user.id,
    });
  }

  @Post('cut')
  @ApiOperation({ summary: 'Cut sections from video' })
  async cutVideo(@CurrentUser() user: User, @Body() cutData: any) {
    return this.editingService.cutVideo({
      ...cutData,
      userId: user.id,
    });
  }

  @Post('merge')
  @ApiOperation({ summary: 'Merge multiple videos' })
  async mergeVideos(@CurrentUser() user: User, @Body() mergeData: any) {
    return this.editingService.mergeVideos({
      ...mergeData,
      userId: user.id,
    });
  }

  @Post('add-intro')
  @ApiOperation({ summary: 'Add intro to video' })
  async addIntro(@CurrentUser() user: User, @Body() introData: any) {
    return this.editingService.addIntro({
      ...introData,
      userId: user.id,
    });
  }

  @Post('add-outro')
  @ApiOperation({ summary: 'Add outro to video' })
  async addOutro(@CurrentUser() user: User, @Body() outroData: any) {
    return this.editingService.addOutro({
      ...outroData,
      userId: user.id,
    });
  }

  @Post('audio-level')
  @ApiOperation({ summary: 'Adjust audio levels' })
  async adjustAudio(@CurrentUser() user: User, @Body() audioData: any) {
    return this.editingService.adjustAudioLevels({
      ...audioData,
      userId: user.id,
    });
  }

  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get editing job status' })
  async getJobStatus(@Param('id') id: string) {
    return this.editingService.getEditStatus(id);
  }

  @Get('user')
  @ApiOperation({ summary: 'Get all editing jobs for user' })
  async getUserJobs(@CurrentUser() user: User) {
    return this.editingService.getUserEdits(user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel editing job' })
  async cancelJob(@Param('id') id: string) {
    return this.editingService.cancelEdit(id);
  }
}
