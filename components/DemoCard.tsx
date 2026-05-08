"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Shield, Share2, Star } from "lucide-react";

export default function DemoCard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleDemo() {
    setIsLoading(true);
    // Use a known demo address
    const demoAddress = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"; // Vitalik's address
    router.push(`/card/${demoAddress}`);
  }

  return (
    <div className="text-center">
      <p className="text-white/40 text-sm mb-4">See it in action</p>
      <button
        onClick={handleDemo}
        disabled={isLoading}
        className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-display font-semibold hover:bg-white/10 transition-colors disabled:opacity-50"
      >
        {isLoading ? "Loading..." : "View Demo Card"}
      </button>
    </div>
  );
}