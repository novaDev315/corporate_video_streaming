import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { AutoChaptersService } from './auto-chapters.service';

interface TranscriptSegment {
  text: string;
  startTime: number;
  endTime: number;
}

@Processor('chapter-generation')
export class ChapterGeneratorProcessor {
  constructor(private readonly autoChaptersService: AutoChaptersService) {}

  @Process('generate-chapters')
  async handleGeneration(job: Job) {
    const { videoId, duration, transcript, minChapterLength, maxChapters } =
      job.data;

    try {
      // Clear existing auto-generated chapters
      await this.autoChaptersService.deleteAllChapters(videoId);

      await job.progress(10);

      let chapters: { title: string; startTime: number; endTime: number }[] = [];

      if (transcript && transcript.length > 0) {
        // Generate chapters from transcript using topic detection
        chapters = await this.generateFromTranscript(
          transcript,
          duration,
          minChapterLength,
          maxChapters,
        );
      } else {
        // Generate chapters based on duration (evenly distributed)
        chapters = this.generateFromDuration(
          duration,
          minChapterLength,
          maxChapters,
        );
      }

      await job.progress(70);

      // Save chapters
      for (const chapter of chapters) {
        await this.autoChaptersService.saveChapter({
          videoId,
          title: chapter.title,
          startTime: chapter.startTime,
          endTime: chapter.endTime,
        });
      }

      await job.progress(100);

      return { success: true, chaptersGenerated: chapters.length };
    } catch (error) {
      console.error('Chapter generation failed:', error);
      throw error;
    }
  }

  private async generateFromTranscript(
    transcript: TranscriptSegment[],
    duration: number,
    minChapterLength: number,
    maxChapters: number,
  ): Promise<{ title: string; startTime: number; endTime: number }[]> {
    const chapters: { title: string; startTime: number; endTime: number }[] = [];

    // Group transcript into chunks based on timing and content
    const chunks = this.groupTranscriptChunks(transcript, minChapterLength);

    // Detect topic changes
    const topicBreaks = this.detectTopicBreaks(chunks, maxChapters);

    // Generate chapters from topic breaks
    for (let i = 0; i < topicBreaks.length; i++) {
      const currentBreak = topicBreaks[i];
      const nextBreak = topicBreaks[i + 1];

      const endTime = nextBreak?.startTime || duration;

      // Generate title from content
      const title = this.generateChapterTitle(currentBreak.text, i + 1);

      chapters.push({
        title,
        startTime: currentBreak.startTime,
        endTime,
      });
    }

    return chapters;
  }

  private generateFromDuration(
    duration: number,
    minChapterLength: number,
    maxChapters: number,
  ): { title: string; startTime: number; endTime: number }[] {
    const chapters: { title: string; startTime: number; endTime: number }[] = [];

    // Calculate optimal chapter length
    const idealChapterCount = Math.min(
      maxChapters,
      Math.floor(duration / minChapterLength),
    );

    if (idealChapterCount < 2) {
      return [{ title: 'Full Video', startTime: 0, endTime: duration }];
    }

    const chapterLength = duration / idealChapterCount;

    for (let i = 0; i < idealChapterCount; i++) {
      const startTime = Math.floor(i * chapterLength);
      const endTime = Math.floor((i + 1) * chapterLength);

      chapters.push({
        title: `Part ${i + 1}`,
        startTime,
        endTime: Math.min(endTime, duration),
      });
    }

    return chapters;
  }

  private groupTranscriptChunks(
    transcript: TranscriptSegment[],
    minChapterLength: number,
  ): TranscriptSegment[] {
    const chunks: TranscriptSegment[] = [];
    let currentChunk: TranscriptSegment | null = null;

    for (const segment of transcript) {
      if (!currentChunk) {
        currentChunk = { ...segment };
        continue;
      }

      // Check if we should start a new chunk
      if (segment.startTime - currentChunk.startTime >= minChapterLength) {
        chunks.push(currentChunk);
        currentChunk = { ...segment };
      } else {
        // Extend current chunk
        currentChunk.text += ' ' + segment.text;
        currentChunk.endTime = segment.endTime;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  private detectTopicBreaks(
    chunks: TranscriptSegment[],
    maxChapters: number,
  ): TranscriptSegment[] {
    // Simplified topic detection - in production use NLP/AI
    // Take evenly distributed chunks up to maxChapters
    if (chunks.length <= maxChapters) {
      return chunks;
    }

    const step = Math.ceil(chunks.length / maxChapters);
    const breaks: TranscriptSegment[] = [];

    for (let i = 0; i < chunks.length; i += step) {
      breaks.push(chunks[i]);
    }

    return breaks.slice(0, maxChapters);
  }

  private generateChapterTitle(text: string, index: number): string {
    // Extract key phrases - simplified version
    // In production, use NLP for better title generation
    const words = text.split(' ').slice(0, 10);
    const cleanWords = words.filter(
      (w) => w.length > 3 && !this.isStopWord(w.toLowerCase()),
    );

    if (cleanWords.length >= 3) {
      return this.capitalizeWords(cleanWords.slice(0, 4).join(' '));
    }

    return `Chapter ${index}`;
  }

  private isStopWord(word: string): boolean {
    const stopWords = [
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all',
      'can', 'her', 'was', 'one', 'our', 'out', 'very', 'have',
      'this', 'that', 'with', 'from', 'they', 'been', 'have',
    ];
    return stopWords.includes(word);
  }

  private capitalizeWords(str: string): string {
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}
