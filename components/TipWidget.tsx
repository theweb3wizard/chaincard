// LOCATION: chaincard/components/TipWidget.tsx
// ACTION: CREATE NEW FILE — goes directly inside components/ folder

"use client";

import { useState } from "react";
import { Heart, X, Copy, Check, ExternalLink } from "lucide-react";

const WALLET_ADDRESS = "0x6b9B30140FedE235Adb27d09Df71E2a30A07e832";
const SHORT_ADDRESS = "0x6b9B...e832";

export default function TipWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(WALLET_ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that block clipboard
      const el = document.createElement("textarea");
      el.value = WALLET_ADDRESS;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <>
      {/* Floating button — left side, mirrors feedback on right */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 left-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 font-display font-semibold text-sm transition-all duration-200 shadow-lg"
        style={{
          background: "rgba(22, 27, 39, 0.95)",
          backdropFilter: "blur(12px)",
          color: "rgba(255,255,255,0.7)",
        }}
      >
        {isOpen
          ? <X className="w-4 h-4" />
          : <Heart className="w-4 h-4 text-pink-400" />
        }
        {!isOpen && <span>Tip jar</span>}
      </button>

      {/* Tip panel */}
      {isOpen && (
        <div
          className="fixed bottom-16 left-5 z-50 w-72 rounded-2xl border border-white/08 overflow-hidden shadow-2xl animate-scale-in"
          style={{
            background: "linear-gradient(145deg, #161B27, #0D1117)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 24px 64px rgba(0,0,0,0.8)",
          }}
        >
          {/* Top strip */}
          <div
            className="h-0.5 w-full"
            style={{ background: "linear-gradient(90deg, #F472B680, #FB923C20)" }}
          />

          <div className="p-5 space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-400/10 border border-pink-400/20 flex items-center justify-center flex-shrink-0">
                <Heart className="w-4 h-4 text-pink-400" />
              </div>
              <div>
                <p className="font-display font-bold text-white text-sm">Support the builder</p>
                <p className="text-xs text-white/40 leading-relaxed mt-0.5">
                  ChainCard is free forever. If it helped you, a tip keeps new tools coming.
                </p>
              </div>
            </div>

            {/* Wallet address box */}
            <div
              className="rounded-xl p-3 border border-white/08 space-y-2"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/30 font-body">ETH · ERC-20 tokens accepted</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
                  <span className="text-xs text-emerald-400 font-mono">Ethereum</span>
                </div>
              </div>

              {/* Address display */}
              <p className="font-mono text-xs text-white/70 break-all leading-relaxed">
                {WALLET_ADDRESS}
              </p>

              {/* Copy button */}
              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-white/08 text-xs font-display font-semibold transition-all duration-150"
                style={{
                  background: copied ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.04)",
                  color: copied ? "#34D399" : "rgba(255,255,255,0.6)",
                  borderColor: copied ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.08)",
                }}
              >
                {copied
                  ? <><Check className="w-3.5 h-3.5" /> Copied!</>
                  : <><Copy className="w-3.5 h-3.5" /> Copy address</>
                }
              </button>
            </div>

            {/* View on Etherscan */}
            <a
              href={`https://etherscan.io/address/${WALLET_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-xs text-white/25 hover:text-white/50 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              View on Etherscan
            </a>
          </div>
        </div>
      )}
    </>
  );
}