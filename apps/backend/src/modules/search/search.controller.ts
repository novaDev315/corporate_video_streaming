import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SearchService } from './search.service';

@ApiTags('Search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search videos, transcripts, and chapters' })
  async searchAll(
    @Request() req,
    @Query('q') query: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('includeTranscripts') includeTranscripts?: boolean,
    @Query('includeChapters') includeChapters?: boolean,
    @Query('category') category?: string,
    @Query('tags') tags?: string,
  ) {
    return this.searchService.searchAll(req.user.organizationId, query, {
      limit,
      offset,
      includeTranscripts: includeTranscripts !== false,
      includeChapters: includeChapters !== false,
      category,
      tags: tags?.split(','),
    });
  }

  @Get('videos')
  @ApiOperation({ summary: 'Search videos only' })
  async searchVideos(
    @Request() req,
    @Query('q') query: string,
    @Query('category') category?: string,
    @Query('tags') tags?: string,
  ) {
    return this.searchService.searchVideos(req.user.organizationId, query, {
      category,
      tags: tags?.split(','),
    });
  }

  @Get('in-video/:videoId')
  @ApiOperation({ summary: 'Search within a video transcript' })
  async searchInVideo(
    @Param('videoId') videoId: string,
    @Query('q') query: string,
  ) {
    const matches = await this.searchService.searchInVideo(videoId, query);
    return { matches, total: matches.length };
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get search suggestions' })
  async getSuggestions(
    @Request() req,
    @Query('q') partialQuery: string,
    @Query('limit') limit?: number,
  ) {
    const suggestions = await this.searchService.getSuggestions(
      req.user.organizationId,
      partialQuery,
      limit,
    );
    return { suggestions };
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular searches' })
  async getPopularSearches(@Request() req) {
    const searches = await this.searchService.getPopularSearches(
      req.user.organizationId,
    );
    return { searches };
  }
}
