import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthApply, CheckPermissions, Action, Resource } from '../../common';
import { DashboardService } from './dashboard.service';
import {
  MonthlyOverviewItem,
  PopularDishItem,
  LowStockItem,
} from './dto/dashboard-metrics.dto';

@ApiTags('Dashboard')
@ApiBearerAuth('access-token')
@AuthApply({ roles: [] })
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @CheckPermissions({ resource: Resource.DASHBOARD, actions: [Action.READ] })
  @Get('daily-sales')
  async getDailySales(): Promise<number> {
    return this.dashboardService.getDailySalesCached();
  }

  @CheckPermissions({ resource: Resource.DASHBOARD, actions: [Action.READ] })
  @Get('monthly-revenue')
  async getMonthlyRevenue(): Promise<number> {
    return this.dashboardService.getMonthlyRevenueCached();
  }

  @CheckPermissions({ resource: Resource.DASHBOARD, actions: [Action.READ] })
  @Get('overview')
  async getOverview(): Promise<MonthlyOverviewItem[]> {
    return this.dashboardService.getOverviewCached();
  }

  @CheckPermissions({ resource: Resource.DASHBOARD, actions: [Action.READ] })
  @Get('popular-dishes')
  async getPopularDishes(): Promise<PopularDishItem[]> {
    return this.dashboardService.getPopularDishesCached();
  }

  @CheckPermissions({ resource: Resource.DASHBOARD, actions: [Action.READ] })
  @Get('low-stock')
  async getLowStockItems(): Promise<LowStockItem[]> {
    return this.dashboardService.getLowStockItemsCached();
  }
}
