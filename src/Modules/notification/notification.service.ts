import { Injectable, NotFoundException } from '@nestjs/common';
import { NOTIFICATION_QUERY_OPTIONS, NotificationRepository } from '../../DB/Repository/notification.repository';
import { UserRepository } from '../../DB/Repository/user.repository';
import { FirebaseService } from '../../common/services/firebase/firebase.service';
import {
  NotificationType,
  NotificationChannel,
  NotificationStatus,
  NotificationDocument,
} from '../../DB/Models/notification.model';
import { isValidObjectId, QueryFilter, Types } from 'mongoose';
import { GetAllNotification } from './dto/get-all-notification.dto';
import { emailEvent } from '../../common/utils/email/email.event';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly userRepository: UserRepository,
    private readonly firebaseService: FirebaseService,
  ) { }

  private async sendEmailNotification(
    userId: Types.ObjectId,
    type: NotificationType,
    title: string,
    messageBody: string,
    status: NotificationStatus,
    metadata?: Record<string, any>,
  ) {
    const user = await this.userRepository.findById(userId);
    if (!user) return;

    const recipient = metadata?.recipient || user.email;

    const notification = await this.notificationRepository.create({
      userId,
      type,
      channel: NotificationChannel.EMAIL,
      title,
      message: messageBody,
      status,
      recipient,
      metadata,
    });

    if (type === NotificationType.ORDER_PLACED) {
      emailEvent.emit('sendOrderPlacedNotification', {
        to: recipient,
        subject: title,
        customerName: metadata?.customerName || user.fullName || user.firstName,
        orderId: String(metadata?.orderId || ''),
        totalAmount: metadata?.totalAmount || 0,
        items: metadata?.items || [],
      });
    }

    return notification;
  }
  private async sendPushNotification(
    userId: Types.ObjectId,
    type: NotificationType,
    title: string,
    messageBody: string,
    status: NotificationStatus,
    metadata?: Record<string, any>,
  ) {
    const user = await this.userRepository.findById(userId);
    if (!user) return; // Silent return if user not found

    const notification = await this.notificationRepository.create({
      userId,
      type,
      channel: NotificationChannel.PUSH,
      title,
      message: messageBody,
      status,
      metadata,
    });

    if (user.fcmTokens && user.fcmTokens.length > 0) {
      try {
        await this.firebaseService.sendPushNotification(
          user.fcmTokens,
          title,
          messageBody,
          metadata as { [key: string]: string },
        );
        notification.status = NotificationStatus.SENT;
        notification.sentAt = new Date();
      } catch (error) {
        notification.status = NotificationStatus.FAILED;
        notification.errorMessage = error.message;
      }
      await notification.save();
    } else {
      notification.status = NotificationStatus.FAILED;
      notification.errorMessage = 'No FCM tokens available for user';
      await notification.save();
    }

    return notification;
  }

  async getAllNotifications(query: GetAllNotification) {

    const { page, limit, sort, search, status, type, channel, userId } = query;
    const filter: QueryFilter<NotificationDocument> = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        ...(isValidObjectId(search) ? [{ _id: search }] : []),
      ];
    }
    if (status) {
      filter.status = status;
    }
    if (type) {
      filter.type = type;
    }
    if (channel) {
      filter.channel = channel;
    }
    if (userId) {
      filter.userId = userId;
    }
    return await this.notificationRepository.paginate(filter, {
      page,
      limit,
      sort: sort === 'asc' ? { createdAt: 1 } : { createdAt: -1 },
      ...NOTIFICATION_QUERY_OPTIONS,
    });
  }

  async getUserNotifications(userId: Types.ObjectId) {
    return await this.notificationRepository.find({
      userId: userId,
      channel: NotificationChannel.PUSH,
    });
  }

  async addFcmToken(userId: Types.ObjectId, token: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (!user.fcmTokens) user.fcmTokens = [];
    if (!user.fcmTokens.includes(token)) {
      user.fcmTokens.push(token);
      await user.save();
    }
    return { message: 'Token added successfully' };
  }

  async sendNotification(
    senderId: Types.ObjectId,
    receiverId: Types.ObjectId,
    type: NotificationType,
    title: string,
    messageBody: string,
    metadata?: Record<string, any>,
    channel?: NotificationChannel,
  ) {
    const sender = await this.userRepository.findById(senderId);
    if (!sender) throw new NotFoundException('Sender not found');

    const actualReceiverId = receiverId || senderId;

    const receiver = await this.userRepository.findById(actualReceiverId);
    if (!receiver) throw new NotFoundException('Receiver not found');

    switch (channel) {
      case NotificationChannel.EMAIL:
        this.sendEmailNotification(actualReceiverId, type, title, messageBody, NotificationStatus.PENDING, metadata);
        break;
      case NotificationChannel.PUSH:
        this.sendPushNotification(actualReceiverId, type, title, messageBody, NotificationStatus.PENDING, metadata);
        break;
    }
  }
}
