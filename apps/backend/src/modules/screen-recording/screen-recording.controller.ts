import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ScreenRecordingService } from './screen-recording.service';
import { RecordingSource, RecordingStatus } from '../../database/entities/screen-recording.entity';

@ApiTags('Screen Recording')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recordings')
export class ScreenRecordingController {
  constructor(private readonly recordingService: ScreenRecordingService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start a new recording session' })
  async startRecording(
    @Request() req,
    @Body()
    body: {
      title: string;
      source: RecordingSource;
      includeAudio?: boolean;
      includeWebcam?: boolean;
      resolution?: string;
      frameRate?: number;
      metadata?: any;
    },
  ) {
    return this.recordingService.startRecording(
      req.user.id,
      req.user.organizationId,
      body,
    );
  }

  @Post(':recordingId/pause')
  @ApiOperation({ summary: 'Pause recording' })
  async pauseRecording(
    @Request() req,
    @Param('recordingId') recordingId: string,
  ) {
    return this.recordingService.pauseRecording(recordingId, req.user.id);
  }

  @Post(':recordingId/resume')
  @ApiOperation({ summary: 'Resume recording' })
  async resumeRecording(
    @Request() req,
    @Param('recordingId') recordingId: string,
  ) {
    return this.recordingService.resumeRecording(recordingId, req.user.id);
  }

  @Post(':recordingId/stop')
  @ApiOperation({ summary: 'Stop recording and save' })
  async stopRecording(
    @Request() req,
    @Param('recordingId') recordingId: string,
    @Body()
    body: {
      rawVideoUrl: string;
      duration: number;
      fileSize: number;
    },
  ) {
    return this.recordingService.stopRecording(recordingId, req.user.id, body);
  }

  @Get()
  @ApiOperation({ summary: 'Get user recordings' })
  async getUserRecordings(
    @Request() req,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('status') status?: RecordingStatus,
  ) {
    return this.recordingService.getUserRecordings(req.user.id, {
      limit,
      offset,
      status,
    });
  }

  @Get(':recordingId')
  @ApiOperation({ summary: 'Get recording details' })
  async getRecording(@Param('recordingId') recordingId: string) {
    return this.recordingService.getRecording(recordingId);
  }

  @Post(':recordingId/convert')
  @ApiOperation({ summary: 'Convert recording to video' })
  async convertToVideo(
    @Request() req,
    @Param('recordingId') recordingId: string,
    @Body()
    body: {
      title?: string;
      description?: string;
      publish?: boolean;
    },
  ) {
    return this.recordingService.convertToVideo(recordingId, req.user.id, body);
  }

  @Delete(':recordingId')
  @ApiOperation({ summary: 'Delete recording' })
  async deleteRecording(
    @Request() req,
    @Param('recordingId') recordingId: string,
  ) {
    await this.recordingService.deleteRecording(recordingId, req.user.id);
    return { message: 'Recording deleted' };
  }
}
