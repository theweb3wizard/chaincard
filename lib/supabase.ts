// LOCATION: chaincard/lib/supabase.ts
// ACTION: CREATE NEW FILE — goes inside the lib/ folder at root

import { createClient } from "@supabase/supabase-js";
import type { CardStats, CachedCard, ArchetypeKey } from "@/types";

// Server-side client — uses service role key (never expose to browser)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── User profiles ───────────────────────────────────────────────
export async function getUserProfile(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return { data, error };
}

export async function createUserProfile(userId: string, email: string) {
  const { data, error } = await supabaseAdmin
    .from("user_profiles")
    .insert({
      id: userId,
      email,
      is_pro: false,
    })
    .select()
    .single();

  return { data, error };
}

export async function upsertUserProfile(
  userId: string,
  email?: string,
  isPro?: boolean
) {
  const payload: {
    id: string;
    email?: string;
    is_pro?: boolean;
    pro_since?: string;
  } = { id: userId };

  if (email) payload.email = email;
  if (isPro) {
    payload.is_pro = true;
    payload.pro_since = new Date().toISOString();
  }

  const { data, error } = await supabaseAdmin
    .from("user_profiles")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();

  return { data, error };
}

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

  const { data: existing } = await supabaseAdmin
    .from("card_cache")
    .select("is_unlocked, unlocked_at")
    .eq("address", normalized)
    .maybeSingle();


  const isUnlocked = existing?.is_unlocked ?? false;
  const expiresAt = isUnlocked ? null : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const unlockedAt = existing?.unlocked_at ?? null;

  const { error } = await supabaseAdmin.from("card_cache").upsert(
    {
      address: normalized,
      ens_name: ensName,
      card_data: cardData,
      archetype: cardData.archetype as ArchetypeKey,
      is_unlocked: isUnlocked,
      unlocked_at: unlockedAt,
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
    .update({
      is_unlocked: true,
      unlocked_at: new Date().toISOString(),
      expires_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("address", normalized);

  if (error) console.error("[Supabase] markCardUnlocked error:", error.message);
}

// ─── Record unlock payment ────────────────────────────────
export async function recordUnlock(params: {
  userId: string;
  checkoutSessionId: string;
  status?: string;
  amountPaid?: number | null;
  currency?: string | null;
  address?: string;
  metadata?: unknown;
}): Promise<void> {
  const row: Record<string, unknown> = {
    user_id: params.userId,
    checkout_session_id: params.checkoutSessionId,
    payment_status: params.status ?? "completed",
    amount_paid: params.amountPaid ?? null,
    currency: params.currency ?? null,
    address: params.address ? params.address.toLowerCase() : null,
    metadata: params.metadata ?? null,
    created_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin.from("payment_events").insert(row);

  if (error) console.error("[Supabase] recordUnlock error:", error.message);
}

// ─── Check if a wallet is already unlocked ────────────────
export async function isCardUnlocked(address: string): Promise<boolean> {
  const cached = await getCachedCard(address);
  return cached?.is_unlocked ?? false;
}