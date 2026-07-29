import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { USER_EVENTS, UserCreatedEvent } from './user-created.event';
import { sendNewUserEmail } from '../../../common/utils/email/send.email';

@Injectable()
export class UserNotificationListener {
  @OnEvent(USER_EVENTS.CREATED)
  async handleUserCreated(event: UserCreatedEvent) {
    await sendNewUserEmail(
      event.data.email,
      'Welcome to our POS System',
      event.data.password,
    ).catch((err) => {
      console.error('Failed to send welcome email', err);
    });
  }
}
