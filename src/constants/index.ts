import type { ArchetypeKey, ArchetypeConfig, ChainKey, ChainConfig } from '@/types';

export const ARCHETYPES: Record<ArchetypeKey, ArchetypeConfig> = {
  DIAMOND_HAND: {
    label: 'The Diamond Hand',
    emoji: '💎',
    description: 'You HODL through chaos. While others panic sell, your hands stay diamond. Every dip is a discount.',
    color: '#60A5FA',
    glowColor: '#60A5FA',
    environment: 'crystalline',
    particles: 'prismatic',
  },
  DEFI_FARMER: {
    label: 'The DeFi Farmer',
    emoji: '🌾',
    description: 'You\'ve farmed more pools than most people have apps. Your wallet is a diversified yield machine.',
    color: '#34D399',
    glowColor: '#34D399',
    environment: 'terraced',
    particles: 'golden',
  },
  NFT_DEGEN: {
    label: 'The NFT Degen',
    emoji: '🎭',
    description: 'JPEGs are your native language. You\'ve aped in, flipped, and collected more PFPs than you can count.',
    color: '#A78BFA',
    glowColor: '#A78BFA',
    environment: 'neon-gallery',
    particles: 'holographic',
  },
  GOVERNANCE_WHALE: {
    label: 'The Governance Whale',
    emoji: '🏛️',
    description: 'You don\'t just hold — you shape protocol policy. Every vote is a brick in the future of DeFi.',
    color: '#FBBF24',
    glowColor: '#FBBF24',
    environment: 'coral-reef',
    particles: 'bioluminescent',
  },
  GAS_BURNER: {
    label: 'The Gas Burner',
    emoji: '🔥',
    description: 'You\'ve single-handedly funded more validator rewards than most DAOs. Gas is your element.',
    color: '#F87171',
    glowColor: '#F87171',
    environment: 'volcanic',
    particles: 'ember',
  },
  AIRDROP_HUNTER: {
    label: 'The Airdrop Hunter',
    emoji: '🪂',
    description: 'Always early. Always eligible. Your wallet is a constellation of retroactive rewards waiting to land.',
    color: '#38BDF8',
    glowColor: '#38BDF8',
    environment: 'crystal-cave',
    particles: 'prismatic-droplets',
  },
  FLIPPER: {
    label: 'The Flipper',
    emoji: '⚡',
    description: 'In and out faster than a flash loan. Speed is your strategy. Volatility is your playground.',
    color: '#FB923C',
    glowColor: '#FB923C',
    environment: 'particle-accelerator',
    particles: 'trails',
  },
  WHALE: {
    label: 'The Whale',
    emoji: '🐋',
    description: 'Your wallet moves markets. When you trade, charts move. The ocean of DeFi bends to your presence.',
    color: '#E879F9',
    glowColor: '#E879F9',
    environment: 'deep-ocean',
    particles: 'god-rays',
  },
  COLLECTOR: {
    label: 'The Collector',
    emoji: '🗃️',
    description: 'Your wallet is a curated museum. Every NFT, every token — chosen with intent, held with pride.',
    color: '#F472B6',
    glowColor: '#F472B6',
    environment: 'gallery',
    particles: 'dust',
  },
  NEW_BLOOD: {
    label: 'The New Blood',
    emoji: '🌱',
    description: 'Fresh on-chain. The story is just beginning. First steps into a vast digital universe.',
    color: '#86EFAC',
    glowColor: '#86EFAC',
    environment: 'seedling',
    particles: 'growth',
  },
};

export const CHAINS: Record<ChainKey, ChainConfig> = {
  eth: {
    label: 'Ethereum',
    shortLabel: 'ETH',
    color: '#627EEA',
    rpcUrl: 'https://eth.llamarpc.com',
    chainId: 1,
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  base: {
    label: 'Base',
    shortLabel: 'BASE',
    color: '#0052FF',
    rpcUrl: 'https://mainnet.base.org',
    chainId: 8453,
    blockExplorer: 'https://basescan.org',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  polygon: {
    label: 'Polygon',
    shortLabel: 'MATIC',
    color: '#8247E5',
    rpcUrl: 'https://polygon-rpc.com',
    chainId: 137,
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  },
  bsc: {
    label: 'BNB Chain',
    shortLabel: 'BSC',
    color: '#F3BA2F',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    chainId: 56,
    blockExplorer: 'https://bscscan.com',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  },
  arbitrum: {
    label: 'Arbitrum',
    shortLabel: 'ARB',
    color: '#12AAFF',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    chainId: 42161,
    blockExplorer: 'https://arbiscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  optimism: {
    label: 'Optimism',
    shortLabel: 'OP',
    color: '#FF0420',
    rpcUrl: 'https://mainnet.optimism.io',
    chainId: 10,
    blockExplorer: 'https://optimistic.etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  avalanche: {
    label: 'Avalanche',
    shortLabel: 'AVAX',
    color: '#E84142',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    chainId: 43114,
    blockExplorer: 'https://snowtrace.io',
    nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
  },
};

export const ALL_CHAINS: ChainKey[] = Object.keys(CHAINS) as ChainKey[];

export const PUBLIC_RPC_FALLBACKS: Record<number, string[]> = {
  1: [
    'https://eth.llamarpc.com',
    'https://rpc.ankr.com/eth',
    'https://ethereum-rpc.publicnode.com',
    'https://eth.drpc.org',
  ],
  8453: [
    'https://mainnet.base.org',
    'https://base.llamarpc.com',
    'https://base-rpc.publicnode.com',
  ],
  137: [
    'https://polygon-rpc.com',
    'https://polygon.llamarpc.com',
    'https://polygon-rpc.publicnode.com',
  ],
  56: [
    'https://bsc-dataseed.binance.org',
    'https://bsc-dataseed1.binance.org',
    'https://bsc-dataseed2.binance.org',
  ],
  42161: [
    'https://arb1.arbitrum.io/rpc',
    'https://arbitrum.llamarpc.com',
    'https://arbitrum-rpc.publicnode.com',
  ],
  10: [
    'https://mainnet.optimism.io',
    'https://optimism.llamarpc.com',
    'https://optimism-rpc.publicnode.com',
  ],
  43114: [
    'https://api.avax.network/ext/bc/C/rpc',
    'https://avalanche.llamarpc.com',
    'https://avalanche-c-chain.publicnode.com',
  ],
};

export const APP_NAME = 'ChainCard Nexus';
export const APP_TAGLINE = 'Your wallet has a story. Now it has a world.';
export const ENS_AVATAR_BASE = 'https://metadata.ens.domains/mainnet/avatar';

export const CACHE_TTL = {
  BALANCE: 60 * 1000,
  TRANSACTIONS: 5 * 60 * 1000,
  NFT_BALANCE: 10 * 60 * 1000,
  WALLET_PROFILE: 30 * 60 * 1000,
  GAS_PRICE: 30 * 1000,
  ENS_RESOLUTION: 60 * 60 * 1000,
};