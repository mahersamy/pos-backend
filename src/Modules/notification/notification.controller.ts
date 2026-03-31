import { Controller, Post, Body, Req, Get, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthApply, AuthUser } from '../../common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import type { UserDocument } from '../../DB/Models/users.model';
import { GetAllNotification } from './dto/get-all-notification.dto';




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


  @Get()
  async getAllNotifications(@Query() query: GetAllNotification) {
    return this.notificationService.getAllNotifications(query);
  }

  // @Get(':userId')
  // async getUserNotifications(@Param('userId') userId: string) {
  //   return this.notificationService.getUserNotifications(userId);
  // }

}
