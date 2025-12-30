import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { ChapterQueryDto } from './dto/chapter-query.dto';
import { Role } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ChaptersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createChapterDto: CreateChapterDto, userId: number) {
    const {
      chapter_number,
      name,
      title,
      chapter_type,
      thumbnail,
      content,
      novel_id,
    } = createChapterDto;

    // Check if novel exists
    const novel = await this.prisma.novels.findUnique({
      where: { public_id: novel_id },
    });

    if (!novel) {
      throw new NotFoundException(`Novel with ID ${novel_id} not found`);
    }

    // Check if chapter number already exists for this novel
    const existingChapter = await this.prisma.chapters.findUnique({
      where: {
        unique_chapter_number_per_novel: {
          novel_id,
          chapter_number,
        },
      },
    });

    if (existingChapter) {
      throw new BadRequestException(
        `Chapter ${chapter_number} already exists for this novel`,
      );
    }

    // Create chapter
    const chapter = await this.prisma.chapters.create({
      data: {
        chapter_number,
        name: name || '',
        title,
        chapter_type: chapter_type || '',
        thumbnail,
        content,
        novel_id,
        created_by: userId,
        updated_by: userId,
      },
      include: {
        novel: {
          select: {
            public_id: true,
            title: true,
          },
        },
        creator: {
          select: {
            id: true,
            full_name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Update novel's chapter count
    await this.prisma.novels.update({
      where: { public_id: novel_id },
      data: {
        chapters_count: {
          increment: 1,
        },
      },
    });

    // Notify all subscribers about new chapter
    await this.notificationsService.notifyNewChapter(novel_id, chapter.title);

    return {
      message: 'Chapter created successfully',
      chapter,
    };
  }

  async findAll(query: ChapterQueryDto) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'chapter_number',
      sortOrder = 'asc',
      search,
      novel_id,
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (novel_id) {
      where.novel_id = novel_id;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await this.prisma.chapters.count({ where });

    // Get chapters
    const chapters = await this.prisma.chapters.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        novel: {
          select: {
            public_id: true,
            title: true,
          },
        },
        creator: {
          select: {
            id: true,
            full_name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return {
      data: chapters,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const chapter = await this.prisma.chapters.findUnique({
      where: { id },
      include: {
        novel: {
          select: {
            public_id: true,
            title: true,
            author_name: true,
          },
        },
        creator: {
          select: {
            id: true,
            full_name: true,
            email: true,
            role: true,
          },
        },
        updater: {
          select: {
            id: true,
            full_name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!chapter) {
      throw new NotFoundException(`Chapter with ID ${id} not found`);
    }

    // Atomically increment view count
    await this.prisma.chapters.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    return {
      ...chapter,
      views: chapter.views + 1, // Return updated view count
    };
  }

  async getNextChapter(novelId: string, currentChapterNumber: number) {
    const nextChapter = await this.prisma.chapters.findFirst({
      where: {
        novel_id: novelId,
        chapter_number: {
          gt: currentChapterNumber,
        },
      },
      orderBy: {
        chapter_number: 'asc',
      },
      select: {
        id: true,
        chapter_number: true,
        name: true,
        title: true,
      },
    });

    if (!nextChapter) {
      return {
        message: 'This is the last chapter',
        next_chapter: null,
      };
    }

    return {
      next_chapter: nextChapter,
    };
  }

  async getPreviousChapter(novelId: string, currentChapterNumber: number) {
    const previousChapter = await this.prisma.chapters.findFirst({
      where: {
        novel_id: novelId,
        chapter_number: {
          lt: currentChapterNumber,
        },
      },
      orderBy: {
        chapter_number: 'desc',
      },
      select: {
        id: true,
        chapter_number: true,
        name: true,
        title: true,
      },
    });

    if (!previousChapter) {
      return {
        message: 'This is the first chapter',
        previous_chapter: null,
      };
    }

    return {
      previous_chapter: previousChapter,
    };
  }

  async getChapterNavigation(id: number) {
    const chapter = await this.prisma.chapters.findUnique({
      where: { id },
      select: {
        novel_id: true,
        chapter_number: true,
      },
    });

    if (!chapter) {
      throw new NotFoundException(`Chapter with ID ${id} not found`);
    }

    const [next, previous] = await Promise.all([
      this.getNextChapter(chapter.novel_id, chapter.chapter_number),
      this.getPreviousChapter(chapter.novel_id, chapter.chapter_number),
    ]);

    return {
      current_chapter_number: chapter.chapter_number,
      next: next.next_chapter,
      previous: previous.previous_chapter,
    };
  }

  async update(
    id: number,
    updateChapterDto: UpdateChapterDto,
    userId: number,
    userRole: Role,
  ) {
    const chapter = await this.prisma.chapters.findUnique({
      where: { id },
    });

    if (!chapter) {
      throw new NotFoundException(`Chapter with ID ${id} not found`);
    }

    // Check permissions: only creator or ADMIN can update
    if (chapter.created_by !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to update this chapter',
      );
    }

    // If updating chapter_number, check for conflicts
    if (
      updateChapterDto.chapter_number &&
      updateChapterDto.chapter_number !== chapter.chapter_number
    ) {
      const existingChapter = await this.prisma.chapters.findUnique({
        where: {
          unique_chapter_number_per_novel: {
            novel_id: chapter.novel_id,
            chapter_number: updateChapterDto.chapter_number,
          },
        },
      });

      if (existingChapter) {
        throw new BadRequestException(
          `Chapter ${updateChapterDto.chapter_number} already exists for this novel`,
        );
      }
    }

    const {
      chapter_number,
      name,
      title,
      chapter_type,
      thumbnail,
      content,
    } = updateChapterDto;

    const updatedChapter = await this.prisma.chapters.update({
      where: { id },
      data: {
        ...(chapter_number && { chapter_number }),
        ...(name && { name }),
        ...(title && { title }),
        ...(chapter_type && { chapter_type }),
        ...(thumbnail && { thumbnail }),
        ...(content && { content }),
        updated_by: userId,
      },
      include: {
        novel: {
          select: {
            public_id: true,
            title: true,
          },
        },
        creator: {
          select: {
            id: true,
            full_name: true,
            email: true,
            role: true,
          },
        },
        updater: {
          select: {
            id: true,
            full_name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return {
      message: 'Chapter updated successfully',
      chapter: updatedChapter,
    };
  }

  async remove(id: number, userId: number, userRole: Role) {
    const chapter = await this.prisma.chapters.findUnique({
      where: { id },
    });

    if (!chapter) {
      throw new NotFoundException(`Chapter with ID ${id} not found`);
    }

    // Check permissions: only creator or ADMIN can delete
    if (chapter.created_by !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to delete this chapter',
      );
    }

    // Delete chapter
    await this.prisma.chapters.delete({
      where: { id },
    });

    // Update novel's chapter count
    await this.prisma.novels.update({
      where: { public_id: chapter.novel_id },
      data: {
        chapters_count: {
          decrement: 1,
        },
      },
    });

    return {
      message: 'Chapter deleted successfully',
    };
  }
}
