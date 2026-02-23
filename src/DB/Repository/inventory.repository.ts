import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from './base.repository';
import { Inventory, InventoryDocument } from '../Models/inventory.model';

export const INVENTORY_SELECT =
  'name category quantity stock status price perishable image createdAt';

export const INVENTORY_POPULATE = {
  path: 'category',
  select: 'name isActive',
};

export const INVENTORY_QUERY_OPTIONS = {
  select: INVENTORY_SELECT,
  populate: INVENTORY_POPULATE,
};

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
