import { Injectable, NotFoundException } from '@nestjs/common';
import { isValidObjectId, QueryFilter } from 'mongoose';
import {
  InventoryRepository,
  INVENTORY_QUERY_OPTIONS,
} from '../../DB/Repository/inventory.repository';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { GetAllInventoryDto } from './dto/get-all-inventory.dto';
import type { UserDocument } from '../../DB/Models/users.model';
import { InventoryDocument } from '../../DB/Models/inventory.model';

@Injectable()
export class InventoryService {
  constructor(private readonly _inventoryRepository: InventoryRepository) {}

  async create(dto: CreateInventoryDto, user: UserDocument, image?: any) {
    const payload: any = {
      ...dto,
      createdBy: user._id,
    };

    if (image) {
      payload.image = {
        secure_url: image.secure_url,
        public_id: image.public_id,
      };
    }

    const inventory = await this._inventoryRepository.createAndReturn(payload);
    return inventory;
  }

  async findAll(query: GetAllInventoryDto) {
    const { page, limit, sort, search, categoryId, stock, status, perishable } =
      query;

    const filter: QueryFilter<InventoryDocument> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        ...(isValidObjectId(search) ? [{ _id: search }] : []),
      ];
    }

    if (categoryId && isValidObjectId(categoryId)) {
      filter.category = categoryId;
    }

    if (stock) {
      filter.stock = stock;
    }

    if (status) {
      filter.status = status;
    }

    if (perishable !== undefined) {
      filter.perishable = perishable;
    }

    return this._inventoryRepository.paginate(filter, {
      page,
      limit,
      sort: sort === 'asc' ? { createdAt: 1 } : { createdAt: -1 },
      ...INVENTORY_QUERY_OPTIONS,
    });
  }

  async findOne(id: string) {
    if (!isValidObjectId(id))
      throw new NotFoundException('Inventory item not found');
    const inventory = await this._inventoryRepository.findById(
      id,
      {},
      INVENTORY_QUERY_OPTIONS,
    );
    if (!inventory) throw new NotFoundException('Inventory item not found');
    return inventory;
  }

  async update(id: string, dto: UpdateInventoryDto, image?: any) {
    if (!isValidObjectId(id))
      throw new NotFoundException('Inventory item not found');

    const inventory = await this._inventoryRepository.findById(id);
    if (!inventory) throw new NotFoundException('Inventory item not found');

    const payload: any = { ...dto };
    if (image) {
      payload.image = {
        secure_url: image.secure_url,
        public_id: image.public_id,
      };
    }

    const updated = await this._inventoryRepository.findByIdAndUpdate(
      id,
      payload,
      INVENTORY_QUERY_OPTIONS,
    );

    return updated;
  }

  async remove(id: string) {
    if (!isValidObjectId(id))
      throw new NotFoundException('Inventory item not found');

    const inventory = await this._inventoryRepository.findById(id);
    if (!inventory) throw new NotFoundException('Inventory item not found');

    await this._inventoryRepository.findByIdAndDelete(id);
    return 'Inventory item deleted successfully';
  }
}
