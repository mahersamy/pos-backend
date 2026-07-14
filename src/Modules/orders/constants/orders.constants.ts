export const ORDER_SELECT =
  'orderNumber status cancellationReason orderType table guestName deliveryInfo phoneNumber totalAmount orderItems createdBy createdAt updatedAt';

export const ORDER_POPULATE = [
  {
    path: 'orderItems.inventory',
    select: 'name price image.secure_url',
  },
  {
    path: 'createdBy',
    select: 'firstName lastName email',
  },
];

export const ORDER_QUERY_OPTIONS = {
  select: ORDER_SELECT,
  populate: ORDER_POPULATE,
};
