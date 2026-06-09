import { ARCHETYPES } from '@/constants';
import type { ArchetypeFactor } from '@/types';

interface ArchetypeDNAProps {
  label: string;
  emoji: string;
  glowColor: string;
  legitimacyScore: number;
  factors: ArchetypeFactor[];
}

function DNASegment({ factor, index }: { factor: ArchetypeFactor; index: number }) {
  const pct = Math.min(100, (factor.value / factor.maxValue) * 100);
  const hue = 180 + pct * 0.6;
  const opacity = 0.3 + pct * 0.007;

  return (
    <div
      className="group relative animate-fade-up"
      style={{ animationDelay: `${0.3 + index * 0.08}s` }}
    >
      <div className="flex items-center gap-3 py-2">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-display font-semibold text-white/70">
              {factor.name}
            </span>
            <span className="text-xs font-mono text-white/40">
              {factor.value.toLocaleString()} / {factor.maxValue.toLocaleString()}
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/05 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${pct}%`,
                background: `linear-gradient(90deg, hsla(${hue - 40}, 80%, 50%, 0.5), hsla(${hue}, 80%, 60%, 0.8))`,
                boxShadow: `0 0 10px hsla(${hue}, 80%, 60%, 0.3)`,
              }}
            />
          </div>
        </div>
        <span
          className="text-xs font-mono font-bold min-w-[3ch] text-right"
          style={{ color: `hsla(${hue}, 80%, 60%, 0.9)` }}
        >
          {Math.round(pct * factor.weight)}%
        </span>
      </div>

      <div className="absolute left-0 -bottom-1 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        <div className="bg-void-800 border border-white/10 rounded-xl p-3 shadow-2xl">
          <p className="text-xs text-white/60 leading-relaxed">{factor.description}</p>
        </div>
      </div>
    </div>
  );
}

export default function ArchetypeDNA({ label, emoji, glowColor, legitimacyScore, factors }: ArchetypeDNAProps) {
  return (
    <div
      className="rounded-2xl border overflow-hidden animate-scale-in"
      style={{
        borderColor: `${glowColor}25`,
        background: `linear-gradient(135deg, ${glowColor}08, transparent 80%)`,
      }}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xl">{emoji}</span>
            <div>
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                On-chain DNA
              </p>
              <p className="font-display font-bold text-sm" style={{ color: glowColor }}>
                {label}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
              Legitimacy
            </p>
            <div className="flex items-baseline gap-1">
              <span
                className="font-display font-extrabold text-2xl"
                style={{
                  color: legitimacyScore >= 70 ? glowColor : legitimacyScore >= 40 ? '#FBBF24' : '#F87171',
                }}
              >
                {legitimacyScore}
              </span>
              <span className="text-xs text-white/30 font-mono">/100</span>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          {factors.map((factor, i) => (
            <DNASegment key={factor.name} factor={factor} index={i} />
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-white/05">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${glowColor}40, transparent)` }} />
            <span className="text-[10px] font-mono text-white/30">Evidence-based profiling</span>
            <div className="flex-1 h-px" style={{ background: `linear-gradient(270deg, ${glowColor}40, transparent)` }} />
          </div>
        </div>
      </div>
    </div>
  );
}