'use client';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api } from '@/lib/api';
import { useDashboardStore } from '@/store/dashboard';
import type {
  OverviewData,
  TopProduct,
  ActivityEvent,
  RevenueTimeseriesData,
} from '@/types/analytics';

function toNumber(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') return value as Record<string, unknown>;
  return {};
}

function normalizeOverviewData(rawValue: unknown, fromIso: string, toIso: string): OverviewData {
  const raw = toRecord(rawValue);
  const revenueRecord = toRecord(raw.revenue);
  const deltasRecord = toRecord(raw.deltas);

  if (revenueRecord.current !== undefined) {
    return {
      ...raw,
      revenue: {
        current: toNumber(revenueRecord.current),
        previous: toNumber(revenueRecord.previous),
      },
      conversion_rate: toNumber(raw.conversion_rate),
      previous_conversion_rate: toNumber(raw.previous_conversion_rate),
      deltas: {
        revenue: toNumber(deltasRecord.revenue),
        purchases: toNumber(deltasRecord.purchases),
        page_views: toNumber(deltasRecord.page_views),
        conversion_rate: toNumber(deltasRecord.conversion_rate),
      },
      total_purchases: toNumber(raw.total_purchases),
      total_page_views: toNumber(raw.total_page_views),
      previous_total_purchases: toNumber(raw.previous_total_purchases),
      previous_total_page_views: toNumber(raw.previous_total_page_views),
      event_counts: toRecord(raw.event_counts) as Record<string, number>,
    } as OverviewData;
  }

  const legacyRevenue = toRecord(raw.revenue);
  return {
    range: {
      from: fromIso,
      to: toIso,
      previous_from: fromIso,
      previous_to: toIso,
    },
    revenue: {
      current: toNumber(legacyRevenue.this_month ?? legacyRevenue.today),
      previous: toNumber(legacyRevenue.last_month ?? legacyRevenue.yesterday),
    },
    conversion_rate: toNumber(raw.conversion_rate),
    previous_conversion_rate: toNumber(raw.conversion_rate_last_month),
    deltas: {
      revenue: toNumber(deltasRecord.revenue_this_month ?? deltasRecord.revenue_today),
      purchases: 0,
      page_views: 0,
      conversion_rate: toNumber(deltasRecord.conversion_rate),
    },
    event_counts: toRecord(raw.event_counts) as Record<string, number>,
    total_purchases: toNumber(raw.total_purchases),
    total_page_views: toNumber(raw.total_page_views),
    previous_total_purchases: 0,
    previous_total_page_views: 0,
  };
}

export function useOverviewData() {
  const dateRange = useDashboardStore((s) => s.dateRange);
  const fromIso = `${dateRange.from}T00:00:00.000Z`;
  const toIso = `${dateRange.to}T00:00:00.000Z`;

  return useQuery<OverviewData>({
    queryKey: ['analytics', 'overview', dateRange.from, dateRange.to],
    queryFn: async () => {
      const raw = await api.overview({ from: fromIso, to: toIso });
      return normalizeOverviewData(raw, fromIso, toIso);
    },
    staleTime: 30_000,
  });
}

export function useTopProducts() {
  const dateRange = useDashboardStore((s) => s.dateRange);
  const fromIso = `${dateRange.from}T00:00:00.000Z`;
  const toIso = `${dateRange.to}T00:00:00.000Z`;

  return useQuery<TopProduct[]>({
    queryKey: ['analytics', 'top-products', dateRange.from, dateRange.to],
    queryFn: () => api.topProducts({ from: fromIso, to: toIso }) as Promise<TopProduct[]>,
    staleTime: 60_000,
  });
}

export function useRevenueTimeseries() {
  const dateRange = useDashboardStore((s) => s.dateRange);
  const fromIso = `${dateRange.from}T00:00:00.000Z`;
  const toIso = `${dateRange.to}T00:00:00.000Z`;

  return useQuery<RevenueTimeseriesData>({
    queryKey: [
      'analytics',
      'revenue-timeseries',
      dateRange.from,
      dateRange.to,
    ],
    queryFn: () => api.revenueTimeseries({
      from: fromIso,
      to: toIso,
      granularity: 'day',
    }) as Promise<RevenueTimeseriesData>,
    staleTime: 30_000,
  });
}

export function useRecentActivity() {
  const dateRange = useDashboardStore((s) => s.dateRange);
  const setActivityFeed = useDashboardStore((s) => s.setActivityFeed);
  const fromIso = `${dateRange.from}T00:00:00.000Z`;
  const toIso = `${dateRange.to}T00:00:00.000Z`;

  const query = useQuery<ActivityEvent[]>({
    queryKey: ['analytics', 'recent-activity', dateRange.from, dateRange.to],
    queryFn: () => api.recentActivity({ from: fromIso, to: toIso }) as Promise<ActivityEvent[]>,
    refetchInterval: 8_000,
    staleTime: 0,
  });

  useEffect(() => {
    if (query.data) setActivityFeed(query.data);
  }, [query.data]); // eslint-disable-line react-hooks/exhaustive-deps

  return query;
}

export function useLiveVisitors() {
  const dateRange = useDashboardStore((s) => s.dateRange);
  const setLiveVisitors = useDashboardStore((s) => s.setLiveVisitors);
  const fromIso = `${dateRange.from}T00:00:00.000Z`;
  const toIso = `${dateRange.to}T00:00:00.000Z`;

  const query = useQuery<{ count: number }>({
    queryKey: ['analytics', 'live-visitors', dateRange.from, dateRange.to],
    queryFn: () => api.liveVisitors({ from: fromIso, to: toIso }),
    refetchInterval: 6_000,
    staleTime: 0,
  });

  useEffect(() => {
    if (query.data) setLiveVisitors(query.data.count);
  }, [query.data]); // eslint-disable-line react-hooks/exhaustive-deps

  return query;
}
