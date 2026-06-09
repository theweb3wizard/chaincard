import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/store';
import { DeterministicPRNG } from '@/utils/prng';

function Seedling({ position, scale, color, seed }: { position: [number, number, number]; scale: number; color: string; seed: string }) {
  const stemRef = useRef<THREE.Mesh>(null);
  const leafRef = useRef<THREE.Mesh>(null);
  const prng = useMemo(() => new DeterministicPRNG(seed + '-seedling-' + position.join('-')), [seed, position]);
  const growthSpeed = prng.nextFloat(0.3, 0.7);
  const leanAngle = prng.nextFloat(-0.2, 0.2);

  useFrame((state) => {
    if (stemRef.current) {
      const growth = Math.min(1, Math.sin(state.clock.elapsedTime * growthSpeed * 0.5) * 0.5 + 0.5);
      stemRef.current.scale.y = 0.3 + growth * 0.7;
      stemRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3 + position[0]) * 0.03 + leanAngle;
    }
    if (leafRef.current) {
      leafRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4 + position[2]) * 0.05;
    }
  });

  return (
    <group position={position} scale={scale}>
      <Float speed={0.5} floatIntensity={0.03}>
        <mesh ref={stemRef} position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.015, 0.025, 0.3, 6]} />
          <meshPhysicalMaterial color="#86EFAC" metalness={0.1} roughness={0.6} />
        </mesh>
        <mesh ref={leafRef} position={[0.04, 0.25, 0]} rotation={[0, 0, -0.3]}>
          <planeGeometry args={[0.08, 0.04]} />
          <meshBasicMaterial color="#34D399" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[-0.03, 0.23, 0]} rotation={[0, 0, 0.3]}>
          <planeGeometry args={[0.06, 0.03]} />
          <meshBasicMaterial color="#4ADE80" transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      </Float>
    </group>
  );
}

function GrowthParticles({ count, seed }: { count: number; seed: string }) {
  const ref = useRef<THREE.Points>(null);
  const prng = useMemo(() => new DeterministicPRNG(seed + '-growth'), [seed]);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = prng.next() * Math.PI * 2;
      const radius = prng.nextFloat(0.5, 3);
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = prng.nextFloat(-0.3, 0.8);
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, [count, prng]);

  const lifetimes = useMemo(() => {
    const l = new Float32Array(count);
    for (let i = 0; i < count; i++) l[i] = prng.nextFloat(0.5, 1);
    return l;
  }, [count, prng]);

  useFrame((state) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      pos[idx + 1] += Math.sin(state.clock.elapsedTime * 0.2 + i * 0.1) * 0.003;
      pos[idx + 1] = Math.max(-0.3, Math.min(1, pos[idx + 1]));
      pos[idx] += Math.cos(state.clock.elapsedTime * 0.1 + i * 0.3) * 0.002;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#86EFAC" size={0.02} transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

function SoilGround() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <circleGeometry args={[3.5, 32]} />
        <meshStandardMaterial color="#1A0A00" roughness={1} metalness={0} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.09, 0]}>
        <circleGeometry args={[3.5, 32]} />
        <meshStandardMaterial color="#2D1810" transparent opacity={0.3} roughness={1} />
      </mesh>
    </group>
  );
}

function LightRays() {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.002;
      const opacity = 0.15 + Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
      ref.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          (child.material as THREE.MeshBasicMaterial).opacity = opacity;
        }
      });
    }
  });

  const rays = useMemo(() => {
    const arr: { angle: number; height: number }[] = [];
    for (let i = 0; i < 5; i++) {
      arr.push({ angle: (i / 5) * Math.PI * 2, height: 1 + Math.sin(i * 1.5) * 0.3 });
    }
    return arr;
  }, []);

  return (
    <group ref={ref}>
      {rays.map((r, i) => (
        <mesh key={i} position={[Math.cos(r.angle) * 1.5, r.height, Math.sin(r.angle) * 1.5]}>
          <coneGeometry args={[0.02, 0.4, 6]} />
          <meshBasicMaterial color="#86EFAC" transparent opacity={0.15} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
}

export default function NewBloodWorld() {
  const groupRef = useRef<THREE.Group>(null);
  const walletProfile = useStore((s) => s.walletProfile);
  const seed = walletProfile?.address || 'default-seed';
  const prng = useMemo(() => new DeterministicPRNG(seed + '-seed'), [seed]);

  const seedlings = useMemo(() => {
    const count = prng.nextInt(3, 8);
    const arr: { pos: [number, number, number]; scale: number; color: string }[] = [];
    for (let i = 0; i < count; i++) {
      const angle = prng.next() * Math.PI * 2;
      const radius = prng.nextFloat(0.3, 1.8);
      const hue = 140 + prng.nextFloat(-20, 20);
      arr.push({
        pos: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius],
        scale: prng.nextFloat(0.6, 1.2),
        color: `hsl(${hue}, 70%, 55%)`,
      });
    }
    return arr;
  }, [prng]);

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[1, 4, 2]} intensity={1.5} color="#86EFAC" />
      <directionalLight position={[-1, 2, -1]} intensity={0.3} color="#34D399" />
      <pointLight position={[0, 2, 0]} intensity={2} color="#86EFAC" distance={6} decay={2} />
      <hemisphereLight args={['#86EFAC', '#1A0A00', 0.3]} />

      <SoilGround />
      <GrowthParticles count={200} seed={seed} />
      <LightRays />

      {seedlings.map((s, i) => (
        <Seedling key={i} position={s.pos} scale={s.scale} color={s.color} seed={seed} />
      ))}

      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#86EFAC" />
      </mesh>
    </group>
  );
}