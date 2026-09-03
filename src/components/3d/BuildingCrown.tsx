'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface BuildingCrownProps {
  topWidth: number;
  topDepth: number;
  roofY: number;
  antennaHeight: number;
  themeColor: string;
  isDayMode?: boolean;
}

export function BuildingCrown({
  topWidth,
  topDepth,
  roofY,
  antennaHeight,
  themeColor,
  isDayMode = false,
}: BuildingCrownProps) {
  const beaconRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (beaconRef.current) {
      beaconRef.current.intensity = (Math.sin(t * 4.5) + 1) * 2.5;
    }
  });

  return (
    <group position={[0, roofY, 0]}>
      {/* 1. OBSERVATION DECK TIER 1 (Recessed Setback & Perimeter Glass Railing) */}
      <group position={[0, 0.45, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[topWidth / 2 + 0.15, topWidth / 2 + 0.35, 0.9, 32]} />
          <meshStandardMaterial
            color={isDayMode ? '#475569' : '#0a0e1a'}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>

        {/* Luminous Architectural Crown Accent Ring */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[topWidth / 2 + 0.18, topWidth / 2 + 0.18, 0.1, 32]} />
          <meshStandardMaterial
            color={themeColor}
            emissive={themeColor}
            emissiveIntensity={isDayMode ? 1.0 : 2.2}
          />
        </mesh>

        {/* Observation Glass Railing */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[topWidth / 2 + 0.1, topWidth / 2 + 0.1, 0.32, 32, 1, true]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            metalness={0.8}
            roughness={0.1}
            transmission={0.8}
            transparent
            opacity={0.65}
          />
        </mesh>

        {/* Helipad Target */}
        <mesh position={[0, 0.46, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.9, 1.15, 32]} />
          <meshBasicMaterial color={themeColor} />
        </mesh>
      </group>

      {/* 2. REAL ROOFTOP MECHANICAL PENTHOUSE & HVAC UNITS (Requirement #2) */}
      <group position={[0, 1.35, 0]}>
        {/* Elevator Overrun & Mechanical Core */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[topWidth * 0.35, topWidth * 0.42, 0.9, 16]} />
          <meshStandardMaterial
            color={isDayMode ? '#64748b' : '#1e293b'}
            metalness={0.95}
            roughness={0.22}
          />
        </mesh>

        {/* 2 HVAC Chiller Units with Fan Grilles */}
        {[-0.85, 0.85].map((hx) => (
          <group key={`hvac-${hx}`} position={[hx, 0.35, 0.8]}>
            {/* Chiller Cabinet */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.65, 0.5, 0.55]} />
              <meshStandardMaterial
                color={isDayMode ? '#475569' : '#0f172a'}
                metalness={0.9}
                roughness={0.25}
              />
            </mesh>
            {/* Exhaust Fan Grille */}
            <mesh position={[0, 0.26, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.12, 0.22, 16]} />
              <meshStandardMaterial color="#020617" roughness={0.5} />
            </mesh>
          </group>
        ))}

        {/* Window-Washing Maintenance Crane Rig (BMU) */}
        <group position={[-0.8, 0.55, -0.7]} rotation={[0, Math.PI / 4, 0]}>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
          </mesh>
          <mesh position={[0.3, 0.4, 0]} rotation={[0, 0, -Math.PI / 6]}>
            <boxGeometry args={[0.7, 0.03, 0.03]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
          </mesh>
        </group>

        {/* Communications Satellite Dish */}
        <group position={[0.7, 0.6, -0.6]} rotation={[-Math.PI / 5, Math.PI / 3, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.26, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial
              color="#e2e8f0"
              metalness={0.8}
              roughness={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      </group>

      {/* 3. HIGH-ALTITUDE TELECOM NEEDLE SPIRE & AVIATION BEACON */}
      <group position={[0, 1.8, 0]}>
        {/* Tapered Spire Base */}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.25, 0.7, 1.0, 16]} />
          <meshStandardMaterial
            color={isDayMode ? '#475569' : '#0f172a'}
            metalness={0.95}
            roughness={0.15}
          />
        </mesh>

        {/* High-Altitude Needle Mast */}
        <mesh position={[0, antennaHeight / 2 + 0.8, 0]}>
          <cylinderGeometry args={[0.035, 0.22, antennaHeight, 16]} />
          <meshStandardMaterial
            color="#cbd5e1"
            metalness={0.95}
            roughness={0.1}
          />
        </mesh>

        {/* Red Warning Beacon Tip */}
        <mesh position={[0, antennaHeight + 0.8, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial color="#ff0044" />
        </mesh>

        <pointLight
          ref={beaconRef}
          position={[0, antennaHeight + 0.8, 0]}
          color="#ff0044"
          distance={18}
          intensity={3}
        />
      </group>
    </group>
  );
}
