import { EventEmitter } from 'node:events';
import { sendAnnouncementEmail, sendConfirmEmail, sendOrderNotification, sendNewUserEmail } from '../email/send.email';

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

emailEvent.on(
  'sendAnnouncementNotification',
  async ({
    to,
    subject,
    message,
  }: {
    to: string;
    subject: string;
    message: string;
  }) => {
    await sendAnnouncementEmail({
      to,
      subject,
      message,
    });
  },
);

emailEvent.on(
  'sendNewUserEmail',
  async (email: string, password?: string) => {
    await sendNewUserEmail(
      email,
      'Welcome to our POS System',
      password,
    );
  },
);
