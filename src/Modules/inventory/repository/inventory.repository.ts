import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../../common/database/base.repository';
import { Inventory, InventoryDocument } from '../model/inventory.model';
import { INVENTORY_SELECT, INVENTORY_POPULATE } from '../constants/inventory.constants';

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
}
