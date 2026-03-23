// LOCATION: chaincard/components/ui/ChainBadge.tsx
// ACTION: CREATE NEW FILE — goes inside components/ui/ folder

import { CHAINS } from "@/constants";
import type { ChainKey } from "@/types";

interface ChainBadgeProps {
  chain: ChainKey;
  showNetWorth?: boolean;
  netWorthUsd?: number;
}

export default function ChainBadge({ chain, showNetWorth = false, netWorthUsd }: ChainBadgeProps) {
  const config = CHAINS[chain];

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono"
      style={{
        borderColor: `${config.color}30`,
        background: `${config.color}10`,
        color: config.color,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: config.color }}
      />
      {config.shortLabel}
      {showNetWorth && netWorthUsd !== undefined && netWorthUsd > 0 && (
        <span className="text-white/40 ml-0.5">
          ${netWorthUsd >= 1000 ? `${(netWorthUsd / 1000).toFixed(1)}K` : netWorthUsd.toFixed(0)}
        </span>
      )}
    </div>
  );
}