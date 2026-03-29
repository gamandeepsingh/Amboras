import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface BadgeProps {
  value: number;
  className?: string;
}

export default function Badge({ value, className }: BadgeProps) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const isUp = safeValue >= 0;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium',
        isUp
          ? 'bg-[hsl(100_71%_64%/0.12)] text-[hsl(100,71%,64%)]'
          : 'bg-[hsl(0_72%_60%/0.12)] text-[hsl(0,72%,60%)]',
        className,
      )}
    >
      {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {Math.abs(safeValue).toFixed(1)}%
    </span>
  );
}
