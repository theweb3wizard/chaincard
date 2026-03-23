// LOCATION: chaincard/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.25.197.104"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.moralis.io" },
      { protocol: "https", hostname: "**.ipfs.io" },
      { protocol: "https", hostname: "ipfs.io" },
      { protocol: "https", hostname: "**.nftstorage.link" },
      { protocol: "https", hostname: "**.opensea.io" },
      { protocol: "https", hostname: "i.seadn.io" },
      { protocol: "https", hostname: "**.arweave.net" },
      { protocol: "https", hostname: "metadata.ens.domains" },
    ],
  },
};

export default nextConfig;