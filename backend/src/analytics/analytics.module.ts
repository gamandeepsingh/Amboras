import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { CacheService } from './cache.service';

@Module({
  providers: [AnalyticsService, CacheService],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
