// LOCATION: chaincard/app/success/page.tsx
// ACTION: CREATE NEW FILE
//   1. Inside app/, create folder: success
//   2. Inside success/, create file: page.tsx
//   3. Paste this entire file into it

"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Zap } from "lucide-react";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const address = searchParams.get("address");

  return (
    <main className="min-h-screen bg-void-950 flex flex-col items-center justify-center px-6 text-center">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(at 50% 40%, hsla(165,80%,15%,0.2) 0px, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-sm space-y-6 animate-scale-in">
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-arc-500/10 border border-arc-500/20 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-arc-400" />
          </div>
        </div>

        <div>
          <h1 className="font-display font-extrabold text-2xl text-white mb-2">Card Unlocked!</h1>
          <p className="text-white/50 font-body text-sm leading-relaxed">
            Your full ChainCard is ready. All 5 chains, no watermark, and a permanent shareable URL.
          </p>
        </div>

        {address ? (
          <Link
            href={`/card/${address}`}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-arc-500 hover:bg-arc-400 text-void-950 font-display font-bold text-sm transition-all duration-150 shadow-[0_4px_20px_rgba(77,255,210,0.25)]"
          >
            <Zap className="w-4 h-4" />
            View My Full Card
          </Link>
        ) : (
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-arc-500 hover:bg-arc-400 text-void-950 font-display font-bold text-sm transition-all duration-150"
          >
            Back to Home
          </Link>
        )}

        <p className="text-xs text-white/25 font-mono">chaincard-hq.vercel.app</p>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}