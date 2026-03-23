// LOCATION: chaincard/lib/moralis.ts
// ACTION: REPLACE the entire file with this

import type {
  MoralisNetWorth,
  MoralisNFT,
  MoralisResolveENS,
  MoralisTx,
  MoralisWalletHistory,
  MoralisWalletStats,
} from "@/types";

const BASE_URL = "https://deep-index.moralis.io/api/v2.2";

function moralisHeaders(): HeadersInit {
  return {
    "X-API-Key": process.env.MORALIS_API_KEY!,
    Accept: "application/json",
  };
}

async function moralisFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: moralisHeaders(),
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Moralis API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// ─── 1. Wallet History (recent 100 txs for category/protocol data) ──
export async function getWalletHistory(address: string): Promise<MoralisTx[]> {
  const url =
    `${BASE_URL}/wallets/${address}/history` +
    `?chain=0x1&excludeSpam=true&limit=100&include_internal_transactions=false`;
  const data = await moralisFetch<MoralisWalletHistory>(url);
  return data.result || [];
}

// ─── 2. Oldest transaction (true wallet age) ──────────────────────
export async function getOldestTransaction(address: string): Promise<string | null> {
  try {
    const url =
      `${BASE_URL}/wallets/${address}/history` +
      `?chain=0x1&excludeSpam=false&limit=1&order=ASC`;
    const data = await moralisFetch<MoralisWalletHistory>(url);
    return data.result?.[0]?.block_timestamp ?? null;
  } catch {
    return null;
  }
}

// ─── 3. Net Worth (multi-chain) ───────────────────────────────────
export async function getWalletNetWorth(address: string): Promise<MoralisNetWorth> {
  const chains = [
    "chains[]=0x1",
    "chains[]=0x2105",
    "chains[]=0x89",
    "chains[]=0x38",
    "chains[]=0xa4b1",
  ].join("&");

  const url =
    `${BASE_URL}/${address}/net-worth` +
    `?${chains}&excludeSpam=true&exclude_small_balances=true`;

  return moralisFetch<MoralisNetWorth>(url);
}

// ─── 4. Native ETH balance (fallback for net worth display) ──────
export async function getNativeBalance(address: string): Promise<number> {
  try {
    const url = `${BASE_URL}/${address}/balance?chain=0x1`;
    const data = await moralisFetch<{ balance: string }>(url);
    // balance is in wei — convert to ETH
    return parseFloat(data.balance) / 1e18;
  } catch {
    return 0;
  }
}

// ─── 5. PnL Summary — aggregate stats across ALL time ─────────────
// This gives total_volume_traded, total_gas_spent (aggregate, not just 100 txs)
export async function getWalletPnlSummary(address: string): Promise<{
  totalVolumeTradedUsd: number;
  totalRealizedProfitUsd: number | null;
  totalGasSpentEth: number;
} | null> {
  try {
    const url = `${BASE_URL}/wallets/${address}/profitability/summary?chain=0x1`;
    const data = await moralisFetch<{
      total_volume_traded_usd?: string;
      realized_profit_usd?: string;
      total_gas_paid?: string;         // in ETH
    }>(url);

    return {
      totalVolumeTradedUsd: parseFloat(data.total_volume_traded_usd || "0"),
      totalRealizedProfitUsd: data.realized_profit_usd
        ? parseFloat(data.realized_profit_usd)
        : null,
      totalGasSpentEth: parseFloat(data.total_gas_paid || "0"),
    };
  } catch {
    return null;
  }
}

// ─── 6. NFT Balances ──────────────────────────────────────────────
export async function getWalletNFTs(address: string): Promise<MoralisNFT[]> {
  const url =
    `${BASE_URL}/${address}/nft` +
    `?chain=0x1&excludeSpam=true&limit=20&media_items=true&normalizeMetadata=true`;
  const data = await moralisFetch<{ result: MoralisNFT[] }>(url);
  return data.result || [];
}

// ─── 7. Wallet Stats (total tx count) ────────────────────────────
export async function getWalletStats(address: string): Promise<MoralisWalletStats> {
  const url = `${BASE_URL}/wallets/${address}/stats?chain=0x1`;
  return moralisFetch<MoralisWalletStats>(url);
}

// ─── 8. Resolve ENS name → address ───────────────────────────────
export async function resolveENS(ensName: string): Promise<string | null> {
  try {
    const url = `${BASE_URL}/resolve/ens/${ensName}`;
    const data = await moralisFetch<{ address: string }>(url);
    return data.address || null;
  } catch {
    return null;
  }
}

// ─── 9. Reverse resolve address → ENS name ───────────────────────
export async function reverseResolveENS(address: string): Promise<string | null> {
  try {
    const url = `${BASE_URL}/resolve/${address}/reverse`;
    const data = await moralisFetch<MoralisResolveENS>(url);
    return data.name || null;
  } catch {
    return null;
  }
}

// ─── 10. Get ETH price ────────────────────────────────────────────
export async function getEthPrice(): Promise<number> {
  try {
    const url = `${BASE_URL}/erc20/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/price?chain=0x1`;
    const data = await moralisFetch<{ usdPrice: number }>(url);
    return data.usdPrice || 3000;
  } catch {
    return 3000;
  }
}

// ─── 11. ENS Avatar URL ───────────────────────────────────────────
export function getENSAvatarUrl(ensName: string): string {
  return `https://metadata.ens.domains/mainnet/avatar/${ensName}`;
}

// ─── Master fetch — all data in parallel ─────────────────────────
export async function fetchAllWalletData(address: string) {
  const [
    history,
    oldestTx,
    netWorth,
    nativeBalance,
    pnlSummary,
    nfts,
    stats,
    ensName,
    ethPrice,
  ] = await Promise.allSettled([
    getWalletHistory(address),
    getOldestTransaction(address),
    getWalletNetWorth(address),
    getNativeBalance(address),
    getWalletPnlSummary(address),
    getWalletNFTs(address),
    getWalletStats(address),
    reverseResolveENS(address),
    getEthPrice(),
  ]);

  return {
    history:
      history.status === "fulfilled" ? history.value : [],
    oldestTxDate:
      oldestTx.status === "fulfilled" ? oldestTx.value : null,
    netWorth:
      netWorth.status === "fulfilled"
        ? netWorth.value
        : { total_networth_usd: "0", chains: [] },
    nativeBalanceEth:
      nativeBalance.status === "fulfilled" ? nativeBalance.value : 0,
    pnlSummary:
      pnlSummary.status === "fulfilled" ? pnlSummary.value : null,
    nfts:
      nfts.status === "fulfilled" ? nfts.value : [],
    stats:
      stats.status === "fulfilled"
        ? stats.value
        : {
            transactions: { total: 0 },
            nft_transfers: { total: 0 },
            token_transfers: { total: 0 },
          },
    ensName:
      ensName.status === "fulfilled" ? ensName.value : null,
    ethPrice:
      ethPrice.status === "fulfilled" ? ethPrice.value : 3000,
  };
}