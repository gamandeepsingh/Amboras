import { IsIn, IsOptional } from 'class-validator';
import { AnalyticsRangeQueryDto } from './analytics-range-query.dto';

export class RevenueTimeseriesQueryDto extends AnalyticsRangeQueryDto {

  @IsOptional()
  @IsIn(['day'])
  granularity?: 'day';
}
