import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    // Get total counts
    const [
      totalUsers,
      totalNovels,
      totalChapters,
      totalSubscriptions,
      recentUsers,
      recentNovels,
      recentChapters,
      topNovels,
    ] = await Promise.all([
      this.prisma.users.count(),
      this.prisma.novels.count(),
      this.prisma.chapters.count(),
      this.prisma.novel_subscriptions.count(),
      this.prisma.users.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          full_name: true,
          email: true,
          role: true,
          created_at: true,
        },
      }),
      this.prisma.novels.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        select: {
          public_id: true,
          title: true,
          author_name: true,
          views: true,
          created_at: true,
        },
      }),
      this.prisma.chapters.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          title: true,
          novel_id: true,
          views: true,
          created_at: true,
        },
      }),
      this.prisma.novels.findMany({
        take: 10,
        orderBy: { views: 'desc' },
        select: {
          public_id: true,
          title: true,
          author_name: true,
          views: true,
          likes: true,
          bookmarks: true,
          _count: {
            select: {
              chapters: true,
              subscriptions: true,
            },
          },
        },
      }),
    ]);

    return {
      overview: {
        totalUsers,
        totalNovels,
        totalChapters,
        totalSubscriptions,
      },
      recentActivity: {
        recentUsers,
        recentNovels,
        recentChapters,
      },
      topNovels,
    };
  }
}
