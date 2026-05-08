"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");

  useEffect(() => {
    const verifyPayment = async () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session_id");

      if (!sessionId) {
        setStatus("error");
        return;
      }

      try {
        const response = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        if (response.ok) {
          setStatus("success");
          // Redirect to dashboard or show success
          setTimeout(() => router.push("/dashboard"), 2000);
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    };

    verifyPayment();
  }, [router]);

  return (
    <main className="min-h-screen bg-void-950 flex items-center justify-center">
      <div className="text-center">
        {status === "verifying" && (
          <>
            <Loader2 className="w-12 h-12 text-arc-400 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Verifying Payment</h1>
            <p className="text-white/60">Please wait while we confirm your Pro upgrade...</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Welcome to Pro!</h1>
            <p className="text-white/60">Your ChainCard Pro features are now unlocked.</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl">✕</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Payment Verification Failed</h1>
            <p className="text-white/60">Please contact support if this persists.</p>
          </>
        )}
      </div>
    </main>
  );
}