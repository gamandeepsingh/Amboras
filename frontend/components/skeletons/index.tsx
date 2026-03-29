function Shimmer({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-white/5 ${className ?? ''}`} />
  );
}

export function OverviewCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
      <Shimmer className="mb-3 h-3 w-24" />
      <Shimmer className="mb-4 h-8 w-32" />
      <Shimmer className="h-10 w-full" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
      <Shimmer className="mb-4 h-4 w-32" />
      <Shimmer className="h-56 w-full" />
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
      <Shimmer className="mb-5 h-4 w-28" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="mb-3 flex items-center gap-3">
          <Shimmer className="h-3 w-4" />
          <Shimmer className="h-3 flex-1" />
          <Shimmer className="h-3 w-16" />
          <Shimmer className="h-3 w-10" />
        </div>
      ))}
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
      <Shimmer className="mb-5 h-4 w-32" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="mb-4 flex items-start gap-3">
          <Shimmer className="h-8 w-8 shrink-0 rounded-full" />
          <div className="flex-1">
            <Shimmer className="mb-1.5 h-3 w-3/4" />
            <Shimmer className="h-2.5 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
