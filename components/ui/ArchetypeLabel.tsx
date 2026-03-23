// LOCATION: chaincard/components/ui/ArchetypeLabel.tsx
// ACTION: CREATE NEW FILE — goes inside components/ui/ folder

import { ARCHETYPES } from "@/constants";
import type { ArchetypeKey } from "@/types";

interface ArchetypeLabelProps {
  archetype: ArchetypeKey;
  size?: "sm" | "md" | "lg";
}

export default function ArchetypeLabel({ archetype, size = "md" }: ArchetypeLabelProps) {
  const config = ARCHETYPES[archetype];

  const sizeClasses = {
    sm: "text-sm px-3 py-1.5",
    md: "text-base px-4 py-2",
    lg: "text-lg px-5 py-3",
  };

  const emojiSize = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div
      className={`inline-flex items-center gap-2.5 rounded-xl border ${sizeClasses[size]} ${config.bgColor}`}
      style={{
        borderColor: `${config.glowColor}30`,
        boxShadow: `0 0 20px ${config.glowColor}10`,
      }}
    >
      <span className={emojiSize[size]}>{config.emoji}</span>
      <div>
        <p className="text-xs text-white/40 font-body leading-none mb-0.5">Your archetype</p>
        <p className={`font-display font-bold leading-tight ${config.color}`}>{config.label}</p>
      </div>
    </div>
  );
}