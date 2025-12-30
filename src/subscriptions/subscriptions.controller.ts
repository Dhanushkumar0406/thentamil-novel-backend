import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Post()
  subscribe(@Body() subscribeDto: SubscribeDto, @Request() req) {
    return this.subscriptionsService.subscribe(subscribeDto, req.user.id);
  }

  @Delete(':novelId')
  unsubscribe(@Param('novelId') novelId: string, @Request() req) {
    return this.subscriptionsService.unsubscribe(novelId, req.user.id);
  }

  @Get('my-subscriptions')
  getMySubscriptions(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.subscriptionsService.getUserSubscriptions(
      req.user.id,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );
  }

  @Get('check/:novelId')
  checkSubscription(@Param('novelId') novelId: string, @Request() req) {
    return this.subscriptionsService.checkSubscription(novelId, req.user.id);
  }

  @Get('novel/:novelId/subscribers')
  getNovelSubscribers(@Param('novelId') novelId: string) {
    return this.subscriptionsService.getNovelSubscribers(novelId);
  }
}
