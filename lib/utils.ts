// LOCATION: chaincard/lib/utils.ts
// ACTION: CREATE NEW FILE — create the lib/ folder at root, then this file inside it

// ─── Address Utilities ────────────────────────────────────

export function normalizeAddress(address: string): string {
  return address.toLowerCase().trim();
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}

export function isENSName(input: string): boolean {
  return input.trim().toLowerCase().endsWith(".eth");
}

// ─── Number Formatting ────────────────────────────────────

export function formatUsd(value: number, compact = false): string {
  if (compact && Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (compact && Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value < 1 ? 4 : 2,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

export function formatEth(value: number): string {
  return `${value.toFixed(4)} ETH`;
}

// ─── Date Utilities ───────────────────────────────────────

export function formatWalletAge(firstTxDate: string | null): string {
  if (!firstTxDate) return "Just created";
  const start = new Date(firstTxDate);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 30) return `${diffDays} days`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  if (months === 0) return `${years} year${years > 1 ? "s" : ""}`;
  return `${years}y ${months}m`;
}

export function formatMonthYear(dateString: string | null): string {
 if (!dateString) return "Brand new";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function daysFromDate(dateString: string): number {
  const start = new Date(dateString);
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── PnL Formatting ───────────────────────────────────────

export function formatPnl(value: number | null): {
  display: string;
  isPositive: boolean;
  isNeutral: boolean;
} {
  if (value === null) {
    return { display: "N/A", isPositive: false, isNeutral: true };
  }
  const isPositive = value >= 0;
  const display = `${isPositive ? "+" : ""}${formatUsd(value, true)}`;
  return { display, isPositive, isNeutral: false };
}

// ─── Share URL ────────────────────────────────────────────

export function getCardUrl(address: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://chaincard-hq.vercel.app";
  return `${base}/card/${normalizeAddress(address)}`;
}

export function getShareTweetText(
  address: string,
  archetypeLabel: string,
  ensName: string | null
): string {
  const displayName = ensName || shortenAddress(address);
  const cardUrl = getCardUrl(address);
  return encodeURIComponent(
    `Just got my on-chain identity card 🔗\n\n${displayName} is "${archetypeLabel}"\n\nCheck yours 👇\n${cardUrl}`
  );
}