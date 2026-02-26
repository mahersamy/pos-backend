import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Inventory, InventorySchema } from '../../DB/Models/inventory.model';
import { InventoryRepository } from '../../DB/Repository/inventory.repository';
import { Order, OrderSchema } from '../../DB/Models/orders.model';
import { OrderRepository } from '../../DB/Repository/order.repository';

@Module({
  imports:[MongooseModule.forFeature([{name:Inventory.name,schema:InventorySchema}]),MongooseModule.forFeature([{name:Order.name,schema:OrderSchema}])],
  controllers: [OrdersController],
  providers: [OrdersService,InventoryRepository,OrderRepository],
})
export class OrdersModule {}
