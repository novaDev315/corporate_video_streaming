import {
  Controller,
  Post,
  Get,
  Query,
  UseGuards,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { BulkUploadService } from './bulk-upload.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities';

@ApiTags('Upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly bulkUploadService: BulkUploadService,
  ) {}

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

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk upload multiple videos' })
  async bulkUpload(@CurrentUser() user: User, @Body() uploadData: any) {
    return this.bulkUploadService.bulkUpload({
      ...uploadData,
      orgId: user.orgId,
      createdById: user.id,
    });
  }

  @Get('bulk/:jobId/progress')
  @ApiOperation({ summary: 'Get bulk upload progress' })
  async getBulkProgress(@Param('jobId') jobId: string) {
    return this.bulkUploadService.getUploadProgress(jobId);
  }
}
