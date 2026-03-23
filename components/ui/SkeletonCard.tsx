// LOCATION: chaincard/components/ui/SkeletonCard.tsx
// ACTION: CREATE NEW FILE
//   1. At root, create folder: components
//   2. Inside components/, create folder: ui
//   3. Inside ui/, create file: SkeletonCard.tsx
//   4. Paste this entire file into it

"use client";

export default function SkeletonCard() {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div
        className="relative rounded-2xl overflow-hidden border border-white/06"
        style={{
          background: "rgba(22, 27, 39, 0.9)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 24px 64px rgba(0,0,0,0.6)",
        }}
      >
        <div className="h-1.5 w-full shimmer" />
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full shimmer flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-32 rounded shimmer" />
              <div className="h-3 w-24 rounded shimmer" />
            </div>
          </div>
          <div className="rounded-xl p-4 space-y-2" style={{ background: "rgba(255,255,255,0.03)" }}>
            <div className="h-3 w-24 rounded shimmer" />
            <div className="h-7 w-48 rounded shimmer" />
            <div className="h-3 w-full rounded shimmer" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl p-3 space-y-2" style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="h-3 w-16 rounded shimmer" />
                <div className="h-5 w-24 rounded shimmer" />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-6 w-16 rounded-full shimmer" />
            ))}
          </div>
          <div className="flex gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-16 h-16 rounded-xl shimmer" />
            ))}
          </div>
        </div>
        <div className="px-6 pb-5">
          <div className="h-px bg-white/05 mb-4" />
          <div className="h-3 w-24 rounded shimmer mx-auto" />
        </div>
      </div>
      <p className="text-center text-xs text-white/30 mt-4 font-mono animate-pulse-slow">
        Reading on-chain history...
      </p>
    </div>
  );
}