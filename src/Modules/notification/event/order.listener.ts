import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from '../notification.service';
import { OrderCreatedEvent, ORDER_EVENTS } from '../../orders/event/order-created.event';
import { NotificationType, NotificationChannel } from '../model/notification.model';
import { Types } from 'mongoose';

@Injectable()
export class OrderNotificationListener {
  constructor(private readonly notificationService: NotificationService) {}

  @OnEvent(ORDER_EVENTS.CREATED)
  async handleOrderCreated(event: OrderCreatedEvent) {
    const userId = new Types.ObjectId(event.data.createdBy);
    await this.notificationService
      .sendNotification(
        userId,      // senderId
        userId,      // receiverId
        NotificationType.ORDER_PLACED,
        'Order Placed',
        `Order ${event.data.orderNumber} has been placed.`,
        { orderId: event.data.orderId, totalAmount: event.data.totalAmount },
        NotificationChannel.EMAIL,
      )
      .catch((err) =>
        console.error('Failed to send order.created notification', err),
      );
  }
}
