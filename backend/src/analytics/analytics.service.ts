import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from './cache.service';
import { AnalyticsRangeQueryDto } from './dto/analytics-range-query.dto';
import { RevenueTimeseriesQueryDto } from './dto/revenue-timeseries-query.dto';

interface OverviewRow {
  current_revenue: string;
  previous_revenue: string;
  current_purchases: string;
  previous_purchases: string;
  current_page_views: string;
  previous_page_views: string;
  current_conversion_rate: string;
  previous_conversion_rate: string;
  event_counts: Record<string, number>;
}

interface TopProductRow {
  product_id: string;
  total_revenue: string;
  order_count: string;
}

interface RevenueTimeseriesRow {
  bucket: string;
  revenue: string;
  orders: number;
}

interface LiveVisitorsRow {
  count: string;
}

interface NormalizedRange {
  from: Date;
  toExclusive: Date;
  previousFrom: Date;
  previousToExclusive: Date;
  cacheFragment: string;
}

const OVERVIEW_SQL = `
  WITH current_stats AS (
    SELECT
      COALESCE(SUM((data->>'amount')::numeric) FILTER (WHERE event_type = 'purchase'), 0) AS revenue,
      COUNT(*) FILTER (WHERE event_type = 'purchase')::int AS purchases,
      COUNT(*) FILTER (WHERE event_type = 'page_view')::int AS page_views
    FROM events
    WHERE store_id::text = $1
      AND timestamp >= $2::timestamptz
      AND timestamp < $3::timestamptz
  ),
  previous_stats AS (
    SELECT
      COALESCE(SUM((data->>'amount')::numeric) FILTER (WHERE event_type = 'purchase'), 0) AS revenue,
      COUNT(*) FILTER (WHERE event_type = 'purchase')::int AS purchases,
      COUNT(*) FILTER (WHERE event_type = 'page_view')::int AS page_views
    FROM events
    WHERE store_id::text = $1
      AND timestamp >= $4::timestamptz
      AND timestamp < $5::timestamptz
  ),
  event_counts AS (
    SELECT event_type, COUNT(*)::int AS cnt
    FROM events
    WHERE store_id::text = $1
      AND timestamp >= $2::timestamptz
      AND timestamp < $3::timestamptz
    GROUP BY event_type
  )
  SELECT
    c.revenue::text AS current_revenue,
    p.revenue::text AS previous_revenue,
    c.purchases::text AS current_purchases,
    p.purchases::text AS previous_purchases,
    c.page_views::text AS current_page_views,
    p.page_views::text AS previous_page_views,
    CASE WHEN c.page_views > 0
      THEN ROUND((c.purchases::numeric / c.page_views) * 100, 2)
      ELSE 0 END AS current_conversion_rate,
    CASE WHEN p.page_views > 0
      THEN ROUND((p.purchases::numeric / p.page_views) * 100, 2)
      ELSE 0 END AS previous_conversion_rate,
    (SELECT json_object_agg(ec.event_type, ec.cnt) FROM event_counts ec) AS event_counts
  FROM current_stats c, previous_stats p
`;

const TOP_PRODUCTS_SQL = `
  SELECT
    data->>'product_id' AS product_id,
    SUM((data->>'amount')::numeric) AS total_revenue,
    COUNT(*)::int AS order_count
  FROM events
  WHERE store_id::text = $1
    AND event_type = 'purchase'
    AND timestamp >= $2::timestamptz
    AND timestamp < $3::timestamptz
  GROUP BY data->>'product_id'
  ORDER BY total_revenue DESC
  LIMIT 10
`;

