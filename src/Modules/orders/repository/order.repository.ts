import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
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

  /**
   * Creates an order document and returns it fully populated.
   * Pass a ClientSession to run inside a transaction.
   */
  async createAndReturn(
    data: Partial<OrderDocument>,
    session?: ClientSession,
  ): Promise<OrderDocument> {
    const [created] = await this.orderModel.create([data], session ? { session } : undefined);
    // Read with the same session so we can see our own uncommitted write.
    // Populate works fine here because the referenced docs (inventory, user)
    // are already committed before the transaction started.
    return this.orderModel
      .findById(created._id)
      .session(session ?? null)
      .select(ORDER_SELECT)
      .populate(ORDER_POPULATE)
      .lean() as Promise<OrderDocument>;
  }
}
