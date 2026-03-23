// LOCATION: chaincard/lib/compute.ts
// ACTION: REPLACE the entire file with this

import type {
  ArchetypeKey,
  CardStats,
  MoralisNetWorth,
  MoralisNFT,
  MoralisTx,
  MoralisWalletStats,
  NFTItem,
  ChainActivity,
} from "@/types";
import type { ChainKey } from "@/types";
import { CHAINS } from "@/constants";
import { daysFromDate } from "@/lib/utils";

// ─── Compute Archetype ────────────────────────────────────────────
export function computeArchetype(stats: {
  walletAgeDays: number;
  totalTransactions: number;
  nftTransferCount: number;
  uniqueProtocols: number;
  governanceVotes: number;
  airdropsReceived: number;
  netWorthUsd: number;
  nativeBalanceEth: number;
  totalGasSpentUsd: number;
  totalVolumeTradedUsd: number;
  avgHoldDays: number;
  swapFrequency: number;
}): ArchetypeKey {
  const {
    walletAgeDays,
    totalTransactions,
    nftTransferCount,
    uniqueProtocols,
    governanceVotes,
    airdropsReceived,
    netWorthUsd,
    nativeBalanceEth,
    totalGasSpentUsd,
    totalVolumeTradedUsd,
    avgHoldDays,
    swapFrequency,
  } = stats;

  // Use native balance as fallback for whale detection if net worth API returns 0
  const effectiveWorth = netWorthUsd > 0 ? netWorthUsd : nativeBalanceEth * 3000;

  if (effectiveWorth >= 100_000) return "WHALE";
  if (walletAgeDays < 180) return "NEW_BLOOD";
  if (governanceVotes >= 5 && walletAgeDays >= 365) return "GOVERNANCE_WHALE";

  const nftRatio =
    totalTransactions > 0 ? nftTransferCount / totalTransactions : 0;
  if (nftRatio >= 0.5 && nftTransferCount >= 20) return "NFT_DEGEN";
  if (nftTransferCount >= 30 && nftRatio < 0.5) return "COLLECTOR";
  if (airdropsReceived >= 10 && walletAgeDays >= 365) return "AIRDROP_HUNTER";
  if (uniqueProtocols >= 10) return "DEFI_FARMER";

  // Use total volume traded (aggregate) for better flipper/diamond hand detection
  const volumePerDay = walletAgeDays > 0 ? totalVolumeTradedUsd / walletAgeDays : 0;
  if (volumePerDay >= 1000 && avgHoldDays < 30) return "FLIPPER";

  if (avgHoldDays >= 180 && swapFrequency < 2) return "DIAMOND_HAND";
  if (swapFrequency >= 10 && avgHoldDays < 30) return "FLIPPER";
  if (totalGasSpentUsd >= 1_000 || totalTransactions >= 500) return "GAS_BURNER";
  if (avgHoldDays >= 90) return "DIAMOND_HAND";

  return "FLIPPER";
}

// ─── Parse wallet history ─────────────────────────────────────────
export interface ParsedHistory {
  firstTxDate: string | null;
  walletAgeDays: number;
  totalGasSpentEth: number;
  biggestSwapUsd: number;
  biggestSwapDescription: string | null;
  governanceVotes: number;
  airdropsReceived: number;
  uniqueProtocols: number;
  swapCount: number;
  avgHoldDays: number;
  swapFrequency: number;
}

