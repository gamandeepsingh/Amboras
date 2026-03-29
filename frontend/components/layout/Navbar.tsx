'use client';
import { type CSSProperties, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { DateRange as DayPickerDateRange, DayPicker } from 'react-day-picker';
import {
  CalendarDays,
  CalendarRange,
  ChevronDown,
  Search,
  Store,
  Users,
} from 'lucide-react';
import { useDashboardStore } from '@/store/dashboard';

function toInputDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toUtcDate(dateInput: string) {
  return new Date(`${dateInput}T00:00:00.000Z`);
}

export default function Navbar() {
  const { dateRange, setDateRange, liveVisitors, user } = useDashboardStore();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectionStep, setSelectionStep] = useState<'start' | 'end'>('start');
  const [draftRange, setDraftRange] = useState<DayPickerDateRange | undefined>({
    from: toUtcDate(dateRange.from),
    to: toUtcDate(dateRange.to),
  });

  useEffect(() => {
    setSelectionStep('start');
    setDraftRange({
      from: toUtcDate(dateRange.from),
      to: toUtcDate(dateRange.to),
    });
  }, [dateRange.from, dateRange.to]);

  const rangeLabel = useMemo(() => {
    const from = new Date(`${dateRange.from}T00:00:00.000Z`);
    const to = new Date(`${dateRange.to}T00:00:00.000Z`);
    const dayMs = 24 * 60 * 60 * 1000;
    const span = Math.round((to.getTime() - from.getTime()) / dayMs) + 1;
    return `${span} days`;
  }, [dateRange.from, dateRange.to]);

  function onSelectDay(day: Date) {
    const clicked = new Date(day.getFullYear(), day.getMonth(), day.getDate());

    if (selectionStep === 'start' || !draftRange?.from || draftRange?.to) {
      setDraftRange({ from: clicked, to: undefined });
      setSelectionStep('end');
      return;
    }

    const start = draftRange.from;
    const [from, to] = clicked < start ? [clicked, start] : [start, clicked];
    const nextRange = { from, to };

    setDraftRange(nextRange);
    setDateRange({ from: toInputDate(from), to: toInputDate(to) });
    setSelectionStep('start');
    setPickerOpen(false);
  }

  const dayPickerTheme = {
    '--rdp-accent-color': 'hsl(100 71% 64%)',
    '--rdp-accent-background-color': 'hsl(100 71% 64% / 0.16)',
    '--rdp-range_middle-background-color': 'hsl(100 71% 64% / 0.10)',
  } as CSSProperties;

  return (
    <header className="relative z-20 flex shrink-0 flex-col gap-3 border-b border-[rgba(255,255,255,0.06)] bg-black/40 px-4 py-3 backdrop-blur-xl md:h-16 md:flex-row md:items-center md:gap-4 md:px-6 md:py-0">
      {/* Search */}
      <div className="flex w-full items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3 py-2 md:max-w-xs">
        <Search className="h-4 w-4 text-white/30" />
        <input
          placeholder="Search..."
          className="flex-1 bg-transparent text-sm text-white/70 placeholder:text-white/25 outline-none"
        />
        <span className="rounded border border-white/10 px-1 py-0.5 text-[10px] text-white/20">⌘K</span>
      </div>

      <div className="flex w-full flex-wrap items-center gap-2 md:ml-auto md:w-auto md:justify-end md:gap-3">
        {/* Live visitors */}
        <div className="flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3 py-1.5">
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="h-2 w-2 rounded-full bg-[hsl(100,71%,64%)]"
          />
          <Users className="h-3.5 w-3.5 text-white/45" />
          <span className="text-xs font-medium text-white/70">{liveVisitors.toLocaleString()} visitors</span>
        </div>

        {/* Date filter */}
        <div className="relative">
          <button
            onClick={() => setPickerOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.08)] bg-white/[0.02] px-3 py-1.5 text-xs text-white/75"
          >
            <CalendarDays className="h-3.5 w-3.5 text-white/45" />
            <span className="hidden sm:inline">{dateRange.from}</span>
            <CalendarRange className="h-3.5 w-3.5 text-white/30" />
            <span className="hidden sm:inline">{dateRange.to}</span>
            <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-white/45">
              {rangeLabel}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-white/40" />
          </button>

          {pickerOpen && (
            <div className="absolute right-0 top-full z-30 mt-2 rounded-xl border border-[rgba(255,255,255,0.10)] bg-[rgba(10,10,10,0.98)] p-3 shadow-2xl">
              <DayPicker
                mode="range"
                selected={draftRange}
                onDayClick={onSelectDay}
                numberOfMonths={2}
                pagedNavigation
                className="text-xs text-white"
                style={dayPickerTheme}
              />
              <p className="mt-2 text-[10px] text-white/45">
                {selectionStep === 'start'
                  ? 'Click a start date.'
                  : 'Click an end date to apply the range.'}
              </p>
            </div>
          )}
        </div>

        {/* Store name */}
        <div className="hidden items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3 py-1.5 text-xs text-white/60 sm:flex">
          <Store className="h-3.5 w-3.5" />
          <span>{user?.email?.split('@')[0] ?? 'My Store'}</span>
        </div>

        {/* Avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(100,71%,64%)] to-[hsl(160,60%,50%)] text-black text-xs font-bold">
          {(user?.email?.[0] ?? 'U').toUpperCase()}
        </div>
      </div>
    </header>
  );
}
