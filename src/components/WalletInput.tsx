import { useState, useRef, type FormEvent } from 'react';
import { Search, AlertCircle, Loader2 } from 'lucide-react';
import { isValidAddress, isENSName } from '@/utils/address';
import { cn } from '@/utils/cn';

interface WalletInputProps {
  onSubmit: (address: string) => void;
  isLoading: boolean;
  error: string | null;
}

export default function WalletInput({ onSubmit, isLoading, error }: WalletInputProps) {
  const [value, setValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function validate(input: string): boolean {
    const trimmed = input.trim();
    if (!trimmed) {
      setValidationError('Enter a wallet address or ENS name');
      return false;
    }
    if (!isValidAddress(trimmed) && !isENSName(trimmed)) {
      setValidationError('Enter a valid 0x address or ENS name (name.eth)');
      return false;
    }
    setValidationError(null);
    return true;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (validate(value)) {
      onSubmit(value.trim());
    }
  }

  const displayError = validationError || error;

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative group">
        <div
          className={cn(
            'flex items-center gap-3 rounded-2xl border transition-all duration-300',
            'bg-void-800/40 backdrop-blur-xl px-5 py-4',
            'ring-1 ring-white/5',
            'focus-within:ring-arc-400/30 focus-within:border-arc-500/40',
            'hover:ring-white/10',
            displayError
              ? 'border-red-500/40 ring-red-500/20'
              : 'border-white/05'
          )}
        >
          <Search className="w-5 h-5 text-white/20 group-focus-within:text-arc-400/60 transition-colors flex-shrink-0" />
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
            className="flex-1 bg-transparent text-white placeholder-white/20 font-mono text-sm outline-none disabled:opacity-50 min-w-0"
          />
          {value && !isLoading && (
            <button
              type="button"
              onClick={() => setValue('')}
              className="text-white/20 hover:text-white/60 transition-colors p-1"
              aria-label="Clear input"
            >
              <span className="text-lg leading-none">&times;</span>
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !value.trim()}
            className={cn(
              'flex-shrink-0 flex items-center gap-2',
              'bg-arc-500 hover:bg-arc-400 disabled:bg-arc-500/20',
              'text-void-950 disabled:text-white/30',
              'font-display font-bold text-sm',
              'px-5 py-2.5 rounded-xl',
              'transition-all duration-200',
              'disabled:cursor-not-allowed',
              'hover:shadow-[0_0_30px_rgba(77,255,210,0.3)]',
              'active:scale-[0.97]',
              'min-h-[44px]'
            )}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Generate'
            )}
          </button>
        </div>
      </form>

      {displayError && (
        <div className="flex items-start gap-2 mt-3 text-red-400 text-xs animate-fade-in px-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>{displayError}</span>
        </div>
      )}

      {isLoading && (
        <div className="mt-4 flex items-center justify-center gap-3 text-white/40">
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-arc-400/60 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-arc-400/60 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-arc-400/60 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-xs font-mono">Reading the chain...</span>
        </div>
      )}
    </div>
  );
}