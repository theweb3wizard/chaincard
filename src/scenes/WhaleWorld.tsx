import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/store';
import { DeterministicPRNG } from '@/utils/prng';

function OceanAtmosphere() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      const rot = Math.sin(state.clock.elapsedTime * 0.02) * 0.01;
      ref.current.rotation.y += rot;
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[3.8, 24, 24]} />
      <meshPhysicalMaterial
        color="#0A1628"
        transparent
        opacity={0.7}
        roughness={0.2}
        metalness={0.8}
        side={THREE.BackSide}
        envMapIntensity={0.5}
      />
    </mesh>
  );
}

function GodRays() {
  const count = 8;
  const ref = useRef<THREE.Group>(null);

  const spots = useMemo(() => {
    const arr: { angle: number; tilt: number; color: string }[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const hue = 280 + Math.sin(i * 1.5) * 20;
      arr.push({ angle, tilt: 0.3 + Math.sin(i) * 0.2, color: `hsl(${hue}, 70%, 60%)` });
    }
    return arr;
  }, []);

  return (
    <group ref={ref}>
      {spots.map((s, i) => (
        <mesh key={i} position={[Math.cos(s.angle) * 2.5, 0, Math.sin(s.angle) * 2.5]}>
          <coneGeometry args={[0.03, 1.5, 6]} />
          <meshBasicMaterial color={s.color} transparent opacity={0.15} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
}

function LeviathanScale({ seed }: { seed: string }) {
  const ref = useRef<THREE.Group>(null);
  const prng = useMemo(() => new DeterministicPRNG(seed + '-leviathan'), [seed]);

  const scales = useMemo(() => {
    const count = 7;
    const arr: { pos: [number, number, number]; scale: number }[] = [];
    for (let i = 0; i < count; i++) {
      const angle = prng.next() * Math.PI * 2;
      const r = prng.nextFloat(1.5, 3.2);
      arr.push({ pos: [Math.cos(angle) * r, prng.nextFloat(-1, 1), Math.sin(angle) * r], scale: prng.nextFloat(0.1, 0.3) });
    }
    return arr;
  }, [prng]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
      ref.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={ref}>
      {scales.map((s, i) => (
        <Float key={i} speed={0.2} floatIntensity={0.05}>
          <mesh position={s.pos} scale={s.scale} rotation={[prng.nextFloat(-0.5, 0.5), 0, prng.nextFloat(-0.5, 0.5)]}>
            <octahedronGeometry args={[0.3, 0]} />
            <meshPhysicalMaterial color="#E879F9" metalness={0.8} roughness={0.2} transparent opacity={0.6} envMapIntensity={2} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function BioluminescentCreatures({ seed }: { seed: string }) {
  const ref = useRef<THREE.Points>(null);
  const prng = useMemo(() => new DeterministicPRNG(seed + '-creatures'), [seed]);
  const count = 150;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = prng.next() * Math.PI * 2;
      const phi = Math.acos(2 * prng.next() - 1);
      const r = prng.nextFloat(1, 3.5);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi) * 0.6;
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return pos;
  }, [prng]);

  useFrame((state) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const float = Math.sin(state.clock.elapsedTime * 0.1 + i * 0.05) * 0.05;
      pos[idx + 1] += float * 0.01;
      pos[idx] += Math.cos(state.clock.elapsedTime * 0.05 + i) * 0.002;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#E879F9" size={0.03} transparent opacity={0.5} sizeAttenuation blending={THREE.AdditiveBlending} />
    </points>
  );
}

export default function WhaleWorld() {
  const groupRef = useRef<THREE.Group>(null);
  const walletProfile = useStore((s) => s.walletProfile);
  const seed = walletProfile?.address || 'default-seed';

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.002;
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.1} color="#E879F9" />
      <directionalLight position={[0, 3, 0]} intensity={0.3} color="#A78BFA" />
      <pointLight position={[0, 0.5, 0]} intensity={3} color="#E879F9" distance={7} decay={2} />
      <pointLight position={[2, -0.5, 2]} intensity={1} color="#60A5FA" distance={4} decay={2} />
      <pointLight position={[-2, -0.5, -2]} intensity={1} color="#E879F9" distance={4} decay={2} />
      <hemisphereLight args={['#E879F9', '#0A1628', 0.4]} />

      <OceanAtmosphere />
      <GodRays />
      <LeviathanScale seed={seed} />
      <BioluminescentCreatures seed={seed} />

      <mesh position={[0, -1.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.5, 32]} />
        <meshStandardMaterial color="#0A1628" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}