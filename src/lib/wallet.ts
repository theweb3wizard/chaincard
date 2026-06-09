import {
  getBalance,
  getTransactionCount,
  getBlock,
  getBlockNumber,
  getClient,
  resolveChainKey,
} from './rpc';
import {
  getCachedWallet,
  cacheWallet,
  getCachedTransactions,
  cacheTransactions,
  getCachedNFTs,
  cacheNFTs,
  getCachedENS,
  cacheENS,
} from './cache';
import { computeArchetype, computeLegitimacyScore, computeArchetypeFactors } from './archetypes';
import { CHAINS, ALL_CHAINS, ENS_AVATAR_BASE, CACHE_TTL } from '@/constants';
import { daysFromDate } from '@/utils/format';
import { normalizeAddress, isValidAddress, isENSName } from '@/utils/address';
import type {
  ChainKey,
  WalletProfile,
  ChainActivity,
  NFTItem,
  WalletStatus,
} from '@/types';

const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
];

const ERC721_ABI = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'index', type: 'uint256' },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
];

interface EnsDomain {
  name: string;
  address: string;
}

let priceCache: { eth: number; timestamp: number } = { eth: 3000, timestamp: 0 };

async function fetchEthPrice(): Promise<number> {
  if (Date.now() - priceCache.timestamp < 60_000) return priceCache.eth;
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
      { signal: AbortSignal.timeout(5000) }
    );
    const data = await res.json();
    const price = data?.ethereum?.usd || 3000;
    priceCache = { eth: price, timestamp: Date.now() };
    return price;
  } catch {
    return priceCache.eth;
  }
}

