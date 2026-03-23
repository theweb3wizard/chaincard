// LOCATION: chaincard/components/DownloadButton.tsx
// ACTION: REPLACE entire file

"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

interface DownloadButtonProps {
  cardElementId: string;
  filename: string;
  // Legacy props — kept for interface compatibility, not used
  isUnlocked?: boolean;
  onUnlockClick?: () => void;
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
      if (!element) {
        console.error(`[DownloadButton] Element #${cardElementId} not found.`);
        return;
      }

      // ── 1. Measure full content dimensions before touching anything ──────────
      const fullWidth  = element.scrollWidth;
      const fullHeight = element.scrollHeight;

      // ── 2. Collect every ancestor that clips overflow ────────────────────────
      // Walk up the DOM and temporarily disable overflow clipping on any
      // ancestor that would crop the element during capture.
      type SavedStyle = { el: HTMLElement; overflow: string; height: string };
      const savedStyles: SavedStyle[] = [];

      let ancestor = element.parentElement;
      while (ancestor && ancestor !== document.body) {
        const cs = window.getComputedStyle(ancestor);
        const clips =
          cs.overflow  === "hidden" || cs.overflow  === "scroll" || cs.overflow  === "auto" ||
          cs.overflowY === "hidden" || cs.overflowY === "scroll" || cs.overflowY === "auto";
        if (clips) {
          savedStyles.push({
            el:       ancestor,
            overflow: ancestor.style.overflow,
            height:   ancestor.style.height,
          });
          ancestor.style.overflow = "visible";
          ancestor.style.height   = "auto";
        }
        ancestor = ancestor.parentElement;
      }

      // ── 3. Also temporarily unlock the element itself ────────────────────────
      const savedElOverflow  = element.style.overflow;
      const savedElHeight    = element.style.height;
      const savedElMaxHeight = element.style.maxHeight;
      element.style.overflow  = "visible";
      element.style.height    = `${fullHeight}px`;
      element.style.maxHeight = "none";

      // ── 4. One rAF + setTimeout so the browser repaints with new styles ──────
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => setTimeout(resolve, 50))
      );

      // ── 5. Capture the live element directly — no cloning ────────────────────
      const dataUrl = await toPng(element, {
        quality:         1,
        pixelRatio:      2,
        backgroundColor: "#0D1117",
        width:           fullWidth,
        height:          fullHeight,
        style: {
          overflow:     "visible",
          borderRadius: "16px",
        },
        filter: (node) => {
          const el = node as HTMLElement;
          if (!el.style) return true;
          // Strip fixed-position overlays (feedback widgets, banners, etc.)
          if (el.style.position === "fixed") return false;
          if (el.style.display  === "none")  return false;
          return true;
        },
      });

      // ── 6. Restore every style we mutated — in reverse order ─────────────────
      element.style.overflow  = savedElOverflow;
      element.style.height    = savedElHeight;
      element.style.maxHeight = savedElMaxHeight;

      for (const { el, overflow, height } of savedStyles.reverse()) {
        el.style.overflow = overflow;
        el.style.height   = height;
      }

      // ── 7. Trigger download ───────────────────────────────────────────────────
      const link    = document.createElement("a");
      link.download = `${filename}.png`;
      link.href     = dataUrl;
      link.click();

    } catch (err) {
      console.error("[DownloadButton] Capture failed:", err);
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