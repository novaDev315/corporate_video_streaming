import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LiveStream, StreamStatus } from '../../database/entities';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StreamsService {
  constructor(
    @InjectRepository(LiveStream)
    private readonly streamRepository: Repository<LiveStream>,
  ) {}

  async findAll(orgId: string): Promise<LiveStream[]> {
    return this.streamRepository.find({
      where: { orgId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<LiveStream> {
    const stream = await this.streamRepository.findOne({
      where: { id },
      relations: ['organization'],
    });

    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    return stream;
  }

  async create(createData: Partial<LiveStream>): Promise<LiveStream> {
    const streamKey = uuidv4();
    const stream = this.streamRepository.create({
      ...createData,
      streamKey,
      rtmpUrl: `rtmp://live.example.com/live/${streamKey}`,
      status: StreamStatus.SCHEDULED,
    });

    return this.streamRepository.save(stream);
  }

  async startStream(id: string) {
    const stream = await this.findById(id);

    await this.streamRepository.update(id, {
      status: StreamStatus.LIVE,
      startedAt: new Date(),
    });

    return { message: 'Stream started', hlsUrl: stream.hlsUrl };
  }

  async endStream(id: string) {
    await this.streamRepository.update(id, {
      status: StreamStatus.ENDED,
      endedAt: new Date(),
    });

    return { message: 'Stream ended' };
  }

  async updateViewerCount(id: string, count: number) {
    const stream = await this.findById(id);

    await this.streamRepository.update(id, {
      currentViewers: count,
      maxViewers: Math.max(stream.maxViewers, count),
    });
  }

  async delete(id: string): Promise<void> {
    await this.streamRepository.delete(id);
  }
}
