"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { signUp, signIn } from "@/lib/supabase";

interface ProUpgradeProps {
  onSuccess?: () => void;
}

export default function ProUpgrade({ onSuccess }: ProUpgradeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);
  const [error, setError] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error } = isSignUp
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        setError(error.message);
        return;
      }

      const userId = data.user?.id ?? data.session?.user?.id;
      if (!userId) {
        setError(
          "Please confirm your account via email before upgrading, then sign in and try again."
        );
        return;
      }

      await handleCheckout(userId);
    } catch (err) {
      setError("Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async (userId: string) => {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_COPPERX_PRO_PRICE_ID,
          userId,
        }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch {
      setError("Failed to start checkout");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-void-950 border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-arc-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Star className="w-6 h-6 text-arc-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Upgrade to Pro</h2>
          <p className="text-white/60 text-sm">
            Unlock saved cards, PDF exports, and legitimacy scores for $9.99/month
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-arc-500 hover:bg-arc-400 text-void-950 font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : (
              `${isSignUp ? "Sign Up" : "Sign In"} & Upgrade`
            )}
          </button>
        </form>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-center text-white/40 text-sm mt-4 hover:text-white/60"
        >
          {isSignUp ? "Already have an account?" : "Need to create an account?"}
        </button>
      </div>
    </div>
  );
}