// LOCATION: chaincard/app/card/[address]/page.tsx
// ACTION: REPLACE the entire file with this


import { isValidAddress, normalizeAddress, shortenAddress } from "@/lib/utils";
import { ARCHETYPES, APP_NAME, APP_URL } from "@/constants";
import type { Metadata } from "next";
import CardPageClient from "./CardPageClient";

interface PageProps {
  params: Promise<{ address: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { address } = await params;
  const normalized = normalizeAddress(address);
  const displayName = shortenAddress(normalized, 4);
  const archetypeLabel = "On-Chain Identity";

  return {
    title: `${displayName} — ${archetypeLabel} | ${APP_NAME}`,
    description: `${displayName} is "${archetypeLabel}" on ChainCard.`,
    openGraph: {
      title: `${displayName} is "${archetypeLabel}"`,
      description: `Check your own on-chain identity at ${APP_URL}`,
      url: `${APP_URL}/card/${normalized}`,
      images: [
        {
          url: `${APP_URL}/card/${normalized}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${displayName}'s ChainCard`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayName} is "${archetypeLabel}"`,
      description: `Check your own on-chain identity at chaincard-hq.vercel.app`,
      images: [`${APP_URL}/card/${normalized}/opengraph-image`],
    },
  };
}

export default async function CardPage({ params }: PageProps) {
  const { address } = await params;

  // Validate address format
  if (!isValidAddress(address)) {
    return (
      <CardPageClient
        address={address}
        initialCard={null}
        initialUnlocked={false}
      />
    );
  }

  const normalized = normalizeAddress(address);

  return (
    <CardPageClient
      address={normalized}
      initialCard={null}
      initialUnlocked={true}
    />
  );
}