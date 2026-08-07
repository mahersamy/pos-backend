import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { isValidObjectId, QueryFilter } from "mongoose";
import { Cron, CronExpression } from "@nestjs/schedule";
import {
  InventoryRepository,
} from "./repository/inventory.repository";
import { INVENTORY_QUERY_OPTIONS } from "./constants/inventory.constants";
import { CreateInventoryDto } from "./dto/request/create-inventory.dto";
import { UpdateInventoryDto } from "./dto/request/update-inventory.dto";
import { GetAllInventoryDto } from "./dto/request/get-all-inventory.dto";
import type { UserDocument } from "../users/models/users.model";
import { InventoryDocument } from "./model/inventory.model";
import { CloudinaryService } from "../../common/services/cloudinary/cloudinary.service";
import { CategoryRepository } from "../category/repository/category.repository";
import { UserRepository } from "../users/repository/user.repository";
import { Role } from "../../common";
import { sendLowStockEmail } from "../../common/utils/email/send.email";

@Injectable()
export class InventoryService {
  constructor(
    private readonly _inventoryRepository: InventoryRepository,
    private readonly cloudinaryService: CloudinaryService,
    private readonly categoryRepository: CategoryRepository,
    private readonly userRepository: UserRepository,
  ) { }

  async create(dto: CreateInventoryDto, user: UserDocument) {
    // Check if category exists
    const category = await this.categoryRepository.findById(dto.category);
    if (!category) {
      throw new BadRequestException("Invalid category ID provided");
    }

    const payload: any = {
      ...dto,
      createdBy: user._id,
    };

    const inventory = await this._inventoryRepository.createAndReturn(payload);
    return inventory;
  }

  async findAll(query: GetAllInventoryDto) {
    const { page, limit, sort, search, categoryId, status } = query;

    const filter: QueryFilter<InventoryDocument> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        ...(isValidObjectId(search) ? [{ _id: search }] : []),
      ];
    }

    if (categoryId && isValidObjectId(categoryId)) {
      filter.category = categoryId;
    }

    if (status) {
      filter.status = status;
    }

    return this._inventoryRepository.paginate(filter, {
      page,
      limit,
      sort: sort === "asc" ? { createdAt: 1 } : { createdAt: -1 },
      ...INVENTORY_QUERY_OPTIONS,
    });
  }

  async findOne(id: string) {
    if (!isValidObjectId(id))
      throw new NotFoundException("Inventory item not found");
    const inventory = await this._inventoryRepository.findById(
      id,
      {},
      INVENTORY_QUERY_OPTIONS,
    );
    if (!inventory) throw new NotFoundException("Inventory item not found");
    return inventory;
  }

  async update(id: string, dto: UpdateInventoryDto) {
    if (!isValidObjectId(id))
      throw new NotFoundException("Inventory item not found");

    const inventory = await this._inventoryRepository.findById(id);
    if (!inventory) throw new NotFoundException("Inventory item not found");

    const payload: any = { ...dto };

    if (dto.category) {
      const category = await this.categoryRepository.findById(dto.category);
      if (!category) {
        throw new BadRequestException("Invalid category ID provided");
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
      throw new NotFoundException("Inventory item not found");

    const inventory = await this._inventoryRepository.findById(id);
    if (!inventory) throw new NotFoundException("Inventory item not found");
    if (!image) throw new BadRequestException("No image provided");

    if (inventory.image?.public_id) {
      await this.cloudinaryService.deleteFile(
        String(inventory.image.public_id),
      );
    }

    const [uploaded] = await this.cloudinaryService.uploadFiles([image], {
      folder: "inventory",
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
      throw new NotFoundException("Inventory item not found");

    const inventory = await this._inventoryRepository.findById(id);
    if (!inventory) throw new NotFoundException("Inventory item not found");

    if (inventory.image?.public_id) {
      await this.cloudinaryService.deleteFile(
        String(inventory.image.public_id),
      );
    }

    await this._inventoryRepository.findByIdAndDelete(id);
    return "Inventory item deleted successfully";
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkLowStockAndNotify() {
    const lowStockThreshold = 10;

    // 1. Find items with low stock
    const lowStockItems = await this._inventoryRepository.find({
      quantity: { $lte: lowStockThreshold },
    });

    if (!lowStockItems || lowStockItems.length === 0) {
      console.log("✅ No low stock items found.");
      return;
    }

    // 2. Map necessary item details for the email
    const itemsData = lowStockItems.map((item) => ({
      id: String(item._id),
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));

    // 3. Find all admins and managers
    const adminsAndManagers = await this.userRepository.find({
      role: { $in: [Role.ADMIN, Role.MANAGER] },
    });

    if (!adminsAndManagers || adminsAndManagers.length === 0) {
      console.log(
        "⚠️ Low stock detected, but no Admins or Managers found to notify.",
      );
      return;
    }

    // 4. Extract emails
    const emails = adminsAndManagers.map((user) => user.email);

    // 5. Send notification
    await sendLowStockEmail(emails, itemsData);
  }
}
