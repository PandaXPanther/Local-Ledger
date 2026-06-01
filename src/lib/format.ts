/**
 * Formatting utilities for economic data display.
 */

export function formatCurrency(value: number | null, decimals = 0): string {
  if (value === null || value === undefined) return 'Data unavailable';
  if (!isFinite(value)) return 'Data unavailable';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number | null, decimals = 1): string {
  if (value === null || value === undefined) return 'Data unavailable';
  if (!isFinite(value)) return 'Data unavailable';
  return `${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number | null, decimals = 0): string {
  if (value === null || value === undefined) return 'Data unavailable';
  if (!isFinite(value)) return 'Data unavailable';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatShortNumber(value: number | null): string {
  if (value === null || value === undefined) return 'Data unavailable';
  if (!isFinite(value)) return 'Data unavailable';
  if (Math.abs(value) >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return String(value);
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Unknown';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  } catch {
    return dateStr;
  }
}

export function formatDataValue(
  value: number | null,
  unit: string
): string {
  if (value === null || value === undefined) return 'Data unavailable';
  if (!isFinite(value)) return 'Data unavailable';

  const u = unit.toLowerCase();

  if (u.includes('usd') || u.includes('dollar') || u === '$') {
    return formatCurrency(value);
  }
  if (u.includes('%') || u.includes('percent') || u.includes('rate')) {
    return formatPercent(value);
  }
  if (u.includes('score') || u.includes('index')) {
    return formatNumber(value, 1);
  }
  return formatNumber(value);
}
