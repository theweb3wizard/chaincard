```json
{
  "project_summary": "ChainCard converts any EVM wallet address into a beautiful, shareable identity card displaying on-chain personality archetypes and statistics.",
  
  "tech_stack": [
    "Next.js 14+ (App Router)",
    "TypeScript",
    "React 19",
    "Tailwind CSS v4",
    "Moralis REST API (blockchain data)",
    "Supabase/PostgreSQL (caching layer)",
    "CopperX (payments)",
    "html-to-image (card rendering)",
    "Next.js OG Image Generation (social preview)",
    "Lucide React (icons)",
    "Vercel Analytics",
    "Vercel Deployment"
  ],
  
  "core_functionality": "Users paste any Ethereum address or ENS name and receive an instant, shareable card showing: their on-chain archetype (e.g., Diamond Hand, DeFi Farmer, NFT Degen), wallet age, total transactions, ETH gas spent, current net worth, active chains, held NFTs with images, governance votes cast, and airdrops received. The card renders as a full-page image with custom branding and can be shared on Twitter/X with one click, auto-generating a tweet with OG image preview.",
  
  "pain_points": [
    "Complex local setup requiring external APIs (Moralis, Supabase keys) creates friction for developers testing the project",
    "Manual Supabase SQL schema setup not automated—easy to miss during onboarding",
    "Heavy dependency on third-party services (Moralis API availability, Supabase uptime) creates reliability concerns",
    "No user accounts/authentication—cards are ephemeral with no way to save, revisit, or bookmark previous results",
    "Limited export/sharing options beyond Twitter—no PDF download, email, or other formats",
    "30-second API timeout may fail on massive wallet histories with thousands of transactions",
    "Archetype calculation logic is complex and opaque to users—they may not understand why they got classified as 'Flipper' vs 'DeFi Farmer'",
    "Privacy paradox: showcasing full on-chain wallet history on social media may deter privacy-conscious users",
    "Moralis data accuracy and freshness depends on external API—stale data could render wrong archetype",
    "No rate limiting visible—heavy usage could incur costs or hit Moralis rate limits unexpectedly"
  ],
  
  "potential_markets": [
    {
      "segment": "Active Crypto Traders & Degens",
      "description": "Users who trade frequently and want to flex their activity levels, transaction counts, and 'Flipper' or 'Gas Burner' status across social media to build reputation and clout in crypto communities."
    },
    {
      "segment": "NFT Collectors & Communities",
      "description": "NFT enthusiasts who want to display their collections, rarity, and collector status (Collector/NFT Degen archetypes) within Discord servers, Twitter profiles, and blockchain social platforms."
    },
    {
      "segment": "DeFi Protocol Communities & DAOs",
      "description": "Projects looking to gamify community engagement by letting users generate and share their DeFi Farmer, Governance Whale, or other archetypes to drive participation, loyalty, and viral growth."
    },
    {
      "segment": "Crypto Content Creators & Influencers",
      "description": "Twitter/YouTube personalities who want to build personal brands around their on-chain identity, using the shareable card as a credibility signal and engagement hook in their content."
    },
    {
      "segment": "Web3 Gaming Communities & Guilds",
      "description": "Gaming DAOs and guilds seeking ways for players to display gaming-linked wallets, NFT credentials, and on-chain reputation badges across platforms to boost community identity."
    }
  ]
}
```
