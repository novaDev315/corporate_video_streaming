import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class UploadService {
  constructor(private readonly configService: ConfigService) {}

  async getPresignedUrl(fileName: string, fileType: string) {
    // TODO: Implement AWS S3 presigned URL generation
    // const client = new S3Client({
    //   region: this.configService.get('AWS_REGION'),
    // });

    // const command = new PutObjectCommand({
    //   Bucket: this.configService.get('AWS_S3_BUCKET'),
    //   Key: `uploads/${Date.now()}-${fileName}`,
    //   ContentType: fileType,
    // });

    // const url = await getSignedUrl(client, command, { expiresIn: 3600 });

    const s3Key = `uploads/${Date.now()}-${fileName}`;
    const mockUrl = `https://s3.example.com/${s3Key}`;

    return {
      uploadUrl: mockUrl,
      s3Key,
      expiresIn: 3600,
    };
  }

  async completeUpload(videoId: string, s3Key: string) {
    // TODO: Update video record with S3 key
    return {
      success: true,
      message: 'Upload completed',
      videoId,
      s3Key,
    };
  }
}
