import { Injectable } from '@nestjs/common';
import { NotificationRepository } from '../../DB/Repository/notification.repository';
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
}
