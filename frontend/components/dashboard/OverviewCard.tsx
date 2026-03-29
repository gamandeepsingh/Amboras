'use client';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useGsapCounter } from '@/hooks/useGsap';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils';
import Badge from '@/components/ui/Badge';

interface OverviewCardProps {
  label: string;
  value: number;
  delta?: number;
  unit: 'currency' | 'percent' | 'number';
  icon: ReactNode;
  sublabel?: string;
}

const UNIT_FORMAT = {
  currency: (v: number) => formatCurrency(v),
  percent: (v: number) => formatPercent(v),
  number: (v: number) => formatNumber(v),
};

export default function OverviewCard({ label, value, delta, unit, icon, sublabel }: OverviewCardProps) {
  const displayValue = useGsapCounter(value);

  return (
    <motion.div
      className="overview-card relative rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-5 backdrop-blur-xl overflow-hidden"
      initial="idle"
      whileHover="hovered"
      variants={{
        idle: { scale: 1, boxShadow: '0 0 0px rgba(106,220,85,0)' },
        hovered: { scale: 1.018, boxShadow: '0 0 0 1px rgba(106,220,85,0.35), 0 0 32px rgba(106,220,85,0.15)' },
      }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      {/* Subtle neon border on hover */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl border border-[hsl(100,71%,64%)] opacity-0"
        variants={{ idle: { opacity: 0 }, hovered: { opacity: 0.25 } }}
        transition={{ duration: 0.2 }}
      />

      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium uppercase tracking-widest text-white/40">{label}</p>
        <span className="text-lg opacity-40">{icon}</span>
      </div>

      <p className="mb-2 text-3xl font-bold tracking-tight text-white">
        {UNIT_FORMAT[unit](displayValue)}
      </p>

      <div className="flex items-center gap-2">
        {delta !== undefined && <Badge value={delta} />}
        {sublabel && <span className="text-xs text-white/35">{sublabel}</span>}
      </div>

      {/* Neon glow accent line */}
      <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-[hsl(100,71%,64%,0.4)] to-transparent" />
    </motion.div>
  );
}
