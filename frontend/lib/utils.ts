import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString('en-US');
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function timeAgo(date: string | Date): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export const PRODUCT_NAMES: Record<string, string> = {
  prod_001: 'Wireless Headphones',
  prod_002: 'Standing Desk Mat',
  prod_003: 'Mechanical Keyboard',
  prod_004: 'USB-C Hub 7-in-1',
  prod_005: 'Portable SSD 1TB',
  prod_006: 'Smart Water Bottle',
  prod_007: 'Laptop Stand',
  prod_008: 'Webcam 4K',
  prod_009: 'Cable Management Kit',
  prod_010: 'LED Desk Lamp',
  prod_011: 'Wireless Charger',
  prod_012: 'Blue Light Glasses',
  prod_013: 'Noise Machine',
  prod_014: 'Monitor Light Bar',
  prod_015: 'Desk Organizer',
};