async function getTokenPrices(addresses: string[]): Promise<Record<string, number>> {
  if (addresses.length === 0) return {};
  try {
    const ids = ['ethereum', 'usd-coin', 'tether', 'chainlink', 'uniswap', 'aave', 'maker'];
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd`,
      { signal: AbortSignal.timeout(5000) }
    );
    const data = await res.json();
    const prices: Record<string, number> = {};
    for (const [id, priceData] of Object.entries(data)) {
      prices[id] = (priceData as any)?.usd || 0;
    }
    return prices;
  } catch {
    return {};
  }
}

async function resolveENS(addressOrName: string): Promise<EnsDomain | null> {
  const isEns = isENSName(addressOrName);

  if (isEns) {
    const cached = await getCachedENS(addressOrName);
    if (cached) return cached;

    try {
      const client = getClient('eth');
      const resolved = await client.getEnsAddress({ name: addressOrName });
      if (resolved) {
        const data = { name: addressOrName, address: resolved };
        await cacheENS(addressOrName, data, CACHE_TTL.ENS_RESOLUTION);
        return data;
      }
      return null;
    } catch {
      return null;
    }
  }

  if (isValidAddress(addressOrName)) {
    const cached = await getCachedENS(addressOrName);
    if (cached) return cached;

    try {
      const client = getClient('eth');
      const resolved = await client.getEnsName({ address: addressOrName as `0x${string}` });
      if (resolved) {
        const data = { name: resolved, address: addressOrName };
        await cacheENS(addressOrName, data, CACHE_TTL.ENS_RESOLUTION);
        return data;
      }
      return null;
    } catch {
      return null;
    }
  }

  return null;
}

interface RawTx {
  hash: string;
  blockNumber: bigint;
  timestamp: number;
  from: string;
  to: string | null;
  value: bigint;
  gasUsed: bigint;
  gasPrice: bigint;
  input: string;
  status: 'success' | 'reverted';
}

async function fetchRecentTransactions(
  address: `0x${string}`,
  chainKey: ChainKey
): Promise<RawTx[]> {
  try {
    const client = getClient(chainKey);
    const currentBlock = await client.getBlockNumber();

    const cacheKey = `${address.toLowerCase()}-${chainKey}`;
    const cachedTxs = await getCachedTransactions(cacheKey);
    if (cachedTxs) return cachedTxs;

    const maxBlocks = 100;
    const startBlock = currentBlock - BigInt(maxBlocks);
    const allTxs: RawTx[] = [];

    const batchSize = 10n;
    for (let b = startBlock; b <= currentBlock; b += batchSize) {
      const end = b + batchSize > currentBlock ? currentBlock : b + batchSize;
      const promises: Promise<any>[] = [];

      for (let i = b; i <= end; i++) {
        promises.push(
          client.getBlock({ blockNumber: i, includeTransactions: true }).catch(() => null)
        );
      }

      const blocks = await Promise.all(promises);
      for (const block of blocks) {
        if (!block) continue;
        for (const tx of block.transactions) {
          if (typeof tx !== 'object' || !('from' in tx)) continue;
          const txFrom = (tx.from as string).toLowerCase();
          const txTo = (tx.to as string | undefined)?.toLowerCase() || '';
          if (txFrom !== address.toLowerCase() && txTo !== address.toLowerCase()) continue;

          const receipt = await client
            .getTransactionReceipt({ hash: tx.hash as `0x${string}` })
            .catch(() => null);
          allTxs.push({
            hash: tx.hash as string,
            blockNumber: block.number!,
            timestamp: Number(block.timestamp),
            from: txFrom,
            to: txTo || null,
            value: tx.value as bigint,
            gasUsed: receipt?.gasUsed || tx.gas,
            gasPrice: tx.gasPrice as bigint || 0n,
            input: tx.input as string,
            status: receipt?.status === 'success' ? 'success' : 'reverted',
          });

          if (allTxs.length >= 200) break;
        }
        if (allTxs.length >= 200) break;
      }
      if (allTxs.length >= 200) break;
    }

    await cacheTransactions(cacheKey, allTxs, CACHE_TTL.TRANSACTIONS);
    return allTxs;
  } catch {
    return [];
  }
}

function hexToBytes(hex: string): number[] {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes: number[] = [];
  for (let i = 0; i < clean.length; i += 2) {
    bytes.push(parseInt(clean.substring(i, i + 2), 16));
  }
  return bytes;
}

const KNOWN_PROTOCOLS: Record<string, { name: string; chain: string }[]> = {
  '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': [{ name: 'Uniswap V2', chain: 'eth' }],
  '0x1f98431c8ad98523631ae4a59f267346ea31f984': [{ name: 'Uniswap V3', chain: 'eth' }],
  '0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9': [{ name: 'Aave V2', chain: 'eth' }],
  '0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2': [{ name: 'Aave V3', chain: 'eth' }],
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': [{ name: 'WETH', chain: 'eth' }],
  '0xdac17f958d2ee523a2206206994597c13d831ec7': [{ name: 'Tether', chain: 'eth' }],
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': [{ name: 'USDC', chain: 'eth' }],
  '0x6b175474e89094c44da98b954eedeac495271d0f': [{ name: 'MakerDAO', chain: 'eth' }],
  '0x514910771af9ca656af840dff83e8264ecf986ca': [{ name: 'Chainlink', chain: 'eth' }],
  '0x5283d291dbcf85356a21ba090e6db59121208b44': [{ name: 'Blur', chain: 'eth' }],
  '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d': [{ name: 'Bored Ape YC', chain: 'eth' }],
  '0x5a98fcbea516cf06857215779fd812ca3bef1b32': [{ name: 'Lido', chain: 'eth' }],
  '0xae7ab96520de3a18e5e111b5eaab095312d7fe84': [{ name: 'stETH', chain: 'eth' }],
  '0xd533a949740bb3306d119cc777fa900ba034cd52': [{ name: 'Curve DAO', chain: 'eth' }],
  '0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419': [{ name: 'ETH/USD Oracle', chain: 'eth' }],
  '0x0000000000000ad24e80fd803c6ac37206a45f15': [{ name: 'Blend', chain: 'eth' }],
  '0x00000000000000adc04c56bf30ac9d3c0aaf14dc': [{ name: 'Blur Pool', chain: 'eth' }],
  '0xc36442b4a4522e871399cd717abdd847ab11fe88': [{ name: 'Uniswap V3 Positions', chain: 'eth' }],
  '0xba12222222228d8ba445958a75a0704d566bf2c8': [{ name: 'Balancer V2', chain: 'eth' }],
  '0x000000000022d473030f116ddee9f6b43ac78ba3': [{ name: 'Seaport 1.1', chain: 'eth' }],
  '0x00000000000006c7676171937c444f6bde3d6282': [{ name: 'Seaport 1.5', chain: 'eth' }],
  '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad': [{ name: 'Uniswap V3', chain: 'eth' }],
};

function detectProtocols(txs: RawTx[]): Set<string> {
  const protocols = new Set<string>();
  for (const tx of txs) {
    if (!tx.to) continue;
    const matches = KNOWN_PROTOCOLS[tx.to.toLowerCase()];
    if (matches) {
      for (const m of matches) {
        protocols.add(m.name);
      }
    }
    const input = tx.input.slice(0, 10);
    const selectorMap: Record<string, string> = {
      '0x38ed1739': 'Uniswap V2 Swap',
      '0x7ff36ab5': 'Uniswap V2 Swap Exact',
      '0x5c11d795': 'Uniswap V2 Swap Exact',
      '0x022c0d9f': 'Token Swap',
      '0xa9059cbb': 'Token Transfer (ERC20)',
      '0x095ea7b3': 'Token Approval (ERC20)',
      '0x23b872dd': 'Token Transfer From',
      '0x42842e0e': 'NFT Safe Transfer',
      '0x70a08231': 'Balance Check',
      '0x3593564c': 'Seaport Order',
      '0x00000000': 'ETH Transfer',
    };
    const protocol = selectorMap[input];
    if (protocol) {
      protocols.add(protocol);
    }
  }
  return protocols;
}

async function fetchNativeBalance(
  address: `0x${string}`,
  chainKey: ChainKey
): Promise<{ balance: bigint; usdValue: number }> {
  try {
    const bal = await getBalance(address, chainKey);
    const ethPrice = await fetchEthPrice();
    const ethBalance = Number(bal) / 1e18;
    return { balance: bal, usdValue: ethBalance * ethPrice };
  } catch {
    return { balance: 0n, usdValue: 0 };
  }
}

async function fetchNFTs(
  address: `0x${string}`,
  chainKey: ChainKey
): Promise<NFTItem[]> {
  const cacheKey = `${address.toLowerCase()}-${chainKey}`;
  const cached = await getCachedNFTs(cacheKey);
  if (cached) return cached as NFTItem[];

  const knownCollections: { name: string; address: `0x${string}`; chain: ChainKey }[] = [
    { name: 'Bored Ape Yacht Club', address: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d', chain: 'eth' },
    { name: 'CryptoPunks', address: '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb', chain: 'eth' },
    { name: 'Mutant Ape Yacht Club', address: '0x60e4d786628fea6478f785a6d7e704777c86a7c6', chain: 'eth' },
    { name: 'Azuki', address: '0xed5af388653567af2f388e6224dc7c4b3241c544', chain: 'eth' },
    { name: 'Pudgy Penguins', address: '0xbd3531da5cf5857e7cfaa92426877b022e612cf8', chain: 'eth' },
    { name: 'Doodles', address: '0x8a90cab2b38dba80c64b7734e58ee1db38b8992e', chain: 'eth' },
    { name: 'CloneX', address: '0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b', chain: 'eth' },
  ];

  const nfts: NFTItem[] = [];
  const client = getClient(chainKey);

  for (const collection of knownCollections) {
    if (collection.chain !== chainKey) continue;
    try {
      const balance = await client.readContract({
        address: collection.address,
        abi: [
          {
            inputs: [{ name: 'owner', type: 'address' }],
            name: 'balanceOf',
            outputs: [{ name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
          } as const,
        ],
        functionName: 'balanceOf',
        args: [address],
      });

      const count = Number(balance);
      for (let i = 0; i < Math.min(count, 3); i++) {
        try {
          const tokenId = await client.readContract({
            address: collection.address,
            abi: [
              {
                inputs: [
                  { name: 'owner', type: 'address' },
                  { name: 'index', type: 'uint256' },
                ],
                name: 'tokenOfOwnerByIndex',
                outputs: [{ name: '', type: 'uint256' }],
                stateMutability: 'view',
                type: 'function',
              } as const,
            ],
            functionName: 'tokenOfOwnerByIndex',
            args: [address, BigInt(i)],
          });

          let imageUrl: string | null = null;
          try {
            const tokenURI = await client.readContract({
              address: collection.address,
              abi: [
                {
                  inputs: [{ name: 'tokenId', type: 'uint256' }],
                  name: 'tokenURI',
                  outputs: [{ name: '', type: 'string' }],
                  stateMutability: 'view',
                  type: 'function',
                } as const,
              ],
              functionName: 'tokenURI',
              args: [tokenId],
            });

            const uri = tokenURI as string;
            if (uri.startsWith('ipfs://')) {
              imageUrl = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
            } else if (uri.startsWith('data:')) {
              imageUrl = uri;
            } else if (uri.startsWith('http')) {
              imageUrl = uri;
            }
          } catch {
            imageUrl = null;
          }

          nfts.push({
            name: `#${tokenId.toString()}`,
            collection: collection.name,
            imageUrl,
            tokenId: tokenId.toString(),
            contractAddress: collection.address,
          });
        } catch {
          continue;
        }
      }
    } catch {
      continue;
    }
  }

  await cacheNFTs(cacheKey, nfts, CACHE_TTL.NFT_BALANCE);
  return nfts;
}

