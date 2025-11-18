import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoTranscript } from '../../database/entities';
import { SubtitlesController } from './subtitles.controller';
import { SubtitlesService } from './subtitles.service';

@Module({
  imports: [TypeOrmModule.forFeature([VideoTranscript])],
  controllers: [SubtitlesController],
  providers: [SubtitlesService],
  exports: [SubtitlesService],
})
export class SubtitlesModule {}
