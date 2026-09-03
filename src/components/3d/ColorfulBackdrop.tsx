'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { ThemeMode } from '@/types/theme';

interface ColorfulBackdropProps {
  theme: ThemeMode;
}

export function ColorfulBackdrop({ theme }: ColorfulBackdropProps) {
  const isDay = theme === 'day';
  const particlesRef = useRef<THREE.Points>(null);

  // Generate colorful ambient light motes / glowing particles floating around
  const particleCount = 180;
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const palette = isDay
      ? [new THREE.Color('#38bdf8'), new THREE.Color('#fbbf24'), new THREE.Color('#60a5fa'), new THREE.Color('#ffffff')]
      : [new THREE.Color('#00f0ff'), new THREE.Color('#d946ef'), new THREE.Color('#8b5cf6'), new THREE.Color('#3b82f6')];

    for (let i = 0; i < particleCount; i++) {
      const radius = 10 + Math.random() * 32;
      const angle = Math.random() * Math.PI * 2;
      const height = Math.random() * 45;

      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = height;
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      const chosenColor = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = chosenColor.r;
      col[i * 3 + 1] = chosenColor.g;
      col[i * 3 + 2] = chosenColor.b;
    }
    return [pos, col];
  }, [isDay]);

  // Slowly rotate and float ambient particles
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.03;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. TWINKLING COLORFUL STARFIELD */}
      {!isDay && (
        <Stars
          radius={120}
          depth={60}
          count={4500}
          factor={5}
          saturation={1}
          fade
          speed={1.5}
        />
      )}

      {/* 2. VIBRANT SKY DOME WITH RICH COLORFUL HORIZON */}
      <group position={[0, 0, 0]}>
        {/* Sky Background Sphere */}
        <mesh position={[0, 20, 0]}>
          <sphereGeometry args={[110, 32, 32]} />
          <meshBasicMaterial
            side={THREE.BackSide}
            color={isDay ? '#0284c7' : '#090518'}
          />
        </mesh>

        {/* Radiant Horizon Glow Cylinder */}
        <mesh position={[0, 14, 0]}>
          <cylinderGeometry args={[105, 105, 36, 32, 1, true]} />
          <meshBasicMaterial
            side={THREE.BackSide}
            color={isDay ? '#38bdf8' : '#7928ca'}
            transparent
            opacity={isDay ? 0.35 : 0.42}
          />
        </mesh>

        {/* Sunset / Cyber Neon Horizon Ribbon */}
        <mesh position={[0, 3, 0]}>
          <cylinderGeometry args={[100, 100, 16, 32, 1, true]} />
          <meshBasicMaterial
            side={THREE.BackSide}
            color={isDay ? '#f59e0b' : '#ff007f'}
            transparent
            opacity={isDay ? 0.45 : 0.38}
          />
        </mesh>
      </group>

      {/* 3. VIBRANT GLOWING REFLECTIVE GROUND PLATFORM */}
      <group position={[0, 0, 0]}>
        {/* Main Sleek Dark Reflective Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
          <planeGeometry args={[160, 160]} />
          <meshStandardMaterial
            color={isDay ? '#e2e8f0' : '#030308'}
            roughness={isDay ? 0.25 : 0.3}
            metalness={isDay ? 0.2 : 0.8}
          />
        </mesh>

        {/* Radiant Concentric Neon Cyber Rings */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[12, 12.35, 64]} />
          <meshBasicMaterial color={isDay ? '#0284c7' : '#00f0ff'} />
        </mesh>
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[18, 18.25, 64]} />
          <meshBasicMaterial color={isDay ? '#3b82f6' : '#a855f7'} />
        </mesh>
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[26, 26.25, 64]} />
          <meshBasicMaterial color={isDay ? '#f59e0b' : '#ec4899'} />
        </mesh>

        {/* Colorful Grid Helper */}
        <gridHelper
          args={[64, 32, isDay ? '#0284c7' : '#00f0ff', isDay ? '#cbd5e1' : '#1e1b4b']}
          position={[0, 0.02, 0]}
        />
      </group>

      {/* 4. FLOATING ATMOSPHERIC LIGHT MOTES / PARTICLES */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={particleCount}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.22}
          vertexColors
          transparent
          opacity={isDay ? 0.6 : 0.85}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
