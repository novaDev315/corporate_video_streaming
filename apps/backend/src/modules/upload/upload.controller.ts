import {
  Controller,
  Post,
  Get,
  Query,
  UseGuards,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('presigned-url')
  @ApiOperation({ summary: 'Get presigned URL for video upload' })
  async getPresignedUrl(
    @Body() data: { fileName: string; fileType: string },
  ) {
    return this.uploadService.getPresignedUrl(data.fileName, data.fileType);
  }

  @Post('complete')
  @ApiOperation({ summary: 'Mark upload as complete' })
  async completeUpload(@Body() data: { videoId: string; s3Key: string }) {
    return this.uploadService.completeUpload(data.videoId, data.s3Key);
  }
}
