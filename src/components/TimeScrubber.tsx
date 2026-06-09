import { useCallback, useRef, useState } from 'react';
import { useStore } from '@/store';
import { cn } from '@/utils/cn';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Clock,
} from 'lucide-react';

export default function TimeScrubber() {
  const timeProgress = useStore((s) => s.timeProgress);
  const setTimeProgress = useStore((s) => s.setTimeProgress);
  const walletProfile = useStore((s) => s.walletProfile);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const animFrameRef = useRef<number | null>(null);

  if (!walletProfile || !walletProfile.firstTxDate) return null;

  const firstTx = new Date(walletProfile.firstTxDate).getTime();
  const now = Date.now();
  const totalDuration = now - firstTx;

  const formatDate = (progress: number) => {
    const date = new Date(firstTx + progress * totalDuration);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTimeAgo = (progress: number) => {
    const date = new Date(firstTx + progress * totalDuration);
    const diff = now - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days < 1) return 'Today';
    if (days < 30) return `${days} days ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    } else {
      setIsPlaying(true);
      const animate = () => {
        const current = useStore.getState().timeProgress;
        const next = current + 0.001;
        if (next >= 1) {
          setTimeProgress(1);
          setIsPlaying(false);
        } else {
          setTimeProgress(next);
        }
        animFrameRef.current = requestAnimationFrame(animate);
      };
      animFrameRef.current = requestAnimationFrame(animate);
    }
  }, [isPlaying, setTimeProgress]);

  const handleSkip = useCallback((direction: 'back' | 'forward') => {
    const step = direction === 'back' ? -0.05 : 0.05;
    const current = useStore.getState().timeProgress;
    setTimeProgress(Math.max(0, Math.min(1, current + step)));
  }, [setTimeProgress]);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeProgress(parseFloat(e.target.value));
  }, [setTimeProgress]);

  const currentDate = formatDate(timeProgress);
  const currentTimeAgo = formatTimeAgo(timeProgress);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowTimeline(!showTimeline)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-mono transition-all duration-200',
            showTimeline
              ? 'border-arc-500/30 bg-arc-500/10 text-arc-400'
              : 'border-white/10 bg-void-800/80 backdrop-blur-xl text-white/50 hover:text-white/80'
          )}
        >
          <Clock className="w-3.5 h-3.5" />
          {showTimeline ? 'Hide Timeline' : 'Wallet History'}
        </button>
      </div>

      {showTimeline && (
        <div
          className={cn(
            'absolute bottom-16 left-1/2 -translate-x-1/2',
            'w-[340px] rounded-2xl border overflow-hidden shadow-2xl animate-scale-in',
            'bg-void-800/90 backdrop-blur-xl border-white/10'
          )}
        >
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-display font-bold text-white/80">Wallet Timeline</p>
              <button
                onClick={() => setTimeProgress(1)}
                className="text-[10px] font-mono text-white/30 hover:text-white/60 transition-colors"
              >
                Reset to Present
              </button>
            </div>

            {/* Slider */}
            <div className="relative">
              <input
                type="range"
                min="0"
                max="1"
                step="0.001"
                value={timeProgress}
                onChange={handleSliderChange}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10 accent-arc-400"
                style={{
                  background: `linear-gradient(to right, #4DFFD2 ${timeProgress * 100}%, rgba(255,255,255,0.1) ${timeProgress * 100}%)`,
                }}
              />
            </div>

            {/* Date Display */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-white/40">{formatDate(0)}</span>
              <div className="text-center">
                <p className="font-display font-bold text-white text-sm">{currentDate}</p>
                <p className="font-mono text-[10px] text-white/30">{currentTimeAgo}</p>
              </div>
              <span className="font-mono text-white/40">{formatDate(1)}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                onClick={() => handleSkip('back')}
                className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all"
                aria-label="Skip back"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={handlePlayPause}
                className="p-3 rounded-xl bg-arc-500/20 border border-arc-500/30 text-arc-400 hover:bg-arc-500/30 transition-all"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => handleSkip('forward')}
                className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all"
                aria-label="Skip forward"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}