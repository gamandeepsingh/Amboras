'use client';
import { useRef } from 'react';
import { DollarSign, MousePointerClick, ShoppingBag, TrendingUp } from 'lucide-react';
import { useOverviewData } from '@/hooks/useAnalytics';
import { useGsapStagger } from '@/hooks/useGsap';
import OverviewCard from './OverviewCard';
import { OverviewCardSkeleton } from '@/components/skeletons';
import ErrorState from '@/components/ui/ErrorState';

export default function OverviewCards() {
  const { data, isLoading, isError, refetch } = useOverviewData();
  const containerRef = useRef<HTMLDivElement>(null);

  useGsapStagger(containerRef, '.overview-card', { opacity: 0, y: 24 }, data, 0.08);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <OverviewCardSkeleton key={i} />)}
      </div>
    );
  }

  if (isError) return <ErrorState message="Failed to load metrics" onRetry={() => refetch()} />;
  if (!data) return null;

  return (
    <div ref={containerRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <OverviewCard
        label="Revenue"
        value={data.revenue.current}
        unit="currency"
        icon={<DollarSign className="h-4 w-4" />}
        delta={data.deltas.revenue}
        sublabel="vs previous range"
      />
      <OverviewCard
        label="Purchases"
        value={data.total_purchases}
        unit="number"
        icon={<ShoppingBag className="h-4 w-4" />}
        delta={data.deltas.purchases}
        sublabel="vs previous range"
      />
      <OverviewCard
        label="Page Views"
        value={data.total_page_views}
        unit="number"
        icon={<MousePointerClick className="h-4 w-4" />}
        delta={data.deltas.page_views}
        sublabel="vs previous range"
      />
      <OverviewCard
        label="Conversion Rate"
        value={data.conversion_rate}
        unit="percent"
        icon={<TrendingUp className="h-4 w-4" />}
        delta={data.deltas.conversion_rate}
        sublabel="vs previous range"
      />
    </div>
  );
}
