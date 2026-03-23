// LOCATION: chaincard/components/WalletInput.tsx
// ACTION: CREATE NEW FILE — goes directly inside components/ folder (NOT inside ui/)

"use client";

import { useState, useRef } from "react";
import { isValidAddress, isENSName } from "@/lib/utils";
import { Search, AlertCircle, Loader2 } from "lucide-react";

interface WalletInputProps {
  onSubmit: (address: string) => void;
  isLoading: boolean;
  error: string | null;
}

export default function WalletInput({ onSubmit, isLoading, error }: WalletInputProps) {
  const [value, setValue] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function validate(input: string): boolean {
    const trimmed = input.trim();
    if (!trimmed) {
      setValidationError("Please enter a wallet address or ENS name.");
      return false;
    }
    if (!isValidAddress(trimmed) && !isENSName(trimmed)) {
      setValidationError("Enter a valid 0x address (0x...) or ENS name (name.eth)");
      return false;
    }
    setValidationError(null);
    return true;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate(value)) {
      onSubmit(value.trim());
    }
  }

  const displayError = validationError || error;

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`
            flex items-center gap-3 rounded-xl border transition-all duration-200
            bg-void-800/60 backdrop-blur-sm px-4 py-3
            ${
              displayError
                ? "border-red-500/40 shadow-[0_0_0_3px_rgba(239,68,68,0.08)]"
                : "border-white/10 focus-within:border-arc-500/40 focus-within:shadow-[0_0_0_3px_rgba(77,255,210,0.06)]"
            }
          `}
        >
          <Search className="w-4 h-4 text-white/30 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="0x... or name.eth"
            disabled={isLoading}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            className="flex-1 bg-transparent text-white placeholder-white/25 font-mono text-sm outline-none disabled:opacity-50 min-w-0"
          />
          <button
            type="submit"
            disabled={isLoading || !value.trim()}
            className="
              flex-shrink-0 flex items-center gap-2
              bg-arc-500 hover:bg-arc-400 disabled:bg-arc-500/30
              text-void-950 disabled:text-white/30
              font-display font-bold text-sm
              px-4 py-2 rounded-lg
              transition-all duration-150
              disabled:cursor-not-allowed
              min-h-[40px]
            "
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate"}
          </button>
        </div>
      </form>

      {displayError && (
        <div className="flex items-start gap-2 mt-3 text-red-400 text-xs animate-fade-in">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>{displayError}</span>
        </div>
      )}

      {isLoading && (
        <p className="mt-3 text-center text-xs text-white/30 animate-pulse-slow">
          Reading the blockchain... this takes 5–10 seconds
        </p>
      )}
    </div>
  );
}