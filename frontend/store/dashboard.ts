'use client';
import { create } from 'zustand';
import type { DateRange, ActivityEvent, AuthUser } from '@/types/analytics';

function toInputDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function defaultDateRange(): DateRange {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 29);
  return { from: toInputDate(from), to: toInputDate(to) };
}

interface DashboardStore {
  // Auth
  token: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;

  // Date range
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;

  // Sidebar
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;

  // Nav
  activeNavItem: string;
  setActiveNavItem: (item: string) => void;

  // Activity feed
  activityFeed: ActivityEvent[];
  setActivityFeed: (events: ActivityEvent[]) => void;

  // Live visitors
  liveVisitors: number;
  setLiveVisitors: (n: number) => void;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  // Auth
  token: typeof window !== 'undefined' ? localStorage.getItem('access_token') : null,
  user: null,
  setAuth: (token, user) => {
    if (typeof window !== 'undefined') localStorage.setItem('access_token', token);
    set({ token, user });
  },
  clearAuth: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('access_token');
    set({ token: null, user: null });
  },

  // Date range
  dateRange: defaultDateRange(),
  setDateRange: (range) => {
    const from = range.from;
    const to = range.to;
    if (from <= to) {
      set({ dateRange: { from, to } });
      return;
    }
    set({ dateRange: { from: to, to: from } });
  },

  // Sidebar
  sidebarCollapsed: false,
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

  // Nav
  activeNavItem: 'dashboard',
  setActiveNavItem: (item) => set({ activeNavItem: item }),

  // Activity feed — diffs by id, caps at 50
  activityFeed: [],
  setActivityFeed: (incoming) => {
    const { activityFeed } = get();
    const existingIds = new Set(activityFeed.map((e) => e.id));
    const next = incoming.map((e) => ({ ...e, isNew: !existingIds.has(e.id) })).slice(0, 50);
    set({ activityFeed: next });
    setTimeout(() => {
      set((s) => ({
        activityFeed: s.activityFeed.map((e) => ({ ...e, isNew: false })),
      }));
    }, 1500);
  },

  // Live visitors
  liveVisitors: 0,
  setLiveVisitors: (n) => set({ liveVisitors: n }),
}));
