import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../../database/entities';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  async findById(id: string): Promise<Organization> {
    const org = await this.organizationRepository.findOne({
      where: { id },
      relations: ['users', 'videos'],
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return org;
  }

  async create(createData: Partial<Organization>): Promise<Organization> {
    const org = this.organizationRepository.create(createData);
    return this.organizationRepository.save(org);
  }

  async update(
    id: string,
    updateData: Partial<Organization>,
  ): Promise<Organization> {
    await this.organizationRepository.update(id, updateData);
    return this.findById(id);
  }

  async getStats(id: string) {
    const org = await this.findById(id);
    return {
      totalUsers: org.users?.length || 0,
      totalVideos: org.videos?.length || 0,
      storageUsed: org.storageUsed,
      storageLimit: org.storageLimit,
      storagePercentage: (org.storageUsed / org.storageLimit) * 100,
    };
  }
}
