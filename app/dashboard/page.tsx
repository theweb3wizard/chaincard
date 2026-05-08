"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-void-950 text-white flex items-center justify-center px-6 py-16">
      <div className="max-w-3xl w-full rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl shadow-black/20">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-green-500/10 text-green-400">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-bold">Pro is active</h1>
          <p className="max-w-lg text-white/70 leading-relaxed">
            Your payment was verified and your ChainCard Pro access is now enabled. Return to the homepage to generate new cards, or keep an eye out for future saved-card and export features.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-arc-500 px-5 py-3 text-sm font-semibold text-void-950 transition hover:bg-arc-400"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </div>
    </main>
  );
}
