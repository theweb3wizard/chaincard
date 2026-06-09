import {
  createPublicClient,
  http,
  type PublicClient,
  type Chain,
  fallback,
} from 'viem';
import { mainnet, base, polygon, bsc, arbitrum, optimism, avalanche } from 'viem/chains';
import { PUBLIC_RPC_FALLBACKS, CHAINS, ALL_CHAINS } from '@/constants';
import type { ChainKey, RpcStatus } from '@/types';

interface RpcClientEntry {
  client: PublicClient;
  chainId: number;
  lastBlockHeight: bigint;
  lastLatency: number;
  healthy: boolean;
}

const clients = new Map<number, RpcClientEntry>();
const chainMap: Record<number, Chain> = {
  1: mainnet,
  8453: base,
  137: polygon,
  56: bsc,
  42161: arbitrum,
  10: optimism,
  43114: avalanche,
};

async function measureLatency(url: string): Promise<number> {
  const start = performance.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return performance.now() - start;
  } catch {
    return Infinity;
  }
}

function getOrCreateClient(chainKey: ChainKey): RpcClientEntry {
  const chainId = CHAINS[chainKey].chainId;
  if (clients.has(chainId)) {
    return clients.get(chainId)!;
  }

  const fallbackUrls = PUBLIC_RPC_FALLBACKS[chainId] || [CHAINS[chainKey].rpcUrl];
  const viemChain = chainMap[chainId];

  const transports = fallbackUrls.map(
    (url) => http(url, {
      retryCount: 2,
      retryDelay: 500,
      timeout: 10000,
    })
  );

  const client = createPublicClient({
    chain: viemChain,
    transport: fallback(transports),
    batch: {
      multicall: true,
    },
  });

  const entry: RpcClientEntry = {
    client,
    chainId,
    lastBlockHeight: 0n,
    lastLatency: 0,
    healthy: true,
  };

  clients.set(chainId, entry);
  return entry;
}

export async function checkHealth(chainKey: ChainKey): Promise<RpcStatus> {
  const chainId = CHAINS[chainKey].chainId;
  const entry = getOrCreateClient(chainKey);
  const urls = PUBLIC_RPC_FALLBACKS[chainId] || [CHAINS[chainKey].rpcUrl];

  let bestLatency = Infinity;
  let bestBlock = 0n;

  for (const url of urls) {
    const latency = await measureLatency(url);
    if (latency < bestLatency) {
      bestLatency = latency;
    }
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json();
      const blockHeight = BigInt(data.result);
      if (blockHeight > bestBlock) {
        bestBlock = blockHeight;
      }
    } catch {
      continue;
    }
  }

  entry.lastBlockHeight = bestBlock;
  entry.lastLatency = bestLatency;
  entry.healthy = bestBlock > 0n;

  return {
    chainId,
    healthy: entry.healthy,
    blockHeight: bestBlock,
    latency: bestLatency,
    lastChecked: Date.now(),
  };
}

export function getClient(chainKey: ChainKey): PublicClient {
  const entry = getOrCreateClient(chainKey);
  return entry.client;
}

export async function getBlockNumber(chainKey: ChainKey): Promise<bigint> {
  const client = getClient(chainKey);
  return client.getBlockNumber();
}

export async function getBalance(
  address: `0x${string}`,
  chainKey: ChainKey
): Promise<bigint> {
  const client = getClient(chainKey);
  return client.getBalance({ address });
}

export async function getTransactionCount(
  address: `0x${string}`,
  chainKey: ChainKey
): Promise<number> {
  const client = getClient(chainKey);
  return client.getTransactionCount({ address });
}

export async function multicall(
  contracts: { address: `0x${string}`; abi: any; functionName: string; args?: any[] }[],
  chainKey: ChainKey
): Promise<any[]> {
  const client = getClient(chainKey);
  return client.multicall({ contracts });
}

export async function readContract(
  address: `0x${string}`,
  abi: any,
  functionName: string,
  args: any[],
  chainKey: ChainKey
): Promise<any> {
  const client = getClient(chainKey);
  return client.readContract({
    address,
    abi,
    functionName,
    args,
  });
}

export function resolveChainId(chainKey: ChainKey): number {
  return CHAINS[chainKey].chainId;
}

export function resolveChainKey(chainId: number): ChainKey | null {
  const entry = Object.entries(CHAINS).find(
    ([, config]) => config.chainId === chainId
  );
  return (entry?.[0] as ChainKey) || null;
}

export async function getBlock(chainKey: ChainKey, blockNumber: bigint) {
  const client = getClient(chainKey);
  return client.getBlock({ blockNumber });
}

export async function getTransactionReceipt(
  chainKey: ChainKey,
  txHash: `0x${string}`
) {
  const client = getClient(chainKey);
  return client.getTransactionReceipt({ hash: txHash });
}

export { getOrCreateClient, measureLatency };