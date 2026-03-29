export interface DateRange {
  from: string;
  to: string;
}

export interface OverviewData {
  range: {
    from: string;
    to: string;
    previous_from: string;
    previous_to: string;
  };
  revenue: {
    current: number;
    previous: number;
  };
  conversion_rate: number;
  previous_conversion_rate: number;
  deltas: {
    revenue: number;
    purchases: number;
    page_views: number;
    conversion_rate: number;
  };
  event_counts: Record<string, number>;
  total_purchases: number;
  total_page_views: number;
  previous_total_purchases: number;
  previous_total_page_views: number;
}

export interface RevenueTimeseriesPoint {
  bucket: string;
  revenue: number;
  orders: number;
}

export interface RevenueTimeseriesData {
  granularity: 'day';
  from: string;
  to: string;
  points: RevenueTimeseriesPoint[];
}

export interface TopProduct {
  rank: number;
  product_id: string;
  total_revenue: number;
  order_count: number;
}

export interface ActivityEventData {
  customer_name?: string;
  country?: string;
  country_flag?: string;
  product_id?: string;
  product_name?: string;
  amount?: number;
  currency?: string;
}

export interface ActivityEvent {
  id: string;
  eventId: string;
  eventType: 'page_view' | 'add_to_cart' | 'remove_from_cart' | 'checkout_started' | 'purchase';
  timestamp: string;
  data: ActivityEventData;
  isNew?: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  storeId: string;
}
