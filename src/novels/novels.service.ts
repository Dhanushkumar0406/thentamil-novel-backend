import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNovelDto } from './dto/create-novel.dto';
import { UpdateNovelDto } from './dto/update-novel.dto';
import { NovelQueryDto } from './dto/novel-query.dto';
import { Role } from '@prisma/client';
import { NovelStatus } from '@prisma/client';


@Injectable()
export class NovelsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createNovelDto: CreateNovelDto, userId: number) {
    const { title, author_name, novel_summary, categories } = createNovelDto;

    const novel = await this.prisma.novels.create({
      data: {
        title,
        author_name,
        novel_summary,
        categories: categories,
        created_by: userId,
        updated_by: userId,
      },
      include: {
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
      message: 'Novel created successfully',
      novel,
    };
  }

  async findAll(query: NovelQueryDto) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc',
      search,
      category,
      status,
    } = query;

    // Convert to numbers (query params come as strings)
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause for filtering
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author_name: { contains: search, mode: 'insensitive' } },
        { novel_summary: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.categories = {
        has: category,
      };
    }

    if (status) {
      where.status = status;
    }

    // Get total count for pagination
    const total = await this.prisma.novels.count({ where });

    // Get novels with pagination and sorting
    const novels = await this.prisma.novels.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        creator: {
          select: {
            id: true,
            full_name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            chapters: true,
            subscriptions: true,
          },
        },
      },
    });

    return {
      items: novels,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async findOne(publicId: string) {
    const novel = await this.prisma.novels.findUnique({
      where: { public_id: publicId },
      include: {
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
        _count: {
          select: {
            chapters: true,
            subscriptions: true,
          },
        },
      },
    });

    if (!novel) {
      throw new NotFoundException(`Novel with ID ${publicId} not found`);
    }

    // Atomically increment view count
    await this.prisma.novels.update({
      where: { public_id: publicId },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    return {
      ...novel,
      views: novel.views + 1, // Return updated view count
    };
  }

  async update(
    publicId: string,
    updateNovelDto: UpdateNovelDto,
    userId: number,
    userRole: Role,
  ) {
    const novel = await this.prisma.novels.findUnique({
      where: { public_id: publicId },
    });

    if (!novel) {
      throw new NotFoundException(`Novel with ID ${publicId} not found`);
    }

    // Check permissions: only creator or ADMIN can update
    if (novel.created_by !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to update this novel',
      );
    }

    const { title, author_name, novel_summary, categories } = updateNovelDto;

    const updatedNovel = await this.prisma.novels.update({
      where: { public_id: publicId },
      data: {
        ...(title && { title }),
        ...(author_name && { author_name }),
        ...(novel_summary && { novel_summary }),
        ...(categories && { categories }),
        updated_by: userId,
      },
      include: {
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
      message: 'Novel updated successfully',
      novel: updatedNovel,
    };
  }

  async remove(publicId: string, userId: number, userRole: Role) {
    const novel = await this.prisma.novels.findUnique({
      where: { public_id: publicId },
    });

    if (!novel) {
      throw new NotFoundException(`Novel with ID ${publicId} not found`);
    }

    // Check permissions: only creator or ADMIN can delete
    if (novel.created_by !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to delete this novel',
      );
    }

    // Delete novel (chapters will be cascade deleted)
    await this.prisma.novels.delete({
      where: { public_id: publicId },
    });

    return {
      message: 'Novel deleted successfully',
    };
  }

  async getNovelStats(publicId: string) {
    const novel = await this.prisma.novels.findUnique({
      where: { public_id: publicId },
      include: {
        _count: {
          select: {
            chapters: true,
            subscriptions: true,
          },
        },
        chapters: {
          select: {
            views: true,
          },
        },
      },
    });

    if (!novel) {
      throw new NotFoundException(`Novel with ID ${publicId} not found`);
    }

    const totalChapterViews = novel.chapters.reduce(
      (sum, chapter) => sum + chapter.views,
      0,
    );

    return {
      novel_id: novel.public_id,
      title: novel.title,
      total_views: novel.views,
      total_chapters: novel._count.chapters,
      total_subscribers: novel._count.subscriptions,
      total_chapter_views: totalChapterViews,
      created_at: novel.created_at,
      updated_at: novel.updated_at,
    };
  }

  async likeNovel(publicId: string, userId: number) {
    // Check if novel exists
    const novel = await this.prisma.novels.findUnique({
      where: { public_id: publicId },
    });

    if (!novel) {
      throw new NotFoundException(`Novel with ID ${publicId} not found`);
    }

    // Check if already liked
    const existingLike = await this.prisma.novel_likes.findUnique({
      where: {
        unique_user_novel_like: {
          user_id: userId,
          novel_id: novel.public_id,
        },
      },
    });

    if (existingLike) {
      throw new BadRequestException('You have already liked this novel');
    }

    // Create like and increment likes count
    await this.prisma.$transaction([
      this.prisma.novel_likes.create({
        data: {
          user_id: userId,
          novel_id: novel.public_id,
        },
      }),
      this.prisma.novels.update({
        where: { public_id: publicId },
        data: {
          likes: {
            increment: 1,
          },
        },
      }),
    ]);

    return { message: 'Novel liked successfully' };
  }

  async unlikeNovel(publicId: string, userId: number) {
    // Get novel first to get internal ID
    const novel = await this.prisma.novels.findUnique({
      where: { public_id: publicId },
    });

    if (!novel) {
      throw new NotFoundException(`Novel with ID ${publicId} not found`);
    }

    // Check if like exists
    const existingLike = await this.prisma.novel_likes.findUnique({
      where: {
        unique_user_novel_like: {
          user_id: userId,
          novel_id: novel.public_id,
        },
      },
    });

    if (!existingLike) {
      throw new NotFoundException('You have not liked this novel');
    }

    // Delete like and decrement likes count
    await this.prisma.$transaction([
      this.prisma.novel_likes.delete({
        where: {
          unique_user_novel_like: {
            user_id: userId,
            novel_id: novel.public_id,
          },
        },
      }),
      this.prisma.novels.update({
        where: { public_id: publicId },
        data: {
          likes: {
            decrement: 1,
          },
        },
      }),
    ]);

    return { message: 'Novel unliked successfully' };
  }

  async bookmarkNovel(publicId: string, userId: number) {
    // Check if novel exists
    const novel = await this.prisma.novels.findUnique({
      where: { public_id: publicId },
    });

    if (!novel) {
      throw new NotFoundException(`Novel with ID ${publicId} not found`);
    }

    // Check if already bookmarked
    const existingBookmark = await this.prisma.novel_bookmarks.findUnique({
      where: {
        unique_user_novel_bookmark: {
          user_id: userId,
          novel_id: novel.public_id,
        },
      },
    });

    if (existingBookmark) {
      throw new BadRequestException('You have already bookmarked this novel');
    }

    // Create bookmark and increment bookmarks count
    await this.prisma.$transaction([
      this.prisma.novel_bookmarks.create({
        data: {
          user_id: userId,
          novel_id: novel.public_id,
        },
      }),
      this.prisma.novels.update({
        where: { public_id: publicId },
        data: {
          bookmarks: {
            increment: 1,
          },
        },
      }),
    ]);

    return { message: 'Novel bookmarked successfully' };
  }

  async unbookmarkNovel(publicId: string, userId: number) {
    // Get novel first to get internal ID
    const novel = await this.prisma.novels.findUnique({
      where: { public_id: publicId },
    });

    if (!novel) {
      throw new NotFoundException(`Novel with ID ${publicId} not found`);
    }

    // Check if bookmark exists
    const existingBookmark = await this.prisma.novel_bookmarks.findUnique({
      where: {
        unique_user_novel_bookmark: {
          user_id: userId,
          novel_id: novel.public_id,
        },
      },
    });

    if (!existingBookmark) {
      throw new NotFoundException('You have not bookmarked this novel');
    }

    // Delete bookmark and decrement bookmarks count
    await this.prisma.$transaction([
      this.prisma.novel_bookmarks.delete({
        where: {
          unique_user_novel_bookmark: {
            user_id: userId,
            novel_id: novel.public_id,
          },
        },
      }),
      this.prisma.novels.update({
        where: { public_id: publicId },
        data: {
          bookmarks: {
            decrement: 1,
          },
        },
      }),
    ]);

    return { message: 'Novel unbookmarked successfully' };
  }
}
