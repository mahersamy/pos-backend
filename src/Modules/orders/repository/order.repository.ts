import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../../common/database/base.repository';
import { Order, OrderDocument } from '../model/orders.model';
import { ORDER_SELECT, ORDER_POPULATE } from '../constants/orders.constants';

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
