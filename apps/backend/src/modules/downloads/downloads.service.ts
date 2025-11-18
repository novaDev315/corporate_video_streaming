import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { VideoDownload, DownloadStatus, DownloadQuality } from '../../database/entities';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DownloadsService {
  constructor(
    @InjectRepository(VideoDownload)
    private readonly downloadRepository: Repository<VideoDownload>,
    @InjectQueue('offline-downloads')
    private readonly downloadQueue: Queue,
  ) {}

  async prepareDownload(downloadData: {
    videoId: string;
    userId: string;
    quality?: DownloadQuality;
    deviceId?: string;
    deviceType?: string;
  }) {
    // Check if user already has an active download for this video
    const existing = await this.downloadRepository.findOne({
      where: {
        videoId: downloadData.videoId,
        userId: downloadData.userId,
        status: DownloadStatus.COMPLETED,
      },
    });

    if (existing && existing.expiresAt > new Date()) {
      return {
        download: existing,
        message: 'Download already available',
      };
    }

    // Create download token
    const downloadToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiration

    const download = this.downloadRepository.create({
      ...downloadData,
      downloadToken,
      expiresAt,
      status: DownloadStatus.PENDING,
      quality: downloadData.quality || DownloadQuality.MEDIUM,
    });

    const savedDownload = await this.downloadRepository.save(download);

    // Queue download preparation job
    await this.downloadQueue.add('prepare-offline-video', {
      downloadId: savedDownload.id,
      videoId: downloadData.videoId,
      quality: downloadData.quality || DownloadQuality.MEDIUM,
    });

    return {
      download: savedDownload,
      message: 'Download preparation started',
    };
  }

  async getUserDownloads(userId: string, status?: string) {
    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    return this.downloadRepository.find({
      where,
      relations: ['video'],
      order: { createdAt: 'DESC' },
    });
  }

  async getDownload(id: string) {
    const download = await this.downloadRepository.findOne({
      where: { id },
      relations: ['video', 'user'],
    });

    if (!download) {
      throw new NotFoundException('Download not found');
    }

    return download;
  }

  async getDownloadUrl(downloadId: string, userId: string) {
    const download = await this.getDownload(downloadId);

    if (download.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (download.status !== DownloadStatus.COMPLETED) {
      throw new ForbiddenException('Download not ready');
    }

    if (download.expiresAt < new Date()) {
      await this.downloadRepository.update(downloadId, {
        status: DownloadStatus.EXPIRED,
      });
      throw new ForbiddenException('Download has expired');
    }

    return {
      downloadUrl: download.downloadUrl,
      expiresAt: download.expiresAt,
      fileSize: download.fileSize,
      quality: download.quality,
    };
  }

  async markComplete(downloadId: string, deviceId: string) {
    await this.downloadRepository.update(downloadId, {
      downloadedAt: new Date(),
      deviceId,
    });

    return { success: true, message: 'Download marked as complete' };
  }

  async deleteDownload(downloadId: string, userId: string) {
    const download = await this.getDownload(downloadId);

    if (download.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.downloadRepository.delete(downloadId);

    return { success: true, message: 'Download deleted' };
  }

  async checkDownloadAvailability(videoId: string, userId: string) {
    // Check if video allows downloads
    // Check user permissions
    // Check storage quota

    return {
      available: true,
      qualities: [
        DownloadQuality.LOW,
        DownloadQuality.MEDIUM,
        DownloadQuality.HIGH,
        DownloadQuality.HD,
      ],
      maxDownloads: 5,
      expirationDays: 30,
    };
  }

  async updateDownloadStatus(
    downloadId: string,
    status: DownloadStatus,
    downloadUrl?: string,
    fileSize?: number,
  ) {
    await this.downloadRepository.update(downloadId, {
      status,
      downloadUrl,
      fileSize,
    });
  }
}