async function getFirstTransactionDate(
  address: `0x${string}`,
  chainKey: ChainKey
): Promise<string | null> {
  try {
    const client = getClient(chainKey);
    const currentBlock = await client.getBlockNumber();

    const currentTxCount = await client.getTransactionCount({ address, blockNumber: currentBlock });
    if (currentTxCount === 0) return null;

    let low = 0n;
    let high = currentBlock;
    let firstTxBlock: bigint | null = null;

    while (low <= high) {
      const mid = (low + high) / 2n;
      try {
        const txCount = await client.getTransactionCount({ address, blockNumber: mid });
        if (txCount > 0) {
          firstTxBlock = mid;
          high = mid - 1n;
        } else {
          low = mid + 1n;
        }
      } catch {
        high = mid - 1n;
      }
    }

    if (firstTxBlock !== null) {
      const block = await client.getBlock({ blockNumber: firstTxBlock });
      return new Date(Number(block.timestamp) * 1000).toISOString();
    }

    return null;
  } catch {
    return null;
  }
}

async function getTokenBalances(
  address: `0x${string}`,
  chainKey: ChainKey
): Promise<{ symbol: string; balance: number; usdValue: number }[]> {
  const TOKENS: { symbol: string; address: `0x${string}` }[] = [
    { symbol: 'USDC', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' },
    { symbol: 'USDT', address: '0xdac17f958d2ee523a2206206994597c13d831ec7' },
    { symbol: 'DAI', address: '0x6b175474e89094c44da98b954eedeac495271d0f' },
    { symbol: 'LINK', address: '0x514910771af9ca656af840dff83e8264ecf986ca' },
    { symbol: 'UNI', address: '0x1f98431c8ad98523631ae4a59f267346ea31f984' },
    { symbol: 'AAVE', address: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9' },
    { symbol: 'MKR', address: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2' },
    { symbol: 'WETH', address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' },
  ];

  const results: { symbol: string; balance: number; usdValue: number }[] = [];
  if (chainKey !== 'eth') return results;

  try {
    const client = getClient(chainKey);
    const contracts = TOKENS.map((t) => ({
      address: t.address,
      abi: ERC20_ABI,
      functionName: 'balanceOf' as const,
      args: [address] as const,
    }));

    const balances = await client.multicall({ contracts });
    const tokenPrices = await getTokenPrices(['ethereum', 'usd-coin', 'tether', 'chainlink', 'uniswap', 'aave', 'maker']);

    TOKENS.forEach((token, i) => {
      const result = balances[i];
      if (result.status === 'success' && result.result) {
        const balanceRaw = BigInt(result.result.toString());
        const decimals = {
          USDC: 6, USDT: 6, DAI: 18, LINK: 18, UNI: 18, AAVE: 18, MKR: 18, WETH: 18,
        };
        const bal = Number(balanceRaw) / Math.pow(10, (decimals as any)[token.symbol] || 18);
        const priceMap: Record<string, number> = {
          USDC: 1, USDT: 1,
          DAI: 1, LINK: tokenPrices['chainlink'] || 15,
          UNI: tokenPrices['uniswap'] || 7,
          AAVE: tokenPrices['aave'] || 100,
          MKR: tokenPrices['maker'] || 1700,
          WETH: tokenPrices['ethereum'] || 3000,
        };

        results.push({
          symbol: token.symbol,
          balance: bal,
          usdValue: bal * (priceMap[token.symbol] || 0),
        });
      }
    });
  } catch {
    // Token balances are best-effort
  }

  return results;
}

function computeGasStats(txs: RawTx[], ethPrice: number): {
  totalGasSpentEth: number;
  totalGasSpentUsd: number;
} {
  let totalGasEth = 0;
  for (const tx of txs) {
    const gasEth = Number(tx.gasUsed * tx.gasPrice) / 1e18;
    totalGasEth += gasEth;
  }
  return {
    totalGasSpentEth: totalGasEth,
    totalGasSpentUsd: totalGasEth * ethPrice,
  };
}

function computeGovernanceVotes(txs: RawTx[]): number {
  const govContracts = [
    '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
    '0x1f98431c8ad98523631ae4a59f267346ea31f984',
    '0x6b175474e89094c44da98b954eedeac495271d0f',
  ];
  return txs.filter(
    (tx) => tx.to && govContracts.some((c) => c.toLowerCase() === tx.to!.toLowerCase())
  ).length;
}

function computeSwapCount(txs: RawTx[]): number {
  return txs.filter((tx) => {
    const input = tx.input.slice(0, 10);
    return [
      '0x38ed1739', '0x7ff36ab5', '0x5c11d795',
      '0x022c0d9f', '0x49404b7c', '0x3593564c',
    ].includes(input);
  }).length;
}

function computeBiggestSwap(txs: RawTx[]): { usd: number; desc: string | null } {
  let biggest = 0;
  let desc: string | null = null;
  for (const tx of txs) {
    const val = Number(tx.value) / 1e18;
    if (val > biggest) {
      biggest = val;
      desc = `${val.toFixed(4)} ETH transfer`;
    }
  }
  return { usd: biggest * priceCache.eth, desc };
}

export async function analyzeWallet(input: string): Promise<WalletProfile> {
  const normalized = normalizeAddress(input) as `0x${string}`;

  const cached = await getCachedWallet(input);
  if (cached) return cached;

  const ensData: EnsDomain | null = isENSName(input)
    ? await resolveENS(input)
    : null;

  let address = normalized;
  let ensName = ensData?.name || null;
  let avatarUrl = null;

  if (ensData) {
    address = ensData.address as `0x${string}`;
    if (!ensName) {
      ensName = ensData.name;
    }
    if (ensName) {
      try {
        const client = getClient('eth');
        const avatar = await client.getEnsAvatar({ name: ensName });
        if (avatar) avatarUrl = avatar;
      } catch {}
    }
  } else {
    const reverseEns = await resolveENS(address);
    if (reverseEns) {
      ensName = reverseEns.name;
      try {
        const client = getClient('eth');
        const avatar = await client.getEnsAvatar({ name: reverseEns.name });
        if (avatar) avatarUrl = avatar;
      } catch {}
    }
  }

  const mainChain: ChainKey = 'eth';

  const [nativeBal, firstTxDate, txs, nfts] = await Promise.all([
    fetchNativeBalance(address, mainChain),
    getFirstTransactionDate(address, mainChain),
    fetchRecentTransactions(address, mainChain),
    fetchNFTs(address, mainChain),
  ]);

  const tokenBalances = await getTokenBalances(address, mainChain);
  const ethPrice = await fetchEthPrice();

  const gasStats = computeGasStats(txs, ethPrice);
  const governanceVotes = computeGovernanceVotes(txs);
  const swapCount = computeSwapCount(txs);
  const biggestSwap = computeBiggestSwap(txs);
  const protocols = detectProtocols(txs);

  const totalNftCount = nfts.length;
  const nftTransferCount = txs.filter(
    (tx) => tx.input.slice(0, 10) === '0x42842e0e' || tx.input.slice(0, 10) === '0x23b872dd'
  ).length;

  const walletAgeDays = firstTxDate ? daysFromDate(firstTxDate) : 0;
  const avgHoldDays = swapCount > 0 ? Math.min(walletAgeDays / swapCount, 365) : walletAgeDays;
  const swapFrequency = walletAgeDays > 0 ? (swapCount / walletAgeDays) * 30 : 0;

  const totalUsdValue = nativeBal.usdValue + tokenBalances.reduce((s, t) => s + t.usdValue, 0);

  const archetype = computeArchetype({
    walletAgeDays,
    totalTransactions: txs.length,
    nftTransferCount,
    uniqueProtocols: protocols.size,
    governanceVotes,
    airdropsReceived: 0,
    netWorthUsd: totalUsdValue,
    nativeBalanceEth: Number(nativeBal.balance) / 1e18,
    totalGasSpentUsd: gasStats.totalGasSpentUsd,
    totalVolumeTradedUsd: biggestSwap.usd,
    avgHoldDays,
    swapFrequency,
  });

  const legitimacyScore = computeLegitimacyScore({
    walletAgeDays,
    totalTransactions: txs.length,
    uniqueProtocols: protocols.size,
    governanceVotes,
    airdropsReceived: 0,
    totalGasSpentUsd: gasStats.totalGasSpentUsd,
    avgHoldDays,
    swapFrequency,
  });

  const archetypeFactors = computeArchetypeFactors({
    walletAgeDays,
    totalTransactions: txs.length,
    nftTransferCount,
    uniqueProtocols: protocols.size,
    governanceVotes,
    airdropsReceived: 0,
    netWorthUsd: totalUsdValue,
    nativeBalanceEth: Number(nativeBal.balance) / 1e18,
    totalGasSpentUsd: gasStats.totalGasSpentUsd,
    totalVolumeTradedUsd: biggestSwap.usd,
    avgHoldDays,
    swapFrequency,
  });

  const chainActivity: ChainActivity[] = [
    {
      chain: mainChain,
      label: CHAINS[mainChain].label,
      txCount: txs.length,
      netWorthUsd: totalUsdValue,
    },
  ];

  const profile: WalletProfile = {
    address,
    ensName,
    avatarUrl,
    firstTxDate,
    walletAgeDays,
    totalTransactions: txs.length,
    uniqueProtocols: protocols.size,
    chainsActive: chainActivity,
    netWorthUsd: totalUsdValue,
    nativeBalanceEth: Number(nativeBal.balance) / 1e18,
    totalGasSpentEth: gasStats.totalGasSpentEth,
    totalGasSpentUsd: gasStats.totalGasSpentUsd,
    totalVolumeTradedUsd: biggestSwap.usd,
    biggestSwapUsd: biggestSwap.usd,
    biggestSwapDescription: biggestSwap.desc,
    realizedPnlUsd: null,
    topNfts: nfts.slice(0, 3),
    totalNftCount,
    governanceVotes,
    airdropsReceived: 0,
    archetype,
    archetypeFactors,
    legitimacyScore,
    nftTransferCount,
    swapCount,
    avgHoldDays,
    swapFrequency,
  };

  profile.avatarUrl = avatarUrl;

  await cacheWallet(profile, CACHE_TTL.WALLET_PROFILE);

  return profile;
}