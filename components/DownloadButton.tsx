// LOCATION: chaincard/components/DownloadButton.tsx
// ACTION: REPLACE entire file

"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

interface DownloadButtonProps {
  cardElementId: string;
  filename: string;
  isUnlocked: boolean;
  onUnlockClick: () => void;
}

export default function DownloadButton({
  cardElementId,
  filename,
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    setIsDownloading(true);
    try {
      const { toPng } = await import("html-to-image");
      const element = document.getElementById(cardElementId);
      if (!element) return;

      // Scroll element into view fully before capture
      element.scrollIntoView({ behavior: "instant", block: "start" });

      // Wait a tick for scroll + any repaints to settle
      await new Promise((r) => setTimeout(r, 120));

      const dataUrl = await toPng(element, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#0D1117",
        // Explicitly set dimensions to the element's full scroll size
        width: element.offsetWidth,
        height: element.scrollHeight,
        style: {
          // Remove any overflow clipping during capture
          overflow: "visible",
          borderRadius: "16px",
        },
        filter: (node) => {
          // Skip any fixed-position overlays (feedback widget, etc)
          const el = node as HTMLElement;
          if (!el.style) return true;
          return el.style.position !== "fixed";
        },
      });

      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="
        flex items-center gap-2.5 px-5 py-3 rounded-xl
        border border-white/10
        bg-white/05 hover:bg-white/08
        text-white/70 hover:text-white
        font-display font-semibold text-sm
        transition-all duration-150
        disabled:opacity-50
        min-h-[48px]
      "
    >
      {isDownloading
        ? <Loader2 className="w-4 h-4 animate-spin" />
        : <Download className="w-4 h-4" />
      }
      {isDownloading ? "Generating..." : "Download PNG"}
    </button>
  );
}