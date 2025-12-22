import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Injectable()
export class ReadingProgressService {
  constructor(private prisma: PrismaService) {}

  async getProgress(userId: number) {
    const progress = await this.prisma.reading_progress.findMany({
      where: { user_id: userId },
      orderBy: { updated_at: 'desc' },
    });

    return progress;
  }

  async updateProgress(userId: number, updateProgressDto: UpdateProgressDto) {
    const { novelId, lastChapter, isCompleted } = updateProgressDto;

    // Check if novel exists
    const novel = await this.prisma.novels.findUnique({
      where: { public_id: novelId },
    });

    if (!novel) {
      throw new NotFoundException('Novel not found');
    }

    // Check if progress entry exists
    const existingProgress = await this.prisma.reading_progress.findUnique({
      where: {
        unique_user_novel_progress: {
          user_id: userId,
          novel_id: novelId,
        },
      },
    });

    const completedAt = isCompleted ? new Date() : null;

    if (existingProgress) {
      // Update existing progress
      const updatedProgress = await this.prisma.reading_progress.update({
        where: {
          unique_user_novel_progress: {
            user_id: userId,
            novel_id: novelId,
          },
        },
        data: {
          last_chapter: lastChapter,
          is_completed: isCompleted ?? existingProgress.is_completed,
          completed_at: completedAt,
        },
      });

      return updatedProgress;
    } else {
      // Create new progress entry
      const newProgress = await this.prisma.reading_progress.create({
        data: {
          user_id: userId,
          novel_id: novelId,
          novel_title: novel.title,
          cover_image: novel.cover_image,
          author: novel.author_name,
          last_chapter: lastChapter,
          is_completed: isCompleted ?? false,
          completed_at: completedAt,
        },
      });

      return newProgress;
    }
  }

  async deleteProgress(userId: number, novelId: string) {
    // Check if progress exists
    const progress = await this.prisma.reading_progress.findUnique({
      where: {
        unique_user_novel_progress: {
          user_id: userId,
          novel_id: novelId,
        },
      },
    });

    if (!progress) {
      throw new NotFoundException('Reading progress not found');
    }

    await this.prisma.reading_progress.delete({
      where: {
        unique_user_novel_progress: {
          user_id: userId,
          novel_id: novelId,
        },
      },
    });

    return { message: 'Reading progress deleted successfully' };
  }
}
