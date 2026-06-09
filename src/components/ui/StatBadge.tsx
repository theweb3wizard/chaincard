interface StatBadgeProps {
  label: string;
  value: string;
  emoji?: string;
  className?: string;
}

export default function StatBadge({ label, value, emoji, className = '' }: StatBadgeProps) {
  return (
    <div
      className={`relative rounded-xl p-3 border border-white/05 transition-all duration-200 hover:border-white/10 ${className}`}
      style={{ background: 'rgba(255,255,255,0.03)' }}
    >
      <p className="text-xs text-white/40 font-body mb-1 flex items-center gap-1.5">
        {emoji && <span className="text-xs">{emoji}</span>}
        {label}
      </p>
      <p className="font-display font-bold text-sm text-white leading-tight">
        {value === '\u2014' ? (
          <span className="text-white/30">{value}</span>
        ) : (
          value
        )}
      </p>
    </div>
  );
}