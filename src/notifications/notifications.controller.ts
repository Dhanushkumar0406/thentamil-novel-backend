import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { MarkReadDto } from './dto/mark-read.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  getUserNotifications(@Request() req, @Query() query: NotificationQueryDto) {
    return this.notificationsService.getUserNotifications(
      req.user.id,
      query,
    );
  }

  @Get('unread-count')
  getUnreadCount(@Request() req) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  @Patch('mark-read')
  markAsRead(@Body() markReadDto: MarkReadDto, @Request() req) {
    return this.notificationsService.markAsRead(markReadDto, req.user.id);
  }

  @Patch('mark-all-read')
  markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  deleteNotification(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.notificationsService.deleteNotification(id, req.user.id);
  }
}
