import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { MarkReadDto } from './dto/mark-read.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async notifyNewChapter(novelId: string, chapterTitle: string) {
    // Get all subscribers of the novel
    const subscribers = await this.prisma.novel_subscriptions.findMany({
      where: { novel_id: novelId },
      include: {
        novel: {
          select: {
            title: true,
          },
        },
      },
    });

    if (subscribers.length === 0) {
      return {
        message: 'No subscribers to notify',
        notified_count: 0,
      };
    }

    // Create notifications for all subscribers
    const notifications = subscribers.map((sub) => ({
      user_id: sub.user_id,
      message: `New chapter "${chapterTitle}" has been published in "${sub.novel.title}"`,
      is_read: false,
    }));

    await this.prisma.notifications.createMany({
      data: notifications,
    });

    return {
      message: 'Subscribers notified successfully',
      notified_count: subscribers.length,
    };
  }

  async getUserNotifications(userId: number, query: NotificationQueryDto) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc',
      is_read,
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { user_id: userId };

    if (is_read !== undefined) {
      where.is_read = is_read;
    }

    // Get total count
    const total = await this.prisma.notifications.count({ where });

    // Get notifications
    const notifications = await this.prisma.notifications.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    return {
      data: notifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(markReadDto: MarkReadDto, userId: number) {
    const { notification_ids } = markReadDto;

    // Verify all notifications belong to the user
    const notifications = await this.prisma.notifications.findMany({
      where: {
        id: { in: notification_ids },
        user_id: userId,
      },
    });

    if (notifications.length !== notification_ids.length) {
      throw new NotFoundException(
        'Some notifications not found or do not belong to you',
      );
    }

    // Mark as read
    await this.prisma.notifications.updateMany({
      where: {
        id: { in: notification_ids },
        user_id: userId,
      },
      data: {
        is_read: true,
      },
    });

    return {
      message: 'Notifications marked as read',
      updated_count: notification_ids.length,
    };
  }

  async markAllAsRead(userId: number) {
    const result = await this.prisma.notifications.updateMany({
      where: {
        user_id: userId,
        is_read: false,
      },
      data: {
        is_read: true,
      },
    });

    return {
      message: 'All notifications marked as read',
      updated_count: result.count,
    };
  }

  async deleteNotification(id: number, userId: number) {
    const notification = await this.prisma.notifications.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    if (notification.user_id !== userId) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notifications.delete({
      where: { id },
    });

    return {
      message: 'Notification deleted successfully',
    };
  }

  async getUnreadCount(userId: number) {
    const count = await this.prisma.notifications.count({
      where: {
        user_id: userId,
        is_read: false,
      },
    });

    return {
      unread_count: count,
    };
  }
}
