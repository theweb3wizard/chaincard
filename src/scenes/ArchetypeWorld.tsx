import { lazy, Suspense } from 'react';
import type { ArchetypeKey } from '@/types';
import CrystallineWorld from './CrystallineWorld';
import DeFiFarmerWorld from './DeFiFarmerWorld';
import NFTDegenWorld from './NFTDegenWorld';
import GovernanceWhaleWorld from './GovernanceWhaleWorld';
import GasBurnerWorld from './GasBurnerWorld';
import AirdropHunterWorld from './AirdropHunterWorld';
import FlipperWorld from './FlipperWorld';
import WhaleWorld from './WhaleWorld';
import CollectorWorld from './CollectorWorld';
import NewBloodWorld from './NewBloodWorld';

interface ArchetypeWorldProps {
  archetype: ArchetypeKey;
  address: string;
}

function WorldFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="#4DFFD2" wireframe transparent opacity={0.3} />
    </mesh>
  );
}

export default function ArchetypeWorld({ archetype, address }: ArchetypeWorldProps) {
  switch (archetype) {
    case 'DIAMOND_HAND':
      return <CrystallineWorld />;
    case 'DEFI_FARMER':
      return <DeFiFarmerWorld />;
    case 'NFT_DEGEN':
      return <NFTDegenWorld />;
    case 'GOVERNANCE_WHALE':
      return <GovernanceWhaleWorld />;
    case 'GAS_BURNER':
      return <GasBurnerWorld />;
    case 'AIRDROP_HUNTER':
      return <AirdropHunterWorld />;
    case 'FLIPPER':
      return <FlipperWorld />;
    case 'WHALE':
      return <WhaleWorld />;
    case 'COLLECTOR':
      return <CollectorWorld />;
    case 'NEW_BLOOD':
      return <NewBloodWorld />;
    default:
      return <WorldFallback />;
  }
}