const REVENUE_TIMESERIES_SQL = `
  WITH series AS (
    SELECT generate_series(
      date_trunc('day', $2::timestamptz),
      date_trunc('day', $3::timestamptz - interval '1 day'),
      interval '1 day'
    )::date AS bucket
  ),
  aggregated AS (
    SELECT
      date_trunc('day', timestamp)::date AS bucket,
      SUM((data->>'amount')::numeric) AS revenue,
      COUNT(*)::int AS orders
    FROM events
    WHERE store_id::text = $1
      AND event_type = 'purchase'
      AND timestamp >= $2::timestamptz
      AND timestamp < $3::timestamptz
    GROUP BY date_trunc('day', timestamp)::date
  )
  SELECT
    s.bucket::text AS bucket,
    COALESCE(a.revenue, 0)::text AS revenue,
    COALESCE(a.orders, 0)::int AS orders
  FROM series s
  LEFT JOIN aggregated a ON a.bucket = s.bucket
  ORDER BY s.bucket ASC
`;

const LIVE_VISITORS_SQL = `
  SELECT COUNT(*)::int AS count
  FROM events
  WHERE store_id::text = $1
    AND timestamp >= $2::timestamptz
    AND timestamp < $3::timestamptz
`;

function parseNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function calcDeltaPercent(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Number((((current - previous) / previous) * 100).toFixed(2));
}

function parseEventCounts(value: unknown): Record<string, number> {
  if (!value) return {};
  if (typeof value === 'object') return value as Record<string, number>;

  try {
    return JSON.parse(String(value)) as Record<string, number>;
  } catch {
    return {};
  }
}

