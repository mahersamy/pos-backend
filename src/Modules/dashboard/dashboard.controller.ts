import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthApply, CheckPermissions, Action, Resource } from '../../common';
import { DashboardService } from './dashboard.service';
import { DashboardHelpers } from './dashboard.helpers';
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
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly helpers: DashboardHelpers,
  ) {}

  @CheckPermissions({ resource: Resource.DASHBOARD, actions: [Action.READ] })
  @Get('daily-sales')
  async getDailySales(): Promise<number> {
    return this.helpers.safeMetric(
      () => this.dashboardService.getDailySalesCached(),
      0,
    );
  }

  @CheckPermissions({ resource: Resource.DASHBOARD, actions: [Action.READ] })
  @Get('monthly-revenue')
  async getMonthlyRevenue(): Promise<number> {
    return this.helpers.safeMetric(
      () => this.dashboardService.getMonthlyRevenueCached(),
      0,
    );
  }

  @CheckPermissions({ resource: Resource.DASHBOARD, actions: [Action.READ] })
  @Get('overview')
  async getOverview(): Promise<MonthlyOverviewItem[]> {
    return this.helpers.safeMetric(
      () => this.dashboardService.getOverviewCached(),
      [],
    );
  }

  @CheckPermissions({ resource: Resource.DASHBOARD, actions: [Action.READ] })
  @Get('popular-dishes')
  async getPopularDishes(): Promise<PopularDishItem[]> {
    return this.helpers.safeMetric(
      () => this.dashboardService.getPopularDishesCached(),
      [],
    );
  }

  @CheckPermissions({ resource: Resource.DASHBOARD, actions: [Action.READ] })
  @Get('low-stock')
  async getLowStockItems(): Promise<LowStockItem[]> {
    return this.helpers.safeMetric(
      () => this.dashboardService.getLowStockItemsCached(),
      [],
    );
  }
}
