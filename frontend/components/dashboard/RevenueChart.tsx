'use client';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useRevenueTimeseries } from '@/hooks/useAnalytics';
import { ChartSkeleton } from '@/components/skeletons';

function formatAxisDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

interface RevenueTooltipProps {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: RevenueTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[rgba(8,8,8,0.92)] px-3 py-2 backdrop-blur-xl text-xs">
      <p className="mb-1 text-white/50">{label}</p>
      <p className="font-semibold text-[hsl(100,71%,64%)]">
        ${payload[0]?.value?.toLocaleString()}
      </p>
    </div>
  );
};

export default function RevenueChart() {
  const { data, isLoading } = useRevenueTimeseries();

  if (isLoading) return <ChartSkeleton />;
  const chartData = (data?.points ?? []).map((point) => ({
    day: formatAxisDate(point.bucket),
    revenue: point.revenue,
    orders: point.orders,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/80">Revenue Trend</h3>
        <span className="text-xs text-white/35">Selected range</span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="neonGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(100,71%,64%)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="hsl(100,71%,64%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="hsl(100,71%,64%)"
            strokeWidth={2}
            fill="url(#neonGradient)"
            dot={false}
            activeDot={{ r: 4, fill: 'hsl(100,71%,64%)', stroke: 'black', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
