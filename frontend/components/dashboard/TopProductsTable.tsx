'use client';
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useTopProducts } from '@/hooks/useAnalytics';
import { useGsapStagger } from '@/hooks/useGsap';
import { formatCurrency, PRODUCT_NAMES } from '@/lib/utils';
import { TableSkeleton } from '@/components/skeletons';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';

export default function TopProductsTable() {
  const { data, isLoading, isError, refetch } = useTopProducts();
  const tbodyRef = useRef<HTMLTableSectionElement>(null);

  useGsapStagger(tbodyRef as any, 'tr', { opacity: 0, x: -12 }, data?.length, 0.04);

  if (isLoading) return <TableSkeleton />;
  if (isError) return <ErrorState message="Failed to load products" onRetry={() => refetch()} />;

  const products = data ?? [];
  const maxRevenue = products[0]?.total_revenue ?? 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/80">Top Products</h3>
        <span className="text-xs text-white/35">Selected range</span>
      </div>

      {products.length === 0 ? (
        <EmptyState title="No products yet" />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[560px] w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                <th className="pb-2 text-left font-medium text-white/30">#</th>
                <th className="pb-2 text-left font-medium text-white/30">Product</th>
                <th className="pb-2 text-right font-medium text-white/30">Revenue</th>
                <th className="pb-2 text-right font-medium text-white/30">Orders</th>
              </tr>
            </thead>
            <tbody ref={tbodyRef}>
              {products.map((p) => (
                <motion.tr
                  key={p.product_id}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                  className="group border-b border-white/[0.04] transition-colors"
                >
                  <td className="py-2.5 pr-3 font-mono text-white/25">{p.rank}</td>
                  <td className="py-2.5 pr-3">
                    <div>
                      <p className="font-medium text-white/80">
                        {PRODUCT_NAMES[p.product_id] ?? p.product_id}
                      </p>
                      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-[hsl(100,71%,64%,0.6)]"
                          style={{ width: `${(p.total_revenue / maxRevenue) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 pl-3 text-right font-semibold text-white/80">
                    {formatCurrency(p.total_revenue)}
                  </td>
                  <td className="py-2.5 pl-3 text-right text-white/40">{p.order_count}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
