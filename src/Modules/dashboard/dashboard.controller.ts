import { Controller, Get } from '@nestjs/common';
import { AuthApply, CheckPermissions, Action, Resource } from '../../common';
import { DashboardService } from './dashboard.service';

@AuthApply({ roles: [] })
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @CheckPermissions({ resource: Resource.DASHBOARD, actions: [Action.READ] })
  @Get('metrics')
  getDashboardMetrics() {
    return this.dashboardService.getDashboardMetrics();
  }
}
