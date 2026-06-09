export function formatUsd(value: number, compact = false): string {
  if (!isFinite(value)) return '$0.00';
  if (compact && Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (compact && Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value < 1 ? 4 : 2,
  }).format(value);
}

export function formatNumber(value: number): string {
  if (!isFinite(value)) return '0';
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

export function formatEth(value: number): string {
  if (!isFinite(value)) return '0 ETH';
  if (value >= 1000) return `${(value / 1000).toFixed(2)}K ETH`;
  return `${value.toFixed(4)} ETH`;
}

export function formatWalletAge(firstTxDate: string | null): string {
  if (!firstTxDate) return 'Brand new';
  const start = new Date(firstTxDate);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return 'Less than a day';
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    const days = diffDays % 30;
    return days > 0 ? `${months}m ${days}d` : `${months} month${months !== 1 ? 's' : ''}`;
  }
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  if (months === 0) return `${years} year${years > 1 ? 's' : ''}`;
  return `${years}y ${months}m`;
}

export function formatMonthYear(dateString: string | null): string {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function daysFromDate(dateString: string): number {
  const start = new Date(dateString);
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatPnl(value: number | null): { display: string; isPositive: boolean; isNeutral: boolean } {
  if (value === null || !isFinite(value)) {
    return { display: '—', isPositive: false, isNeutral: true };
  }
  const isPositive = value >= 0;
  const display = `${isPositive ? '+' : ''}${formatUsd(value, true)}`;
  return { display, isPositive, isNeutral: false };
}

export function formatPercentage(value: number, decimals = 1): string {
  if (!isFinite(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

export function formatTimeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}