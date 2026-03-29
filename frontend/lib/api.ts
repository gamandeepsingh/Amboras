const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface AnalyticsRangeParams {
  from?: string;
  to?: string;
}

function withRange(path: string, params?: AnalyticsRangeParams): string {
  const search = new URLSearchParams();
  if (params?.from) search.set('from', params.from);
  if (params?.to) search.set('to', params.to);
  const suffix = search.toString() ? `?${search.toString()}` : '';
  return `${path}${suffix}`;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ access_token: string; user: { id: string; email: string; storeId: string } }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
    ),
  overview: (params?: AnalyticsRangeParams) => request(withRange('/analytics/overview', params)),
  topProducts: (params?: AnalyticsRangeParams) => request(withRange('/analytics/top-products', params)),
  recentActivity: (params?: AnalyticsRangeParams) => request(withRange('/analytics/recent-activity', params)),
  liveVisitors: (params?: AnalyticsRangeParams) => request<{ count: number }>(withRange('/analytics/live-visitors', params)),
  revenueTimeseries: (params?: { from?: string; to?: string; granularity?: 'day' }) => {
    const search = new URLSearchParams();
    if (params?.from) search.set('from', params.from);
    if (params?.to) search.set('to', params.to);
    if (params?.granularity) search.set('granularity', params.granularity);
    const suffix = search.toString() ? `?${search.toString()}` : '';
    return request(`/analytics/revenue-timeseries${suffix}`);
  },
};
