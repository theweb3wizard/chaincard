// LOCATION: chaincard/app/card/[address]/opengraph-image.tsx
// ACTION: CREATE NEW FILE — goes in the same [address] folder as page.tsx
// This file auto-generates the image that appears when a card URL is shared on X/Twitter

import { ImageResponse } from "next/og";
import { getCachedCard } from "@/lib/supabase";
import {
  normalizeAddress,
  shortenAddress,
  formatUsd,
  formatNumber,
  formatMonthYear,
} from "@/lib/utils";
import { ARCHETYPES } from "@/constants";

export const runtime = "nodejs";
export const revalidate = 3600;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface PageProps {
  params: Promise<{ address: string }>;
}

export default async function OGImage({ params }: PageProps) {
  const { address } = await params;
  const normalized = normalizeAddress(address);
  const cached = await getCachedCard(normalized);

  // Fallback image if card hasn't been generated yet
  if (!cached) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(145deg, #0D1117, #161B27)",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <div style={{ fontSize: "64px" }}>⚡</div>
            <div style={{ fontSize: "36px", color: "#fff", fontWeight: "800" }}>ChainCard</div>
            <div style={{ fontSize: "18px", color: "rgba(255,255,255,0.4)" }}>
              Your wallet has a story. Now it has a card.
            </div>
            <div style={{ fontSize: "14px", color: "#4DFFD2", marginTop: "8px" }}>
              chaincard-hq.vercel.app
            </div>
          </div>
        </div>
      ),
      { ...size }
    );
  }

  const card = cached.card_data;
  const archConfig = ARCHETYPES[cached.archetype];
  const displayName = card.ensName || shortenAddress(normalized, 5);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          background: "linear-gradient(145deg, #080B12 0%, #0D1117 40%, #161B27 100%)",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow blobs */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${archConfig.glowColor}15 0%, transparent 70%)`,
          }}
        />

        {/* Left — main identity */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "60px 40px 60px 60px",
            gap: "24px",
          }}
        >
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: `${archConfig.glowColor}20`,
                border: `1px solid ${archConfig.glowColor}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
              }}
            >
              ⚡
            </div>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", letterSpacing: "0.1em" }}>
              CHAINCARD
            </span>
          </div>

          {/* Wallet name */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "15px" }}>On-chain identity</div>
            <div style={{ color: "#ffffff", fontSize: "28px", fontWeight: "800" }}>{displayName}</div>
          </div>

          {/* Archetype — the hero */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "20px 24px",
              borderRadius: "16px",
              background: `${archConfig.glowColor}10`,
              border: `1px solid ${archConfig.glowColor}25`,
            }}
          >
            <div style={{ fontSize: "48px" }}>{archConfig.emoji}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>YOUR ARCHETYPE</div>
              <div style={{ color: archConfig.glowColor, fontSize: "32px", fontWeight: "800" }}>
                {archConfig.label}
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "15px", lineHeight: "1.5", maxWidth: "460px" }}>
            {archConfig.description}
          </div>
        </div>

        {/* Right — stats panel */}
        <div
          style={{
            width: "380px",
            display: "flex",
            flexDirection: "column",
            padding: "60px 40px 60px 20px",
            gap: "12px",
          }}
        >
          {[
            { emoji: "⚡", label: "Transactions", value: formatNumber(card.totalTransactions) },
            { emoji: "📅", label: "On-chain since", value: formatMonthYear(card.firstTxDate) },
            {
              emoji: "💸",
              label: "Gas burned",
              value: card.totalGasSpentUsd > 0 ? formatUsd(card.totalGasSpentUsd, true) : "< $1",
            },
            {
              emoji: "💰",
              label: "Net worth",
              value: card.netWorthUsd > 0 ? formatUsd(card.netWorthUsd, true) : "—",
            },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                padding: "14px 16px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", display: "flex", gap: "6px" }}>
                <span>{stat.emoji}</span>
                {stat.label}
              </div>
              <div style={{ color: "#ffffff", fontSize: "18px", fontWeight: "700" }}>{stat.value}</div>
            </div>
          ))}

          {/* Chain pills */}
          {card.chainsActive.length > 0 && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "4px" }}>
              {card.chainsActive.slice(0, 4).map((c) => (
                <div
                  key={c.chain}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "100px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.6)",
                    fontSize: "11px",
                    fontWeight: "600",
                  }}
                >
                  {c.chain.toUpperCase()}
                </div>
              ))}
            </div>
          )}

          <div
            style={{
              marginTop: "auto",
              color: archConfig.glowColor,
              fontSize: "13px",
              fontWeight: "600",
              letterSpacing: "0.05em",
            }}
          >
            chaincard-hq.vercel.app
          </div>
        </div>

        {/* Top color strip */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: `linear-gradient(90deg, ${archConfig.glowColor}90, ${archConfig.glowColor}20)`,
          }}
        />
      </div>
    ),
    { ...size }
  );
}