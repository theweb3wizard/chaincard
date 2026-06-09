import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/store';
import { DeterministicPRNG } from '@/utils/prng';

function HolographicFrame({ position, color, seed, index }: { position: [number, number, number]; color: string; seed: string; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const prng = useMemo(() => new DeterministicPRNG(seed + '-frame-' + index), [seed, index]);
  const size = prng.nextFloat(0.3, 0.7);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3 + index) * 0.1;
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <Float speed={0.5 + prng.nextFloat(0, 0.5)} floatIntensity={0.1}>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[size, size * (prng.next() > 0.5 ? 1.3 : 0.8), 0.03]} />
        <MeshTransmissionMaterial
          color={new THREE.Color(color)}
          metalness={0.3}
          roughness={0.2}
          transmission={0.9}
          thickness={0.3}
          ior={1.5}
          envMapIntensity={1}
          clearcoat={0.5}
        />
      </mesh>
      <mesh position={[position[0], position[1], position[2] + 0.02]}>
        <planeGeometry args={[size * 0.6, size * 0.6]} />
        <meshBasicMaterial color={new THREE.Color(color)} transparent opacity={0.15} />
      </mesh>
    </Float>
  );
}

function NeonGrid() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 0.01;
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
      <planeGeometry args={[10, 10, 40, 40]} />
      <meshBasicMaterial color="#A78BFA" wireframe transparent opacity={0.15} />
    </mesh>
  );
}

function GlitchParticles({ count, seed }: { count: number; seed: string }) {
  const ref = useRef<THREE.Points>(null);
  const prng = useMemo(() => new DeterministicPRNG(seed + '-glitch'), [seed]);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = prng.nextFloat(-5, 5);
      pos[i * 3 + 1] = prng.nextFloat(-3, 3);
      pos[i * 3 + 2] = prng.nextFloat(-3, 3);
    }
    return pos;
  }, [count, prng]);

  const colors = useMemo(() => {
    const c = new Float32Array(count * 3);
    const palette = [new THREE.Color('#A78BFA'), new THREE.Color('#E879F9'), new THREE.Color('#F472B6'), new THREE.Color('#22D3EE')];
    for (let i = 0; i < count; i++) {
      const col = palette[i % palette.length];
      c[i * 3] = col.r;
      c[i * 3 + 1] = col.g;
      c[i * 3 + 2] = col.b;
    }
    return c;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      pos[idx + 1] += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.002;
      pos[idx] += Math.cos(state.clock.elapsedTime * 0.3 + i * 0.5) * 0.002;
      if (Math.abs(pos[idx]) > 5) pos[idx] *= -0.8;
      if (Math.abs(pos[idx + 1]) > 3) pos[idx + 1] *= -0.8;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} vertexColors transparent opacity={0.6} sizeAttenuation blending={THREE.AdditiveBlending} />
    </points>
  );
}

export default function NFTDegenWorld() {
  const groupRef = useRef<THREE.Group>(null);
  const walletProfile = useStore((s) => s.walletProfile);
  const seed = walletProfile?.address || 'default-seed';
  const prng = useMemo(() => new DeterministicPRNG(seed + '-nft'), [seed]);

  const frames = useMemo(() => {
    const count = 8;
    const arr: { pos: [number, number, number]; color: string }[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = prng.nextFloat(1.5, 3.0);
      const height = prng.nextFloat(-0.8, 0.8);
      const hue = 270 + prng.nextFloat(-40, 40);
      arr.push({
        pos: [Math.cos(angle) * radius, height, Math.sin(angle) * radius],
        color: `hsl(${hue}, 80%, 65%)`,
      });
    }
    return arr;
  }, [prng]);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.008;
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.1} />
      <directionalLight position={[0, 5, 0]} intensity={0.3} color="#A78BFA" />
      <pointLight position={[0, 2, 0]} intensity={3} color="#E879F9" distance={8} decay={2} />
      <pointLight position={[2, -1, 2]} intensity={2} color="#22D3EE" distance={6} decay={2} />
      <pointLight position={[-2, -1, -2]} intensity={2} color="#F472B6" distance={6} decay={2} />

      <NeonGrid />
      <GlitchParticles count={400} seed={seed} />

      {frames.map((f, i) => (
        <HolographicFrame key={i} position={f.pos} color={f.color} seed={seed} index={i} />
      ))}

      <mesh position={[0, 0, 0]}>
        <icosahedronGeometry args={[0.2, 0]} />
        <meshBasicMaterial color="#A78BFA" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}