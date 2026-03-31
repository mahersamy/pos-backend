import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from './base.repository';
import {
  Notification,
  NotificationDocument,
} from '../Models/notification.model';



export const NOTIFICATION_SELECT = 'title message status type channel userId metadata sentAt errorMessage createdAt updatedAt';
export const NOTIFICATION_QUERY_OPTIONS = {
  select: NOTIFICATION_SELECT,
};


@Injectable()
export class NotificationRepository extends BaseRepository<NotificationDocument> {

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {
    super(notificationModel);
  }
}
