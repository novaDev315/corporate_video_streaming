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
import { AccessLinksService } from './access-links.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities';

@ApiTags('Access Links')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('access-links')
export class AccessLinksController {
  constructor(private readonly accessLinksService: AccessLinksService) {}

  @Post()
  @ApiOperation({ summary: 'Create temporary access link' })
  async createLink(@CurrentUser() user: User, @Body() createData: any) {
    return this.accessLinksService.create({
      ...createData,
      createdById: user.id,
    });
  }

  @Get('videos/:videoId')
  @ApiOperation({ summary: 'Get all access links for a video' })
  async getLinks(@Param('videoId') videoId: string) {
    return this.accessLinksService.findByVideo(videoId);
  }

  @Get('validate/:token')
  @ApiOperation({ summary: 'Validate access link token' })
  async validateLink(@Param('token') token: string) {
    return this.accessLinksService.validateToken(token);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revoke access link' })
  async revokeLink(@Param('id') id: string) {
    return this.accessLinksService.revoke(id);
  }
}
