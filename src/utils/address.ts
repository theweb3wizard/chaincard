export function normalizeAddress(address: string): string {
  return address.toLowerCase().trim() as `0x${string}`;
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  if (address.length < chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}

export function isENSName(input: string): boolean {
  const trimmed = input.trim().toLowerCase();
  return /^.{3,}\.eth$/.test(trimmed);
}

export function shortenIfAddress(value: string): string {
  if (isValidAddress(value)) return shortenAddress(value);
  return value;
}

export function truncateHash(hash: string, chars = 6): string {
  if (!hash || hash.length < chars * 2 + 2) return hash || '';
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

export function isValidENS(ens: string): boolean {
  return /^.{1,}\.(eth|xyz|app|com|org|dao|defi|nft|crypto|blockchain|bitcoin)$/i.test(ens);
}