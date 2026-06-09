import type { ArchetypeKey, ArchetypeFactor } from '@/types';

interface ArchetypeInput {
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
}

export function computeArchetype(stats: ArchetypeInput): ArchetypeKey {
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

  const effectiveWorth = netWorthUsd > 0 ? netWorthUsd : nativeBalanceEth * 3000;

  if (effectiveWorth >= 100_000) return 'WHALE';
  if (walletAgeDays < 180) return 'NEW_BLOOD';
  if (governanceVotes >= 5 && walletAgeDays >= 365) return 'GOVERNANCE_WHALE';

  const nftRatio = totalTransactions > 0 ? nftTransferCount / totalTransactions : 0;
  if (nftRatio >= 0.5 && nftTransferCount >= 20) return 'NFT_DEGEN';
  if (nftTransferCount >= 30 && nftRatio < 0.5) return 'COLLECTOR';
  if (airdropsReceived >= 10 && walletAgeDays >= 365) return 'AIRDROP_HUNTER';
  if (uniqueProtocols >= 10) return 'DEFI_FARMER';

  const volumePerDay = walletAgeDays > 0 ? totalVolumeTradedUsd / walletAgeDays : 0;
  if (volumePerDay >= 1000 && avgHoldDays < 30) return 'FLIPPER';

  if (avgHoldDays >= 180 && swapFrequency < 2) return 'DIAMOND_HAND';
  if (swapFrequency >= 10 && avgHoldDays < 30) return 'FLIPPER';
  if (totalGasSpentUsd >= 1_000 || totalTransactions >= 500) return 'GAS_BURNER';
  if (avgHoldDays >= 90) return 'DIAMOND_HAND';

  return 'FLIPPER';
}

export function computeLegitimacyScore(stats: {
  walletAgeDays: number;
  totalTransactions: number;
  uniqueProtocols: number;
  governanceVotes: number;
  airdropsReceived: number;
  totalGasSpentUsd: number;
  avgHoldDays: number;
  swapFrequency: number;
}): number {
  let score = 0;

  if (stats.walletAgeDays >= 365 * 3) score += 30;
  else if (stats.walletAgeDays >= 365 * 2) score += 25;
  else if (stats.walletAgeDays >= 365) score += 20;
  else if (stats.walletAgeDays >= 180) score += 15;
  else if (stats.walletAgeDays >= 90) score += 10;
  else score += Math.max(0, stats.walletAgeDays / 3);

  if (stats.totalTransactions >= 1000) score += 25;
  else if (stats.totalTransactions >= 500) score += 20;
  else if (stats.totalTransactions >= 200) score += 15;
  else if (stats.totalTransactions >= 50) score += 10;
  else score += Math.min(10, stats.totalTransactions / 5);

  if (stats.uniqueProtocols >= 20) score += 20;
  else if (stats.uniqueProtocols >= 10) score += 15;
  else if (stats.uniqueProtocols >= 5) score += 10;
  else score += stats.uniqueProtocols * 2;

  if (stats.governanceVotes >= 20) score += 15;
  else if (stats.governanceVotes >= 10) score += 10;
  else if (stats.governanceVotes >= 5) score += 5;
  else score += stats.governanceVotes;

  if (stats.airdropsReceived >= 10) score += 10;
  else score += stats.airdropsReceived;

  if (stats.totalGasSpentUsd >= 1000) score += 5;
  else if (stats.totalGasSpentUsd >= 500) score += 3;
  else if (stats.totalGasSpentUsd >= 100) score += 1;

  if (stats.avgHoldDays >= 180) score += 5;
  else if (stats.avgHoldDays >= 90) score += 3;
  else if (stats.swapFrequency >= 10) score -= 2;

  return Math.min(100, Math.max(0, Math.round(score)));
}

