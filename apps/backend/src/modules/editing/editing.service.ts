import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { VideoEdit, EditOperation, EditStatus, Video } from '../../database/entities';

@Injectable()
export class EditingService {
  constructor(
    @InjectRepository(VideoEdit)
    private readonly editRepository: Repository<VideoEdit>,
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    @InjectQueue('video-editing')
    private readonly editQueue: Queue,
  ) {}

  async trimVideo(trimData: {
    videoId: string;
    userId: string;
    startTime: number;
    endTime: number;
    outputName?: string;
  }) {
    const edit = await this.createEditJob(
      trimData.videoId,
      trimData.userId,
      EditOperation.TRIM,
      {
        startTime: trimData.startTime,
        endTime: trimData.endTime,
        outputName: trimData.outputName,
      },
    );

    return {
      editId: edit.id,
      message: 'Trim job queued',
      status: edit.status,
    };
  }

  async cutVideo(cutData: {
    videoId: string;
    userId: string;
    cuts: Array<{ start: number; end: number }>;
    outputName?: string;
  }) {
    const edit = await this.createEditJob(
      cutData.videoId,
      cutData.userId,
      EditOperation.CUT,
      {
        cuts: cutData.cuts,
        outputName: cutData.outputName,
      },
    );

    return {
      editId: edit.id,
      message: 'Cut job queued',
      status: edit.status,
    };
  }

  async mergeVideos(mergeData: {
    videoIds: string[];
    userId: string;
    outputName?: string;
    transitions?: boolean;
  }) {
    // Use first video as base
    const edit = await this.createEditJob(
      mergeData.videoIds[0],
      mergeData.userId,
      EditOperation.MERGE,
      {
        videoIds: mergeData.videoIds,
        outputName: mergeData.outputName,
        transitions: mergeData.transitions,
      },
    );

    return {
      editId: edit.id,
      message: 'Merge job queued',
      status: edit.status,
    };
  }

  async addIntro(introData: {
    videoId: string;
    userId: string;
    introVideoId: string;
    outputName?: string;
  }) {
    const edit = await this.createEditJob(
      introData.videoId,
      introData.userId,
      EditOperation.ADD_INTRO,
      {
        introVideoId: introData.introVideoId,
        outputName: introData.outputName,
      },
    );

    return {
      editId: edit.id,
      message: 'Add intro job queued',
      status: edit.status,
    };
  }

  async addOutro(outroData: {
    videoId: string;
    userId: string;
    outroVideoId: string;
    outputName?: string;
  }) {
    const edit = await this.createEditJob(
      outroData.videoId,
      outroData.userId,
      EditOperation.ADD_OUTRO,
      {
        outroVideoId: outroData.outroVideoId,
        outputName: outroData.outputName,
      },
    );

    return {
      editId: edit.id,
      message: 'Add outro job queued',
      status: edit.status,
    };
  }

  async adjustAudioLevels(audioData: {
    videoId: string;
    userId: string;
    volume?: number;
    normalize?: boolean;
    outputName?: string;
  }) {
    const edit = await this.createEditJob(
      audioData.videoId,
      audioData.userId,
      EditOperation.AUDIO_LEVEL,
      {
        volume: audioData.volume,
        normalize: audioData.normalize,
        outputName: audioData.outputName,
      },
    );

    return {
      editId: edit.id,
      message: 'Audio adjustment job queued',
      status: edit.status,
    };
  }

  private async createEditJob(
    videoId: string,
    userId: string,
    operation: EditOperation,
    parameters: any,
  ): Promise<VideoEdit> {
    const edit = this.editRepository.create({
      videoId,
      userId,
      operation,
      parameters,
      status: EditStatus.PENDING,
    });

    const savedEdit = await this.editRepository.save(edit);

    // Queue editing job
    await this.editQueue.add('process-edit', {
      editId: savedEdit.id,
      videoId,
      operation,
      parameters,
    });

    return savedEdit;
  }

  async getEditStatus(editId: string) {
    const edit = await this.editRepository.findOne({
      where: { id: editId },
      relations: ['video', 'user'],
    });

    if (!edit) {
      throw new NotFoundException('Edit job not found');
    }

    return {
      id: edit.id,
      operation: edit.operation,
      status: edit.status,
      progress: edit.progress,
      resultVideoId: edit.resultVideoId,
      errorMessage: edit.errorMessage,
      createdAt: edit.createdAt,
      updatedAt: edit.updatedAt,
    };
  }

  async getUserEdits(userId: string) {
    return this.editRepository.find({
      where: { userId },
      relations: ['video'],
      order: { createdAt: 'DESC' },
    });
  }

  async cancelEdit(editId: string) {
    const edit = await this.editRepository.findOne({ where: { id: editId } });

    if (!edit) {
      throw new NotFoundException('Edit job not found');
    }

    if (edit.status === EditStatus.COMPLETED) {
      return { success: false, message: 'Edit already completed' };
    }

    await this.editRepository.update(editId, {
      status: EditStatus.FAILED,
      errorMessage: 'Cancelled by user',
    });

    return { success: true, message: 'Edit job cancelled' };
  }

  async updateEditProgress(editId: string, progress: number, status?: EditStatus) {
    const updateData: any = { progress };
    if (status) {
      updateData.status = status;
    }
    await this.editRepository.update(editId, updateData);
  }

  async completeEdit(editId: string, resultVideoId: string) {
    await this.editRepository.update(editId, {
      status: EditStatus.COMPLETED,
      resultVideoId,
      progress: 100,
    });
  }

  async failEdit(editId: string, errorMessage: string) {
    await this.editRepository.update(editId, {
      status: EditStatus.FAILED,
      errorMessage,
    });
  }
}
