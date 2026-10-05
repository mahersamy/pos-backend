import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { BaseRepository } from '../../../common/database/base.repository';
import { Inventory, InventoryDocument } from '../model/inventory.model';
import { INVENTORY_SELECT, INVENTORY_POPULATE } from '../constants/inventory.constants';
import { InventoryStock } from '../../../common';

@Injectable()
export class InventoryRepository extends BaseRepository<InventoryDocument> {
  constructor(
    @InjectModel(Inventory.name)
    private readonly inventoryModel: Model<InventoryDocument>,
  ) {
    super(inventoryModel);
  }

  async createAndReturn(
    data: Partial<InventoryDocument>,
  ): Promise<InventoryDocument> {
    const created = await this.inventoryModel.create(data);
    return this.inventoryModel
      .findById(created._id)
      .select(INVENTORY_SELECT)
      .populate(INVENTORY_POPULATE)
      .lean() as Promise<InventoryDocument>;
  }

  /**
   * Atomically checks and decrements stock in a single DB operation.
   * Returns null if there is not enough quantity — caller must handle this.
   * Must run inside a session/transaction.
   */
  async decrementStock(
    inventoryId: Types.ObjectId,
    quantity: number,
    session: ClientSession,
  ): Promise<InventoryDocument | null> {
    return this.inventoryModel.findOneAndUpdate(
      {
        _id: inventoryId,
        quantity: { $gte: quantity }, // ← atomic guard: check + decrement in ONE op
      },
      [
        {
          $set: {
            quantity: { $subtract: ['$quantity', quantity] },
            // flip to OUTOFSTOCK when resulting quantity reaches 0
            stock: {
              $cond: [
                { $eq: [{ $subtract: ['$quantity', quantity] }, 0] },
                InventoryStock.OUTOFSTOCK,
                '$stock',
              ],
            },
          },
        },
      ],
      { new: true, session, updatePipeline: true } as any,
    ).exec() as unknown as Promise<InventoryDocument | null>;
  }

  /**
   * Atomically increments stock (used on order cancellation).
   * Always sets status back to INSTOCK.
   * Must run inside a session/transaction.
   */
  async incrementStock(
    inventoryId: Types.ObjectId,
    quantity: number,
    session: ClientSession,
  ): Promise<InventoryDocument | null> {
    return this.inventoryModel.findOneAndUpdate(
      { _id: inventoryId },
      {
        $inc: { quantity },
        $set: { stock: InventoryStock.INSTOCK },
      },
      { new: true, session },
    ).exec();
  }
}
