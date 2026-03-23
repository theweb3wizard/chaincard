// LOCATION: chaincard/lib/supabase.ts
// ACTION: CREATE NEW FILE — goes inside the lib/ folder at root

import { createClient } from "@supabase/supabase-js";
import type { CardStats, CachedCard, ArchetypeKey } from "@/types";

// Server-side client — uses service role key (never expose to browser)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Browser-safe client — uses anon key
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── Read cached card ─────────────────────────────────────
export async function getCachedCard(address: string): Promise<CachedCard | null> {
  const normalized = address.toLowerCase();

  const { data, error } = await supabaseAdmin
    .from("card_cache")
    .select("*")
    .eq("address", normalized)
    .single();

  if (error || !data) return null;

  // Delete expired free-tier cards so they regenerate fresh
  if (!data.is_unlocked && data.expires_at) {
    if (new Date(data.expires_at) < new Date()) {
      await supabaseAdmin.from("card_cache").delete().eq("address", normalized);
      return null;
    }
  }

  return data as CachedCard;
}

// ─── Write card to cache ──────────────────────────────────
export async function setCachedCard(
  address: string,
  cardData: CardStats,
  ensName: string | null
): Promise<void> {
  const normalized = address.toLowerCase();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabaseAdmin.from("card_cache").upsert(
    {
      address: normalized,
      ens_name: ensName,
      card_data: cardData,
      archetype: cardData.archetype as ArchetypeKey,
      is_unlocked: false,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "address", ignoreDuplicates: false }
  );

  if (error) console.error("[Supabase] setCachedCard error:", error.message);
}

// ─── Mark wallet as unlocked after payment ────────────────
export async function markCardUnlocked(address: string): Promise<void> {
  const normalized = address.toLowerCase();

  const { error } = await supabaseAdmin
    .from("card_cache")
    .update({ is_unlocked: true, updated_at: new Date().toISOString() })
    .eq("address", normalized);

  if (error) console.error("[Supabase] markCardUnlocked error:", error.message);
}

// ─── Record unlock payment ────────────────────────────────
export async function recordUnlock(params: {
  address: string;
  stripeSessionId: string;
  stripePaymentIntent: string | null;
  amountPaid: number;
}): Promise<void> {
  const { error } = await supabaseAdmin.from("unlocks").insert({
    address: params.address.toLowerCase(),
    stripe_session_id: params.stripeSessionId,
    stripe_payment_intent: params.stripePaymentIntent,
    amount_paid: params.amountPaid,
  });

  if (error) console.error("[Supabase] recordUnlock error:", error.message);
}

// ─── Check if a wallet is already unlocked ────────────────
export async function isCardUnlocked(address: string): Promise<boolean> {
  const cached = await getCachedCard(address);
  return cached?.is_unlocked ?? false;
}