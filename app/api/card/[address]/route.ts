// LOCATION: chaincard/app/api/card/[address]/route.ts
// ACTION: CREATE NEW FILE
//   1. Inside app/api/, create folder: card
//   2. Inside that card/, create folder: [address]   ← brackets are part of the folder name
//   3. Inside [address]/, create file: route.ts
//   4. Paste this entire file into it

import { NextRequest, NextResponse } from "next/server";
import { getCachedCard } from "@/lib/supabase";
import { normalizeAddress, isValidAddress } from "@/lib/utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  if (!address || !isValidAddress(address)) {
    return NextResponse.json({ notFound: true }, { status: 404 });
  }

  const normalized = normalizeAddress(address);
  const cached = await getCachedCard(normalized);

  if (!cached) {
    return NextResponse.json({ notFound: true }, { status: 404 });
  }

  return NextResponse.json({
    card: cached.card_data,
    isUnlocked: cached.is_unlocked,
  });
}