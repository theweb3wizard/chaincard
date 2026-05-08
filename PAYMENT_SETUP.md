# ChainCard Payment Setup Guide

## CopperX Integration

### 1. Create CopperX Account
- Sign up at [copperx.io](https://copperx.io)
- Complete KYC verification
- Set up your merchant account

### 2. Create Products & Prices
- Create a "ChainCard Pro" product
- Set up pricing: $9.99/month subscription
- Note the Price ID for environment variables

### 3. Environment Variables
Add these to your `.env.local`:

```env
# CopperX Configuration
COPPERX_API_KEY=your_copperx_api_key_here
COPPERX_PRO_PRICE_ID=price_xxxxxxxxxxxxxxxxxx
COPPERX_WEBHOOK_SECRET=your_webhook_secret_here

# Existing variables...
MORALIS_API_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Webhook Setup
- In CopperX dashboard, configure webhooks
- Set webhook URL: `https://yourdomain.com/api/webhooks/copperx`
- Use the secret above to sign events
- Subscribe to: `checkout.session.completed`

### 5. Database Schema Updates
Run `SUPABASE_SCHEMA.sql` in your Supabase SQL Editor, or copy the statements from that file.

```sql
-- User profiles table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  is_pro BOOLEAN DEFAULT FALSE,
  pro_since TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved cards table (Pro feature)
CREATE TABLE saved_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  card_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_cards ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own saved cards" ON saved_cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved cards" ON saved_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 6. Local Development
- Start your Next.js dev server: `npm run dev`
- Test payments in sandbox mode
- Use test USDC/USDT for development

### 7. Deployment Notes
- Ensure all environment variables are set in Vercel
- Configure webhook endpoints for production
- Test payment flow end-to-end before launch
- Monitor CopperX dashboard for transaction status

### 8. Security Considerations
- Never expose API keys in client-side code
- Validate webhook signatures from CopperX
- Use HTTPS for all payment-related requests
- Implement proper error handling for failed payments