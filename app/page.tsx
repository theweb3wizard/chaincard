"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import WalletInput from "@/components/WalletInput";
import { APP_NAME } from "@/constants";
import { Zap, Star } from "lucide-react";
import DemoCard from "@/components/DemoCard";
import ProUpgrade from "@/components/ProUpgrade";

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProUpgrade, setShowProUpgrade] = useState(false);

  async function handleGenerate(address: string) {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Something went wrong. Please try again.");
        setIsLoading(false);
        return;
      }

      const resolvedAddress = data.card.address;
      router.push(`/card/${resolvedAddress}`);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-void-950 relative overflow-hidden flex flex-col">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(at 15% 15%, hsla(210,80%,20%,0.25) 0px, transparent 55%),
            radial-gradient(at 85% 85%, hsla(165,80%,15%,0.2) 0px, transparent 55%),
            radial-gradient(at 50% 100%, hsla(220,60%,10%,0.4) 0px, transparent 60%)
          `,
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--border-subtle) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-arc-500/20 border border-arc-500/30 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-arc-400" />
          </div>
          <span className="font-display font-700 text-white tracking-tight text-sm">
            {APP_NAME}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-white/30 font-mono hidden sm:block">
            on-chain identity
          </span>
          <button
            onClick={() => setShowProUpgrade(true)}
            className="px-3 py-1.5 bg-arc-500/10 border border-arc-500/20 rounded-lg text-arc-400 text-xs font-mono hover:bg-arc-500/20 transition-colors"
          >
            <Star className="w-3 h-3 inline mr-1" />
            Upgrade to Pro
          </button>
        </div>
      </header>

      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="animate-fade-up stagger-1 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-arc-500/20 bg-arc-500/5 text-arc-400 text-xs font-mono mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-arc-400 animate-pulse-slow" />
          Any EVM wallet · Results in seconds
        </div>

        <h1 className="animate-fade-up stagger-2 font-display font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-white mb-4 max-w-3xl">
          Your wallet has
          <br />
          <span className="text-gradient-arc">a story.</span>
        </h1>
        <p className="animate-fade-up stagger-3 font-display font-semibold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-white/30 mb-8">
          Now it has a card.
        </p>

        <p className="animate-fade-up stagger-4 text-white/50 text-base sm:text-lg max-w-md mb-12 font-body leading-relaxed">
          Paste any Ethereum address or ENS name. Get a beautiful, shareable identity card with your on-chain archetype, stats, and legitimacy score.
        </p>

        <div className="animate-fade-up stagger-5 w-full max-w-md mb-8">
          <WalletInput onSubmit={handleGenerate} isLoading={isLoading} error={error} />
        </div>

        <div className="animate-fade-up stagger-6">
          <DemoCard />
        </div>
      </section>

      {showProUpgrade && (
        <ProUpgrade onSuccess={() => setShowProUpgrade(false)} />
      )}
    </main>
  );
}
