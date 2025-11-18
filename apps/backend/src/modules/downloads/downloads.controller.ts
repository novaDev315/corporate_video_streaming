import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DownloadsService } from './downloads.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities';

@ApiTags('Offline Downloads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('downloads')
export class DownloadsController {
  constructor(private readonly downloadsService: DownloadsService) {}

  @Post('prepare')
  @ApiOperation({ summary: 'Prepare video for offline download' })
  async prepareDownload(
    @CurrentUser() user: User,
    @Body() downloadData: any,
  ) {
    return this.downloadsService.prepareDownload({
      ...downloadData,
      userId: user.id,
    });
  }

  @Get('user')
  @ApiOperation({ summary: 'Get all downloads for current user' })
  async getUserDownloads(
    @CurrentUser() user: User,
    @Query('status') status?: string,
  ) {
    return this.downloadsService.getUserDownloads(user.id, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get download by ID' })
  async getDownload(@Param('id') id: string) {
    return this.downloadsService.getDownload(id);
  }

  @Get(':id/url')
  @ApiOperation({ summary: 'Get secure download URL' })
  async getDownloadUrl(@Param('id') id: string, @CurrentUser() user: User) {
    return this.downloadsService.getDownloadUrl(id, user.id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark download as completed' })
  async markComplete(@Param('id') id: string, @Body() data: any) {
    return this.downloadsService.markComplete(id, data.deviceId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete download record' })
  async deleteDownload(@Param('id') id: string, @CurrentUser() user: User) {
    return this.downloadsService.deleteDownload(id, user.id);
  }

  @Get('videos/:videoId/available')
  @ApiOperation({ summary: 'Check if video is available for offline download' })
  async checkAvailability(
    @Param('videoId') videoId: string,
    @CurrentUser() user: User,
  ) {
    return this.downloadsService.checkDownloadAvailability(videoId, user.id);
  }
}
