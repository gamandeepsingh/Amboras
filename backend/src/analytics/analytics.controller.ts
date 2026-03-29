import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RevenueTimeseriesQueryDto } from './dto/revenue-timeseries-query.dto';
import { AnalyticsRangeQueryDto } from './dto/analytics-range-query.dto';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analytics: AnalyticsService) {}

  @Get('overview')
  overview(
    @Request() req: { user: { storeId: string } },
    @Query() query: AnalyticsRangeQueryDto,
  ) {
    return this.analytics.getOverview(req.user.storeId, query);
  }

  @Get('top-products')
  topProducts(
    @Request() req: { user: { storeId: string } },
    @Query() query: AnalyticsRangeQueryDto,
  ) {
    return this.analytics.getTopProducts(req.user.storeId, query);
  }

  @Get('recent-activity')
  recentActivity(
    @Request() req: { user: { storeId: string } },
    @Query() query: AnalyticsRangeQueryDto,
  ) {
    return this.analytics.getRecentActivity(req.user.storeId, query);
  }

  @Get('live-visitors')
  liveVisitors(
    @Request() req: { user: { storeId: string } },
    @Query() query: AnalyticsRangeQueryDto,
  ) {
    return this.analytics.getLiveVisitors(req.user.storeId, query);
  }

  @Get('revenue-timeseries')
  revenueTimeseries(
    @Request() req: { user: { storeId: string } },
    @Query() query: RevenueTimeseriesQueryDto,
  ) {
    return this.analytics.getRevenueTimeseries(req.user.storeId, query);
  }
}