function toUtcDayStart(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

@Injectable()
export class AnalyticsService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  private normalizeRange(params: AnalyticsRangeQueryDto = {}): NormalizedRange {
    const now = new Date();

    const toInput = params.to ? new Date(params.to) : now;
    if (Number.isNaN(toInput.getTime())) {
      throw new BadRequestException('Invalid to date');
    }

    const fromInput = params.from ? new Date(params.from) : new Date(toInput);
    if (!params.from) {
      fromInput.setUTCDate(fromInput.getUTCDate() - 29);
    }

    if (Number.isNaN(fromInput.getTime())) {
      throw new BadRequestException('Invalid from date');
    }

    const from = toUtcDayStart(fromInput);
    const toInclusive = toUtcDayStart(toInput);

    if (from > toInclusive) {
      throw new BadRequestException('from must be less than or equal to to');
    }

    const toExclusive = new Date(toInclusive);
    toExclusive.setUTCDate(toExclusive.getUTCDate() + 1);

    const dayMs = 24 * 60 * 60 * 1000;
    const rangeDays = Math.max(1, Math.ceil((toExclusive.getTime() - from.getTime()) / dayMs));

    const previousToExclusive = new Date(from);
    const previousFrom = new Date(from);
    previousFrom.setUTCDate(previousFrom.getUTCDate() - rangeDays);

    const cacheFragment = `${from.toISOString()}:${toExclusive.toISOString()}`;

    return {
      from,
      toExclusive,
      previousFrom,
      previousToExclusive,
      cacheFragment,
    };
  }

  async getOverview(storeId: string, params: AnalyticsRangeQueryDto = {}) {
    const range = this.normalizeRange(params);
    const cacheKey = `overview:${storeId}:${range.cacheFragment}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const [result] = await this.prisma.$queryRawUnsafe<OverviewRow[]>(
      OVERVIEW_SQL,
      storeId,
      range.from.toISOString(),
      range.toExclusive.toISOString(),
      range.previousFrom.toISOString(),
      range.previousToExclusive.toISOString(),
    );

    const currentRevenue = parseNumber(result?.current_revenue);
    const previousRevenue = parseNumber(result?.previous_revenue);
    const currentPurchases = parseNumber(result?.current_purchases);
    const previousPurchases = parseNumber(result?.previous_purchases);
    const currentPageViews = parseNumber(result?.current_page_views);
    const previousPageViews = parseNumber(result?.previous_page_views);
    const currentConversionRate = parseNumber(result?.current_conversion_rate);
    const previousConversionRate = parseNumber(result?.previous_conversion_rate);

    const shaped = {
      range: {
        from: range.from.toISOString(),
        to: new Date(range.toExclusive.getTime() - 1).toISOString(),
        previous_from: range.previousFrom.toISOString(),
        previous_to: new Date(range.previousToExclusive.getTime() - 1).toISOString(),
      },
      revenue: {
        current: currentRevenue,
        previous: previousRevenue,
      },
      conversion_rate: currentConversionRate,
      previous_conversion_rate: previousConversionRate,
      deltas: {
        revenue: calcDeltaPercent(currentRevenue, previousRevenue),
        purchases: calcDeltaPercent(currentPurchases, previousPurchases),
        page_views: calcDeltaPercent(currentPageViews, previousPageViews),
        conversion_rate: calcDeltaPercent(currentConversionRate, previousConversionRate),
      },
      event_counts: parseEventCounts(result?.event_counts),
      total_purchases: currentPurchases,
      total_page_views: currentPageViews,
      previous_total_purchases: previousPurchases,
      previous_total_page_views: previousPageViews,
    };

    await this.cache.set(cacheKey, shaped, 30_000);
    return shaped;
  }

  async getTopProducts(storeId: string, params: AnalyticsRangeQueryDto = {}) {
    const range = this.normalizeRange(params);
    const cacheKey = `top-products:${storeId}:${range.cacheFragment}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const rows = await this.prisma.$queryRawUnsafe<TopProductRow[]>(
      TOP_PRODUCTS_SQL,
      storeId,
      range.from.toISOString(),
      range.toExclusive.toISOString(),
    );

    const result = rows.map((r, i) => ({
      rank: i + 1,
      product_id: r.product_id,
      total_revenue: parseFloat(r.total_revenue) || 0,
      order_count: Number(r.order_count) || 0,
    }));

    await this.cache.set(cacheKey, result, 60_000);
    return result;
  }

  async getRecentActivity(storeId: string, params: AnalyticsRangeQueryDto = {}) {
    const range = this.normalizeRange(params);
    const cacheKey = `recent-activity:${storeId}:${range.cacheFragment}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const events = await this.prisma.event.findMany({
      where: {
        storeId,
        timestamp: {
          gte: range.from,
          lt: range.toExclusive,
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 20,
      select: {
        id: true,
        eventId: true,
        eventType: true,
        timestamp: true,
        data: true,
      },
    });

    await this.cache.set(cacheKey, events, 10_000);
    return events;
  }

  async getLiveVisitors(storeId: string, params: AnalyticsRangeQueryDto = {}) {
    const range = this.normalizeRange(params);
    const cacheKey = `live-visitors:${storeId}:${range.cacheFragment}`;
    const cached = await this.cache.get<{ count: number }>(cacheKey);
    if (cached) return cached;

    const [result] = await this.prisma.$queryRawUnsafe<LiveVisitorsRow[]>(
      LIVE_VISITORS_SQL,
      storeId,
      range.from.toISOString(),
      range.toExclusive.toISOString(),
    );
    const payload = { count: parseNumber(result?.count) };

    await this.cache.set(cacheKey, payload, 5_000);
    return payload;
  }

  async getRevenueTimeseries(storeId: string, params: RevenueTimeseriesQueryDto = {}) {
    const range = this.normalizeRange(params);
    const granularity = params.granularity ?? 'day';

    const cacheKey = `revenue-timeseries:${storeId}:${granularity}:${range.cacheFragment}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const rows = await this.prisma.$queryRawUnsafe<RevenueTimeseriesRow[]>(
      REVENUE_TIMESERIES_SQL,
      storeId,
      range.from.toISOString(),
      range.toExclusive.toISOString(),
    );

    const points = rows.map((row) => ({
      bucket: row.bucket,
      revenue: parseNumber(row.revenue),
      orders: parseNumber(row.orders),
    }));

    const payload = {
      granularity,
      from: range.from.toISOString(),
      to: new Date(range.toExclusive.getTime() - 1).toISOString(),
      points,
    };

    await this.cache.set(cacheKey, payload, 30_000);
    return payload;
  }
}
