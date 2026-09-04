'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';

interface InteriorOfficeProps {
  width: number;
  depth: number;
  height: number;
  isSelected: boolean;
  isDayMode?: boolean;
}

const SHARED_OFFICE_GEOMETRIES = {
  deskTop: new THREE.BoxGeometry(1.1, 0.04, 0.55),
  deskLeg: new THREE.BoxGeometry(0.04, 0.22, 0.48),
  monitor: new THREE.BoxGeometry(0.36, 0.22, 0.02),
  chairSeat: new THREE.BoxGeometry(0.32, 0.04, 0.32),
  chairBack: new THREE.BoxGeometry(0.3, 0.3, 0.03),
};

export function InteriorOffice({
  width,
  depth,
  height,
  isSelected,
  isDayMode = false,
}: InteriorOfficeProps) {
  // Office ceiling and floor boundaries
  const usableW = width - 0.7;
  const usableD = depth - 0.7;
  const floorY = -height / 2 + 0.12;
  const ceilingY = height / 2 - 0.12;

  // Desk layout coordinates
  const deskPositions = useMemo(
    () => [
      { x: -usableW * 0.26, z: -usableD * 0.22, rot: 0 },
      { x: usableW * 0.26, z: -usableD * 0.22, rot: 0 },
      { x: -usableW * 0.26, z: usableD * 0.22, rot: Math.PI },
      { x: usableW * 0.26, z: usableD * 0.22, rot: Math.PI },
    ],
    [usableW, usableD]
  );

  return (
    <group position={[0, 0, 0]}>
      {/* 1. INTERIOR CONCRETE FLOOR SLAB */}
      <mesh position={[0, floorY, 0]} receiveShadow>
        <boxGeometry args={[usableW, 0.06, usableD]} />
        <meshStandardMaterial
          color={isDayMode ? '#94a3b8' : '#1e293b'}
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>

      {/* 2. ACOUSTIC CEILING GRID WITH WARM RECESSED DOWNLIGHTS */}
      <mesh position={[0, ceilingY, 0]}>
        <boxGeometry args={[usableW, 0.04, usableD]} />
        <meshStandardMaterial
          color={isDayMode ? '#f8fafc' : '#fed7aa'}
          emissive={isDayMode ? '#ffffff' : '#f59e0b'}
          emissiveIntensity={isSelected ? 1.2 : isDayMode ? 0.35 : 0.65}
          roughness={0.8}
        />
      </mesh>

      {/* 3. CENTRAL ELEVATOR CORE & INTERIOR REINFORCED WALLS */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[usableW * 0.38, height * 0.78, usableD * 0.38]} />
        <meshStandardMaterial
          color={isDayMode ? '#475569' : '#0f172a'}
          roughness={0.5}
          metalness={0.4}
        />
      </mesh>

      {/* 4. WORKSTATION DESKS, MONITORS & CHAIRS (Using shared geometries) */}
      {deskPositions.map((d, i) => (
        <group key={`desk-${i}`} position={[d.x, floorY + 0.22, d.z]} rotation={[0, d.rot, 0]}>
          {/* Desk Top */}
          <mesh geometry={SHARED_OFFICE_GEOMETRIES.deskTop} castShadow receiveShadow>
            <meshStandardMaterial
              color={isDayMode ? '#cbd5e1' : '#334155'}
              roughness={0.4}
              metalness={0.5}
            />
          </mesh>

          {/* Desk Legs */}
          {[-0.48, 0.48].map((lx) => (
            <mesh key={`leg-${lx}`} geometry={SHARED_OFFICE_GEOMETRIES.deskLeg} position={[lx, -0.11, 0]}>
              <meshStandardMaterial color="#0f172a" metalness={0.8} />
            </mesh>
          ))}

          {/* Dual Desktop Computer Monitors */}
          <group position={[0, 0.16, -0.14]}>
            <mesh geometry={SHARED_OFFICE_GEOMETRIES.monitor} position={[-0.22, 0, 0]} rotation={[0, 0.15, 0]}>
              <meshStandardMaterial
                color="#020617"
                emissive="#38bdf8"
                emissiveIntensity={isSelected ? 1.5 : 0.8}
              />
            </mesh>
            <mesh geometry={SHARED_OFFICE_GEOMETRIES.monitor} position={[0.22, 0, 0]} rotation={[0, -0.15, 0]}>
              <meshStandardMaterial
                color="#020617"
                emissive="#38bdf8"
                emissiveIntensity={isSelected ? 1.5 : 0.8}
              />
            </mesh>
          </group>

          {/* Office Ergonomic Task Chair */}
          <group position={[0, 0.08, 0.35]}>
            <mesh geometry={SHARED_OFFICE_GEOMETRIES.chairSeat} position={[0, 0, 0]}>
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            <mesh geometry={SHARED_OFFICE_GEOMETRIES.chairBack} position={[0, 0.16, 0.14]}>
              <meshStandardMaterial color="#1e293b" />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}
