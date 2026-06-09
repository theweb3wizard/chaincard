import { useStore } from '@/store';
import { ARCHETYPES } from '@/constants';
import { shortenAddress, truncateHash } from '@/utils/address';
import {
  formatUsd,
  formatNumber,
  formatEth,
  formatWalletAge,
  formatPnl,
} from '@/utils/format';
import { Share2, Download, Bookmark, BookmarkCheck, RotateCcw } from 'lucide-react';
import { cn } from '@/utils/cn';
import StatBadge from './ui/StatBadge';
import ChainBadge from './ui/ChainBadge';
import NFTThumbnail from './ui/NFTThumbnail';
import ArchetypeDNA from './ArchetypeDNA';
import { useCallback, useState } from 'react';

export default function ProfileCard() {
  const walletProfile = useStore((s) => s.walletProfile);
  const show3D = useStore((s) => s.show3D);
  const savedCards = useStore((s) => s.savedCards);
  const toggleSaveCard = useStore((s) => s.toggleSaveCard);

  const [showDNA, setShowDNA] = useState(false);

  if (!walletProfile) return null;

  const archConfig = ARCHETYPES[walletProfile.archetype];
  const displayName = walletProfile.ensName || shortenAddress(walletProfile.address, 4);
  const isSaved = savedCards.some(
    (c) => c.address.toLowerCase() === walletProfile.address.toLowerCase()
  );

  function handleShare() {
    const url = `${window.location.origin}/?address=${walletProfile.address}`;
    const text = encodeURIComponent(
      `🔗 My on-chain identity: ${archConfig.label}\n\n${archConfig.description}\n\nLegitimacy Score: ${walletProfile.legitimacyScore}/100\n\nCheck yours: ${url}`
    );
    window.open(
      `https://twitter.com/intent/tweet?text=${text}`,
      '_blank',
      'noopener,noreferrer,width=600,height=400'
    );
  }

  async function handleDownload() {
    try {
      const { toPng } = await import('html-to-image');
      const el = document.getElementById('profile-card');
      if (!el) return;
      const dataUrl = await toPng(el, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#080B12',
      });
      const link = document.createElement('a');
      link.download = `chaincard-${displayName}.png`;
      link.href = dataUrl;
      link.click();
    } catch {}
  }

  function handleSave() {
    toggleSaveCard({
      address: walletProfile.address,
      ensName: walletProfile.ensName,
      archetype: walletProfile.archetype,
      avatarUrl: walletProfile.avatarUrl,
      timestamp: Date.now(),
    });
  }

  const formatNetWorth = () => {
    if (walletProfile.netWorthUsd >= 1) return formatUsd(walletProfile.netWorthUsd, true);
    if (walletProfile.nativeBalanceEth >= 0.0001) return formatEth(walletProfile.nativeBalanceEth);
    return '\u2014';
  };

  return (
    <div className="w-full max-w-lg mx-auto" id="profile-card">
      {!show3D && (
        <div className={cn('rounded-3xl overflow-hidden border animate-scale-in')}
          style={{
            borderColor: `${archConfig.glowColor}20`,
            boxShadow: `0 0 0 1px ${archConfig.glowColor}10, 0 32px 80px rgba(0,0,0,0.8), 0 0 120px ${archConfig.glowColor}15`,
            background: `linear-gradient(180deg, rgba(13,17,23,0.9), rgba(13,17,23,0.95))`,
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="h-1 w-full"
            style={{ background: `linear-gradient(90deg, ${archConfig.glowColor}80, ${archConfig.glowColor}20, transparent)` }}
          />

          <div className="p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex-shrink-0 border overflow-hidden flex items-center justify-center"
                style={{
                  borderColor: `${archConfig.glowColor}30`,
                  background: `conic-gradient(from 0deg, ${archConfig.glowColor}40, #1E2535, ${archConfig.glowColor}20, #1E2535)`,
                }}
              >
                {walletProfile.avatarUrl ? (
                  <img src={walletProfile.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg">{archConfig.emoji}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold text-white text-sm truncate">{displayName}</p>
                <p className="font-mono text-xs text-white/30 truncate">
                  {shortenAddress(walletProfile.address, 6)}
                </p>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="text-lg">{archConfig.emoji}</span>
                  <span className="font-display font-bold text-sm" style={{ color: archConfig.glowColor }}>
                    {archConfig.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Archetype */}
            <div className={cn(
              'rounded-2xl p-5 border',
              'bg-gradient-to-br from-white/[0.03] to-transparent'
            )}
              style={{
                borderColor: `${archConfig.glowColor}20`,
                boxShadow: `inset 0 0 30px ${archConfig.glowColor}08`,
              }}>
              <p className="text-xs text-white/40 font-mono mb-3 tracking-wider">
                ON-CHAIN ARCHETYPE
              </p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl">{archConfig.emoji}</span>
                <span className="font-display font-extrabold text-xl" style={{ color: archConfig.glowColor }}>
                  {archConfig.label}
                </span>
                <span className="text-xs text-white/30 font-mono ml-auto">
                  Legitimacy {walletProfile.legitimacyScore}/100
                </span>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">
                {archConfig.description}
              </p>

              <button
                onClick={() => setShowDNA(!showDNA)}
                className="mt-3 text-xs font-mono flex items-center gap-1.5 transition-colors"
                style={{ color: `${archConfig.glowColor}80` }}
              >
                <RotateCcw className="w-3 h-3" />
                {showDNA ? 'Hide evidence' : 'How was this calculated?'}
              </button>
            </div>

            {/* DNA Evidence */}
            {showDNA && (
              <ArchetypeDNA
                label={archConfig.label}
                emoji={archConfig.emoji}
                glowColor={archConfig.glowColor}
                legitimacyScore={walletProfile.legitimacyScore}
                factors={walletProfile.archetypeFactors}
              />
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <StatBadge label="Transactions" value={formatNumber(walletProfile.totalTransactions)} emoji="⚡" />
              <StatBadge label="Wallet Age" value={formatWalletAge(walletProfile.firstTxDate)} emoji="📅" />
              <StatBadge label="Gas Burned" value={walletProfile.totalGasSpentUsd >= 0.01 ? formatUsd(walletProfile.totalGasSpentUsd, true) : formatEth(walletProfile.totalGasSpentEth)} emoji="💸" />
              <StatBadge label="Net Worth" value={formatNetWorth()} emoji="💰" />
              <StatBadge
                label="Chains"
                value={walletProfile.chainsActive.length > 0 ? `${walletProfile.chainsActive.length} chain${walletProfile.chainsActive.length > 1 ? 's' : ''}` : 'ETH only'}
                emoji="🌐"
              />
              <StatBadge label="Protocols" value={walletProfile.uniqueProtocols > 0 ? `${walletProfile.uniqueProtocols}+` : '\u2014'} emoji="📊" />
            </div>

            {/* PnL */}
            {walletProfile.realizedPnlUsd !== null && (
              <StatBadge
                label="Realized PnL"
                value={(walletProfile.realizedPnlUsd >= 0 ? '+' : '') + formatUsd(walletProfile.realizedPnlUsd, true)}
                emoji={walletProfile.realizedPnlUsd >= 0 ? '📈' : '📉'}
              />
            )}

            {/* Chains */}
            {walletProfile.chainsActive.length > 0 && (
              <div>
                <p className="text-xs text-white/30 mb-2 font-mono tracking-wider">ACTIVE ON</p>
                <div className="flex flex-wrap gap-2">
                  {walletProfile.chainsActive.map((c) => (
                    <ChainBadge key={c.chain} chain={c.chain} label={c.label} />
                  ))}
                </div>
              </div>
            )}

            {/* NFTs */}
            {walletProfile.topNfts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-white/30 font-mono tracking-wider">NFTS HELD</p>
                  <span className="text-xs text-white/20 font-mono">
                    {walletProfile.totalNftCount} total
                  </span>
                </div>
                <div className="flex gap-2.5">
                  {walletProfile.topNfts.map((nft, i) => (
                    <NFTThumbnail key={i} nft={nft} size={64} />
                  ))}
                  {walletProfile.totalNftCount > 3 && (
                    <div
                      className="w-16 h-16 rounded-xl border border-white/05 flex items-center justify-center text-xs text-white/30 font-mono flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.03)' }}
                    >
                      +{walletProfile.totalNftCount - 3}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Governance / Airdrops */}
            {(walletProfile.governanceVotes > 0 || walletProfile.airdropsReceived > 0) && (
              <div className="grid grid-cols-2 gap-2.5">
                {walletProfile.governanceVotes > 0 && (
                  <StatBadge label="Governance Votes" value={formatNumber(walletProfile.governanceVotes)} emoji="🏛️" />
                )}
                {walletProfile.airdropsReceived > 0 && (
                  <StatBadge label="Airdrops" value={formatNumber(walletProfile.airdropsReceived)} emoji="🪂" />
                )}
              </div>
            )}
          </div>

          <div className="px-6 pb-5">
            <div className="h-px bg-white/05 mb-3" />
            <p className="font-mono text-xs text-white/15 text-center tracking-widest uppercase">
              ChainCard Nexus &mdash; Your Wallet, A Living World
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className={cn(
        'flex gap-2 pt-4',
        show3D ? 'justify-center' : 'justify-stretch'
      )}>
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1DA1F2] hover:bg-[#1a8fd1] text-white text-sm font-display font-semibold transition-all duration-200 shadow-[0_4px_20px_rgba(29,161,242,0.3)] hover:shadow-[0_4px_30px_rgba(29,161,242,0.5)] active:scale-[0.97] min-h-[44px] flex-1"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/05 hover:bg-white/10 text-white/70 hover:text-white text-sm font-display font-semibold transition-all duration-200 active:scale-[0.97] min-h-[44px] flex-1"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
        <button
          onClick={handleSave}
          className={cn(
            'flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-display font-semibold transition-all duration-200 active:scale-[0.97] min-h-[44px] flex-1',
            isSaved
              ? 'bg-arc-500/20 border-arc-500/30 text-arc-400'
              : 'bg-white/05 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
          )}
        >
          {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          {isSaved ? 'Saved' : 'Save'}
        </button>
      </div>
    </div>
  );
}