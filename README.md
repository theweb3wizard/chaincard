# ⚡ ChainCard

**Your wallet has a story. Now it has a card.**

ChainCard turns any Ethereum wallet address into a beautiful, shareable identity card — your DeFi archetype, on-chain stats, and crypto story, all in one place.

🔗 **Live:** [chaincard.vercel.app](https://chaincard.vercel.app)

---

## What It Does

Paste any EVM wallet address or ENS name and get back:

- **Your on-chain archetype** — Diamond Hand, DeFi Farmer, NFT Degen, Governance Whale, and more
- **Wallet age** — exactly when you first went on-chain
- **Total transactions** — your full on-chain history count
- **Gas burned** — how much ETH you've spent on fees
- **Net worth** — current token holdings in USD or ETH
- **Active chains** — every EVM chain you've touched
- **NFTs held** — your top NFTs with images
- **Governance votes + airdrops received**

Share your card on X with one click. The card renders as a full image in the tweet.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Blockchain Data | Moralis REST API |
| Database / Cache | Supabase (PostgreSQL) |
| OG Images | next/og (Edge) |
| Analytics | Vercel Analytics |
| Deployment | Vercel |

---

## Local Development

### Prerequisites

- Node.js v18+
- A [Moralis](https://admin.moralis.com) account (free)
- A [Supabase](https://supabase.com) project (free)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/theweb3wizard/chaincard.git
cd chaincard

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.local.example .env.local
# Fill in your keys in .env.local

# 4. Run the Supabase SQL schema
# Copy the SQL from the section below and run it in your Supabase SQL Editor

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and paste any wallet address or ENS name.

### Environment Variables

```env
MORALIS_API_KEY=                    # From admin.moralis.com
NEXT_PUBLIC_SUPABASE_URL=           # From supabase.com dashboard
NEXT_PUBLIC_SUPABASE_ANON_KEY=      # From supabase.com dashboard
SUPABASE_SERVICE_ROLE_KEY=          # From supabase.com dashboard
NEXT_PUBLIC_APP_URL=                # http://localhost:3000 for dev
```

### Supabase Schema

Run this SQL in your Supabase project → SQL Editor:

```sql
CREATE TABLE card_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  address TEXT NOT NULL UNIQUE,
  ens_name TEXT,
  card_data JSONB NOT NULL,
  archetype TEXT NOT NULL,
  is_unlocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX idx_card_cache_address ON card_cache(address);

CREATE TABLE feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER card_cache_updated_at
  BEFORE UPDATE ON card_cache
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## How Archetypes Work

ChainCard assigns every wallet one of 10 archetypes based on on-chain behavior:

| Archetype | Trigger |
|---|---|
| 🐋 The Whale | Net worth ≥ $100K |
| 🌱 The New Blood | Wallet age < 6 months |
| 🏛️ The Governance Whale | 5+ governance votes, wallet age ≥ 1 year |
| 🎭 The NFT Degen | NFT transfers > 50% of all transactions |
| 🗃️ The Collector | 30+ NFT transfers, varied collections |
| 🪂 The Airdrop Hunter | 10+ airdrops, wallet age ≥ 1 year |
| 🌾 The DeFi Farmer | 10+ unique protocols touched |
| 💎 The Diamond Hand | Avg hold time ≥ 6 months, low swap frequency |
| ⚡ The Flipper | High swap frequency, short hold times |
| 🔥 The Gas Burner | High tx count or high gas spend |

---

## Project Structure

```
chaincard/
├── app/
│   ├── card/[address]/     # Card display page + OG image
│   ├── api/
│   │   ├── generate/       # Fetches Moralis, computes card, caches
│   │   ├── card/[address]/ # Serves cached card data
│   │   └── feedback/       # Stores user feedback
│   └── success/            # Post-payment success (legacy)
├── components/
│   ├── ui/                 # SkeletonCard, StatBadge, ChainBadge, etc.
│   ├── ChainCard.tsx       # The card itself
│   ├── WalletInput.tsx     # Address input with ENS support
│   ├── ShareButton.tsx     # X/Twitter share
│   ├── DownloadButton.tsx  # Download as PNG
│   └── FeedbackWidget.tsx  # Floating feedback button
├── lib/
│   ├── moralis.ts          # All Moralis API calls
│   ├── compute.ts          # Archetype logic + stat computation
│   ├── supabase.ts         # Database client + cache helpers
│   └── utils.ts            # Formatting utilities
├── types/                  # TypeScript interfaces
└── constants/              # Archetypes, chains, config
```

---

## Deployment

Deployed on [Vercel](https://vercel.com). Add all environment variables in your Vercel project settings before deploying.

---

## License

MIT — do whatever you want with it.

---

Built by a solo founder in one session. Powered by Moralis, Supabase, and Next.js.