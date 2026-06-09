import { useEffect, useState, lazy, Suspense } from 'react';
import { useStore } from '@/store';
import { Zap, ArrowLeft } from 'lucide-react';
import TimeScrubber from '@/components/TimeScrubber';
import { APP_NAME, APP_TAGLINE } from '@/constants';
import WalletInput from '@/components/WalletInput';
import ProfileCard from '@/components/ProfileCard';
import { cn } from '@/utils/cn';

const NexusScene = lazy(() => import('@/scenes/NexusScene'));

function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-void-950 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl border-2 border-arc-400/30 border-t-arc-400 animate-spin" />
        <p className="text-white/40 text-sm font-mono animate-pulse">Loading Nexus...</p>
      </div>
    </div>
  );
}

interface HomeScreenProps {
  onGenerate: (address: string) => void;
  isLoading: boolean;
  error: string | null;
  addressParam: string | null;
}

function HomeScreen({ onGenerate, isLoading, error, addressParam }: HomeScreenProps) {
  const [mounted, setMounted] = useState(false);
  const [show3DToggle, setShow3DToggle] = useState(false);
  const show3D = useStore((s) => s.show3D);
  const toggle3D = useStore((s) => s.toggle3D);

  useEffect(() => {
    setMounted(true);
    if (addressParam) {
      onGenerate(addressParam);
    }
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-void-950 relative overflow-hidden flex flex-col">
      {/* Background effects */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(at 15% 15%, hsla(210,80%,20%,0.3) 0px, transparent 55%),
            radial-gradient(at 85% 85%, hsla(165,80%,15%,0.2) 0px, transparent 55%),
            radial-gradient(at 50% 100%, hsla(220,60%,10%,0.4) 0px, transparent 60%)
          `,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-arc-500/20 border border-arc-500/30 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-arc-400" />
          </div>
          <span className="font-display font-bold text-white tracking-tight text-sm">
            {APP_NAME}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShow3DToggle(!show3DToggle)}
            className="text-xs text-white/30 hover:text-white/60 transition-colors font-mono"
          >
            {show3D ? '2D' : '3D'}
          </button>
          <span className="text-xs text-white/20 font-mono hidden sm:block">v2.0</span>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="animate-fade-up stagger-1 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-arc-500/20 bg-arc-500/5 text-arc-400 text-xs font-mono mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-arc-400 animate-pulse-slow" />
          Any EVM wallet &middot; 3D Worlds &middot; Free
        </div>

        <h1 className="animate-fade-up stagger-2 font-display font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-white mb-3 max-w-4xl">
          Your wallet has
          <br />
          <span className="text-gradient-arc">a world.</span>
        </h1>
        <p className="animate-fade-up stagger-3 text-white/30 font-body text-lg sm:text-xl max-w-lg mb-10 leading-relaxed">
          Paste any Ethereum address to generate a living, interactive 3D identity universe.
          Explore your on-chain archetype through a uniquely generated world.
        </p>

        <div className="animate-fade-up stagger-4 w-full max-w-lg mb-8">
          <WalletInput onSubmit={onGenerate} isLoading={isLoading} error={error} />
        </div>

        <div className="animate-fade-up stagger-5 grid grid-cols-3 gap-4 max-w-md text-center">
          {[
            { emoji: '💎', label: '10 Archetypes', desc: 'Unique on-chain personality' },
            { emoji: '🌍', label: '3D Worlds', desc: 'Procedural living environments' },
            { emoji: '🧬', label: 'DNA Evidence', desc: 'Every factor explained' },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-xl border border-white/05 bg-white/[0.02]">
              <span className="text-2xl block mb-1">{item.emoji}</span>
              <p className="text-xs font-display font-bold text-white/80">{item.label}</p>
              <p className="text-[10px] text-white/30 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 py-6 text-center">
        <p className="text-xs text-white/15 font-mono">
          100% on-chain &middot; 100% free &middot; All client-side
        </p>
      </footer>
    </main>
  );
}

interface CardScreenProps {
  onBack: () => void;
}

function CardScreen({ onBack }: CardScreenProps) {
  const walletProfile = useStore((s) => s.walletProfile);
  const show3D = useStore((s) => s.show3D);
  const toggle3D = useStore((s) => s.toggle3D);
  const archetype = walletProfile?.archetype;

  return (
    <div className="min-h-screen bg-void-950 relative">
      {/* 3D Background */}
      <div className={cn(
        'fixed inset-0 transition-opacity duration-700',
        show3D ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}>
        <Suspense fallback={<LoadingScreen />}>
          <NexusScene />
        </Suspense>
      </div>

      <TimeScrubber />

      {/* UI Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="flex items-center justify-between px-6 py-5 max-w-2xl mx-auto w-full">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-display font-semibold">Back</span>
          </button>
          <button
            onClick={toggle3D}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all duration-200',
              show3D
                ? 'border-arc-500/30 bg-arc-500/10 text-arc-400'
                : 'border-white/10 text-white/40 hover:border-white/20'
            )}
          >
            {show3D ? '🌍 3D World' : '📄 Flat View'}
          </button>
        </header>

        <div className="flex-1 flex items-start justify-center px-4 pb-20 max-w-2xl mx-auto w-full pt-8">
          <div className={cn(
            'transition-all duration-500',
            show3D ? 'bg-void-900/60 backdrop-blur-xl rounded-3xl p-4 border border-white/05' : ''
          )}>
            <ProfileCard />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<'home' | 'card'>('home');
  const [addressParam, setAddressParam] = useState<string | null>(null);
  const walletProfile = useStore((s) => s.walletProfile);
  const status = useStore((s) => s.status);
  const error = useStore((s) => s.error);
  const generateCard = useStore((s) => s.generateCard);
  const reset = useStore((s) => s.reset);
  const fetchSavedCards = useStore((s) => s.fetchSavedCards);

  useEffect(() => {
    fetchSavedCards();
    const params = new URLSearchParams(window.location.search);
    const addr = params.get('address');
    if (addr) setAddressParam(addr);
  }, []);

  useEffect(() => {
    if (walletProfile && status === 'complete') {
      setView('card');
      window.history.replaceState({}, '', `/?address=${walletProfile.address}`);
    }
  }, [walletProfile, status]);

  function handleGenerate(input: string) {
    generateCard(input);
  }

  function handleBack() {
    setView('home');
    reset();
    window.history.replaceState({}, '', '/');
  }

  if (view === 'card') {
    return <CardScreen onBack={handleBack} />;
  }

  return (
    <HomeScreen
      onGenerate={handleGenerate}
      isLoading={status === 'searching' || status === 'analyzing' || status === 'generating'}
      error={error}
      addressParam={addressParam}
    />
  );
}