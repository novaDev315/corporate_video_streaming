import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Playlist } from '../../database/entities';

@Injectable()
export class PlaylistsService {
  constructor(
    @InjectRepository(Playlist)
    private readonly playlistRepository: Repository<Playlist>,
  ) {}

  async findAll(orgId: string): Promise<Playlist[]> {
    return this.playlistRepository.find({
      where: { orgId },
      relations: ['videos', 'createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Playlist> {
    const playlist = await this.playlistRepository.findOne({
      where: { id },
      relations: ['videos', 'createdBy'],
    });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    return playlist;
  }

  async create(createData: Partial<Playlist>): Promise<Playlist> {
    const playlist = this.playlistRepository.create(createData);
    return this.playlistRepository.save(playlist);
  }

  async update(id: string, updateData: Partial<Playlist>): Promise<Playlist> {
    await this.playlistRepository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.playlistRepository.delete(id);
  }

  async addVideo(playlistId: string, videoId: string) {
    const playlist = await this.findById(playlistId);

    // Add video to playlist (assuming videos relation is already loaded)
    // This is simplified - in production you'd use query builder
    await this.playlistRepository
      .createQueryBuilder()
      .relation(Playlist, 'videos')
      .of(playlistId)
      .add(videoId);

    await this.playlistRepository.increment(
      { id: playlistId },
      'videoCount',
      1,
    );

    return { success: true };
  }

  async removeVideo(playlistId: string, videoId: string) {
    await this.playlistRepository
      .createQueryBuilder()
      .relation(Playlist, 'videos')
      .of(playlistId)
      .remove(videoId);

    await this.playlistRepository.decrement(
      { id: playlistId },
      'videoCount',
      1,
    );

    return { success: true };
  }
}
