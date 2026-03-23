// LOCATION: chaincard/components/ui/StatBadge.tsx
// ACTION: CREATE NEW FILE — goes inside components/ui/ folder

interface StatBadgeProps {
  label: string;
  value: string;
  emoji?: string;
  locked?: boolean;
  className?: string;
}

export default function StatBadge({ label, value, emoji, locked = false, className = "" }: StatBadgeProps) {
  return (
    <div
      className={`relative rounded-xl p-3 border border-white/05 transition-all duration-200 ${locked ? "opacity-60" : ""} ${className}`}
      style={{ background: "rgba(255,255,255,0.03)" }}
    >
      <p className="text-xs text-white/40 font-body mb-1 flex items-center gap-1">
        {emoji && <span>{emoji}</span>}
        {label}
      </p>
      <p className={`font-display font-bold text-sm leading-tight ${locked ? "blur-[5px] select-none" : "text-white"}`}>
        {locked ? "••••••" : value}
      </p>
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl">
          <span className="text-xs text-white/30">🔒</span>
        </div>
      )}
    </div>
  );
}