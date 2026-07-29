export const ORDER_EVENTS = {
  CREATED: 'order.created',
} as const;

export class OrderCreatedEvent {
  constructor(
    public readonly data: {
      orderId: string;
      orderNumber: string;
      totalAmount: number;
      createdBy: string;
    },
  ) {}
}
