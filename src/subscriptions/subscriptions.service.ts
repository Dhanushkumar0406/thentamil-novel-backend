import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscribeDto } from './dto/subscribe.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async subscribe(subscribeDto: SubscribeDto, userId: number) {
    const { novel_id } = subscribeDto;

    // Check if novel exists
    const novel = await this.prisma.novels.findUnique({
      where: { public_id: novel_id },
    });

    if (!novel) {
      throw new NotFoundException(`Novel with ID ${novel_id} not found`);
    }

    // Check if already subscribed
    const existingSubscription =
      await this.prisma.novel_subscriptions.findUnique({
        where: {
          unique_user_novel_subscription: {
            user_id: userId,
            novel_id,
          },
        },
      });

    if (existingSubscription) {
      throw new BadRequestException('You are already subscribed to this novel');
    }

    // Create subscription
    const subscription = await this.prisma.novel_subscriptions.create({
      data: {
        user_id: userId,
        novel_id,
      },
      include: {
        novel: {
          select: {
            public_id: true,
            title: true,
            author_name: true,
          },
        },
      },
    });

    return {
      message: 'Successfully subscribed to novel',
      subscription,
    };
  }

  async unsubscribe(novelId: string, userId: number) {
    // Check if subscription exists
    const subscription = await this.prisma.novel_subscriptions.findUnique({
      where: {
        unique_user_novel_subscription: {
          user_id: userId,
          novel_id: novelId,
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Delete subscription
    await this.prisma.novel_subscriptions.delete({
      where: {
        id: subscription.id,
      },
    });

    return {
      message: 'Successfully unsubscribed from novel',
    };
  }

  async getUserSubscriptions(userId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const total = await this.prisma.novel_subscriptions.count({
      where: { user_id: userId },
    });

    const subscriptions = await this.prisma.novel_subscriptions.findMany({
      where: { user_id: userId },
      skip,
      take: limit,
      orderBy: {
        created_at: 'desc',
      },
      include: {
        novel: {
          select: {
            public_id: true,
            title: true,
            author_name: true,
            novel_summary: true,
            categories: true,
            chapters_count: true,
            views: true,
            created_at: true,
            updated_at: true,
          },
        },
      },
    });

    return {
      data: subscriptions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async checkSubscription(novelId: string, userId: number) {
    const subscription = await this.prisma.novel_subscriptions.findUnique({
      where: {
        unique_user_novel_subscription: {
          user_id: userId,
          novel_id: novelId,
        },
      },
    });

    return {
      is_subscribed: !!subscription,
    };
  }

  async getNovelSubscribers(novelId: string) {
    const subscribers = await this.prisma.novel_subscriptions.findMany({
      where: { novel_id: novelId },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return {
      total: subscribers.length,
      subscribers: subscribers.map((sub) => ({
        id: sub.id,
        user: sub.user,
        subscribed_at: sub.created_at,
      })),
    };
  }
}
