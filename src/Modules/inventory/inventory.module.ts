import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { InventoryController } from "./inventory.controller";
import { InventoryService } from "./inventory.service";
import { InventoryRepository } from "./repository/inventory.repository";
import { Inventory, InventorySchema } from "./model/inventory.model";
import { CloudinaryService } from "../../common/services/cloudinary/cloudinary.service";
import { CategoryModule } from "../category/category.module";
import { UserModule } from "../users/user.module";

import {
  InventoryMovement,
  InventoryMovementSchema,
} from "./model/inventory-movement.model";
import { InventoryMovementRepository } from "./repository/inventory-movement.repository";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Inventory.name, schema: InventorySchema },
      { name: InventoryMovement.name, schema: InventoryMovementSchema },
    ]),
    CategoryModule,
    UserModule,
  ],
  controllers: [InventoryController],
  providers: [
    InventoryService,
    InventoryRepository,
    InventoryMovementRepository,
    CloudinaryService,
  ],
  exports: [InventoryRepository, InventoryMovementRepository, MongooseModule],
})
export class InventoryModule {}
