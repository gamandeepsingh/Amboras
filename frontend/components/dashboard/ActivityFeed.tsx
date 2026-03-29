'use client';
import { useCallback } from 'react';
import { CircleDot } from 'lucide-react';
import { useRecentActivity, useLiveVisitors } from '@/hooks/useAnalytics';
import { useDashboardStore } from '@/store/dashboard';
import { FeedSkeleton } from '@/components/skeletons';
import EmptyState from '@/components/ui/EmptyState';
import { timeAgo, formatCurrency } from '@/lib/utils';
import type { ActivityEvent } from '@/types/analytics';

const EVENT_STYLES: Record<string, { label: string; color: string }> = {
  purchase:          { label: 'Purchase',  color: 'hsl(100,71%,64%)' },
  add_to_cart:       { label: 'Add to Cart', color: 'hsl(210,100%,65%)' },
  remove_from_cart:  { label: 'Removed',   color: 'hsl(0,72%,60%)' },
  checkout_started:  { label: 'Checkout',  color: 'hsl(38,92%,60%)' },
  page_view:         { label: 'Page View', color: 'rgba(255,255,255,0.3)' },
};

function FeedItem({ event, isNew }: { event: ActivityEvent; isNew?: boolean }) {
  const style = EVENT_STYLES[event.eventType] ?? { label: event.eventType, color: 'white' };
  const d = event.data;

  const refCb = useCallback((node: HTMLLIElement | null) => {
    if (!node || !isNew) return;
    import('gsap').then(({ gsap }) => {
      gsap.from(node, { opacity: 0, x: 20, duration: 0.35, ease: 'power2.out' });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <li
      ref={refCb}
      className="flex items-start gap-3 border-b border-white/[0.04] py-3 last:border-0"
      style={isNew ? { animation: 'newItemFlash 1.5s ease-out' } : undefined}
    >
      {/* Avatar */}
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
        style={{ background: `${style.color}20`, color: style.color }}
      >
        {d.customer_name?.[0]?.toUpperCase() ?? '?'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
            style={{ background: `${style.color}18`, color: style.color }}
          >
            {style.label}
          </span>
          {d.country_flag && <span className="text-sm">{d.country_flag}</span>}
        </div>
        <p className="mt-0.5 truncate text-xs text-white/60">
          {d.customer_name ?? 'Anonymous'}
          {d.product_name && (
            <span className="text-white/35"> · {d.product_name}</span>
          )}
        </p>
      </div>

      <div className="shrink-0 text-right">
        {d.amount && (
          <p className="text-xs font-semibold text-white/80">{formatCurrency(d.amount)}</p>
        )}
        <p className="text-[10px] text-white/25">{timeAgo(event.timestamp)}</p>
      </div>
    </li>
  );
}

export default function ActivityFeed() {
  const { isLoading } = useRecentActivity();
  useLiveVisitors(); // starts polling

  const activityFeed = useDashboardStore((s) => s.activityFeed);

  if (isLoading && activityFeed.length === 0) return <FeedSkeleton />;

  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/80">Live Activity</h3>
        <span className="flex items-center gap-1.5 text-xs text-white/35">
            <CircleDot className="h-3.5 w-3.5 text-[hsl(100,71%,64%)]" />
            Selected range
        </span>
      </div>

      {activityFeed.length === 0 ? (
        <EmptyState title="No activity yet" description="Events will appear here in real time" />
      ) : (
        <ul className="max-h-96 overflow-y-auto pr-1">
          {activityFeed.map((event) => (
            <FeedItem key={event.id} event={event} isNew={event.isNew} />
          ))}
        </ul>
      )}
    </div>
  );
}
