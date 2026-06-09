import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/store';
import { DeterministicPRNG } from '@/utils/prng';

function GeodeCrystal({ position, color, seed, index }: { position: [number, number, number]; color: string; seed: string; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const prng = useMemo(() => new DeterministicPRNG(seed + '-geode-' + index), [seed, index]);
  const size = prng.nextFloat(0.15, 0.4);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1 + index) * 0.05;
      meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.15 + index * 0.5) * 0.05;
    }
  });

  return (
    <Float speed={0.3} floatIntensity={0.03}>
      <mesh ref={meshRef} position={position}>
        <dodecahedronGeometry args={[size, 0]} />
        <MeshTransmissionMaterial
          color={new THREE.Color(color)}
          metalness={0.5}
          roughness={0.2}
          transmission={0.7}
          thickness={0.5}
          ior={2.0}
          envMapIntensity={2}
          clearcoat={1}
        />
      </mesh>
      <mesh position={position} scale={size * 0.6}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color={new THREE.Color(color)} transparent opacity={0.15} />
      </mesh>
    </Float>
  );
}

function PrismaticBeams({ seed }: { seed: string }) {
  const prng = useMemo(() => new DeterministicPRNG(seed + '-beams'), [seed]);
  const count = 6;

  const beams = useMemo(() => {
    const arr: { angle: number; color: string }[] = [];
    for (let i = 0; i < count; i++) {
      const hue = prng.nextFloat(180, 240);
      arr.push({ angle: (i / count) * Math.PI * 2, color: `hsl(${hue}, 80%, 60%)` });
    }
    return arr;
  }, [prng]);

  return (
    <group>
      {beams.map((b, i) => (
        <mesh key={i} position={[Math.cos(b.angle) * 2, 0, Math.sin(b.angle) * 2]}>
          <coneGeometry args={[0.02, 0.5, 6]} />
          <meshBasicMaterial color={b.color} transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function CaveFog() {
  return (
    <mesh>
      <sphereGeometry args={[3.5, 16, 16]} />
      <meshStandardMaterial color="#0A1628" transparent opacity={0.6} side={THREE.BackSide} roughness={1} metalness={0} />
    </mesh>
  );
}

export default function AirdropHunterWorld() {
  const groupRef = useRef<THREE.Group>(null);
  const walletProfile = useStore((s) => s.walletProfile);
  const seed = walletProfile?.address || 'default-seed';
  const prng = useMemo(() => new DeterministicPRNG(seed + '-cave'), [seed]);

  const geodes = useMemo(() => {
    const count = 15;
    const arr: { pos: [number, number, number]; color: string }[] = [];
    for (let i = 0; i < count; i++) {
      const angle = prng.next() * Math.PI * 2;
      const radius = prng.nextFloat(0.5, 2.8);
      const hue = 190 + prng.nextFloat(-30, 30);
      arr.push({
        pos: [Math.cos(angle) * radius, prng.nextFloat(-1, 0.5), Math.sin(angle) * radius],
        color: `hsl(${hue}, 70%, 55%)`,
      });
    }
    return arr;
  }, [prng]);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.003;
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 1, 0]} intensity={1.5} color="#38BDF8" distance={6} decay={2} />
      <pointLight position={[1.5, -0.5, 1.5]} intensity={0.8} color="#22D3EE" distance={4} decay={2} />
      <pointLight position={[-1.5, -0.5, -1.5]} intensity={0.8} color="#818CF8" distance={4} decay={2} />
      <hemisphereLight args={['#38BDF8', '#0A1628', 0.3]} />

      <CaveFog />
      <PrismaticBeams seed={seed} />

      {geodes.map((g, i) => (
        <GeodeCrystal key={i} position={g.pos} color={g.color} seed={seed} index={i} />
      ))}

      <mesh position={[0, -1.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3, 32]} />
        <meshStandardMaterial color="#0A1628" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}