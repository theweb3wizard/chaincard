// LOCATION: chaincard/components/ShareButton.tsx
// ACTION: CREATE NEW FILE — goes directly inside components/ folder (NOT inside ui/)

"use client";

import { Share2 } from "lucide-react";
import { ARCHETYPES } from "@/constants";
import { getShareTweetText } from "@/lib/utils";
import type { ArchetypeKey } from "@/types";

interface ShareButtonProps {
  address: string;
  ensName: string | null;
  archetype: ArchetypeKey;
}

export default function ShareButton({ address, ensName, archetype }: ShareButtonProps) {
  const archetypeLabel = ARCHETYPES[archetype].label;

  function handleShare() {
    const tweetText = getShareTweetText(address, archetypeLabel, ensName);
    const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
    window.open(tweetUrl, "_blank", "noopener,noreferrer,width=600,height=400");
  }

  return (
    <button
      onClick={handleShare}
      className="
        flex items-center gap-2.5 px-5 py-3 rounded-xl
        bg-[#1DA1F2] hover:bg-[#1a8fd1]
        text-white font-display font-bold text-sm
        transition-all duration-150
        shadow-[0_4px_20px_rgba(29,161,242,0.3)]
        hover:shadow-[0_4px_30px_rgba(29,161,242,0.5)]
        active:scale-[0.98]
        min-h-[48px]
      "
    >
      <Share2 className="w-4 h-4" />
      Share on X
    </button>
  );
}