export function parseWalletHistory(
  txs: MoralisTx[],
  overrideFirstTxDate?: string | null
): ParsedHistory {
  if (!txs || txs.length === 0) {
    const firstTxDate = overrideFirstTxDate ?? null;
    const walletAgeDays = firstTxDate ? daysFromDate(firstTxDate) : 0;
    return {
      firstTxDate,
      walletAgeDays,
      totalGasSpentEth: 0,
      biggestSwapUsd: 0,
      biggestSwapDescription: null,
      governanceVotes: 0,
      airdropsReceived: 0,
      uniqueProtocols: 0,
      swapCount: 0,
      avgHoldDays: 0,
      swapFrequency: 0,
    };
  }

  const sorted = [...txs].sort(
    (a, b) =>
      new Date(a.block_timestamp).getTime() -
      new Date(b.block_timestamp).getTime()
  );

  const firstTxDate = overrideFirstTxDate ?? sorted[0]?.block_timestamp ?? null;
  const walletAgeDays = firstTxDate ? daysFromDate(firstTxDate) : 0;

  let totalGasSpentEth = 0;
  let biggestSwapUsd = 0;
  let biggestSwapDescription: string | null = null;
  let governanceVotes = 0;
  let airdropsReceived = 0;
  const protocolSet = new Set<string>();
  let swapCount = 0;

  for (const tx of txs) {
    if (tx.possible_spam) continue;

    const gasEth = parseFloat(tx.transaction_fee || "0");
    if (!isNaN(gasEth)) totalGasSpentEth += gasEth;

    const category = (tx.category || "").toLowerCase();
    const summary = tx.summary || "";

    if (category === "governance" || summary.toLowerCase().includes("vote")) {
      governanceVotes++;
    }

    if (category === "airdrop" || category === "receive") {
      airdropsReceived++;
    }

    if (category === "token swap" || category === "swap") {
      swapCount++;
      const usdMatch = summary.match(/\$([0-9,]+\.?[0-9]*)/);
      if (usdMatch) {
        const usd = parseFloat(usdMatch[1].replace(",", ""));
        if (usd > biggestSwapUsd) {
          biggestSwapUsd = usd;
          biggestSwapDescription = summary;
        }
      }
    }

    const protocolKeywords = [
      "uniswap", "aave", "compound", "curve", "lido", "maker",
      "1inch", "sushiswap", "balancer", "yearn", "convex",
      "opensea", "blur", "zora", "rarible",
    ];
    for (const keyword of protocolKeywords) {
      if (summary.toLowerCase().includes(keyword)) {
        protocolSet.add(keyword);
      }
    }
  }

  const avgHoldDays =
    swapCount > 0 ? Math.min(walletAgeDays / swapCount, 365) : walletAgeDays;
  const swapFrequency =
    walletAgeDays > 0 ? (swapCount / walletAgeDays) * 30 : 0;

  return {
    firstTxDate,
    walletAgeDays,
    totalGasSpentEth,
    biggestSwapUsd,
    biggestSwapDescription,
    governanceVotes,
    airdropsReceived,
    uniqueProtocols: protocolSet.size,
    swapCount,
    avgHoldDays,
    swapFrequency,
  };
}

// ─── Parse net worth ──────────────────────────────────────────────
export function parseNetWorth(
  data: MoralisNetWorth
): { totalUsd: number; chains: ChainActivity[] } {
  const totalUsd = parseFloat(data.total_networth_usd || "0");

  const chains: ChainActivity[] = (data.chains || [])
    .map((c) => {
      const chainKey = Object.entries(CHAINS).find(
        ([, v]) =>
          v.moralisId.toLowerCase() === c.chain.toLowerCase() ||
          v.label.toLowerCase().includes(c.chain.toLowerCase())
      )?.[0] as ChainKey | undefined;

      if (!chainKey) return null;

      return {
        chain: chainKey,
        label: CHAINS[chainKey].label,
        txCount: 0,
        netWorthUsd: parseFloat(c.networth_usd || "0"),
      } satisfies ChainActivity;
    })
    .filter((c): c is ChainActivity => c !== null && c.netWorthUsd > 0);

  return { totalUsd, chains };
}

// ─── Parse NFTs ───────────────────────────────────────────────────
export function parseNFTs(nfts: MoralisNFT[]): {
  topNfts: NFTItem[];
  totalCount: number;
} {
  const valid = nfts.filter((n) => !n.possible_spam);
  const totalCount = valid.length;

  const topNfts: NFTItem[] = valid.slice(0, 3).map((n) => ({
    name: n.normalized_metadata?.name || n.name || `#${n.token_id}`,
    collection: n.name || "Unknown Collection",
    imageUrl: n.normalized_metadata?.image || n.collection_logo || null,
    tokenId: n.token_id,
    contractAddress: n.token_address,
  }));

  return { topNfts, totalCount };
}

// ─── Parse wallet stats ───────────────────────────────────────────
export function parseWalletStats(stats: MoralisWalletStats): {
  totalTransactions: number;
  nftTransferCount: number;
} {
  return {
    totalTransactions: stats.transactions?.total || 0,
    nftTransferCount: stats.nft_transfers?.total || 0,
  };
}

