import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Html,
  useProgress,
} from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { useStore } from '@/store';
import ArchetypeWorld from './ArchetypeWorld';
import * as THREE from 'three';

function CameraController() {
  const controlsRef = useRef<any>(null);

  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={true}
      minDistance={2}
      maxDistance={12}
      target={[0, 0, 0]}
      makeDefault
    />
  );
}

function SceneLoader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-full border-2 border-arc-400/30 border-t-arc-400 animate-spin" />
        <p className="text-white/60 text-sm font-mono">{progress.toFixed(0)}%</p>
      </div>
    </Html>
  );
}

interface SceneContentProps {
  archetype: string;
  address: string;
}

function SceneContent({ archetype, address }: SceneContentProps) {
  return (
    <Suspense fallback={<SceneLoader />}>
      <ArchetypeWorld archetype={archetype as any} address={address} />
    </Suspense>
  );
}

export default function NexusScene() {
  const walletProfile = useStore((s) => s.walletProfile);

  if (!walletProfile) return null;

  return (
    <Canvas
      shadows
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
      }}
      camera={{ position: [4, 2, 4], fov: 45, near: 0.1, far: 100 }}
      gl={{
        antialias: true,
        outputColorSpace: THREE.SRGBColorSpace,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#080B12']} />
      <fog attach="fog" args={['#080B12', 8, 15]} />

      <CameraController />
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-5, -2, 5]} intensity={0.3} color="#4DFFD2" />
      <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={15} blur={2.5} far={4} />
      <Environment preset="night" />
      <SceneContent archetype={walletProfile.archetype} address={walletProfile.address} />
      <EffectComposer>
        <Bloom intensity={0.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur />
        <ChromaticAberration offset={[0.002, 0.002]} radialModulation={false} modulationOffset={0} />
        <Vignette eskil={false} offset={0.3} darkness={0.5} />
      </EffectComposer>
    </Canvas>
  );
}