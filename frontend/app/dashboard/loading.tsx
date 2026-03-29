import { OverviewCardSkeleton, ChartSkeleton, TableSkeleton, FeedSkeleton } from '@/components/skeletons';

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-white/5" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <OverviewCardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <TableSkeleton />
        <FeedSkeleton />
      </div>
    </div>
  );
}
