'use client';

import React from 'react';
import * as THREE from 'three';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RealisticHuman } from './RealisticHuman';

interface PartyInteriorProps {
  width: number;
  depth: number;
  height: number;
  isSelected: boolean;
  isDayMode?: boolean;
}

export function PartyInterior({
  width,
  depth,
  height,
  isSelected,
  isDayMode = false,
}: PartyInteriorProps) {
  const usableW = width - 0.7;
  const usableD = depth - 0.7;
  const floorY = -height / 2 + 0.12;
  const ceilingY = height / 2 - 0.12;
  const discoRef = useRef<THREE.Group>(null);

  const glowIntensity = isSelected ? 2.2 : isDayMode ? 1.0 : 1.6;

  useFrame((state) => {
    if (discoRef.current) {
      discoRef.current.rotation.y = state.clock.getElapsedTime() * 0.6;
    }
  });

  const discoColors = ['#ff2d55', '#0a84ff', '#30d158', '#ffd60a', '#bf5af2', '#ff9f0a'];

  return (
    <group position={[0, 0, 0]}>
      {/* Dance floor */}
      <mesh position={[0, floorY, 0]} receiveShadow>
        <boxGeometry args={[usableW, 0.08, usableD]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Glowing dance floor grid */}
      {[-0.28, -0.18, -0.08, 0.02, 0.12, 0.22].map((z, zi) => (
        <React.Fragment key={`grid-${zi}`}>
          {[-0.24, -0.12, 0, 0.12, 0.24].map((x, xi) => (
            <mesh key={`cell-${xi}`} position={[x * usableW, floorY + 0.045, z * usableD]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[usableW * 0.18, usableD * 0.16]} />
              <meshBasicMaterial
                color={discoColors[(zi + xi) % discoColors.length]}
                transparent
                opacity={0.5}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
        </React.Fragment>
      ))}

      {/* DJ Booth */}
      <group position={[-usableW * 0.24, floorY, -usableD * 0.28]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[1.6, 1.0, 0.9]} />
          <meshStandardMaterial color="#111827" metalness={0.7} roughness={0.25} />
        </mesh>
        {/* Mixer deck */}
        <mesh position={[0.3, 1.12, 0.25]} rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[0.9, 0.06, 0.6]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.15} />
        </mesh>
        {/* Glowing control pads */}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={`pad-${i}`} position={[0.05 + i * 0.12, 1.18, 0.45]} rotation={[-0.2, 0, 0]}>
            <boxGeometry args={[0.07, 0.03, 0.07]} />
            <meshBasicMaterial color={discoColors[i]} />
          </mesh>
        ))}
      </group>

      {/* Colorful DJ spotlight beams */}
      {discoColors.map((color, i) => {
        const angle = (i / discoColors.length) * Math.PI * 2;
        return (
          <group key={`light-${i}`} position={[0, ceilingY, 0]} rotation={[0, angle, 0]}>
            <mesh position={[0, -0.3, usableD * 0.32]} rotation={[Math.PI / 4, 0, 0]}>
              <coneGeometry args={[0.12, 0.8, 8]} />
              <meshBasicMaterial color={color} transparent opacity={0.28} side={THREE.DoubleSide} />
            </mesh>
            <pointLight position={[0, -0.2, usableD * 0.4]} color={color} intensity={2.2} distance={usableD} decay={2} />
          </group>
        );
      })}

      {/* Disco ball */}
      <group ref={discoRef} position={[0, ceilingY - 0.3, 0]}>
        <mesh>
          <sphereGeometry args={[0.24, 16, 12]} />
          <meshStandardMaterial color="#e2e8f0" metalness={1} roughness={0.1} emissive="#ffffff" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.22, 6]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} />
        </mesh>
      </group>

      {/* Acoustic ceiling */}
      <mesh position={[0, ceilingY, 0]}>
        <boxGeometry args={[usableW, 0.04, usableD]} />
        <meshStandardMaterial
          color="#1e293b"
          emissive="#7c3aed"
          emissiveIntensity={glowIntensity * 0.25}
          roughness={0.7}
        />
      </mesh>

      {/* Neon party sign */}
      <group position={[0, floorY + 0.6, -usableD * 0.3]}>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[3.2, 0.8, 0.06]} />
          <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.4, 0.04]}>
          <boxGeometry args={[2.9, 0.55, 0.02]} />
          <meshBasicMaterial color="#ff2d55" />
        </mesh>
      </group>

      {/* Club crowd */}
      {[
        { x: -usableW * 0.16, z: usableD * 0.2, c: '#30d158' },
        { x: usableW * 0.14, z: usableD * 0.26, c: '#0a84ff' },
        { x: -usableW * 0.1, z: -usableD * 0.05, c: '#ffd60a' },
        { x: usableW * 0.22, z: -usableD * 0.1, c: '#bf5af2' },
        { x: usableW * 0.02, z: usableD * 0.12, c: '#ff9f0a' },
        { x: -usableW * 0.24, z: usableD * 0.32, c: '#30d158' },
      ].map((p, i) => (
        <group key={`person-${i}`} position={[p.x, floorY, p.z]} rotation={[0, (i % 4) * (Math.PI / 2), 0]}>
          <RealisticHuman shirtColor={p.c} height={0.98} isDayMode={!isDayMode} pose="walking" skinTone={['#f4c7a1', '#d99a6c', '#6f3e27', '#9a5d3b'][i % 4]} hairColor={['#1c1917', '#3f2a1d', '#713f12', '#0f172a'][i % 4]} />
        </group>
      ))}

      {/* Bar counter with glowing shelf */}
      <group position={[usableW * 0.26, floorY, usableD * 0.24]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[2.0, 1.0, 0.5]} />
          <meshStandardMaterial color="#1c1917" metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[2.2, 0.08, 0.6]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.4} />
        </mesh>
        {/* Neon-lit back shelf */}
        <mesh position={[0, 1.0, -0.42]}>
          <boxGeometry args={[2.3, 0.1, 0.06]} />
          <meshBasicMaterial color="#bf5af2" />
        </mesh>
      </group>

      {/* Rooftop open sides get warm string lights feel */}
      <mesh position={[0, ceilingY - 0.1, 0]}>
        <boxGeometry args={[usableW, 0.02, usableD]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
    </group>
  );
}