export function computeArchetypeFactors(stats: ArchetypeInput): ArchetypeFactor[] {
  const archetype = computeArchetype(stats);
  const allFactors: ArchetypeFactor[] = [
    {
      name: 'Wallet Age',
      value: stats.walletAgeDays,
      maxValue: 1095,
      description: stats.walletAgeDays >= 1095 ? 'Ancient wallet — 3+ years on-chain' :
        stats.walletAgeDays >= 365 ? 'Established — over a year old' :
        stats.walletAgeDays >= 180 ? 'Maturing — 6+ months old' :
        stats.walletAgeDays >= 30 ? 'Growing — less than 6 months old' :
        'Fresh — brand new to the chain',
      weight: 0.25,
    },
    {
      name: 'Transaction Volume',
      value: stats.totalTransactions,
      maxValue: 1000,
      description: stats.totalTransactions >= 1000 ? 'Power user — 1,000+ transactions' :
        stats.totalTransactions >= 200 ? 'Active — hundreds of transactions' :
        stats.totalTransactions >= 50 ? 'Regular — dozens of interactions' :
        'Light user — just getting started',
      weight: 0.2,
    },
    {
      name: 'Protocol Diversity',
      value: stats.uniqueProtocols,
      maxValue: 20,
      description: stats.uniqueProtocols >= 10 ? 'Explorer — 10+ different protocols' :
        stats.uniqueProtocols >= 5 ? 'Diversified — multiple protocols used' :
        stats.uniqueProtocols >= 3 ? 'Growing — several protocols tried' :
        'Focused — using few protocols',
      weight: 0.15,
    },
    {
      name: 'Hold Duration',
      value: stats.avgHoldDays,
      maxValue: 365,
      description: stats.avgHoldDays >= 180 ? 'Diamond hands — holds for 6+ months' :
        stats.avgHoldDays >= 90 ? 'Patient — holds for months' :
        stats.avgHoldDays >= 30 ? 'Moderate — holds for weeks' :
        'Quick — holds for days or less',
      weight: 0.15,
    },
    {
      name: 'Governance Participation',
      value: stats.governanceVotes,
      maxValue: 20,
      description: stats.governanceVotes >= 10 ? 'Governance whale — 10+ votes cast' :
        stats.governanceVotes >= 5 ? 'Active voter — multiple proposals' :
        stats.governanceVotes >= 1 ? 'Participant — has voted before' :
        'Observer — no governance participation',
      weight: 0.1,
    },
    {
      name: 'Gas Contribution',
      value: Math.round(stats.totalGasSpentUsd),
      maxValue: 1000,
      description: stats.totalGasSpentUsd >= 1000 ? 'Gas burner — $1,000+ in fees' :
        stats.totalGasSpentUsd >= 500 ? 'Heavy user — $500+ in gas' :
        stats.totalGasSpentUsd >= 100 ? 'Regular user — $100+ in fees' :
        'Light user — minimal gas spent',
      weight: 0.1,
    },
    {
      name: 'Trading Activity',
      value: stats.swapFrequency,
      maxValue: 20,
      description: stats.swapFrequency >= 10 ? 'Flipper — high swap frequency' :
        stats.swapFrequency >= 5 ? 'Active trader — regular swaps' :
        stats.swapFrequency >= 2 ? 'Occasional trader — some swaps' :
        'HODLer — rarely swaps',
      weight: 0.05,
    },
  ];

  const archetypeSpecific = getArchetypeEvidence(archetype, stats);
  return [...allFactors, ...archetypeSpecific];
}

function getArchetypeEvidence(archetype: ArchetypeKey, stats: ArchetypeInput): ArchetypeFactor[] {
  switch (archetype) {
    case 'DIAMOND_HAND':
      return [{
        name: 'Diamond Hands Evidence',
        value: Math.round(stats.avgHoldDays),
        maxValue: 365,
        description: `You hold assets for ${stats.avgHoldDays >= 180 ? 'over 6 months' : 'extended periods'}. Your patience is your superpower.`,
        weight: 0.5,
      }];
    case 'DEFI_FARMER':
      return [{
        name: 'DeFi Activity Evidence',
        value: stats.uniqueProtocols,
        maxValue: 20,
        description: `You've interacted with ${stats.uniqueProtocols} different protocols. Your wallet is a diversified yield machine.`,
        weight: 0.5,
      }];
    case 'NFT_DEGEN':
      return [{
        name: 'NFT Activity Evidence',
        value: stats.nftTransferCount,
        maxValue: 100,
        description: `NFTs make up a major part of your on-chain activity with ${stats.nftTransferCount}+ transfers.`,
        weight: 0.5,
      }];
    case 'GOVERNANCE_WHALE':
      return [{
        name: 'Governance Evidence',
        value: stats.governanceVotes,
        maxValue: 20,
        description: `You've cast ${stats.governanceVotes} governance votes. You help shape protocol policy.`,
        weight: 0.5,
      }];
    case 'GAS_BURNER':
      return [{
        name: 'Gas Evidence',
        value: Math.round(stats.totalGasSpentUsd),
        maxValue: 2000,
        description: `You've spent $${Math.round(stats.totalGasSpentUsd).toLocaleString()} on gas. The network thanks you.`,
        weight: 0.5,
      }];
    case 'AIRDROP_HUNTER':
      return [{
        name: 'Airdrop Evidence',
        value: stats.airdropsReceived,
        maxValue: 20,
        description: `You've received ${stats.airdropsReceived} airdrops. You know where to be early.`,
        weight: 0.5,
      }];
    case 'FLIPPER':
      return [{
        name: 'Trading Frequency Evidence',
        value: Math.round(stats.swapFrequency),
        maxValue: 30,
        description: `You make ${stats.swapFrequency.toFixed(1)} swaps per month. Speed is your strategy.`,
        weight: 0.5,
      }];
    case 'WHALE':
      return [{
        name: 'Wealth Evidence',
        value: Math.round(stats.netWorthUsd),
        maxValue: 1000000,
        description: `Your portfolio exceeds $100K. Your moves make markets move.`,
        weight: 0.5,
      }];
    case 'COLLECTOR':
      return [{
        name: 'Collection Diversity Evidence',
        value: stats.nftTransferCount,
        maxValue: 50,
        description: `You own and transfer a diverse range of NFTs and tokens. A true curator.`,
        weight: 0.5,
      }];
    case 'NEW_BLOOD':
      return [{
        name: 'Wallet Freshness Evidence',
        value: Math.round(stats.walletAgeDays),
        maxValue: 180,
        description: `Your wallet is ${stats.walletAgeDays} days young. The journey is just beginning.`,
        weight: 0.5,
      }];
  }
}

