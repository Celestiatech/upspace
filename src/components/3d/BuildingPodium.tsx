'use client';

import React from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface BuildingPodiumProps {
  width: number;
  depth: number;
  height: number;
  themeColor: string;
  isDayMode?: boolean;
}

export function BuildingPodium({
  width,
  depth,
  height,
  themeColor,
  isDayMode = false,
}: BuildingPodiumProps) {
  const plazaSize = 25;

  return (
    <group position={[0, 0, 0]}>
      {/* 1. ARCHITECTURAL GRANITE PLAZA PAVING WITH JOINTS & CURBS */}
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[plazaSize, 0.08, plazaSize]} />
        <meshStandardMaterial
          color={isDayMode ? '#94a3b8' : '#0b101c'}
          roughness={isDayMode ? 0.45 : 0.65}
          metalness={isDayMode ? 0.15 : 0.35}
        />
      </mesh>

      {/* Plaza Inset Granite Curb & Accent Border */}
      <mesh position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[width / 2 + 1.2, width / 2 + 1.38, 64]} />
        <meshStandardMaterial
          color={themeColor}
          emissive={themeColor}
          emissiveIntensity={isDayMode ? 0.6 : 1.2}
        />
      </mesh>

      {/* Plaza Stone Benches for Pedestrians */}
      {[-3.2, 3.2].map((bx) => (
        <mesh key={`bench-${bx}`} position={[bx, 0.25, 4.5]} castShadow receiveShadow>
          <boxGeometry args={[1.6, 0.35, 0.5]} />
          <meshStandardMaterial
            color={isDayMode ? '#64748b' : '#1e293b'}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* 2. SUBSTANTIAL 3-STORY GLASS ATRIUM LOBBY (Floors 1-3) */}
      <group position={[0, height / 2, 0]}>
        {/* Reinforced Structural Core */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[width + 0.6, height, depth + 0.6]} />
          <meshStandardMaterial
            color={isDayMode ? '#334155' : '#070b14'}
            metalness={0.92}
            roughness={0.18}
          />
        </mesh>

        {/* Double-Height Grand Glass Curtain Facade with Window Panes */}
        <mesh position={[0, 0, (depth + 0.6) / 2 + 0.02]}>
          <planeGeometry args={[width - 0.4, height - 0.3]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            metalness={0.8}
            roughness={0.08}
            transmission={0.75}
            transparent
            opacity={0.88}
            emissive={themeColor}
            emissiveIntensity={0.2}
            ior={1.52}
          />
        </mesh>

        {/* Interior Lobby Reception Desk & Architectural Columns Visible Through Glass */}
        <mesh position={[0, -height * 0.25, 0]}>
          <boxGeometry args={[2.2, 0.5, 0.8]} />
          <meshStandardMaterial color="#f8fafc" emissive="#fed7aa" emissiveIntensity={0.6} />
        </mesh>

        {/* Revolving Glass Entrance Door Cylinder */}
        <group position={[0, -height * 0.28, (depth + 0.6) / 2 + 0.15]}>
          <mesh>
            <cylinderGeometry args={[0.7, 0.7, 1.1, 16]} />
            <meshPhysicalMaterial
              color="#ffffff"
              transmission={0.9}
              transparent
              opacity={0.5}
              roughness={0.1}
            />
          </mesh>
          <mesh rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[0.02, 1.0, 1.3]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} />
          </mesh>
        </group>

        {/* Grand Entrance Architectural Cantilevered Canopy */}
        <group position={[0, -height * 0.1, (depth + 0.6) / 2 + 0.85]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width * 0.75, 0.14, 1.6]} />
            <meshStandardMaterial
              color={isDayMode ? '#475569' : '#0f172a'}
              metalness={0.95}
              roughness={0.18}
            />
          </mesh>

          {/* Under-Canopy Recessed Downlight Strip */}
          <mesh position={[0, -0.075, 0]}>
            <planeGeometry args={[width * 0.7, 1.4]} />
            <meshStandardMaterial
              color="#fed7aa"
              emissive="#fed7aa"
              emissiveIntensity={isDayMode ? 0.6 : 1.4}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Prominent Architectural Signage */}
          <Text
            position={[0, 0.22, 0.55]}
            fontSize={0.24}
            color={isDayMode ? '#0f172a' : '#ffffff'}
            anchorX="center"
            anchorY="bottom"
            fontWeight="bold"
            letterSpacing={0.16}
          >
            UPSPACE TOWER
          </Text>

          <Text
            position={[0, 0.08, 0.55]}
            fontSize={0.11}
            color={themeColor}
            anchorX="center"
            anchorY="bottom"
            letterSpacing={0.22}
          >
            GLOBAL ADVERTISING HEADQUARTERS
          </Text>
        </group>

        {/* Structural Load Columns Supporting Lobby Atrium */}
        {[-width / 2 + 0.35, -width / 4, width / 4, width / 2 - 0.35].map((colX) => (
          <mesh
            key={`podium-col-${colX}`}
            position={[colX, 0, (depth + 0.6) / 2 + 0.75]}
            castShadow
          >
            <cylinderGeometry args={[0.13, 0.15, height, 16]} />
            <meshStandardMaterial
              color={isDayMode ? '#64748b' : '#334155'}
              metalness={0.95}
              roughness={0.15}
            />
          </mesh>
        ))}
      </group>

      {/* 3. LANDSCAPED GRANITE PLANTERS WITH TREES & BOLLARD LIGHTS */}
      {[-1, 1].map((xSign) =>
        [-1, 1].map((zSign) => {
          const px = (xSign * (width + 2.8)) / 2;
          const pz = (zSign * (depth + 2.8)) / 2;
          return (
            <group key={`planter-${xSign}-${zSign}`} position={[px, 0.3, pz]}>
              {/* Granite Planter Curb */}
              <mesh castShadow receiveShadow>
                <boxGeometry args={[1.6, 0.45, 1.6]} />
                <meshStandardMaterial
                  color={isDayMode ? '#475569' : '#1e293b'}
                  metalness={0.8}
                  roughness={0.25}
                />
              </mesh>
              {/* Soil Bed */}
              <mesh position={[0, 0.23, 0]}>
                <boxGeometry args={[1.4, 0.04, 1.4]} />
                <meshStandardMaterial color="#271b12" roughness={0.9} />
              </mesh>
              {/* Architectural Evergreen Shrub */}
              <mesh position={[0, 0.65, 0]} castShadow>
                <coneGeometry args={[0.55, 0.9, 10]} />
                <meshStandardMaterial
                  color={isDayMode ? '#15803d' : '#166534'}
                  roughness={0.65}
                />
              </mesh>
              {/* LED Lighting Bollard */}
              <mesh position={[0.55, 0.35, 0.55]}>
                <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
                <meshStandardMaterial
                  color="#ffffff"
                  emissive={themeColor}
                  emissiveIntensity={1.4}
                />
              </mesh>
            </group>
          );
        })
      )}
    </group>
  );
}
