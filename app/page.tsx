"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import WalletInput from "@/components/WalletInput";
import { APP_NAME } from "@/constants";
import { Zap, ChevronRight } from "lucide-react";
import DemoCard from "@/components/DemoCard";

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedCards, setSavedCards] = useState<any[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("chaincard_saved_cards");
      if (saved) {
        setSavedCards(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

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

        {savedCards.length > 0 && (
          <div className="animate-fade-up stagger-6 mt-16 w-full max-w-2xl text-left">
            <h3 className="font-display font-semibold text-lg text-white/80 mb-4 border-b border-white/10 pb-2">Your Saved Cards</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {savedCards.map((c: any) => (
                <Link
                  key={c.address}
                  href={`/card/${c.address}`}
                  className="flex items-center justify-between p-4 rounded-xl border border-white/05 bg-white/02 hover:bg-white/05 hover:border-white/10 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-void-900 flex items-center justify-center text-xs">
                      {c.avatarUrl ? (
                        <img src={c.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        "⚡"
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-display font-semibold text-sm text-white/90">
                        {c.ensName || `${c.address.slice(0, 6)}...${c.address.slice(-4)}`}
                      </span>
                      <span className="text-xs text-white/40">{c.archetype}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
