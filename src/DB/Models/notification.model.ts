import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { sendOrderNotification } from '../../common/utils/email';
import { emailEvent } from '../../common/utils/email/email.event';

export type NotificationDocument = HydratedDocument<Notification>;

export enum NotificationChannel {
  EMAIL = 'email',
  IN_APP = 'in_app',
}

export enum NotificationType {
  ORDER_PLACED = 'order_placed',
  ORDER_SHIPPED = 'order_shipped',
  ORDER_DELIVERED = 'order_delivered',
  ORDER_CANCELLED = 'order_cancelled',
  WELCOME = 'welcome',
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
  PRODUCT_BACK_IN_STOCK = 'product_back_in_stock',
  PRICE_DROP = 'price_drop',
  COUPON_EXPIRING = 'coupon_expiring',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  READ = 'read',
}

@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class Notification {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, type: String, enum: NotificationChannel })
  channel: NotificationChannel;

  @Prop({ required: true, type: String, enum: NotificationType })
  type: NotificationType;

  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: String })
  message: string;

  @Prop({ type: String })
  recipient: string; // Email address for email notifications

  @Prop({
    required: true,
    type: String,
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @Prop({ type: Object })
  metadata: Record<string, any>; // Additional data (order ID, product ID, etc.)

  @Prop({ type: String })
  errorMessage: string; // Store error if sending fails

  @Prop({ type: Number, default: 0 })
  retryCount: number;

  @Prop({ type: Date })
  sentAt: Date;

  @Prop({ type: Date })
  readAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Index for faster queries
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, status: 1 });

NotificationSchema.pre('save', async function () {
  if (
    this.type === NotificationType.ORDER_PLACED &&
    this.channel === NotificationChannel.EMAIL
  ) {
    try {
      emailEvent.emit('sendOrderPlacedNotification', {
        to: this.recipient,
        subject: this.title,
        customerName: this.metadata?.customerName,
        orderId: this.metadata?.orderId,
        totalAmount: this.metadata?.totalAmount,
        items: this.metadata?.items || [], // Ensure items is at least an empty array
      });
      this.status = NotificationStatus.SENT;
      this.sentAt = new Date();
    } catch (error) {
      console.error('Error sending email notification:', error);
      this.status = NotificationStatus.FAILED;
      this.errorMessage = error.message;
    }
  }
});
