// LOCATION: chaincard/components/ui/NFTThumbnail.tsx
// ACTION: CREATE NEW FILE — goes inside components/ui/ folder

import Image from "next/image";
import type { NFTItem } from "@/types";

interface NFTThumbnailProps {
  nft: NFTItem;
  size?: number;
}

export default function NFTThumbnail({ nft, size = 64 }: NFTThumbnailProps) {
  const displayName = nft.name || `#${nft.tokenId.slice(0, 6)}`;

  return (
    <div
      className="relative rounded-xl overflow-hidden border border-white/08 flex-shrink-0 group"
      style={{ width: size, height: size }}
      title={`${displayName} — ${nft.collection}`}
    >
      {nft.imageUrl ? (
        <Image
          src={nft.imageUrl}
          alt={displayName}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          unoptimized
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-xl"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          🖼️
        </div>
      )}
      {/* Name on hover */}
      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-1">
        <p className="text-white text-[9px] text-center font-mono leading-tight line-clamp-2">
          {displayName}
        </p>
      </div>
    </div>
  );
}