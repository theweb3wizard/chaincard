// LOCATION: chaincard/app/api/generate/route.ts
// ACTION: REPLACE the entire file with this

import { NextRequest, NextResponse } from "next/server";
import { isValidAddress, isENSName, normalizeAddress } from "@/lib/utils";
import { fetchAllWalletData, resolveENS, getENSAvatarUrl } from "@/lib/moralis";
import { assembleCardStats } from "@/lib/compute";
import { getCachedCard, setCachedCard } from "@/lib/supabase";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = (body.address || "").trim();

    if (!input) {
      return NextResponse.json(
        { success: false, error: "Wallet address is required." },
        { status: 400 }
      );
    }

    let address = input;
    let ensName: string | null = null;

    if (isENSName(input)) {
      const resolved = await resolveENS(input);
      if (!resolved) {
        return NextResponse.json(
          { success: false, error: `Could not resolve ENS name: ${input}` },
          { status: 400 }
        );
      }
      address = resolved;
      ensName = input;
    }

    if (!isValidAddress(address)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid wallet address. Please enter a valid 0x address or ENS name.",
        },
        { status: 400 }
      );
    }

    const normalized = normalizeAddress(address);

    // Return cached card if available
    const cached = await getCachedCard(normalized);
    if (cached) {
      return NextResponse.json({
        success: true,
        card: cached.card_data,
        isUnlocked: cached.is_unlocked,
        fromCache: true,
      });
    }

    // Fetch all data in parallel
    const {
      history,
      oldestTxDate,
      netWorth,
      nativeBalanceEth,
      pnlSummary,
      nfts,
      stats,
      ensName: resolvedEns,
      ethPrice,
    } = await fetchAllWalletData(normalized);

    const finalEnsName = ensName || resolvedEns;
    const avatarUrl = finalEnsName ? getENSAvatarUrl(finalEnsName) : null;

    const cardStats = assembleCardStats({
      address: normalized,
      ensName: finalEnsName,
      avatarUrl,
      history,
      oldestTxDate,
      netWorthData: netWorth,
      nativeBalanceEth,
      pnlSummary,
      nfts,
      walletStats: stats,
      gasEthPrice: ethPrice,
    });

    await setCachedCard(normalized, cardStats, finalEnsName);

    return NextResponse.json({
      success: true,
      card: cardStats,
      isUnlocked: false,
      fromCache: false,
    });
  } catch (err) {
    console.error("[/api/generate] Error:", err);
    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to generate card. This wallet may have no on-chain activity, or the service is temporarily unavailable.",
      },
      { status: 500 }
    );
  }
}