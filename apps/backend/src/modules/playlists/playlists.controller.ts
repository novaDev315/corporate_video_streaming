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
import { PlaylistsService } from './playlists.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities';

@ApiTags('Playlists')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all playlists for organization' })
  async getPlaylists(@CurrentUser() user: User) {
    return this.playlistsService.findAll(user.orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get playlist by ID with videos' })
  async getPlaylist(@Param('id') id: string) {
    return this.playlistsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new playlist' })
  async createPlaylist(@CurrentUser() user: User, @Body() createData: any) {
    return this.playlistsService.create({
      ...createData,
      orgId: user.orgId,
      createdById: user.id,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update playlist' })
  async updatePlaylist(@Param('id') id: string, @Body() updateData: any) {
    return this.playlistsService.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete playlist' })
  async deletePlaylist(@Param('id') id: string) {
    return this.playlistsService.delete(id);
  }

  @Post(':id/videos/:videoId')
  @ApiOperation({ summary: 'Add video to playlist' })
  async addVideo(@Param('id') id: string, @Param('videoId') videoId: string) {
    return this.playlistsService.addVideo(id, videoId);
  }

  @Delete(':id/videos/:videoId')
  @ApiOperation({ summary: 'Remove video from playlist' })
  async removeVideo(
    @Param('id') id: string,
    @Param('videoId') videoId: string,
  ) {
    return this.playlistsService.removeVideo(id, videoId);
  }
}
