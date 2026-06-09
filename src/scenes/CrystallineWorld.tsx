import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/store';
import { DeterministicPRNG } from '@/utils/prng';

interface CrystalClusterProps {
  position: [number, number, number];
  scale: number;
  color: string;
  seed: string;
}

function CrystalCluster({ position, scale, color, seed }: CrystalClusterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const prng = useMemo(() => new DeterministicPRNG(seed), [seed]);
  const colorObj = useMemo(() => new THREE.Color(color), [color]);

  const crystals = useMemo(() => {
    const count = prng.nextInt(3, 8);
    const arr: {
      pos: [number, number, number];
      rot: [number, number, number];
      scale: number;
      heightScale: number;
    }[] = [];

    for (let i = 0; i < count; i++) {
      const angle = prng.next() * Math.PI * 2;
      const radius = prng.nextFloat(0.1, 0.4);
      arr.push({
        pos: [Math.cos(angle) * radius, prng.nextFloat(-0.2, 0.2), Math.sin(angle) * radius],
        rot: [prng.nextFloat(-0.3, 0.3), prng.next() * Math.PI * 2, prng.nextFloat(-0.3, 0.3)],
        scale: prng.nextFloat(0.3, 0.8),
        heightScale: prng.nextFloat(1.5, 4.0),
      });
    }
    return arr;
  }, [prng]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05 * scale;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {crystals.map((c, i) => (
        <Float key={i} speed={0.5 + prng.nextFloat(0, 1)} floatIntensity={0.05}>
          <mesh
            position={c.pos}
            rotation={c.rot}
            scale={[c.scale, c.scale * c.heightScale, c.scale]}
            castShadow
          >
            <octahedronGeometry args={[0.3, 0]} />
            <MeshTransmissionMaterial
              color={colorObj}
              metalness={0.9}
              roughness={0.1}
              transmission={0.8}
              thickness={0.5}
              ior={2.4}
              envMapIntensity={1.5}
              clearcoat={1}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

interface FloatingCrystalProps {
  count: number;
  spread: number;
  color: string;
  seed: string;
}

function FloatingCrystals({ count, spread, color, seed }: FloatingCrystalProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const colorObj = useMemo(() => new THREE.Color(color), [color]);
  const prng = useMemo(() => new DeterministicPRNG(seed + '-float'), [seed]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  const transforms = useMemo(() => {
    const data: Float32Array[] = [];
    for (let i = 0; i < count; i++) {
      const x = prng.nextFloat(-spread, spread);
      const y = prng.nextFloat(-spread * 0.5, spread * 0.5);
      const z = prng.nextFloat(-spread, spread);
      const scale = prng.nextFloat(0.02, 0.08);
      data.push(new Float32Array([x, y, z, scale]));
    }
    return data;
  }, [count, spread, prng]);

  useFrame((state) => {
    if (!meshRef.current) return;
    for (let i = 0; i < transforms.length; i++) {
      const t = transforms[i];
      const x = t[0] + Math.sin(state.clock.elapsedTime * 0.3 + i) * 0.1;
      const y = t[1] + Math.sin(state.clock.elapsedTime * 0.5 + i * 1.3) * 0.1;
      const z = t[2] + Math.cos(state.clock.elapsedTime * 0.4 + i * 0.7) * 0.1;
      const s = t[3] * (1 + Math.sin(state.clock.elapsedTime * 0.2 + i) * 0.2);
      dummy.position.set(x, y, z);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, count]} castShadow>
      <octahedronGeometry args={[1, 0]} />
      <meshPhysicalMaterial
        color={colorObj}
        metalness={0.9}
        roughness={0.1}
        transparent
        opacity={0.6}
        envMapIntensity={2}
      />
    </instancedMesh>
  );
}

export default function CrystallineWorld() {
  const groupRef = useRef<THREE.Group>(null);
  const walletProfile = useStore((s) => s.walletProfile);

  const seed = walletProfile?.address || 'default-seed';
  const prng = useMemo(() => new DeterministicPRNG(seed + '-world'), [seed]);

  const clusters = useMemo(() => {
    const count = prng.nextInt(5, 12);
    const arr: { pos: [number, number, number]; scale: number }[] = [];
    for (let i = 0; i < count; i++) {
      const angle = prng.next() * Math.PI * 2;
      const radius = prng.nextFloat(1.5, 4.0);
      arr.push({
        pos: [Math.cos(angle) * radius, prng.nextFloat(-0.5, 0.5), Math.sin(angle) * radius],
        scale: prng.nextFloat(0.4, 1.2),
      });
    }
    return arr;
  }, [prng]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
      <directionalLight position={[-5, -5, 5]} intensity={0.5} color="#60A5FA" />
      <pointLight position={[0, 3, 0]} intensity={2} color="#A5D8FF" distance={10} decay={2} />

      <FloatingCrystals
        count={200}
        spread={6}
        color="#60A5FA"
        seed={seed}
      />

      {clusters.map((cluster, i) => (
        <CrystalCluster
          key={i}
          position={cluster.pos}
          scale={cluster.scale}
          color="#60A5FA"
          seed={`${seed}-cluster-${i}`}
        />
      ))}

      <CrystalCluster
        position={[0, 0, 0]}
        scale={1.5}
        color="#A5D8FF"
        seed={`${seed}-center`}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
        <ringGeometry args={[0.5, 8, 64]} />
        <meshStandardMaterial
          color="#0D1117"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}