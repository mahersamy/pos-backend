import { EventEmitter } from 'node:events';
import { sendConfirmEmail, sendOrderNotification } from '../email/send.email';

export const emailEvent = new EventEmitter();

emailEvent.on(
  'sendOtp',
  async (email: string, otp: string, subject: string, title: string) => {
    await sendConfirmEmail(email, otp, subject, title);
  },
);

emailEvent.on(
  'sendOrderPlacedNotification',
  async ({
    to,
    subject,
    customerName,
    orderId,
    totalAmount,
    items,
  }: {
    to: string;
    subject: string;
    customerName: string;
    orderId: string;
    totalAmount: number;
    items: any[];
  }) => {
    await sendOrderNotification({
      to,
      subject,
      customerName,
      orderId,
      totalAmount,
      items,
    });
  },
);
