import { Controller, Post, Body, Req } from '@nestjs/common';
import { Request } from 'express';
import { NotificationService } from './notification.service';
import { AuthApply } from '../../common';
import { Types } from 'mongoose';

@AuthApply({ roles: [] })
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('fcm-token')
  async addFcmToken(
    @Req() req: Request & { user: { _id: Types.ObjectId } },
    @Body('token') token: string,
  ) {
    return this.notificationService.addFcmToken(req.user._id, token);
  }
}
