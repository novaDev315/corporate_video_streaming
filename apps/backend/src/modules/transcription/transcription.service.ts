import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { TranscribeClient, StartTranscriptionJobCommand } from '@aws-sdk/client-transcribe';

@Injectable()
export class TranscriptionService {
  constructor(private readonly configService: ConfigService) {}

  async transcribeVideo(videoId: string, s3Uri: string): Promise<string> {
    // TODO: Implement AWS Transcribe integration
    // const client = new TranscribeClient({
    //   region: this.configService.get('AWS_REGION'),
    // });

    // const command = new StartTranscriptionJobCommand({
    //   TranscriptionJobName: `video-${videoId}`,
    //   Media: { MediaFileUri: s3Uri },
    //   MediaFormat: 'mp4',
    //   LanguageCode: 'en-US',
    // });

    // const response = await client.send(command);
    // return response.TranscriptionJob.TranscriptionJobName;

    console.log(`Transcribing video ${videoId} from ${s3Uri}`);
    return 'transcription-job-id';
  }

  async getTranscript(jobName: string): Promise<any> {
    // TODO: Implement fetching transcript from AWS Transcribe
    return {
      transcript: 'Sample transcript text...',
      words: [],
    };
  }
}
