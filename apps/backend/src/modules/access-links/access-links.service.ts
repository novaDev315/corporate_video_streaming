import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessLink } from '../../database/entities';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AccessLinksService {
  constructor(
    @InjectRepository(AccessLink)
    private readonly accessLinkRepository: Repository<AccessLink>,
  ) {}

  async create(createData: Partial<AccessLink>): Promise<AccessLink> {
    const token = uuidv4();
    const link = this.accessLinkRepository.create({
      ...createData,
      token,
    });
    return this.accessLinkRepository.save(link);
  }

  async findByVideo(videoId: string): Promise<AccessLink[]> {
    return this.accessLinkRepository.find({
      where: { videoId },
      order: { createdAt: 'DESC' },
    });
  }

  async validateToken(token: string) {
    const link = await this.accessLinkRepository.findOne({
      where: { token, isActive: true },
      relations: ['video'],
    });

    if (!link) {
      throw new NotFoundException('Invalid or expired link');
    }

    // Check expiration
    if (new Date() > link.expiresAt) {
      return { valid: false, message: 'Link has expired' };
    }

    // Check max views
    if (link.maxViews && link.viewCount >= link.maxViews) {
      return { valid: false, message: 'Maximum views reached' };
    }

    // Increment view count
    await this.accessLinkRepository.increment({ id: link.id }, 'viewCount', 1);

    return {
      valid: true,
      video: link.video,
      message: 'Access granted',
    };
  }

  async revoke(id: string) {
    await this.accessLinkRepository.update(id, { isActive: false });
    return { success: true, message: 'Link revoked' };
  }
}
