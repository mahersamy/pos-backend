import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from '../orders/model/orders.model';
import { Inventory, InventorySchema } from '../inventory/model/inventory.model';
import {
  InventoryMovement,
  InventoryMovementSchema,
} from '../inventory/model/inventory-movement.model';
import { AppCacheModule } from '../../common/cache/cache.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { SalesReportsService } from './services/sales-reports.service';
import { InventoryReportsService } from './services/inventory-reports.service';
import { ReportDateHelper } from './helpers/report-date.helper';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Inventory.name, schema: InventorySchema },
      { name: InventoryMovement.name, schema: InventoryMovementSchema },
    ]),
    AppCacheModule,
  ],
  controllers: [ReportsController],
  providers: [
    ReportsService,
    SalesReportsService,
    InventoryReportsService,
    ReportDateHelper,
  ],
  exports: [ReportsService],
})
export class ReportsModule {}
