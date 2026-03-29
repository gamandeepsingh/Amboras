'use client';
import { motion } from 'framer-motion';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useOverviewData } from '@/hooks/useAnalytics';
import { ChartSkeleton } from '@/components/skeletons';

const EVENT_LABELS: Record<string, string> = {
  page_view: 'Page Views',
  add_to_cart: 'Add to Cart',
  remove_from_cart: 'Removed',
  checkout_started: 'Checkout',
  purchase: 'Purchases',
};

const EVENT_COLORS: Record<string, string> = {
  page_view: 'rgba(255,255,255,0.25)',
  add_to_cart: 'hsl(100,71%,64%)',
  remove_from_cart: 'hsl(0,72%,60%)',
  checkout_started: 'hsl(38,92%,60%)',
  purchase: 'hsl(100,71%,64%)',
};

interface EventsTooltipProps {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: EventsTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[rgba(8,8,8,0.92)] px-3 py-2 backdrop-blur-xl text-xs">
      <p className="mb-1 text-white/50">{label}</p>
      <p className="font-semibold text-white">{payload[0]?.value?.toLocaleString()}</p>
    </div>
  );
};

export default function EventsChart() {
  const { data, isLoading } = useOverviewData();

  if (isLoading) return <ChartSkeleton />;

  const chartData = Object.entries(data?.event_counts ?? {})
    .map(([type, count]) => ({
      name: EVENT_LABELS[type] ?? type,
      count,
      fill: EVENT_COLORS[type] ?? 'rgba(255,255,255,0.2)',
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/80">Events Breakdown</h3>
        <span className="text-xs text-white/35">Selected range</span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
