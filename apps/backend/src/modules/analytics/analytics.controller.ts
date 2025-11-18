import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('videos/:videoId')
  @ApiOperation({ summary: 'Get analytics for a specific video' })
  async getVideoAnalytics(@Param('videoId') videoId: string) {
    return this.analyticsService.getVideoAnalytics(videoId);
  }

  @Get('organization/:orgId')
  @ApiOperation({ summary: 'Get organization-wide analytics' })
  async getOrgAnalytics(
    @Param('orgId') orgId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getOrganizationAnalytics(orgId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('users/:userId')
  @ApiOperation({ summary: 'Get user watch history and engagement' })
  async getUserAnalytics(@Param('userId') userId: string) {
    return this.analyticsService.getUserAnalytics(userId);
  }
}
