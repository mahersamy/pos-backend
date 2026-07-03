import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardHelpers } from './dashboard.helpers';
import { OrdersModule } from '../orders/orders.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [OrdersModule, InventoryModule],
  controllers: [DashboardController],
  providers: [DashboardHelpers, DashboardService],
})
export class DashboardModule {}
