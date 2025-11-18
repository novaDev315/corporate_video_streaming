import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoTranscript } from '../../database/entities';

@Injectable()
export class SubtitlesService {
  constructor(
    @InjectRepository(VideoTranscript)
    private readonly transcriptRepository: Repository<VideoTranscript>,
  ) {}

  async getTranscript(videoId: string, language: string = 'en') {
    return this.transcriptRepository.findOne({
      where: { videoId, language },
    });
  }

  async saveTranscript(transcriptData: Partial<VideoTranscript>) {
    const transcript = this.transcriptRepository.create(transcriptData);
    return this.transcriptRepository.save(transcript);
  }

  async editTranscript(id: string, updateData: Partial<VideoTranscript>) {
    await this.transcriptRepository.update(id, {
      ...updateData,
      isEdited: true,
    });
    return this.transcriptRepository.findOne({ where: { id } });
  }

  async generateVTT(id: string): Promise<string> {
    const transcript = await this.transcriptRepository.findOne({
      where: { id },
    });

    if (!transcript || !transcript.words) {
      return '';
    }

    // Generate WebVTT format
    let vtt = 'WEBVTT\n\n';

    transcript.words.forEach((word: any, index: number) => {
      const startTime = this.formatTime(word.start);
      const endTime = this.formatTime(word.end);

      vtt += `${index + 1}\n`;
      vtt += `${startTime} --> ${endTime}\n`;
      vtt += `${word.text}\n\n`;
    });

    return vtt;
  }

  async searchTranscript(videoId: string, query: string) {
    const transcript = await this.getTranscript(videoId);

    if (!transcript) {
      return { results: [] };
    }

    const searchRegex = new RegExp(query, 'gi');
    const results = [];

    if (transcript.words) {
      transcript.words.forEach((word: any) => {
        if (searchRegex.test(word.text)) {
          results.push({
            text: word.text,
            timestamp: word.start,
            context: word.text,
          });
        }
      });
    }

    return { results, total: results.length };
  }

  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
  }
}
