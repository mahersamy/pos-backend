export const USER_EVENTS = {
  CREATED: 'user.created',
} as const;

export class UserCreatedEvent {
  constructor(
    public readonly data: {
      userId: string;
      email: string;
      password?: string;
    },
  ) {}
}
