import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RecommendationsService } from './recommendations.service';

@ApiTags('Recommendations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get('personalized')
  @ApiOperation({ summary: 'Get personalized video recommendations' })
  async getPersonalized(@Request() req, @Query('limit') limit?: number) {
    return this.recommendationsService.getPersonalizedRecommendations(
      req.user.id,
      req.user.organizationId,
      limit,
    );
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending videos' })
  async getTrending(@Request() req, @Query('limit') limit?: number) {
    return this.recommendationsService.getTrendingVideos(
      req.user.organizationId,
      limit,
    );
  }

  @Get('new-releases')
  @ApiOperation({ summary: 'Get newly released videos' })
  async getNewReleases(@Request() req, @Query('limit') limit?: number) {
    return this.recommendationsService.getNewReleases(
      req.user.organizationId,
      limit,
    );
  }

  @Get('most-watched')
  @ApiOperation({ summary: 'Get most watched videos' })
  async getMostWatched(@Request() req, @Query('limit') limit?: number) {
    return this.recommendationsService.getMostWatched(
      req.user.organizationId,
      limit,
    );
  }

  @Get('from-bookmarks')
  @ApiOperation({ summary: 'Get recommendations based on bookmarks' })
  async getFromBookmarks(@Request() req, @Query('limit') limit?: number) {
    return this.recommendationsService.getBasedOnBookmarks(req.user.id, limit);
  }

  @Get('similar/:videoId')
  @ApiOperation({ summary: 'Get similar videos' })
  async getSimilar(
    @Param('videoId') videoId: string,
    @Query('limit') limit?: number,
  ) {
    return this.recommendationsService.getSimilarVideos(videoId, limit);
  }
}
