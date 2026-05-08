# ⚡ ChainCard

**Your wallet has a story. Now it has a card.**

ChainCard turns any Ethereum wallet address into a beautiful, shareable identity card — your DeFi archetype, on-chain stats, and crypto story, all in one place.

🔗 **Live:** [chaincard.vercel.app](https://chaincard-hq.vercel.app)

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

# 3. Create a local env file
copy .env.example .env.local
# Fill in your keys in .env.local

# 4. Run the Supabase SQL schema
# Use SUPABASE_SCHEMA.sql in the repo or paste it into Supabase SQL Editor

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
COPPERX_API_KEY=                    # CopperX server API key
COPPERX_PRO_PRICE_ID=               # CopperX price ID for ChainCard Pro
COPPERX_WEBHOOK_SECRET=             # CopperX webhook signing secret
```

### Supabase Schema

Use `SUPABASE_SCHEMA.sql` in the repo to create the required tables and policies.

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
│   │   ├── generate/            # Fetches Moralis, computes card, caches
│   │   ├── card/[address]/      # Serves cached card data
│   │   ├── checkout/            # Creates CopperX checkout sessions
│   │   ├── verify-payment/      # Verifies CopperX sessions
│   │   ├── webhooks/copperx/    # Receives CopperX webhook events
│   │   └── feedback/            # Stores user feedback
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