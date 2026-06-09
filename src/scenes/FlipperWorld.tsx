import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/store';
import { DeterministicPRNG } from '@/utils/prng';

function AcceleratorRing({ radius, color, speed, tilt }: { radius: number; color: string; speed: number; tilt: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.x += delta * speed;
    ref.current.rotation.z = tilt;
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.02, 8, 48]} />
      <meshBasicMaterial color={color} transparent opacity={0.4} />
    </mesh>
  );
}

function SpeedParticles({ count, seed }: { count: number; seed: string }) {
  const ref = useRef<THREE.Points>(null);
  const prng = useMemo(() => new DeterministicPRNG(seed + '-speed'), [seed]);

  const { positions, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const angle = prng.next() * Math.PI * 2;
      const radius = prng.nextFloat(0.8, 2.5);
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = prng.nextFloat(-0.3, 0.3);
      pos[i * 3 + 2] = Math.sin(angle) * radius;
      spd[i] = prng.nextFloat(0.005, 0.03);
    }
    return { positions: pos, speeds: spd };
  }, [count, prng]);

  useFrame(() => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const x = pos[idx];
      const z = pos[idx + 2];
      const angle = Math.atan2(z, x);
      const newAngle = angle + speeds[i];
      const radius = Math.sqrt(x * x + z * z);
      pos[idx] = Math.cos(newAngle) * radius;
      pos[idx + 2] = Math.sin(newAngle) * radius;
      pos[idx + 1] += Math.sin(Date.now() * 0.001 * speeds[i] * 50 + i) * 0.001;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#FB923C" size={0.025} transparent opacity={0.7} sizeAttenuation blending={THREE.AdditiveBlending} />
    </points>
  );
}

function TrailLines({ seed }: { seed: string }) {
  const ref = useRef<THREE.LineSegments>(null);
  const prng = useMemo(() => new DeterministicPRNG(seed + '-trails'), [seed]);
  const count = 30;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 6);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r1 = prng.nextFloat(0.5, 1.5);
      const r2 = prng.nextFloat(2.0, 3.0);
      pos[i * 6] = Math.cos(angle) * r1;
      pos[i * 6 + 1] = prng.nextFloat(-0.2, 0.2);
      pos[i * 6 + 2] = Math.sin(angle) * r1;
      pos[i * 6 + 3] = Math.cos(angle) * r2;
      pos[i * 6 + 4] = prng.nextFloat(-0.2, 0.2);
      pos[i * 6 + 5] = Math.sin(angle) * r2;
    }
    return pos;
  }, [prng]);

  return (
    <lineSegments ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color="#FB923C" transparent opacity={0.2} />
    </lineSegments>
  );
}

export default function FlipperWorld() {
  const groupRef = useRef<THREE.Group>(null);
  const walletProfile = useStore((s) => s.walletProfile);
  const seed = walletProfile?.address || 'default-seed';
  const prng = useMemo(() => new DeterministicPRNG(seed + '-flip'), [seed]);

  const rings = useMemo(() => {
    return [
      { radius: 1.0, color: '#FB923C', speed: 0.3, tilt: 0.1 },
      { radius: 1.5, color: '#F87171', speed: -0.4, tilt: -0.15 },
      { radius: 2.0, color: '#FB923C', speed: 0.5, tilt: 0.2 },
      { radius: 2.5, color: '#FBBF24', speed: -0.2, tilt: -0.1 },
      { radius: 3.0, color: '#FB923C', speed: 0.35, tilt: 0.05 },
    ];
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.01;
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 0, 0]} intensity={4} color="#FB923C" distance={8} decay={2} />
      <pointLight position={[2, 1, 2]} intensity={1.5} color="#F87171" distance={5} decay={2} />
      <pointLight position={[-2, -1, -2]} intensity={1.5} color="#FBBF24" distance={5} decay={2} />

      {rings.map((r, i) => (
        <AcceleratorRing key={i} radius={r.radius} color={r.color} speed={r.speed} tilt={r.tilt} />
      ))}

      <SpeedParticles count={500} seed={seed} />
      <TrailLines seed={seed} />

      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshBasicMaterial color="#FB923C" />
      </mesh>
    </group>
  );
}