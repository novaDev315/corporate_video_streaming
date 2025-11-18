import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AuditLog, AuditAction } from '../../database/entities';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(logData: Partial<AuditLog>): Promise<AuditLog> {
    const log = this.auditLogRepository.create(logData);
    return this.auditLogRepository.save(log);
  }

  async findLogs(
    orgId: string,
    filters: {
      action?: string;
      userId?: string;
      startDate?: Date;
      endDate?: Date;
    } = {},
  ): Promise<AuditLog[]> {
    const where: any = { orgId };

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.startDate && filters.endDate) {
      where.createdAt = Between(filters.startDate, filters.endDate);
    }

    return this.auditLogRepository.find({
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 1000, // Limit to prevent large queries
    });
  }

  async findByUser(userId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async exportToCsv(orgId: string, filters: any): Promise<string> {
    const logs = await this.findLogs(orgId, filters);

    // Convert to CSV format
    const headers = ['Date', 'User', 'Action', 'Resource', 'IP Address'];
    const rows = logs.map((log) => [
      log.createdAt.toISOString(),
      log.user?.email || 'System',
      log.action,
      `${log.resourceType}:${log.resourceId}`,
      log.ipAddress || 'N/A',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

    return csv;
  }
}
