"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import WalletInput from "@/components/WalletInput";
import { APP_NAME, APP_TAGLINE } from "@/constants";
import { Zap, Shield, Share2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // Navigate to the card page
      const resolvedAddress = data.card.address;
      router.push(`/card/${resolvedAddress}`);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-void-950 relative overflow-hidden flex flex-col">
      {/* Background mesh */}
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

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--border-subtle) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-arc-500/20 border border-arc-500/30 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-arc-400" />
          </div>
          <span className="font-display font-700 text-white tracking-tight text-sm">
            {APP_NAME}
          </span>
        </div>
        <span className="text-xs text-white/30 font-mono hidden sm:block">
          on-chain identity
        </span>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        {/* Badge */}
        <div className="animate-fade-up stagger-1 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-arc-500/20 bg-arc-500/5 text-arc-400 text-xs font-mono mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-arc-400 animate-pulse-slow" />
          Any EVM wallet · Results in seconds
        </div>

        {/* Headline */}
        <h1 className="animate-fade-up stagger-2 font-display font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-white mb-4 max-w-3xl">
          Your wallet has
          <br />
          <span className="text-gradient-arc">a story.</span>
        </h1>
        <p className="animate-fade-up stagger-3 font-display font-semibold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-white/30 mb-8">
          Now it has a card.
        </p>

        <p className="animate-fade-up stagger-4 text-white/50 text-base sm:text-lg max-w-md mb-12 font-body leading-relaxed">
          Paste any Ethereum address or ENS name. Get a beautiful, shareable
          identity card — your archetype, stats, and on-chain legacy.
        </p>

        {/* Input */}
        <div className="animate-fade-up stagger-5 w-full max-w-xl">
          <WalletInput
            onSubmit={handleGenerate}
            isLoading={isLoading}
            error={error}
          />
        </div>

        {/* Example addresses */}
        <div className="animate-fade-up stagger-6 mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-white/30">
          <span>Try:</span>
          {["vitalik.eth", "hayden.eth", "punk6529.eth"].map((addr) => (
            <button
              key={addr}
              onClick={() => handleGenerate(addr)}
              disabled={isLoading}
              className="font-mono px-2 py-1 rounded border border-white/10 hover:border-arc-500/30 hover:text-arc-400 transition-colors disabled:opacity-50"
            >
              {addr}
            </button>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 px-6 pb-20 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: <Zap className="w-4 h-4" />,
              title: "Paste & Generate",
              desc: "Any EVM address or ENS name. No wallet connection needed.",
            },
            {
              icon: <Shield className="w-4 h-4" />,
              title: "Your On-Chain Identity",
              desc: "Archetype, age, gas burned, biggest swap, NFTs, and more.",
            },
            {
              icon: <Share2 className="w-4 h-4" />,
              title: "Share Your Card",
              desc: "One click to X. Your card renders as a full image in the tweet.",
            },
          ].map((step, i) => (
            <div
              key={i}
              className="card-glass rounded-xl p-5 flex flex-col gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-arc-500/10 border border-arc-500/20 flex items-center justify-center text-arc-400">
                {step.icon}
              </div>
              <p className="font-display font-semibold text-sm text-white">
                {step.title}
              </p>
              <p className="text-xs text-white/40 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center pb-8 text-xs text-white/20 font-mono">
        {APP_NAME} · chaincard-hq.vercel.app
      </footer>
    </main>
  );
}