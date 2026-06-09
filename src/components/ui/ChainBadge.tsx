import type { ChainKey } from '@/types';
import { CHAINS } from '@/constants';

interface ChainBadgeProps {
  chain: ChainKey;
  label?: string;
}

export default function ChainBadge({ chain, label }: ChainBadgeProps) {
  const config = CHAINS[chain];
  if (!config) return null;

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono font-medium"
      style={{
        borderColor: `${config.color}30`,
        background: `${config.color}10`,
        color: config.color,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: config.color }}
      />
      {label || config.shortLabel}
    </div>
  );
}