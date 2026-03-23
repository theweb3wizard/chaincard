// LOCATION: chaincard/constants/index.ts
// ACTION: REPLACE entire file

import type { ArchetypeKey, ChainKey } from "@/types";

export const ARCHETYPES: Record<
  ArchetypeKey,
  { label: string; emoji: string; description: string; color: string; bgColor: string; glowColor: string }
> = {
  DIAMOND_HAND: {
    label: "The Diamond Hand", emoji: "💎",
    description: "You hold through the chaos. While others panic sell, you don't flinch.",
    color: "text-blue-400", bgColor: "bg-blue-400/10", glowColor: "#60A5FA",
  },
  DEFI_FARMER: {
    label: "The DeFi Farmer", emoji: "🌾",
    description: "You've touched more protocols than most people have crypto apps.",
    color: "text-emerald-400", bgColor: "bg-emerald-400/10", glowColor: "#34D399",
  },
  NFT_DEGEN: {
    label: "The NFT Degen", emoji: "🎭",
    description: "JPEGs are your love language. The blockchain knows it.",
    color: "text-violet-400", bgColor: "bg-violet-400/10", glowColor: "#A78BFA",
  },
  GOVERNANCE_WHALE: {
    label: "The Governance Whale", emoji: "🏛️",
    description: "You don't just hold — you vote. Protocol decisions have your fingerprints.",
    color: "text-amber-400", bgColor: "bg-amber-400/10", glowColor: "#FBBF24",
  },
  GAS_BURNER: {
    label: "The Gas Burner", emoji: "🔥",
    description: "You've donated more to miners than most people hold in their wallets.",
    color: "text-red-400", bgColor: "bg-red-400/10", glowColor: "#F87171",
  },
  AIRDROP_HUNTER: {
    label: "The Airdrop Hunter", emoji: "🪂",
    description: "Early, active, and always in the right place at the right time.",
    color: "text-sky-400", bgColor: "bg-sky-400/10", glowColor: "#38BDF8",
  },
  FLIPPER: {
    label: "The Flipper", emoji: "⚡",
    description: "In and out. Fast hands, quick trades. The market is your playground.",
    color: "text-orange-400", bgColor: "bg-orange-400/10", glowColor: "#FB923C",
  },
  WHALE: {
    label: "The Whale", emoji: "🐋",
    description: "Your moves make charts move. The market watches your wallet.",
    color: "text-fuchsia-400", bgColor: "bg-fuchsia-400/10", glowColor: "#E879F9",
  },
  COLLECTOR: {
    label: "The Collector", emoji: "🗃️",
    description: "Your wallet is a museum. Curated, diverse, and surprisingly rare.",
    color: "text-pink-400", bgColor: "bg-pink-400/10", glowColor: "#F472B6",
  },
  NEW_BLOOD: {
    label: "The New Blood", emoji: "🌱",
    description: "Fresh on-chain. The story is just beginning.",
    color: "text-green-400", bgColor: "bg-green-400/10", glowColor: "#86EFAC",
  },
};

export const CHAINS: Record<
  ChainKey,
  { label: string; shortLabel: string; color: string; moralisId: string }
> = {
  eth:      { label: "Ethereum", shortLabel: "ETH",  color: "#627EEA", moralisId: "0x1"    },
  base:     { label: "Base",     shortLabel: "BASE", color: "#0052FF", moralisId: "0x2105"  },
  polygon:  { label: "Polygon",  shortLabel: "MATIC",color: "#8247E5", moralisId: "0x89"   },
  bsc:      { label: "BNB Chain",shortLabel: "BSC",  color: "#F3BA2F", moralisId: "0x38"   },
  arbitrum: { label: "Arbitrum", shortLabel: "ARB",  color: "#12AAFF", moralisId: "0xa4b1" },
};

export const ALL_CHAINS: ChainKey[] = ["eth", "base", "polygon", "bsc", "arbitrum"];

export const CACHE_TTL_HOURS = 24;

export const APP_NAME = "ChainCard";
export const APP_TAGLINE = "Your wallet has a story. Now it has a card.";
// Update this after Vercel gives you your URL
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://chaincard.vercel.app";
export const TWITTER_HANDLE = "@ChainCard";