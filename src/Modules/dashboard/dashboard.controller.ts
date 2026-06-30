import { Controller, Get } from '@nestjs/common';
import { AuthApply, CheckPermissions, Action, Resource } from '../../common';
import { DashboardService } from './dashboard.service';
import { DashboardMetricsDto } from './dto/dashboard-metrics.dto';

@AuthApply({ roles: [] })
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @CheckPermissions({ resource: Resource.DASHBOARD, actions: [Action.READ] })
  @Get('metrics')
  async getDashboardMetrics(): Promise<DashboardMetricsDto> {
    return this.dashboardService.getDashboardMetrics();
  }
}
