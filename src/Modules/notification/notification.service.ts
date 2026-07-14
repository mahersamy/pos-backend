import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { NotificationRepository } from './repository/notification.repository';
import { NOTIFICATION_QUERY_OPTIONS } from './constants/notification.constants';
import { UserRepository } from '../users/repository/user.repository';
import { FirebaseService } from '../../common/services/firebase/firebase.service';
import { FcmTokenRepository } from '../users/repository/fcm-token.repository';
import {
  NotificationType,
  NotificationChannel,
  NotificationStatus,
  NotificationDocument,
} from './model/notification.model';
import { QueryFilter, Types } from 'mongoose';
import { GetNotificationsDto } from './dto/get-all-notification.dto';
import { emailEvent } from '../../common/utils/email/email.event';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly userRepository: UserRepository,
    private readonly firebaseService: FirebaseService,
    private readonly fcmTokenRepository: FcmTokenRepository,
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
    if (!user) throw new NotFoundException(`User not found`);

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

    switch (type) {
      case NotificationType.ORDER_PLACED:
        emailEvent.emit('sendOrderPlacedNotification', {
          to: recipient,
          subject: title,
          customerName: metadata?.customerName || user.fullName || user.firstName,
          orderId: String(metadata?.orderId || ''),
          totalAmount: metadata?.totalAmount || 0,
          items: metadata?.items || [],
        });
        break;
      case NotificationType.ANNOUNCEMENT:
        emailEvent.emit('sendAnnouncementNotification', {
          to: recipient,
          subject: title,
          message: messageBody,
        });
        break;
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

    const objectIdUserId = new Types.ObjectId(userId.toString());
    const userTokensDocs = await this.fcmTokenRepository.find({ userId: objectIdUserId });
    const fcmTokens = userTokensDocs.map(doc => doc.token);

    if (fcmTokens.length > 0) {
      try {
        const response = await this.firebaseService.sendPushNotification(
          fcmTokens,
          title,
          messageBody,
          metadata as { [key: string]: string },
        );

        if (response && response.failureCount > 0) {
          const failedTokens: string[] = [];
          response.responses.forEach((resp, idx) => {
            if (!resp.success && (resp.error?.code === 'messaging/registration-token-not-registered' || resp.error?.message === 'NotRegistered' || resp.error?.code === 'messaging/invalid-registration-token')) {
              failedTokens.push(fcmTokens[idx]);
            }
          });

          if (failedTokens.length > 0) {
            await this.fcmTokenRepository.deleteMany({ token: { $in: failedTokens } });
          }
        }

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


  async deleteNotification(userId: Types.ObjectId, notificationId: Types.ObjectId) {
    const notification = await this.notificationRepository.findById(notificationId);
    if (!notification) throw new NotFoundException('Notification not found');
    if (notification.userId.toString() !== userId.toString()) throw new UnauthorizedException('You are not authorized to delete this notification');
    await this.notificationRepository.findByIdAndDelete(notificationId);
    return 'Notification deleted successfully';
  }


  async markAsRead(userId: Types.ObjectId, notificationIds: Types.ObjectId[]) {
    const result = await this.notificationRepository.updateMany({ _id: { $in: notificationIds }, userId: userId.toString() }, { status: NotificationStatus.READ, readAt: new Date() });
    console.log(result)
    if (result.modifiedCount === 0) {
      throw new NotFoundException('Notification not found');
    }
    return 'Notification marked as read successfully';
  }


  async getUserNotifications(
    userId: Types.ObjectId,
    dto: GetNotificationsDto,
  ) {
    const { limit, cursor, status } = dto;

    const query: QueryFilter<NotificationDocument> = {
      userId: userId.toString(),
      channel: NotificationChannel.PUSH,
    };

    if (status) {
      query.status = status;
    }

    // Cursor: fetch records older than the last seen _id
    if (cursor) {
      query._id = { $lt: new Types.ObjectId(cursor) };
    }

    const raw = await this.notificationRepository.find(
      query,
      undefined,
      {
        sort: { _id: -1 },
        limit: limit + 1,
        ...NOTIFICATION_QUERY_OPTIONS
      },
    );

    const hasMore = raw.length > limit;
    const data = hasMore ? raw.slice(0, limit) : raw;

    return {
      data,
      hasMore,
      nextCursor: hasMore ? (data[data.length - 1])._id.toString() : null,
    };
  }

  async addFcmToken(userId: Types.ObjectId, token: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    await this.fcmTokenRepository.findOneAndUpdate(
      { token },
      { $set: { userId } },
      { upsert: true, new: true }
    );
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
        this.sendEmailNotification(actualReceiverId, type, title, messageBody, NotificationStatus.SENT, metadata);
        break;
      case NotificationChannel.PUSH:
        this.sendPushNotification(actualReceiverId, type, title, messageBody, NotificationStatus.PENDING, metadata);
        break;
    }
  }
}
