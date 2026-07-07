import { Controller, Get, UseGuards } from '@nestjs/common';

import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtUser } from '../auth/types/jwt-user.type';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(@CurrentUser() user: JwtUser) {
    return this.dashboardService.getSummary(user.userId);
  }

  @Get('category-breakdown')
  getCategoryBreakdown(@CurrentUser() user: JwtUser) {
    return this.dashboardService.getCategoryBreakdown(user.userId);
  }

  @Get('monthly-spending')
  getMonthlySpending(@CurrentUser() user: JwtUser) {
    return this.dashboardService.getMonthlySpending(user.userId);
  }
}
