import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Get audit logs for organization' })
  async getLogs(
    @CurrentUser() user: User,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditService.findLogs(user.orgId, {
      action,
      userId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('users/:userId')
  @ApiOperation({ summary: 'Get audit logs for specific user' })
  async getUserLogs(@Param('userId') userId: string) {
    return this.auditService.findByUser(userId);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export audit logs as CSV' })
  async exportLogs(@CurrentUser() user: User, @Query() filters: any) {
    return this.auditService.exportToCsv(user.orgId, filters);
  }
}
