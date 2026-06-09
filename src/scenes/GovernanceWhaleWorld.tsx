import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/store';
import { DeterministicPRNG } from '@/utils/prng';

function CoralBranch({ position, color, seed, index }: { position: [number, number, number]; color: string; seed: string; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const prng = useMemo(() => new DeterministicPRNG(seed + '-coral-' + index), [seed, index]);

  const branchCount = prng.nextInt(3, 7);
  const branches = useMemo(() => {
    const arr: { pos: [number, number, number]; scale: number; rot: [number, number, number] }[] = [];
    for (let i = 0; i < branchCount; i++) {
      arr.push({
        pos: [prng.nextFloat(-0.2, 0.2), 0, prng.nextFloat(-0.2, 0.2)],
        scale: prng.nextFloat(0.3, 0.8),
        rot: [prng.nextFloat(-0.5, 0.5), prng.next() * Math.PI * 2, prng.nextFloat(-0.5, 0.5)],
      });
    }
    return arr;
  }, [prng]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2 + index) * 0.05;
    }
  });

  return (
    <group position={position}>
      <Float speed={0.3} floatIntensity={0.05}>
        <mesh ref={meshRef}>
          <tubeGeometry args={[
            new THREE.CatmullRomCurve3([
              new THREE.Vector3(0, 0, 0),
              new THREE.Vector3(0, 0.3, 0),
              new THREE.Vector3(0.1, 0.6, 0.05),
              new THREE.Vector3(0, 0.9, 0),
            ]),
            8, 0.05, 8, false,
          ]} />
          <meshPhysicalMaterial color={color} metalness={0.3} roughness={0.4} clearcoat={0.3} transparent opacity={0.9} />
        </mesh>
      </Float>
      {branches.map((b, i) => (
        <Float key={i} speed={0.4} floatIntensity={0.03}>
          <mesh position={b.pos} rotation={b.rot} scale={b.scale}>
            <capsuleGeometry args={[0.03, 0.2, 4, 6]} />
            <meshPhysicalMaterial color={color} metalness={0.2} roughness={0.5} transparent opacity={0.8} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function BioluminescentParticles({ count, seed }: { count: number; seed: string }) {
  const ref = useRef<THREE.Points>(null);
  const prng = useMemo(() => new DeterministicPRNG(seed + '-bio'), [seed]);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = prng.next() * Math.PI * 2;
      const phi = Math.acos(2 * prng.next() - 1);
      const r = prng.nextFloat(1, 4);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi) * 0.5;
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return pos;
  }, [count, prng]);

  useFrame((state) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      pos[idx + 1] += Math.sin(state.clock.elapsedTime * 0.2 + i * 0.1) * 0.001;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#FBBF24" size={0.04} transparent opacity={0.6} sizeAttenuation blending={THREE.AdditiveBlending} />
    </points>
  );
}

function VoteCurrents() {
  const ref = useRef<THREE.Points>(null);
  const count = 200;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 4;
      pos[i * 3] = Math.cos(t) * 2.5;
      pos[i * 3 + 1] = Math.sin(t * 0.5) * 0.5;
      pos[i * 3 + 2] = Math.sin(t) * 2.5;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    const t = state.clock.elapsedTime * 0.3;
    for (let i = 0; i < count; i++) {
      const phase = (i / count) * Math.PI * 4;
      pos[i * 3] = Math.cos(phase + t) * 2.5;
      pos[i * 3 + 1] = Math.sin((phase + t) * 0.5) * 0.3 + 0.5;
      pos[i * 3 + 2] = Math.sin(phase + t) * 2.5;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#FBBF24" size={0.03} transparent opacity={0.4} sizeAttenuation blending={THREE.AdditiveBlending} />
    </points>
  );
}

export default function GovernanceWhaleWorld() {
  const groupRef = useRef<THREE.Group>(null);
  const walletProfile = useStore((s) => s.walletProfile);
  const seed = walletProfile?.address || 'default-seed';
  const prng = useMemo(() => new DeterministicPRNG(seed + '-gov'), [seed]);

  const corals = useMemo(() => {
    const count = 12;
    const arr: { pos: [number, number, number]; color: string }[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + prng.nextFloat(-0.2, 0.2);
      const radius = prng.nextFloat(1.2, 3.5);
      const hue = 40 + prng.nextFloat(-15, 15);
      arr.push({
        pos: [Math.cos(angle) * radius, prng.nextFloat(-0.8, 0.2), Math.sin(angle) * radius],
        color: `hsl(${hue}, 80%, 55%)`,
      });
    }
    return arr;
  }, [prng]);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.005;
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.2} color="#FBBF24" />
      <directionalLight position={[2, 5, 3]} intensity={0.6} color="#FBBF24" />
      <pointLight position={[0, 1, 0]} intensity={2} color="#FBBF24" distance={6} decay={2} />
      <hemisphereLight args={['#FBBF24', '#1A3A4A', 0.3]} />

      <BioluminescentParticles count={300} seed={seed} />
      <VoteCurrents />

      {corals.map((c, i) => (
        <CoralBranch key={i} position={c.pos} color={c.color} seed={seed} index={i} />
      ))}

      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 4, 32]} />
        <meshStandardMaterial color="#1A3A4A" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}