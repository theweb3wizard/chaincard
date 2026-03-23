// LOCATION: chaincard/app/layout.tsx
// ACTION: REPLACE entire file

import type { Metadata } from "next";
import { Syne, DM_Sans, DM_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { APP_NAME, APP_TAGLINE, APP_URL } from "@/constants";
import FeedbackWidget from "@/components/FeedbackWidget";
import TipWidget from "@/components/TipWidget";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Turn any Ethereum wallet address into a beautiful, shareable identity card. Your DeFi archetype, on-chain stats, and crypto story — all in one place.",
  metadataBase: new URL(APP_URL),
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: APP_NAME,
    description: APP_TAGLINE,
    url: APP_URL,
    siteName: APP_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_TAGLINE,
    creator: "@ChainCard",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body
        className="antialiased min-h-screen"
        style={{ backgroundColor: "#080B12", color: "white" }}
      >
        {children}
        <TipWidget />
        <FeedbackWidget />
        <Analytics />
      </body>
    </html>
  );
}