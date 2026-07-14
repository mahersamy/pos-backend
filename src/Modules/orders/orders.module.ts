import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Inventory, InventorySchema } from '../inventory/model/inventory.model';
import { InventoryRepository } from '../inventory/repository/inventory.repository';
import { Order, OrderSchema } from './model/orders.model';
import { OrderRepository } from './repository/order.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Inventory.name, schema: InventorySchema },
    ]),
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, InventoryRepository, OrderRepository],
  exports: [OrderRepository],
})
export class OrdersModule {}
