import { Controller, Post, Body, Req, Get, Query, Patch, Delete, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { AuthApply, AuthUser, ParamIdDto } from '../../common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import type { UserDocument } from '../users/models/users.model';
import { GetNotificationsDto } from './dto/get-all-notification.dto';
import { Types } from 'mongoose';
import { MarkAsReadNotificationDto } from './dto/update-notification.dto';




@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@AuthApply({ roles: [] })
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  @Post('add-fcm-token')
  async addFcmToken(
    @AuthUser() user: UserDocument,
    @Body('token') token: string,
  ) {
    return this.notificationService.addFcmToken(user._id, token);
  }


  @Post('send-push-notification')
  async sendNotification(
    @Body() body: CreateNotificationDto, @AuthUser() user: UserDocument,) {
    return this.notificationService.sendNotification(
      user._id,
      body.receiverId,
      body.type,
      body.title,
      body.message,
      body.metadata,
      body.channel,
    );
  }

  @Get('inbox')
  async getUserNotifications(@AuthUser() user: UserDocument, @Query() query: GetNotificationsDto) {
    return this.notificationService.getUserNotifications(user._id, query);
  }


  @Patch('mark-as-read')
  async markAsRead(
    @AuthUser() user: UserDocument,
    @Body() body: MarkAsReadNotificationDto,
  ) {
    return this.notificationService.markAsRead(user._id, body.notificationIds);
  }

  @Delete(':id')
  async deleteNotification(
    @AuthUser() user: UserDocument,
    @Param() param: ParamIdDto,
  ) {
    return this.notificationService.deleteNotification(user._id, new Types.ObjectId(param.id));
  }


}
