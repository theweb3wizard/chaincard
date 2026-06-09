import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/store';
import { DeterministicPRNG } from '@/utils/prng';

function TerracedRing({ radius, height, color, segmentCount }: { radius: number; height: number; color: string; segmentCount: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const points = 12;
    for (let i = 0; i <= points; i++) {
      const a = (i / points) * Math.PI * 2;
      const r = radius + Math.sin(a * 3) * 0.05;
      s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    return s;
  }, [radius]);

  const geo = useMemo(() => {
    const extrudeSettings = { depth: height, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [shape, height]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 0.02;
  });

  return (
    <mesh ref={ref} geometry={geo} position={[0, -1 + height / 2, 0]} receiveShadow>
      <meshPhysicalMaterial color={color} metalness={0.2} roughness={0.8} />
    </mesh>
  );
}

function WheatField({ count, spread, seed }: { count: number; spread: number; seed: string }) {
  const ref = useRef<THREE.Points>(null);
  const prng = useMemo(() => new DeterministicPRNG(seed + '-wheat'), [seed]);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = prng.next() * Math.PI * 2;
      const radius = prng.nextFloat(0, spread);
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = prng.nextFloat(-0.5, 0.5);
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, [count, spread, prng]);

  const sizes = useMemo(() => {
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) s[i] = prng.nextFloat(0.02, 0.08);
    return s;
  }, [count, prng]);

  useFrame((state) => {
    if (!ref.current) return;
    const positionsArr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const baseY = Math.sin(idx * 0.1) * 0.1;
      positionsArr[idx + 1] = baseY + Math.sin(state.clock.elapsedTime * 0.8 + i * 0.1) * 0.05;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#D4A843" size={0.04} transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

export default function DeFiFarmerWorld() {
  const groupRef = useRef<THREE.Group>(null);
  const walletProfile = useStore((s) => s.walletProfile);
  const seed = walletProfile?.address || 'default-seed';
  const prng = useMemo(() => new DeterministicPRNG(seed + '-farm'), [seed]);

  const terraces = useMemo(() => {
    const arr: { radius: number; height: number }[] = [];
    for (let i = 0; i < 5; i++) {
      arr.push({ radius: 1 + i * 0.6 + prng.nextFloat(-0.1, 0.1), height: 0.08 + prng.nextFloat(0, 0.04) });
    }
    return arr;
  }, [prng]);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.01;
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 8, 4]} intensity={1.2} color="#FFD700" castShadow />
      <directionalLight position={[-2, 3, -3]} intensity={0.3} color="#FFA500" />
      <hemisphereLight args={['#87CEEB', '#D4A843', 0.4]} />

      {terraces.map((t, i) => (
        <TerracedRing key={i} radius={t.radius} height={t.height} color={`hsl(${38 + i * 3}, 60%, ${45 + i * 5}%)`} segmentCount={8 + i * 2} />
      ))}

      <WheatField count={800} spread={4} seed={seed} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]} receiveShadow>
        <circleGeometry args={[5, 32]} />
        <meshStandardMaterial color="#2D1810" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}