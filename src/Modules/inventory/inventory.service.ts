import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
import { CloudinaryService } from '../../common/services/cloudinary/cloudinary.service';
import { CategoryRepository } from '../../DB/Repository/category.repository';

@Injectable()
export class InventoryService {
  constructor(
    private readonly _inventoryRepository: InventoryRepository,
    private readonly cloudinaryService: CloudinaryService,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async create(dto: CreateInventoryDto, user: UserDocument) {
    // Check if category exists
    const category = await this.categoryRepository.findById(dto.category);
    if (!category) {
      throw new BadRequestException('Invalid category ID provided');
    }

    const payload: any = {
      ...dto,
      createdBy: user._id,
    };

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

  async update(id: string, dto: UpdateInventoryDto) {
    if (!isValidObjectId(id))
      throw new NotFoundException('Inventory item not found');

    const inventory = await this._inventoryRepository.findById(id);
    if (!inventory) throw new NotFoundException('Inventory item not found');

    const payload: any = { ...dto };

    if (dto.category) {
      const category = await this.categoryRepository.findById(dto.category);
      if (!category) {
        throw new BadRequestException('Invalid category ID provided');
      }
    }

    const updated = await this._inventoryRepository.findByIdAndUpdate(
      id,
      payload,
      INVENTORY_QUERY_OPTIONS,
    );

    return updated;
  }

  async addImage(id: string, image: Express.Multer.File) {
    if (!isValidObjectId(id))
      throw new NotFoundException('Inventory item not found');

    const inventory = await this._inventoryRepository.findById(id);
    if (!inventory) throw new NotFoundException('Inventory item not found');
    if (!image) throw new BadRequestException('No image provided');

    if (inventory.image?.public_id) {
      await this.cloudinaryService.deleteFile(
        String(inventory.image.public_id),
      );
    }

    const [uploaded] = await this.cloudinaryService.uploadFiles([image], {
      folder: 'inventory',
      quality: 60,
      toWebp: true,
    });

    const updated = await this._inventoryRepository.findByIdAndUpdate(
      id,
      {
        image: {
          secure_url: uploaded.secure_url,
          public_id: uploaded.public_id,
        },
      },
      INVENTORY_QUERY_OPTIONS,
    );

    return updated;
  }

  async remove(id: string) {
    if (!isValidObjectId(id))
      throw new NotFoundException('Inventory item not found');

    const inventory = await this._inventoryRepository.findById(id);
    if (!inventory) throw new NotFoundException('Inventory item not found');

    if (inventory.image?.public_id) {
      await this.cloudinaryService.deleteFile(
        String(inventory.image.public_id),
      );
    }

    await this._inventoryRepository.findByIdAndDelete(id);
    return 'Inventory item deleted successfully';
  }
}
