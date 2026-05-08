-- SUPABASE_SCHEMA.sql
-- Run this file in the Supabase SQL editor to prepare the ChainCard schema.

-- 1) Required extension for UUID generation.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2) User profiles store Pro status and email metadata.
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  is_pro BOOLEAN NOT NULL DEFAULT FALSE,
  pro_since TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3) Cached wallet cards to reduce Moralis calls.
CREATE TABLE IF NOT EXISTS card_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT NOT NULL UNIQUE,
  ens_name TEXT,
  card_data JSONB NOT NULL,
  archetype TEXT NOT NULL,
  is_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  unlocked_at TIMESTAMPTZ NULL,
  expires_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_card_cache_address ON card_cache(address);

-- 4) Payment events record CopperX webhook data and session IDs.
CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  checkout_session_id TEXT NOT NULL UNIQUE,
  payment_status TEXT NOT NULL,
  amount_paid NUMERIC NULL,
  currency TEXT NULL,
  address TEXT NULL,
  metadata JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_events_user_id ON payment_events(user_id);

-- 5) Saved cards are prepared for the future Pro feature set.
CREATE TABLE IF NOT EXISTS saved_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  address TEXT NOT NULL,
  label TEXT NULL,
  card_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_cards_user_id ON saved_cards(user_id);

-- 6) Feedback storage used by the feedback API route.
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7) Trigger to keep updated_at fresh.
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_profiles_update_at ON user_profiles;
CREATE TRIGGER user_profiles_update_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS saved_cards_update_at ON saved_cards;
CREATE TRIGGER saved_cards_update_at
  BEFORE UPDATE ON saved_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 8) Row level security for user-owned data.
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can view their saved cards" ON saved_cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their saved cards" ON saved_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their saved cards" ON saved_cards
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can view payment events" ON payment_events
  FOR SELECT USING (auth.uid() = user_id);

-- 9) Optional: allow authenticated users to insert feedback directly if that becomes a client feature.
-- If feedback is only created via API server-side routes, this policy is not required.
--
-- ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Feedback insertion" ON feedback
--   FOR INSERT WITH CHECK (true);

-- Notes:
-- * Do not expose service role keys to the client.
-- * Use the webhook secret to verify CopperX events in app/api/webhooks/copperx/route.ts.
-- * Keep `card_cache` writes behind the service role client.
