import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryRepository } from '../../DB/Repository/inventory.repository';
import { Inventory, InventorySchema } from '../../DB/Models/inventory.model';
import { CloudinaryService } from '../../common/services/cloudinary/cloudinary.service';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Inventory.name, schema: InventorySchema },
    ]),
    CategoryModule,
  ],
  controllers: [InventoryController],
  providers: [InventoryService, InventoryRepository, CloudinaryService],
  exports: [InventoryRepository],
})
export class InventoryModule {}
