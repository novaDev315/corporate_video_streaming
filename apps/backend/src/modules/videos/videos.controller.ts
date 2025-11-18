import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VideosService } from './videos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities';

@ApiTags('Videos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get()
  @ApiOperation({ summary: 'Get all videos for organization' })
  async getVideos(
    @CurrentUser() user: User,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.videosService.findAll(user.orgId, { category, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get video by ID' })
  async getVideo(@Param('id') id: string) {
    return this.videosService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new video entry' })
  async createVideo(@CurrentUser() user: User, @Body() createData: any) {
    return this.videosService.create({
      ...createData,
      orgId: user.orgId,
      createdById: user.id,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update video metadata' })
  async updateVideo(@Param('id') id: string, @Body() updateData: any) {
    return this.videosService.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete video' })
  async deleteVideo(@Param('id') id: string) {
    return this.videosService.delete(id);
  }

  @Post(':id/process')
  @ApiOperation({ summary: 'Trigger video processing' })
  async processVideo(@Param('id') id: string) {
    return this.videosService.processVideo(id);
  }

  @Post(':id/track')
  @ApiOperation({ summary: 'Track video view analytics' })
  async trackView(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() trackingData: any,
  ) {
    return this.videosService.trackView(id, user.id, trackingData);
  }
}
