# ChainCard Nexus

> Your wallet has a story. Now it has a world.

**ChainCard Nexus** transforms any Ethereum wallet into a living, interactive 3D identity universe. Paste an address — discover your on-chain archetype through a uniquely generated procedural world powered by React Three Fiber, analyzed entirely client-side with zero backend.

**100% free. 100% on-chain. Runs entirely in the browser.**

---

## Features

### 🧬 On-Chain Archetype Detection
Analyze any EVM wallet across **7 chains** (Ethereum, Base, Polygon, BSC, Arbitrum, Optimism, Avalanche) — no API key needed.

| Archetype | Description |
|-----------|-------------|
| 💎 **Diamond Hand** | HODL through chaos — 6+ month average hold time |
| 🌾 **DeFi Farmer** | 10+ protocols farmed like a diversified yield machine |
| 🎭 **NFT Degen** | 50%+ transaction ratio in NFTs, 20+ transfers |
| 🏛️ **Governance Whale** | 5+ governance votes cast, year+ wallet age |
| 🔥 **Gas Burner** | $1,000+ in gas fees or 500+ total transactions |
| 🪂 **Airdrop Hunter** | 10+ airdrops received with 365+ day wallet age |
| ⚡ **Flipper** | $1K+/day volume, < 30 day average hold |
| 🐋 **Whale** | $100K+ net worth across chains |
| 🗃️ **Collector** | 30+ NFT transfers with < 50% tx ratio |
| 🌱 **New Blood** | Less than 6 months on-chain |

### 🌍 10 Procedural 3D Worlds
Each archetype unlocks a unique **interactive 3D environment** (React Three Fiber + custom GLSL shaders):

- **Crystalline World** — Instanced octahedrons with MeshTransmissionMaterial, prismatic dispersion shaders
- **DeFi Farm** — Terraced ExtrudeGeometry rings with 800 golden wheat particles
- **Neon NFT Gallery** — Holographic frames with wireframe grid and RGB glitch particles
- **Governance Coral Reef** — TubeGeometry coral branches with bioluminescent Vote Currents
- **Volcanic Gas Burner** — Displaced icosahedron terrain with lava rivers and ember physics
- **Airdrop Crystal Cave** — Dodecahedron geodes with MeshTransmissionMaterial (ior 2.0)
- **Particle Accelerator** — Rotating torus rings with 500 angular momentum particles
- **Deep Ocean** — God rays, leviathan scales, bioluminescent creatures in a sphere ocean
- **Collector's Gallery** — Pedestal-displayed items with per-pedestal SpotLight
- **Seedling World** — Growing stem/leaf geometry with 200 growth particles

### 📊 Explainable DNA Scoring
Every wallet gets a **0-100 legitimacy score** broken down across 7 weighted dimensions:
- Wallet Age (25%), Transaction Volume (20%), Protocol Diversity (15%)
- Hold Duration (15%), Governance Participation (10%)
- Gas Contribution (10%), Trading Activity (5%)
- + archetype-specific evidence factor (50% weight)

### 🕐 Interactive Timeline
Scrub through a wallet's entire on-chain history from first transaction to present — watch identity evolve over time.

### 🔒 Privacy-First
- **No backend** — all analysis runs in your browser
- **No data stored on servers** — everything in IndexedDB/localStorage
- **Public RPCs only** — no API keys, no tracking, no accounts

---

## Quick Start

```bash
# Clone the repo
git clone https://github.com/anomalyco/chaincard.git
cd chaincard

# Install dependencies
npm install

# Start dev server (opens at http://localhost:3000)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Testing the App

### Quick Check (5 minutes)

1. **Start dev server**: `npm run dev` → opens at `http://localhost:3000`
2. **Try a known address**: Paste `vitalik.eth` — should resolve to Vitalik's ENS and wallet
3. **Try a fresh address**: `0x0000000000000000000000000000000000000001` — should show as New Blood
4. **Toggle 3D mode**: Click the `3D`/`2D` toggle on the card screen
5. **Play with timeline**: Use the TimeScrubber at the bottom to scrub through wallet history
6. **Save a card**: Click "Save" to persist to localStorage, "Share" to copy link

### Full Test Checklist

- **Wallet Input**: Accepts `0x...` and `*.eth` addresses, validates format, shows loading states, shows error messages for invalid/empty
- **Archetype Detection**: Tests all 10 branches with addresses known for different behaviors
- **3D Worlds**: Verify all 10 worlds load without console errors, toggle between 2D/3D smoothly
- **Timeline**: Play/pause, scrub slider, skip buttons, reset to present
- **Profile Card**: Share (copies URL), Download (PNG capture), Save (localStorage persistence + cards list)
- **Offline**: Load app, visit a card, go offline — cached content should render from service worker