export function getArchetypeDescription(archetype: ArchetypeKey): string {
  const descriptions: Record<ArchetypeKey, { short: string; long: string; trait: string; advice: string }> = {
    DIAMOND_HAND: {
      short: 'You HODL through chaos',
      long: 'While others panic sell, your hands stay diamond. Every dip is a discount, every crash is an opportunity. You understand that time in the market beats timing the market.',
      trait: 'Patience',
      advice: 'Your conviction is rare. Consider staking your long-term holds to earn yield while diamond handing.',
    },
    DEFI_FARMER: {
      short: 'You farm where others don\'t',
      long: 'You\'ve touched more protocols than most people have crypto apps. Your wallet is a diversified yield machine, constantly optimizing across every chain.',
      trait: 'Curiosity',
      advice: 'Your protocol diversity is impressive. Track your yield farming across chains to maximize returns.',
    },
    NFT_DEGEN: {
      short: 'JPEGs are your native language',
      long: 'You\'ve aped in, flipped, and collected more PFPs than you can count. The NFT market runs on your energy and your willingness to take risks on art.',
      trait: 'Vision',
      advice: 'Your eye for value is sharp. Focus on quality over quantity — the best collections outperform the rest.',
    },
    GOVERNANCE_WHALE: {
      short: 'You shape protocol policy',
      long: 'You don\'t just hold — you vote. Every proposal, every decision, every fork — your voice is heard. You\'re not a spectator, you\'re a stakeholder.',
      trait: 'Leadership',
      advice: 'Your governance participation helps decentralize protocols. Consider delegating to active voters when you can\'t vote yourself.',
    },
    GAS_BURNER: {
      short: 'Gas is your element',
      long: 'You\'ve single-handedly funded more validator rewards than most DAOs. Every transaction, every swap, every interaction — you pay the price of admission.',
      trait: 'Relentlessness',
      advice: 'Your transaction volume is incredible. Consider batching transactions or using L2s to save on gas fees.',
    },
    AIRDROP_HUNTER: {
      short: 'Always early, always eligible',
      long: 'You know where to be before anyone else does. Your wallet is a constellation of retroactive rewards and undiscovered protocols waiting to launch.',
      trait: 'Foresight',
      advice: 'Your early-adopter pattern is valuable. Keep diversifying across ecosystems to maximize future airdrops.',
    },
    FLIPPER: {
      short: 'Speed is your strategy',
      long: 'In and out faster than a flash loan. You thrive on volatility, reading the market in seconds and executing before others blink.',
      trait: 'Agility',
      advice: 'Your quick execution is a skill. Be careful of tax implications — frequent trading creates complex records.',
    },
    WHALE: {
      short: 'Your wallet moves markets',
      long: 'When you trade, charts move. The ocean of DeFi bends to your presence. Your portfolio is a force of nature in the crypto ecosystem.',
      trait: 'Influence',
      advice: 'Your size gives you power. Consider using DCA strategies to minimize market impact on large trades.',
    },
    COLLECTOR: {
      short: 'Your wallet is a museum',
      long: 'Every NFT, every token — chosen with intent, held with pride. Your collection tells a story of curation, taste, and conviction.',
      trait: 'Curation',
      advice: 'Your curated collection is a work of art. Consider showcasing it in a virtual gallery or museum.',
    },
    NEW_BLOOD: {
      short: 'The journey is just beginning',
      long: 'Fresh on-chain, full of potential. Every transaction is a step into a vast digital universe. The story of your wallet is only on page one.',
      trait: 'Potential',
      advice: 'Welcome to the chain! Start with small transactions, explore different protocols, and learn about security best practices.',
    },
  };
  return descriptions[archetype].long;
}

export function getArchetypeTrait(archetype: ArchetypeKey): string {
  const traits: Record<ArchetypeKey, string> = {
    DIAMOND_HAND: 'Patience',
    DEFI_FARMER: 'Curiosity',
    NFT_DEGEN: 'Vision',
    GOVERNANCE_WHALE: 'Leadership',
    GAS_BURNER: 'Relentlessness',
    AIRDROP_HUNTER: 'Foresight',
    FLIPPER: 'Agility',
    WHALE: 'Influence',
    COLLECTOR: 'Curation',
    NEW_BLOOD: 'Potential',
  };
  return traits[archetype];
}