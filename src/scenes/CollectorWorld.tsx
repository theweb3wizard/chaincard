import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, SpotLight } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/store';
import { DeterministicPRNG } from '@/utils/prng';

function Pedestal({ position, color, scale, seed }: { position: [number, number, number]; color: string; scale: number; seed: string }) {
  const prng = useMemo(() => new DeterministicPRNG(seed + '-ped-' + position.join('-')), [seed, position]);
  const itemType = prng.pick(['box', 'sphere', 'icosahedron', 'torus']);

  const itemGeometry = useMemo(() => {
    switch (itemType) {
      case 'box': return <boxGeometry args={[0.2 * scale, 0.2 * scale, 0.2 * scale]} />;
      case 'sphere': return <sphereGeometry args={[0.12 * scale, 16, 16]} />;
      case 'icosahedron': return <icosahedronGeometry args={[0.13 * scale, 0]} />;
      case 'torus': return <torusGeometry args={[0.1 * scale, 0.04 * scale, 8, 16]} />;
    }
  }, [itemType, scale]);

  return (
    <group position={position}>
      <Float speed={0.5} floatIntensity={0.05}>
        <mesh position={[0, 0.15 * scale, 0]} castShadow>
          {itemGeometry}
          <meshPhysicalMaterial color={color} metalness={0.7} roughness={0.2} envMapIntensity={1.5} />
        </mesh>
      </Float>
      <mesh position={[0, 0, 0]} receiveShadow>
        <cylinderGeometry args={[0.06 * scale, 0.08 * scale, 0.1 * scale, 8]} />
        <meshStandardMaterial color="#1E2535" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.05 * scale, 0]}>
        <cylinderGeometry args={[0.1 * scale, 0.12 * scale, 0.02 * scale, 12]} />
        <meshStandardMaterial color="#2A3347" metalness={0.6} roughness={0.2} />
      </mesh>
    </group>
  );
}

function GallerySpotlight({ position, target, color }: { position: [number, number, number]; target: [number, number, number]; color: string }) {
  return (
    <SpotLight
      position={position}
      angle={0.3}
      penumbra={0.5}
      intensity={2}
      color={color}
      distance={5}
      decay={2}
      target-position={target}
      castShadow
    />
  );
}

function GalleryFloor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#0D1117" roughness={0.8} metalness={0.2} />
      </mesh>
      <gridHelper args={[8, 16, '#ffffff08', '#ffffff08']} position={[0, -0.12, 0]} />
    </group>
  );
}

function GalleryWalls() {
  return (
    <group>
      {[
        { pos: [0, 1, -4], rot: 0 },
        { pos: [0, 1, 4], rot: Math.PI },
        { pos: [-4, 1, 0], rot: -Math.PI / 2 },
        { pos: [4, 1, 0], rot: Math.PI / 2 },
      ].map((wall, i) => (
        <mesh key={i} position={wall.pos} rotation={[0, wall.rot, 0]}>
          <planeGeometry args={[8, 3]} />
          <meshStandardMaterial color="#161B27" side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

function DustMotes({ count, seed }: { count: number; seed: string }) {
  const ref = useRef<THREE.Points>(null);
  const prng = useMemo(() => new DeterministicPRNG(seed + '-dust'), [seed]);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = prng.nextFloat(-3.5, 3.5);
      pos[i * 3 + 1] = prng.nextFloat(-0.5, 2.5);
      pos[i * 3 + 2] = prng.nextFloat(-3.5, 3.5);
    }
    return pos;
  }, [count, prng]);

  useFrame((state) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      pos[idx + 1] += Math.sin(state.clock.elapsedTime * 0.1 + i) * 0.001;
      pos[idx] += Math.cos(state.clock.elapsedTime * 0.08 + i * 0.3) * 0.0005;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#F472B6" size={0.01} transparent opacity={0.3} sizeAttenuation />
    </points>
  );
}

export default function CollectorWorld() {
  const groupRef = useRef<THREE.Group>(null);
  const walletProfile = useStore((s) => s.walletProfile);
  const seed = walletProfile?.address || 'default-seed';
  const prng = useMemo(() => new DeterministicPRNG(seed + '-gallery'), [seed]);

  const pedestals = useMemo(() => {
    const count = 7;
    const arr: { pos: [number, number, number]; color: string; scale: number }[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = prng.nextFloat(0.8, 2.5);
      const hue = 320 + prng.nextFloat(-30, 30);
      arr.push({
        pos: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius],
        color: `hsl(${hue}, 65%, 60%)`,
        scale: prng.nextFloat(0.8, 1.3),
      });
    }
    return arr;
  }, [prng]);

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.15} />
      <directionalLight position={[0, 4, 0]} intensity={0.2} color="#F472B6" />
      <pointLight position={[0, 2, 0]} intensity={0.5} color="#F472B6" distance={6} decay={2} />

      <GalleryFloor />
      <GalleryWalls />
      <DustMotes count={100} seed={seed} />

      {pedestals.map((p, i) => (
        <group key={i}>
          <GallerySpotlight
            position={[p.pos[0], 2, p.pos[2]]}
            target={[p.pos[0], 0, p.pos[2]]}
            color={p.color}
          />
          <Pedestal position={p.pos} color={p.color} scale={p.scale} seed={seed} />
        </group>
      ))}
    </group>
  );
}