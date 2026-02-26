import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from './base.repository';
import { Order, OrderDocument } from '../Models/orders.model';

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

@Injectable()
export class OrderRepository extends BaseRepository<OrderDocument> {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {
    super(orderModel);
  }

  async createAndReturn(data: Partial<OrderDocument>): Promise<OrderDocument> {
    const created = await this.orderModel.create(data);
    return this.orderModel
      .findById(created._id)
      .select(ORDER_SELECT)
      .populate(ORDER_POPULATE)
      .lean() as Promise<OrderDocument>;
  }
}
