'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboardStore } from '@/store/dashboard';
import OverviewCards from '@/components/dashboard/OverviewCards';
import RevenueChart from '@/components/dashboard/RevenueChart';
import EventsChart from '@/components/dashboard/EventsChart';
import TopProductsTable from '@/components/dashboard/TopProductsTable';
import ActivityFeed from '@/components/dashboard/ActivityFeed';

export default function DashboardPage() {
  const { token, dateRange } = useDashboardStore();
  const router = useRouter();

  useEffect(() => {
    if (!token) router.replace('/login');
  }, [token, router]);

  if (!token) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${dateRange.from}-${dateRange.to}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Overview</h1>
          <p className="text-sm text-white/40">Your store performance at a glance</p>
        </div>

        {/* Overview cards */}
        <OverviewCards />

        {/* Charts row */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <RevenueChart />
          <EventsChart />
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <TopProductsTable />
          <ActivityFeed />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
