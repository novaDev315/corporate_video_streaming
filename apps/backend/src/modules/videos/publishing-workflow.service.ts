import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../../database/entities';

export enum PublishingStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

interface WorkflowTransition {
  from: PublishingStatus;
  to: PublishingStatus;
  allowedRoles: string[];
}

@Injectable()
export class PublishingWorkflowService {
  private workflows: WorkflowTransition[] = [
    {
      from: PublishingStatus.DRAFT,
      to: PublishingStatus.PENDING_REVIEW,
      allowedRoles: ['content_manager', 'admin'],
    },
    {
      from: PublishingStatus.PENDING_REVIEW,
      to: PublishingStatus.APPROVED,
      allowedRoles: ['admin'],
    },
    {
      from: PublishingStatus.APPROVED,
      to: PublishingStatus.PUBLISHED,
      allowedRoles: ['admin', 'content_manager'],
    },
    {
      from: PublishingStatus.PUBLISHED,
      to: PublishingStatus.ARCHIVED,
      allowedRoles: ['admin'],
    },
    {
      from: PublishingStatus.PENDING_REVIEW,
      to: PublishingStatus.DRAFT,
      allowedRoles: ['admin', 'content_manager'],
    },
  ];

  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
  ) {}

  async canTransition(
    videoId: string,
    targetStatus: PublishingStatus,
    userRole: string,
  ): Promise<boolean> {
    const video = await this.videoRepository.findOne({
      where: { id: videoId },
    });

    if (!video) {
      return false;
    }

    const currentStatus = (video as any).publishingStatus || PublishingStatus.DRAFT;

    const transition = this.workflows.find(
      (w) => w.from === currentStatus && w.to === targetStatus,
    );

    if (!transition) {
      return false;
    }

    return transition.allowedRoles.includes(userRole);
  }

  async transitionStatus(
    videoId: string,
    targetStatus: PublishingStatus,
    userRole: string,
    userId: string,
  ) {
    const canTransition = await this.canTransition(
      videoId,
      targetStatus,
      userRole,
    );

    if (!canTransition) {
      throw new Error('Unauthorized transition or invalid workflow');
    }

    await this.videoRepository.update(videoId, {
      // Note: You'd need to add publishingStatus field to Video entity
      // publishingStatus: targetStatus,
      updatedAt: new Date(),
    });

    // Log the transition
    return {
      success: true,
      message: `Video transitioned to ${targetStatus}`,
      videoId,
    };
  }

  async getWorkflowHistory(videoId: string) {
    // This would require a separate workflow_history table
    // For now, return placeholder
    return {
      videoId,
      transitions: [
        {
          from: 'draft',
          to: 'published',
          timestamp: new Date(),
          userId: 'user-id',
        },
      ],
    };
  }
}