### Performance Tips

- Dev mode loads uncompressed source — production build is faster (`npm run build && npm run preview`)
- Three.js worlds are ~1MB — first load may take a moment (cached by service worker on repeat visits)
- Monitor console in DevTools for RPC errors — some public endpoints may be rate-limited
- Network tab will show requests to CoinGecko (pricing) and ENS metadata (avatars)

---

## Architecture

```
src/
├── main.tsx                        # Entry point
├── App.tsx                         # Root routing (Home / Card screens)
├── components/
│   ├── WalletInput.tsx             # Address input with validation
│   ├── ProfileCard.tsx             # Full wallet identity display
│   ├── ArchetypeDNA.tsx            # Explainable scoring visualization
│   ├── TimeScrubber.tsx            # Interactive timeline slider
│   └── ui/                         # Atomic UI components
├── scenes/
│   ├── NexusScene.tsx              # Main Canvas + post-processing
│   ├── ArchetypeWorld.tsx          # World router (10 archetypes)
│   ├── CrystallineWorld.tsx        # Diamond Hand
│   ├── DeFiFarmerWorld.tsx         # DeFi Farmer
│   ├── NFTDegenWorld.tsx           # NFT Degen
│   ├── GovernanceWhaleWorld.tsx    # Governance Whale
│   ├── GasBurnerWorld.tsx          # Gas Burner
│   ├── AirdropHunterWorld.tsx      # Airdrop Hunter
│   ├── FlipperWorld.tsx            # Flipper
│   ├── WhaleWorld.tsx              # Whale
│   ├── CollectorWorld.tsx          # Collector
│   └── NewBloodWorld.tsx           # New Blood
├── lib/
│   ├── rpc.ts                      # Multi-chain RPC client (21 endpoints)
│   ├── wallet.ts                   # Wallet analyzer (ENS, balances, NFTs, txs)
│   ├── archetypes.ts               # Archetype computation + scoring
│   └── cache.ts                    # IndexedDB caching layer
├── store/
│   └── index.ts                    # Zustand global state
├── shaders/
│   ├── crystal.vert.glsl           # Vertex noise displacement
│   └── crystal.frag.glsl           # Fresnel + prismatic dispersion
├── utils/
│   ├── address.ts                  # Address formatting/validation
│   ├── format.ts                   # Number/currency formatting
│   ├── prng.ts                     # Deterministic PRNG for world generation
│   └── cn.ts                       # className merge utility
├── types/
│   └── index.ts                    # TypeScript type definitions
├── constants/
│   └── index.ts                    # Archetype/chain configs, RPC URLs, TTLs
├── styles/
│   └── globals.css                 # Tailwind + custom CSS
└── sw.ts                           # Service worker (Workbox injectManifest)
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Vite 5 + React 18 + TypeScript |
| **3D Engine** | React Three Fiber (R3F) + Three.js + custom GLSL shaders |
| **Post-Processing** | Bloom, Chromatic Aberration, Vignette |
| **Blockchain** | viem (multicall, ENS, ERC20, ERC721) |
| **State** | Zustand |
| **Animation** | GSAP + useFrame |
| **Storage** | IndexedDB (idb) + localStorage |
| **PWA** | Workbox (vite-plugin-pwa) |
| **Styling** | Tailwind CSS v3 + clsx + tailwind-merge |
| **Export** | html-to-image (PNG download) |

### Dependencies

```
react@18.3.1        @react-three/fiber@8.18      @react-three/drei@9.114
@react-three/postprocessing@2.16  three@0.168     viem@2.21
zustand@4.5         idb@8.0          gsap@3.12.5
html-to-image@1.11  lucide-react@0.441       tailwind-merge@2.5
```

### Supported Chains & Public RPCs

| Chain | Endpoints |
|-------|-----------|
| Ethereum | 4 (llamarpc, ankr, publicnode, drpc) |
| Base | 3 (base.org, llamarpc, publicnode) |
| Polygon | 3 (polygon-rpc, llamarpc, publicnode) |
| BSC | 3 (dataseed 1-3) |
| Arbitrum | 3 (arb1, llamarpc, publicnode) |
| Optimism | 3 (optimism.io, llamarpc, publicnode) |
| Avalanche | 3 (avax.network, llamarpc, publicnode) |

---

## Deployment

### GitHub Pages

```bash
npm run build
npx gh-pages -d dist
```

### Cloudflare Pages

1. Connect repo to Cloudflare Pages
2. Build command: `npm run build`
3. Output directory: `dist`

No environment variables needed. No API keys to configure.

---

## License

MIT © 2025 anomalyco
