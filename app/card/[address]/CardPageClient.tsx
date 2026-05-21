// LOCATION: chaincard/app/card/[address]/CardPageClient.tsx
// ACTION: REPLACE entire file

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { CardStats } from "@/types";
import { ARCHETYPES, APP_NAME } from "@/constants";
import { shortenAddress } from "@/lib/utils";
import ChainCard from "@/components/ChainCard";
import SkeletonCard from "@/components/ui/SkeletonCard";
import ShareButton from "@/components/ShareButton";
import DownloadButton from "@/components/DownloadButton";
import { Zap, ArrowLeft, RefreshCw, Bookmark, BookmarkCheck } from "lucide-react";

interface CardPageClientProps {
  address: string;
  initialCard: CardStats | null;
  initialUnlocked: boolean;
}

export default function CardPageClient({ address, initialCard }: CardPageClientProps) {
  const [card, setCard] = useState<CardStats | null>(initialCard);
  const [isLoading, setIsLoading] = useState(!initialCard);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!initialCard) generateCard();
    checkIfSaved();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function checkIfSaved() {
    const saved = localStorage.getItem("chaincard_saved_cards");
    if (saved) {
      const cards = JSON.parse(saved);
      if (cards.some((c: any) => c.address.toLowerCase() === address.toLowerCase())) {
        setIsSaved(true);
      }
    }
  }

  function handleSaveCard() {
    if (!card) return;
    try {
      const saved = localStorage.getItem("chaincard_saved_cards");
      let cards = saved ? JSON.parse(saved) : [];
      if (!isSaved) {
        cards.push({ address: card.address, ensName: card.ensName, archetype: card.archetype, avatarUrl: card.avatarUrl, timestamp: Date.now() });
        setIsSaved(true);
      } else {
        cards = cards.filter((c: any) => c.address.toLowerCase() !== card.address.toLowerCase());
        setIsSaved(false);
      }
      localStorage.setItem("chaincard_saved_cards", JSON.stringify(cards));
    } catch (e) {
      console.error("Failed to save card", e);
    }
  }

  async function generateCard() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Failed to generate card."); return; }
      setCard(data.card);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRegenerating(false);
    }
  }

  const displayName = card?.ensName || shortenAddress(address, 4);
  const archetypeConfig = card ? ARCHETYPES[card.archetype] : null;

  return (
    <main className="min-h-screen bg-void-950 relative overflow-hidden" style={{ backgroundColor: "#080B12" }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: archetypeConfig
            ? `radial-gradient(at 60% 20%, ${archetypeConfig.glowColor}08 0px, transparent 55%)`
            : undefined,
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-2xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-arc-500/20 border border-arc-500/30 flex items-center justify-center">
              <Zap className="w-2.5 h-2.5 text-arc-400" />
            </div>
            <span className="font-display font-bold text-white/60 text-xs">{APP_NAME}</span>
          </div>
        </Link>
        <button
          onClick={() => { setIsRegenerating(true); generateCard(); }}
          disabled={isLoading || isRegenerating}
          className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors disabled:opacity-30"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </header>

      <div className="relative z-10 px-4 pb-20 max-w-2xl mx-auto">
        {isLoading && <SkeletonCard />}

        {!isLoading && error && (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">⚠️</p>
            <p className="font-display font-bold text-white text-lg mb-2">Couldn&apos;t load this wallet</p>
            <p className="text-white/40 text-sm mb-6 max-w-sm mx-auto">{error}</p>
            <button
              onClick={generateCard}
              className="px-5 py-2.5 rounded-xl bg-arc-500/10 border border-arc-500/20 text-arc-400 text-sm font-display font-semibold hover:bg-arc-500/20 transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && card && (
          <div className="space-y-5">
            <div className="text-center animate-fade-up stagger-1">
              <p className="text-white/40 text-sm font-body mb-1">On-chain identity for</p>
              <p className="font-display font-bold text-white text-lg">{displayName}</p>
            </div>

            <div className="animate-fade-up stagger-2">
              <ChainCard card={card} />
            </div>

            {/* Actions — Share + Download only, no paywall */}
            {card.totalTransactions > 0 && (
              <div className="animate-fade-up stagger-3 flex flex-col sm:flex-row gap-3 pt-1">
                <ShareButton address={address} ensName={card.ensName} archetype={card.archetype} />
                <DownloadButton
                  cardElementId="chain-card"
                  filename={`chaincard-${displayName}`}
                  isUnlocked={true}
                  onUnlockClick={() => {}}
                />
                <button
                  onClick={handleSaveCard}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border font-display font-semibold text-sm transition-all duration-150
                    ${isSaved ? "bg-arc-500/20 border-arc-500/30 text-arc-400" : "bg-white/05 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"}`}
                >
                  {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  {isSaved ? "Saved" : "Save Card"}
                </button>
              </div>
            )}

            <div className="animate-fade-up stagger-4 text-center pt-4 border-t border-white/05">
              <p className="text-white/30 text-sm mb-3 font-body">What&apos;s your on-chain identity?</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/03 text-white/60 hover:text-white hover:border-white/20 text-sm font-display font-semibold transition-all duration-150"
              >
                Generate your own card →
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}