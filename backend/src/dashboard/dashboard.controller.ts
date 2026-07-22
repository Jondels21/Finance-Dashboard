import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtUser } from '../auth/types/jwt-user.type';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(@CurrentUser() user: JwtUser, @Query('month') month?: string) {
    return this.dashboardService.getSummary(user.userId, month);
  }

  @Get('category-breakdown')
  getCategoryBreakdown(
    @CurrentUser() user: JwtUser,
    @Query('month') month?: string,
  ) {
    return this.dashboardService.getCategoryBreakdown(user.userId, month);
  }

  @Get('monthly-spending')
  getMonthlySpending(
    @CurrentUser() user: JwtUser,
    @Query('month') month?: string,
  ) {
    return this.dashboardService.getMonthlySpending(user.userId, month);
  }

  @Get('monthly-income')
  getMonthlyIncome(
    @CurrentUser() user: JwtUser,
    @Query('month') month?: string,
  ) {
    return this.dashboardService.getMonthlyIncome(user.userId, month);
  }
}
