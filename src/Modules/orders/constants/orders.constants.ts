import { OrderStatus } from '../../../common/Enums/order-status';

export const ORDER_SELECT =
  'orderNumber status cancellationReason orderType table guestName deliveryInfo phoneNumber totalAmount orderItems createdBy createdAt updatedAt';

export const ORDER_POPULATE = [
  {
    path: 'createdBy',
    select: 'firstName lastName email',
  },
];

export const ORDER_QUERY_OPTIONS = {
  select: ORDER_SELECT,
  populate: ORDER_POPULATE,
  lean: true,
};

/**
 * Allowed order status transitions (state machine).
 * `completed` and `cancelled` are terminal: nothing can leave them.
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  [OrderStatus.IN_PROCESS]: [OrderStatus.READY, OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  [OrderStatus.READY]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELLED]: [],
};

/** All statuses an order may currently be in so that moving it to `target` is legal. */
export function statusesThatCanMoveTo(target: OrderStatus): OrderStatus[] {
  return (Object.keys(ORDER_STATUS_TRANSITIONS) as OrderStatus[]).filter((from) =>
    ORDER_STATUS_TRANSITIONS[from].includes(target),
  );
}

/** Statuses in which an order's descriptive fields (table, phone, ...) may still be edited. */
export const EDITABLE_ORDER_STATUSES: readonly OrderStatus[] = [
  OrderStatus.IN_PROCESS,
  OrderStatus.READY,
];
