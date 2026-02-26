import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { OrdersModule } from '../orders/orders.module';
import { DashboardController } from './dashboard.controller';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [OrdersModule,InventoryModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
