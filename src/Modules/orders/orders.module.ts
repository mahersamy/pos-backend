import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Inventory, InventorySchema } from '../inventory/model/inventory.model';
import { InventoryRepository } from '../inventory/repository/inventory.repository';
import { Order, OrderSchema } from './model/orders.model';
import { OrderRepository } from './repository/order.repository';
import { Counter, CounterSchema } from './model/counter.model';
import { CounterRepository } from './repository/counter.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Inventory.name, schema: InventorySchema },
      { name: Order.name, schema: OrderSchema },
      { name: Counter.name, schema: CounterSchema },
    ]),
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    InventoryRepository,
    OrderRepository,
    CounterRepository,
  ],
  exports: [OrderRepository],
})
export class OrdersModule {}
