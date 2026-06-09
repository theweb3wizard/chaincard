import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/store';
import { DeterministicPRNG } from '@/utils/prng';

function VolcanicTerrain({ seed }: { seed: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const prng = useMemo(() => new DeterministicPRNG(seed + '-terrain'), [seed]);

  const geo = useMemo(() => {
    const geometry = new THREE.IcosahedronGeometry(2, 2);
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const noise = Math.sin(x * 3 + seed.length) * 0.15 + Math.cos(z * 2 + y) * 0.1 + prng.nextFloat(-0.05, 0.05);
      const len = 1 + noise;
      pos.setXYZ(i, x * len, y * len, z * len);
    }
    pos.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  }, [prng, seed]);

  return (
    <mesh ref={ref} geometry={geo} castShadow receiveShadow>
      <meshStandardMaterial color="#2D1810" roughness={0.9} metalness={0.1} />
    </mesh>
  );
}

function LavaStreams({ seed }: { seed: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const prng = useMemo(() => new DeterministicPRNG(seed + '-lava'), [seed]);

  const streams = useMemo(() => {
    const count = 5;
    const arr: { path: THREE.Vector3[]; color: string }[] = [];
    for (let i = 0; i < count; i++) {
      const points: THREE.Vector3[] = [];
      const startAngle = prng.next() * Math.PI * 2;
      const startRadius = prng.nextFloat(0.3, 0.8);
      points.push(new THREE.Vector3(Math.cos(startAngle) * startRadius, 1.2, Math.sin(startAngle) * startRadius));
      for (let j = 1; j <= 4; j++) {
        const a = startAngle + prng.nextFloat(-0.5, 0.5);
        const r = startRadius + j * prng.nextFloat(0.2, 0.4);
        points.push(new THREE.Vector3(Math.cos(a) * r, 1.2 - j * 0.05, Math.sin(a) * r));
      }
      arr.push({ path: points, color: `hsl(${10 + prng.nextFloat(-5, 5)}, 90%, ${50 + prng.nextFloat(-10, 10)}%)` });
    }
    return arr;
  }, [prng]);

  useFrame((state) => {
    if (ref.current) {
      const intensity = 0.5 + Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      (ref.current.material as THREE.MeshBasicMaterial).opacity = intensity;
    }
  });

  return (
    <group ref={ref}>
      {streams.map((s, i) => {
        const curve = new THREE.CatmullRomCurve3(s.path);
        const tubeGeo = new THREE.TubeGeometry(curve, 12, 0.04, 6, false);
        return (
          <mesh key={i} geometry={tubeGeo}>
            <meshBasicMaterial color={s.color} transparent opacity={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}

function EmberParticles({ count, seed }: { count: number; seed: string }) {
  const ref = useRef<THREE.Points>(null);
  const prng = useMemo(() => new DeterministicPRNG(seed + '-embers'), [seed]);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = prng.next() * Math.PI * 2;
      const radius = prng.nextFloat(0.5, 3);
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = prng.nextFloat(-0.5, 2);
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, [count, prng]);

  const velocities = useMemo(() => {
    const v = new Float32Array(count);
    for (let i = 0; i < count; i++) v[i] = prng.nextFloat(0.002, 0.01);
    return v;
  }, [count, prng]);

  useFrame(() => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      pos[idx + 1] += velocities[i];
      pos[idx] += Math.sin(Date.now() * 0.001 * velocities[i] * 10 + i) * 0.002;
      if (pos[idx + 1] > 2.5) {
        const angle = prng.next() * Math.PI * 2;
        const radius = prng.nextFloat(0.5, 2);
        pos[idx] = Math.cos(angle) * radius;
        pos[idx + 1] = -0.5;
        pos[idx + 2] = Math.sin(angle) * radius;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#F87171" size={0.03} transparent opacity={0.7} sizeAttenuation blending={THREE.AdditiveBlending} />
    </points>
  );
}

function GlowCore() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      const intensity = 0.5 + Math.sin(state.clock.elapsedTime * 0.8) * 0.2;
      (ref.current.material as THREE.MeshBasicMaterial).opacity = intensity;
    }
  });

  return (
    <mesh ref={ref} position={[0, 1.2, 0]}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshBasicMaterial color="#F87171" transparent opacity={0.8} />
    </mesh>
  );
}

export default function GasBurnerWorld() {
  const groupRef = useRef<THREE.Group>(null);
  const walletProfile = useStore((s) => s.walletProfile);
  const seed = walletProfile?.address || 'default-seed';

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.015;
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.15} color="#F87171" />
      <directionalLight position={[0, 3, 2]} intensity={0.4} color="#F87171" />
      <pointLight position={[0, 1.5, 0]} intensity={3} color="#F87171" distance={6} decay={2} />
      <pointLight position={[1, 0, 1]} intensity={1.5} color="#FB923C" distance={4} decay={2} />

      <VolcanicTerrain seed={seed} />
      <LavaStreams seed={seed} />
      <EmberParticles count={300} seed={seed} />
      <GlowCore />

      <mesh position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 4, 32]} />
        <meshBasicMaterial color="#F87171" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}