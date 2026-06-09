import { openDB, type IDBPDatabase } from 'idb';
import type { WalletProfile, CacheEntry, SavedCard } from '@/types';

const DB_NAME = 'chaincard-nexus';
const DB_VERSION = 1;

interface ChainCardDB {
  wallets: {
    key: string;
    value: CacheEntry<WalletProfile>;
    indexes: { 'by-archetype': string };
  };
  transactions: {
    key: string;
    value: CacheEntry<any[]>;
  };
  nfts: {
    key: string;
    value: CacheEntry<any[]>;
  };
  tokens: {
    key: string;
    value: CacheEntry<any[]>;
  };
  ens: {
    key: string;
    value: CacheEntry<{ address: string; name: string }>;
  };
  savedCards: {
    key: string;
    value: SavedCard;
    indexes: { 'by-timestamp': number };
  };
  settings: {
    key: string;
    value: any;
  };
}

let dbPromise: Promise<IDBPDatabase<ChainCardDB>> | null = null;

function getDB(): Promise<IDBPDatabase<ChainCardDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ChainCardDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('wallets')) {
          const walletStore = db.createObjectStore('wallets', { keyPath: 'address' });
          walletStore.createIndex('by-archetype', 'archetype');
        }
        if (!db.objectStoreNames.contains('transactions')) {
          db.createObjectStore('transactions');
        }
        if (!db.objectStoreNames.contains('nfts')) {
          db.createObjectStore('nfts');
        }
        if (!db.objectStoreNames.contains('tokens')) {
          db.createObjectStore('tokens');
        }
        if (!db.objectStoreNames.contains('ens')) {
          db.createObjectStore('ens');
        }
        if (!db.objectStoreNames.contains('savedCards')) {
          const savedStore = db.createObjectStore('savedCards', { keyPath: 'address' });
          savedStore.createIndex('by-timestamp', 'timestamp');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      },
    });
  }
  return dbPromise;
}

function isExpired<T>(entry: CacheEntry<T>): boolean {
  return Date.now() - entry.timestamp > entry.ttl;
}

