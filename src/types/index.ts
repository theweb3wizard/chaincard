export type ArchetypeKey =
  | 'DIAMOND_HAND'
  | 'DEFI_FARMER'
  | 'NFT_DEGEN'
  | 'GOVERNANCE_WHALE'
  | 'GAS_BURNER'
  | 'AIRDROP_HUNTER'
  | 'FLIPPER'
  | 'WHALE'
  | 'COLLECTOR'
  | 'NEW_BLOOD';

export type ChainKey = 'eth' | 'base' | 'polygon' | 'bsc' | 'arbitrum' | 'optimism' | 'avalanche';

export interface ArchetypeConfig {
  label: string;
  emoji: string;
  description: string;
  color: string;
  glowColor: string;
  environment: string;
  particles: string;
}

export interface ChainConfig {
  label: string;
  shortLabel: string;
  color: string;
  rpcUrl: string;
  chainId: number;
  blockExplorer: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
}

export interface ChainActivity {
  chain: ChainKey;
  label: string;
  txCount: number;
  netWorthUsd: number;
}

export interface NFTItem {
  name: string;
  collection: string;
  imageUrl: string | null;
  tokenId: string;
  contractAddress: string;
}

export interface WalletProfile {
  address: string;
  ensName: string | null;
  avatarUrl: string | null;
  firstTxDate: string | null;
  walletAgeDays: number;
  totalTransactions: number;
  uniqueProtocols: number;
  chainsActive: ChainActivity[];
  netWorthUsd: number;
  nativeBalanceEth: number;
  totalGasSpentEth: number;
  totalGasSpentUsd: number;
  totalVolumeTradedUsd: number;
  biggestSwapUsd: number;
  biggestSwapDescription: string | null;
  realizedPnlUsd: number | null;
  topNfts: NFTItem[];
  totalNftCount: number;
  governanceVotes: number;
  airdropsReceived: number;
  archetype: ArchetypeKey;
  archetypeFactors: ArchetypeFactor[];
  legitimacyScore: number;
  nftTransferCount: number;
  swapCount: number;
  avgHoldDays: number;
  swapFrequency: number;
}

export interface ArchetypeFactor {
  name: string;
  value: number;
  maxValue: number;
  description: string;
  weight: number;
}

export interface RpcStatus {
  chainId: number;
  healthy: boolean;
  blockHeight: bigint;
  latency: number;
  lastChecked: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export type WalletStatus = 'idle' | 'searching' | 'analyzing' | 'generating' | 'complete' | 'error';

export interface ViewState {
  walletAddress: string | null;
  walletProfile: WalletProfile | null;
  status: WalletStatus;
  error: string | null;
  selectedArchetypeWorld: ArchetypeKey | null;
  show3D: boolean;
  cameraAngle: number;
  timeProgress: number;
}

export interface SavedCard {
  address: string;
  ensName: string | null;
  archetype: ArchetypeKey;
  timestamp: number;
  avatarUrl: string | null;
}