// ─── Format net worth display ─────────────────────────────────────
// Smart fallback: use net worth if available, else ETH balance, else "—"
export function resolveNetWorthDisplay(
  netWorthUsd: number,
  nativeBalanceEth: number,
  ethPrice: number
): { value: string; isEstimate: boolean } {
  if (netWorthUsd >= 0.01) {
    return {
      value: netWorthUsd >= 1000
        ? `$${(netWorthUsd / 1000).toFixed(1)}K`
        : netWorthUsd < 1
        ? `$${netWorthUsd.toFixed(2)}`
        : `$${Math.round(netWorthUsd).toLocaleString()}`,
      isEstimate: false,
    };
  }
  if (nativeBalanceEth >= 0.0001) {
    const ethUsd = nativeBalanceEth * ethPrice;
    return {
      value: `${nativeBalanceEth.toFixed(4)} ETH`,
      isEstimate: false,
    };
  }
  return { value: "—", isEstimate: false };
}

// ─── Assemble final CardStats ─────────────────────────────────────
export function assembleCardStats(params: {
  address: string;
  ensName: string | null;
  avatarUrl: string | null;
  history: MoralisTx[];
  oldestTxDate: string | null;
  netWorthData: MoralisNetWorth;
  nativeBalanceEth: number;
  pnlSummary: {
    totalVolumeTradedUsd: number;
    totalRealizedProfitUsd: number | null;
    totalGasSpentEth: number;
  } | null;
  nfts: MoralisNFT[];
  walletStats: MoralisWalletStats;
  gasEthPrice: number;
}): CardStats {
  const {
    address,
    ensName,
    avatarUrl,
    history,
    oldestTxDate,
    netWorthData,
    nativeBalanceEth,
    pnlSummary,
    nfts,
    walletStats,
    gasEthPrice,
  } = params;

  const parsed = parseWalletHistory(history, oldestTxDate);
  const { totalUsd, chains } = parseNetWorth(netWorthData);
  const { topNfts, totalCount } = parseNFTs(nfts);
  const { totalTransactions, nftTransferCount } = parseWalletStats(walletStats);

  // Use PnL summary aggregate gas if available — covers ALL txs not just 100
  const totalGasSpentEth =
    pnlSummary?.totalGasSpentEth && pnlSummary.totalGasSpentEth > parsed.totalGasSpentEth
      ? pnlSummary.totalGasSpentEth
      : parsed.totalGasSpentEth;

  const totalGasSpentUsd = totalGasSpentEth * gasEthPrice;

  // Use PnL total volume for biggest swap approximation if no swap found in history
  const biggestSwapUsd =
    parsed.biggestSwapUsd > 0
      ? parsed.biggestSwapUsd
      : pnlSummary?.totalVolumeTradedUsd
      ? 0 // Don't show total volume as "biggest swap" — misleading
      : 0;

  const totalVolumeTradedUsd = pnlSummary?.totalVolumeTradedUsd ?? 0;

  const archetype = computeArchetype({
    walletAgeDays: parsed.walletAgeDays,
    totalTransactions,
    nftTransferCount,
    uniqueProtocols: parsed.uniqueProtocols,
    governanceVotes: parsed.governanceVotes,
    airdropsReceived: parsed.airdropsReceived,
    netWorthUsd: totalUsd,
    nativeBalanceEth,
    totalGasSpentUsd,
    totalVolumeTradedUsd,
    avgHoldDays: parsed.avgHoldDays,
    swapFrequency: parsed.swapFrequency,
  });

  return {
    address,
    ensName,
    avatarUrl,
    firstTxDate: parsed.firstTxDate,
    walletAgedays: parsed.walletAgeDays,
    totalTransactions,
    uniqueProtocols: parsed.uniqueProtocols,
    chainsActive: chains,
    netWorthUsd: totalUsd,
    nativeBalanceEth,
    totalGasSpentEth,
    totalGasSpentUsd,
    biggestSwapUsd,
    biggestSwapDescription: parsed.biggestSwapDescription,
    totalVolumeTradedUsd,
    realizedPnlUsd: pnlSummary?.totalRealizedProfitUsd ?? null,
    topNfts,
    totalNftCount: totalCount,
    governanceVotes: parsed.governanceVotes,
    airdropsReceived: parsed.airdropsReceived,
    archetype,
  };
}