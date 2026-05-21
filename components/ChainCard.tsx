// LOCATION: chaincard/components/ChainCard.tsx
// ACTION: REPLACE entire file

"use client";

import type { CardStats } from "@/types";
import { ARCHETYPES } from "@/constants";
import {
  formatUsd,
  formatNumber,
  formatEth,
  formatMonthYear,
  formatWalletAge,
  shortenAddress,
} from "@/lib/utils";
import StatBadge from "@/components/ui/StatBadge";
import ChainBadge from "@/components/ui/ChainBadge";
import NFTThumbnail from "@/components/ui/NFTThumbnail";
import type { ChainKey } from "@/types";

interface ChainCardProps {
  card: CardStats;
}

function formatNetWorth(card: CardStats): string {
  if (card.netWorthUsd >= 1) return formatUsd(card.netWorthUsd, true);
  if (card.nativeBalanceEth >= 0.0001) return formatEth(card.nativeBalanceEth);
  return "—";
}

function formatGas(card: CardStats): string {
  if (card.totalGasSpentUsd >= 0.01) return formatUsd(card.totalGasSpentUsd, true);
  if (card.totalGasSpentEth >= 0.0001) return formatEth(card.totalGasSpentEth);
  return "—";
}

export default function ChainCard({ card }: ChainCardProps) {
  const archConfig = ARCHETYPES[card.archetype];
  const displayName = card.ensName || shortenAddress(card.address, 4);

  return (
    <div
      id="chain-card"
      className="relative w-full max-w-lg mx-auto rounded-3xl overflow-hidden animate-scale-in border border-white/10"
      style={{
        background: "rgba(13, 17, 23, 0.65)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: `0 0 0 1px rgba(255,255,255,0.05), inset 0 0 32px rgba(255,255,255,0.02), 0 32px 80px rgba(0,0,0,0.8), 0 0 120px ${archConfig.glowColor}25`,
      }}
    >
      {/* Top color strip */}
      <div
        className="h-1 w-full"
        style={{ background: `linear-gradient(90deg, ${archConfig.glowColor}80, ${archConfig.glowColor}20)` }}
      />

      {/* Background glow */}
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${archConfig.glowColor}08 0%, transparent 70%)`,
          transform: "translate(30%, -30%)",
        }}
      />

      <div className="relative z-10 p-6 space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-full flex-shrink-0 border border-white/10 overflow-hidden"
            style={{ background: `conic-gradient(from 0deg, ${archConfig.glowColor}60, #1E2535, ${archConfig.glowColor}30, #1E2535)` }}
          >
            {card.avatarUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={card.avatarUrl}
                alt={displayName}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display font-bold text-white text-sm truncate">{displayName}</p>
            <p className="font-mono text-xs text-white/30 truncate">{shortenAddress(card.address, 6)}</p>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-xs text-white/30">on-chain since</p>
            <p className="font-mono text-xs text-white/60">{formatMonthYear(card.firstTxDate)}</p>
          </div>
        </div>

        {/* ── Archetype — fully inlined so html-to-image never mis-reflows it ── */}
        <div
          style={{
            background: `linear-gradient(135deg, ${archConfig.glowColor}15 0%, ${archConfig.glowColor}05 100%)`,
            border: `1px solid ${archConfig.glowColor}30`,
            borderRadius: "16px",
            padding: "20px",
            boxShadow: `inset 0 0 20px ${archConfig.glowColor}10`,
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Label row — inline-flex + nowrap guarantees single-line rendering */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: `${archConfig.glowColor}15`,
              border: `1px solid ${archConfig.glowColor}30`,
              borderRadius: "8px",
              padding: "6px 10px",
              maxWidth: "100%",
            }}
          >
            {/* Archetype emoji / icon */}
            <span style={{ fontSize: "16px", lineHeight: 1, flexShrink: 0 }}>
              {archConfig.emoji ?? "🎭"}
            </span>

            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.35)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                }}
              >
                Your archetype
              </span>
              <span
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: archConfig.glowColor,
                  whiteSpace: "nowrap",  // ← THE KEY FIX: never wraps
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                }}
              >
                {archConfig.label ?? card.archetype} • {card.legitimacyScore}/100
              </span>
            </div>
          </div>

          {/* Description */}
          <p
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.60)",
              marginTop: "12px",
              lineHeight: 1.6,
              letterSpacing: "0.01em",
            }}
          >
            {archConfig.description}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <StatBadge emoji="⚡" label="Total transactions" value={formatNumber(card.totalTransactions)} />
          <StatBadge emoji="📅" label="Wallet age"         value={formatWalletAge(card.firstTxDate)} />
          <StatBadge emoji="💸" label="Gas burned"         value={formatGas(card)} />
          <StatBadge emoji="💰" label="Net worth"          value={formatNetWorth(card)} />
          <StatBadge
            emoji="📊"
            label="Chains active"
            value={card.chainsActive.length > 0
              ? `${card.chainsActive.length} chain${card.chainsActive.length > 1 ? "s" : ""}`
              : "ETH only"}
          />
          <StatBadge
            emoji="🌐"
            label="Protocols"
            value={card.uniqueProtocols > 0 ? `${card.uniqueProtocols}+` : "—"}
          />
        </div>

        {/* Realized PnL */}
        {card.realizedPnlUsd !== null && (
          <StatBadge
            emoji={card.realizedPnlUsd >= 0 ? "📈" : "📉"}
            label="Realized PnL"
            value={(card.realizedPnlUsd >= 0 ? "+" : "") + formatUsd(card.realizedPnlUsd, true)}
          />
        )}

        {/* Active Chains */}
        {card.chainsActive.length > 0 && (
          <div>
            <p className="text-xs text-white/30 mb-2 font-body">Active on</p>
            <div className="flex flex-wrap gap-2 items-center">
              {card.chainsActive.map((c) => (
                <ChainBadge key={c.chain} chain={c.chain as ChainKey} showNetWorth netWorthUsd={c.netWorthUsd} />
              ))}
            </div>
          </div>
        )}

        {/* NFTs */}
        {card.topNfts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-white/30 font-body">NFTs held</p>
              {card.totalNftCount > 0 && (
                <p className="text-xs text-white/20 font-mono">{card.totalNftCount} total</p>
              )}
            </div>
            <div className="flex gap-2.5">
              {card.topNfts.map((nft, i) => <NFTThumbnail key={i} nft={nft} size={64} />)}
              {card.totalNftCount > 3 && (
                <div
                  className="w-16 h-16 rounded-xl border border-white/08 flex items-center justify-center text-xs text-white/30 font-mono flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  +{card.totalNftCount - 3}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Governance / Airdrops */}
        {(card.governanceVotes > 0 || card.airdropsReceived > 0) && (
          <div className="grid grid-cols-2 gap-2.5">
            {card.governanceVotes > 0 && (
              <StatBadge emoji="🏛️" label="Governance votes"  value={formatNumber(card.governanceVotes)} />
            )}
            {card.airdropsReceived > 0 && (
              <StatBadge emoji="🪂" label="Airdrops received" value={formatNumber(card.airdropsReceived)} />
            )}
          </div>
        )}

        {/* Empty wallet */}
        {card.totalTransactions === 0 && (
          <div
            className="rounded-xl p-3 border border-white/08 flex items-center gap-3"
            style={{ background: "rgba(255,255,255,0.02)" }}
          >
            <span className="text-lg">🌱</span>
            <div>
              <p className="text-xs font-display font-semibold text-white/60">Fresh wallet</p>
              <p className="text-xs text-white/30 font-body">No on-chain activity yet. The story is just beginning.</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="relative z-10 px-6 pb-5">
        <div className="h-px bg-white/05 mb-4" />
        <p className="font-mono text-xs text-white/20 text-center">chaincard.vercel.app</p>
      </div>
    </div>
  );
}