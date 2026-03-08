import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationRepository } from '../../DB/Repository/notification.repository';
import { UserRepository } from '../../DB/Repository/user.repository';
import { FirebaseService } from '../../common/services/firebase/firebase.service';
import {
  NotificationType,
  NotificationChannel,
  NotificationStatus,
} from '../../DB/Models/notification.model';
import { Types } from 'mongoose';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly userRepository: UserRepository,
    private readonly firebaseService: FirebaseService,
  ) {}

  async sendOrderNotification({
    userId,
    orderId,
    customerName,
    totalAmount,
    items,
    recipient,
  }: {
    userId: Types.ObjectId;
    orderId: string | Types.ObjectId;
    customerName: string;
    totalAmount: number;
    items: any[];
    recipient: string;
  }) {
    const notification = await this.notificationRepository.create({
      userId,
      type: NotificationType.ORDER_PLACED,
      channel: NotificationChannel.EMAIL,
      title: 'Order Placed Successfully',
      message: `Your order #${orderId} has been placed successfully.`,
      status: NotificationStatus.PENDING,
      recipient: recipient,
      metadata: {
        orderId,
        customerName,
        totalAmount,
        items,
        recipient,
      },
    });

    return notification;
  }

  getAllNotifications() {
    return this.notificationRepository.find();
  }

  getUserNotifications(userId: string) {
    return this.notificationRepository.find({
      userId: new Types.ObjectId(userId),
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

  async sendPushNotification(
    userId: Types.ObjectId,
    type: NotificationType,
    title: string,
    messageBody: string,
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
      status: NotificationStatus.PENDING,
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
}
