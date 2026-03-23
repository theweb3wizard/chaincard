// LOCATION: chaincard/components/FeedbackWidget.tsx
// ACTION: CREATE NEW FILE — goes directly inside components/ folder

"use client";

import { useState } from "react";
import { MessageSquare, X, Send, Check, Loader2 } from "lucide-react";

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() || null, message: message.trim() }),
      });
      setIsSubmitted(true);
      setEmail("");
      setMessage("");
      setTimeout(() => {
        setIsSubmitted(false);
        setIsOpen(false);
      }, 2500);
    } catch {
      // Fail silently — feedback is best-effort
      setIsSubmitted(true);
      setTimeout(() => { setIsSubmitted(false); setIsOpen(false); }, 2500);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 font-display font-semibold text-sm transition-all duration-200 shadow-lg"
        style={{
          background: "rgba(22, 27, 39, 0.95)",
          backdropFilter: "blur(12px)",
          color: "rgba(255,255,255,0.7)",
        }}
      >
        {isOpen
          ? <X className="w-4 h-4" />
          : <MessageSquare className="w-4 h-4 text-arc-400" />
        }
        {!isOpen && <span>Feedback</span>}
      </button>

      {/* Feedback panel */}
      {isOpen && (
        <div
          className="fixed bottom-16 right-5 z-50 w-80 rounded-2xl border border-white/08 overflow-hidden shadow-2xl animate-scale-in"
          style={{
            background: "linear-gradient(145deg, #161B27, #0D1117)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 24px 64px rgba(0,0,0,0.8)",
          }}
        >
          {/* Top strip */}
          <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, #4DFFD280, #00B4D820)" }} />

          <div className="p-5">
            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center py-6 gap-3">
                <div className="w-10 h-10 rounded-full bg-arc-500/20 border border-arc-500/30 flex items-center justify-center">
                  <Check className="w-5 h-5 text-arc-400" />
                </div>
                <p className="font-display font-bold text-white text-sm">Thanks for the feedback!</p>
                <p className="text-xs text-white/40 text-center">It genuinely helps make ChainCard better.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <p className="font-display font-bold text-white text-sm mb-1">Share your thoughts</p>
                  <p className="text-xs text-white/40">What do you love? What&apos;s missing? Be brutal.</p>
                </div>

                {/* Email — optional */}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (optional)"
                  className="w-full bg-white/05 border border-white/08 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-arc-500/40 transition-colors font-body"
                />

                {/* Message — required */}
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Your feedback..."
                  required
                  rows={3}
                  className="w-full bg-white/05 border border-white/08 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-arc-500/40 transition-colors resize-none font-body"
                />

                <button
                  type="submit"
                  disabled={isSubmitting || !message.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-arc-500 hover:bg-arc-400 disabled:bg-arc-500/30 text-void-950 disabled:text-white/30 font-display font-bold text-sm transition-all duration-150 min-h-[40px]"
                >
                  {isSubmitting
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><Send className="w-3.5 h-3.5" /> Send feedback</>
                  }
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}