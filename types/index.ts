// LOCATION: chaincard/types/index.ts
// ACTION: REPLACE the entire file with this

// ─── Archetypes ───────────────────────────────────────────────────
export type ArchetypeKey =
  | "DIAMOND_HAND"
  | "DEFI_FARMER"
  | "NFT_DEGEN"
  | "GOVERNANCE_WHALE"
  | "GAS_BURNER"
  | "AIRDROP_HUNTER"
  | "FLIPPER"
  | "WHALE"
  | "COLLECTOR"
  | "NEW_BLOOD";

// ─── Chain ────────────────────────────────────────────────────────
export type ChainKey = "eth" | "base" | "polygon" | "bsc" | "arbitrum";

export interface ChainActivity {
  chain: ChainKey;
  label: string;
  txCount: number;
  netWorthUsd: number;
}

// ─── NFT ─────────────────────────────────────────────────────────
export interface NFTItem {
  name: string;
  collection: string;
  imageUrl: string | null;
  tokenId: string;
  contractAddress: string;
}

// ─── Card Stats ───────────────────────────────────────────────────
export interface CardStats {
  // Identity
  address: string;
  ensName: string | null;
  avatarUrl: string | null;

  // Time
  firstTxDate: string | null;
  walletAgedays: number;

  // Activity
  totalTransactions: number;
  uniqueProtocols: number;
  chainsActive: ChainActivity[];

  // Financial — current holdings
  netWorthUsd: number;
  nativeBalanceEth: number;          // ETH balance for fallback display

  // Financial — activity aggregate (from PnL summary, covers ALL txs)
  totalGasSpentEth: number;
  totalGasSpentUsd: number;
  totalVolumeTradedUsd: number;      // total lifetime trading volume

  // Financial — best trade
  biggestSwapUsd: number;
  biggestSwapDescription: string | null;

  // Financial — PnL
  realizedPnlUsd: number | null;

  // NFTs
  topNfts: NFTItem[];
  totalNftCount: number;

  // Governance / Airdrops
  governanceVotes: number;
  airdropsReceived: number;

  // Archetype
  archetype: ArchetypeKey;
}

// ─── Cached Card (Supabase row) ───────────────────────────────────
export interface CachedCard {
  id: string;
  address: string;
  ens_name: string | null;
  card_data: CardStats;
  archetype: ArchetypeKey;
  is_unlocked: boolean;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

// ─── Moralis Raw Types ────────────────────────────────────────────
export interface MoralisWalletHistory {
  result: MoralisTx[];
  cursor?: string;
}

export interface MoralisTx {
  hash: string;
  block_timestamp: string;
  category: string;
  summary: string;
  possible_spam: boolean;
  value: string;
  transaction_fee: string;
  nft_transfers?: unknown[];
}

export interface MoralisNetWorth {
  total_networth_usd: string;
  chains: {
    chain: string;
    native_balance_formatted: string;
    networth_usd: string;
    token_balance_usd: string;
  }[];
}

export interface MoralisNFT {
  name: string | null;
  normalized_metadata?: {
    name?: string;
    image?: string;
  };
  collection_logo?: string;
  token_id: string;
  token_address: string;
  possible_spam: boolean;
}

export interface MoralisWalletStats {
  transactions: { total: number };
  nft_transfers: { total: number };
  token_transfers: { total: number };
}

export interface MoralisResolveENS {
  name: string;
  address?: string;
}