export async function getCachedWallet(address: string): Promise<WalletProfile | null> {
  try {
    const db = await getDB();
    const entry = await db.get('wallets', address.toLowerCase());
    if (!entry || isExpired(entry)) {
      if (entry) await db.delete('wallets', address.toLowerCase());
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export async function cacheWallet(profile: WalletProfile, ttl: number): Promise<void> {
  try {
    const db = await getDB();
    const entry: CacheEntry<WalletProfile> = {
      data: profile,
      timestamp: Date.now(),
      ttl,
    };
    await db.put('wallets', entry, profile.address.toLowerCase());
  } catch {
    console.warn('Failed to cache wallet');
  }
}

export async function getCachedTransactions(address: string): Promise<any[] | null> {
  try {
    const db = await getDB();
    const entry = await db.get('transactions', address.toLowerCase());
    if (!entry || isExpired(entry)) {
      if (entry) await db.delete('transactions', address.toLowerCase());
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export async function cacheTransactions(address: string, txs: any[], ttl: number): Promise<void> {
  try {
    const db = await getDB();
    const entry: CacheEntry<any[]> = {
      data: txs,
      timestamp: Date.now(),
      ttl,
    };
    await db.put('transactions', entry, address.toLowerCase());
  } catch {
    console.warn('Failed to cache transactions');
  }
}

export async function getCachedNFTs(address: string): Promise<any[] | null> {
  try {
    const db = await getDB();
    const entry = await db.get('nfts', address.toLowerCase());
    if (!entry || isExpired(entry)) {
      if (entry) await db.delete('nfts', address.toLowerCase());
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export async function cacheNFTs(address: string, nfts: any[], ttl: number): Promise<void> {
  try {
    const db = await getDB();
    const entry: CacheEntry<any[]> = {
      data: nfts,
      timestamp: Date.now(),
      ttl,
    };
    await db.put('nfts', entry, address.toLowerCase());
  } catch {
    console.warn('Failed to cache NFTs');
  }
}

export async function getCachedTokens(address: string): Promise<any[] | null> {
  try {
    const db = await getDB();
    const entry = await db.get('tokens', address.toLowerCase());
    if (!entry || isExpired(entry)) {
      if (entry) await db.delete('tokens', address.toLowerCase());
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export async function cacheTokens(address: string, tokens: any[], ttl: number): Promise<void> {
  try {
    const db = await getDB();
    const entry: CacheEntry<any[]> = {
      data: tokens,
      timestamp: Date.now(),
      ttl,
    };
    await db.put('tokens', entry, address.toLowerCase());
  } catch {
    console.warn('Failed to cache tokens');
  }
}

export async function getCachedENS(name: string): Promise<{ address: string; name: string } | null> {
  try {
    const db = await getDB();
    const entry = await db.get('ens', name.toLowerCase());
    if (!entry || isExpired(entry)) {
      if (entry) await db.delete('ens', name.toLowerCase());
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export async function cacheENS(name: string, data: { address: string; name: string }, ttl: number): Promise<void> {
  try {
    const db = await getDB();
    const entry: CacheEntry<{ address: string; name: string }> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    await db.put('ens', entry, name.toLowerCase());
  } catch {
    console.warn('Failed to cache ENS');
  }
}

export async function getSavedCards(): Promise<SavedCard[]> {
  try {
    const db = await getDB();
    const index = db.transaction('savedCards').store.index('by-timestamp');
    return await index.getAll();
  } catch {
    return [];
  }
}

export async function saveCard(card: SavedCard): Promise<void> {
  try {
    const db = await getDB();
    await db.put('savedCards', card);
    localStorage.setItem('chaincard_saved_cards', JSON.stringify(await getSavedCards()));
  } catch {
    console.warn('Failed to save card');
  }
}

export async function removeSavedCard(address: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('savedCards', address.toLowerCase());
    localStorage.setItem('chaincard_saved_cards', JSON.stringify(await getSavedCards()));
  } catch {
    console.warn('Failed to remove saved card');
  }
}

export async function isCardSaved(address: string): Promise<boolean> {
  try {
    const db = await getDB();
    const card = await db.get('savedCards', address.toLowerCase());
    return !!card;
  } catch {
    return false;
  }
}

export async function getSetting<T>(key: string): Promise<T | null> {
  try {
    const db = await getDB();
    return await db.get('settings', key);
  } catch {
    return null;
  }
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  try {
    const db = await getDB();
    await db.put('settings', value, key);
  } catch {
    console.warn('Failed to save setting');
  }
}

export async function clearAllCache(): Promise<void> {
  try {
    const db = await getDB();
    await db.clear('wallets');
    await db.clear('transactions');
    await db.clear('nfts');
    await db.clear('tokens');
    await db.clear('ens');
  } catch {
    console.warn('Failed to clear cache');
  }
}

export async function getCacheStats(): Promise<{
  wallets: number;
  transactions: number;
  nfts: number;
  tokens: number;
  ens: number;
  savedCards: number;
  sizeEstimate: string;
}> {
  try {
    const db = await getDB();
    const wallets = await db.count('wallets');
    const transactions = await db.count('transactions');
    const nfts = await db.count('nfts');
    const tokens = await db.count('tokens');
    const ens = await db.count('ens');
    const savedCards = await db.count('savedCards');

    const estimate = (wallets + transactions + nfts + tokens + ens) * 5000 + savedCards * 1000;
    const sizeStr = estimate > 1_000_000
      ? `${(estimate / 1_000_000).toFixed(1)} MB`
      : `${(estimate / 1_000).toFixed(0)} KB`;

    return { wallets, transactions, nfts, tokens, ens, savedCards, sizeEstimate: sizeStr };
  } catch {
    return { wallets: 0, transactions: 0, nfts: 0, tokens: 0, ens: 0, savedCards: 0, sizeEstimate: '0 KB' };
  }
}