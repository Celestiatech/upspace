'use client';

import React from 'react';

interface StructuralColumnProps {
  x: number;
  z: number;
  height: number;
  baseY: number;
  radius?: number;
  themeColor?: string;
  isDayMode?: boolean;
}

export function StructuralColumn({
  x,
  z,
  height,
  baseY,
  radius = 0.14,
  themeColor = '#00f0ff',
  isDayMode = false,
}: StructuralColumnProps) {
  const centerY = baseY + height / 2;

  return (
    <group position={[x, centerY, z]}>
      {/* 1. SOLID TITANIUM/STEEL STRUCTURAL COLUMN */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius * 1.15, height, 16]} />
        <meshStandardMaterial
          color={isDayMode ? '#475569' : '#1e293b'}
          metalness={0.92}
          roughness={0.16}
        />
      </mesh>

      {/* 2. RECESSED ARCHITECTURAL VERTICAL LIGHT RUNNER */}
      <mesh position={[0, 0, radius * 1.05]}>
        <boxGeometry args={[0.035, height, 0.02]} />
        <meshStandardMaterial
          color={themeColor}
          emissive={themeColor}
          emissiveIntensity={isDayMode ? 0.8 : 1.6}
        />
      </mesh>
    </group>
  );
}
