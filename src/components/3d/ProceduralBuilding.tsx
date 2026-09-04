'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Arena } from '@/types/arena';
import { FloorData } from '@/types/floor';
import { FloorMesh } from './FloorMesh';

interface ProceduralBuildingProps {
  arena: Arena;
  floors: FloorData[];
  selectedFloor: FloorData | null;
  isDayMode?: boolean;
  onSelectFloor: (floor: FloorData) => void;
  onHoverFloor?: (floor: FloorData | null) => void;
}

export function ProceduralBuilding({
  arena,
  floors,
  selectedFloor,
  isDayMode = false,
  onSelectFloor,
  onHoverFloor,
}: ProceduralBuildingProps) {
  const beaconRef = useRef<THREE.PointLight>(null);

  const {
    floorHeight,
    baseHeight,
    antennaHeight,
    themeColor,
  } = arena;

  const totalFloorsHeight = floors.length * floorHeight;
  const floorsStartY = baseHeight;
  const roofY = baseHeight + totalFloorsHeight;

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (beaconRef.current) {
      beaconRef.current.intensity = (Math.sin(t * 4) + 1) * 2.5;
    }
  });

  // Taper profile matching the reference skyscraper (5.6m base tapering to 4.5m)
  const getFloorDimensions = (floorNumber: number) => {
    if (floorNumber <= 6) return { w: 5.6, d: 5.6, r: 0.65 };
    if (floorNumber <= 12) return { w: 5.2, d: 5.2, r: 0.6 };
    if (floorNumber <= 17) return { w: 4.8, d: 4.8, r: 0.55 };
    return { w: 4.5, d: 4.5, r: 0.5 };
  };

  const lobbyWidth = 6.4;
  const lobbyDepth = 6.4;
  const coreRadius = 1.1; // Central utility cylinder

  return (
    <group position={[0, 0, 0]}>
      {/* 1. CENTRAL CYLINDRICAL CORE (Panel 1: Semi-transparent elevator/utility core) */}
      <group position={[0, floorsStartY + totalFloorsHeight / 2, 0]}>
        {/* Semi-transparent outer utility core cylinder */}
        <mesh receiveShadow>
          <cylinderGeometry args={[coreRadius, coreRadius, totalFloorsHeight, 32]} />
          <meshPhysicalMaterial
            color={isDayMode ? '#475569' : '#0f172a'}
            metalness={0.8}
            roughness={0.2}
            transmission={0.4}
            transparent
            opacity={0.7}
          />
        </mesh>

        {/* Inner glowing elevator track / conduit */}
        <mesh>
          <cylinderGeometry args={[coreRadius * 0.45, coreRadius * 0.45, totalFloorsHeight, 16]} />
          <meshStandardMaterial
            color={themeColor}
            emissive={themeColor}
            emissiveIntensity={isDayMode ? 0.8 : 1.5}
          />
        </mesh>
      </group>

      {/* 2. GRAND MULTI-TIER LOBBY PODIUM */}
      <group position={[0, baseHeight / 2, 0]}>
        {/* Main curved entrance lobby block */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[lobbyWidth / 2, lobbyWidth / 2 + 0.3, baseHeight, 32]} />
          <meshStandardMaterial
            color={isDayMode ? '#334155' : '#070a12'}
            metalness={0.9}
            roughness={0.15}
          />
        </mesh>

        {/* Grand Glass Ribbon for Lobby */}
        <mesh position={[0, 0, lobbyDepth / 2 - 0.2]}>
          <planeGeometry args={[lobbyWidth - 1.2, baseHeight - 0.5]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            metalness={0.8}
            roughness={0.1}
            transmission={0.7}
            transparent
            opacity={0.85}
            emissive={themeColor}
            emissiveIntensity={0.25}
          />
        </mesh>

        {/* Lobby Foundation Perimeter Glow Ring */}
        <mesh position={[0, -baseHeight / 2 + 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[lobbyWidth / 2 + 0.1, lobbyWidth / 2 + 0.35, 64]} />
          <meshStandardMaterial
            color={themeColor}
            emissive={themeColor}
            emissiveIntensity={isDayMode ? 1.2 : 2.0}
          />
        </mesh>

        {/* Architectural Entrance Pillars */}
        {[-1.6, -0.6, 0.6, 1.6].map((x) => (
          <mesh key={`pillar-${x}`} position={[x, 0, lobbyDepth / 2 + 0.35]}>
            <cylinderGeometry args={[0.12, 0.12, baseHeight, 16]} />
            <meshStandardMaterial
              color={isDayMode ? '#94a3b8' : '#475569'}
              metalness={0.95}
              roughness={0.1}
            />
          </mesh>
        ))}
      </group>

      {/* 3. FOUR CORNER VERTICAL COLUMNS & NEON ACCENT RUNNERS (Panel 1 & reference building) */}
      {[-1, 1].map((xSign) =>
        [-1, 1].map((zSign) => {
          const colX = (xSign * (lobbyWidth - 1.3)) / 2;
          const colZ = (zSign * (lobbyDepth - 1.3)) / 2;
          return (
            <group key={`corner-${xSign}-${zSign}`}>
              {/* Structural Solid Pillar */}
              <mesh position={[colX, floorsStartY + totalFloorsHeight / 2, colZ]}>
                <cylinderGeometry args={[0.1, 0.12, totalFloorsHeight, 16]} />
                <meshStandardMaterial
                  color={isDayMode ? '#64748b' : '#334155'}
                  metalness={0.95}
                  roughness={0.15}
                />
              </mesh>

              {/* Exterior Vertical Neon Light Runner along corner curve */}
              <mesh position={[colX * 1.06, floorsStartY + totalFloorsHeight / 2, colZ * 1.06]}>
                <cylinderGeometry args={[0.03, 0.03, totalFloorsHeight, 8]} />
                <meshStandardMaterial
                  color={themeColor}
                  emissive={themeColor}
                  emissiveIntensity={isDayMode ? 1.0 : 2.2}
                />
              </mesh>
            </group>
          );
        })
      )}

      {/* 4. ALL 20 ARCHITECTURAL FLOORS (Beveled plates, glowing edge trims, digital banners) */}
      {floors.map((floor, index) => {
        const yPos = floorsStartY + index * floorHeight + floorHeight / 2;
        const isSelected = selectedFloor?.id === floor.id;
        const { w, d, r } = getFloorDimensions(floor.floorNumber);

        return (
          <FloorMesh
            key={floor.id}
            floor={floor}
            yPosition={yPos}
            height={floorHeight}
            width={w}
            depth={d}
            totalFloors={floors.length}
            cornerRadius={r}
            isSelected={isSelected}
            hasSelection={selectedFloor !== null}
            themeColor={themeColor}
            isDayMode={isDayMode}
            onSelect={onSelectFloor}
            onHover={onHoverFloor}
          />
        );
      })}

      {/* 5. ROOFTOP OBSERVATION DECK & ARCHITECTURAL CROWN */}
      {(() => {
        const topDim = getFloorDimensions(20);
        return (
          <group position={[0, roofY + 0.45, 0]}>
            {/* Crown Tier 1 (Curved Deck) */}
            <mesh castShadow receiveShadow>
              <cylinderGeometry
                args={[topDim.w / 2 + 0.2, topDim.w / 2 + 0.35, 0.85, 32]}
              />
              <meshStandardMaterial
                color={isDayMode ? '#475569' : '#070b14'}
                metalness={0.9}
                roughness={0.2}
              />
            </mesh>

            {/* Glowing Crown Accent Light Ring */}
            <mesh position={[0, 0.38, 0]}>
              <cylinderGeometry
                args={[topDim.w / 2 + 0.25, topDim.w / 2 + 0.25, 0.12, 32]}
              />
              <meshStandardMaterial
                color={themeColor}
                emissive={themeColor}
                emissiveIntensity={isDayMode ? 1.2 : 2.4}
              />
            </mesh>

            {/* Rooftop Helipad Target */}
            <mesh position={[0, 0.44, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.9, 1.15, 32]} />
              <meshBasicMaterial color={themeColor} />
            </mesh>
          </group>
        );
      })()}

      {/* 6. TELECOMMUNICATIONS NEEDLE SPIRE & AVIATION BEACON */}
      <group position={[0, roofY + 0.9, 0]}>
        {/* Spire Taper Base */}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.3, 0.85, 1.0, 16]} />
          <meshStandardMaterial
            color={isDayMode ? '#64748b' : '#1e293b'}
            metalness={0.95}
            roughness={0.15}
          />
        </mesh>

        {/* Tall Spire Mast */}
        <mesh position={[0, antennaHeight / 2 + 0.8, 0]}>
          <cylinderGeometry args={[0.04, 0.22, antennaHeight, 16]} />
          <meshStandardMaterial
            color="#cbd5e1"
            metalness={0.95}
            roughness={0.1}
          />
        </mesh>

        {/* Red Warning Beacon Tip */}
        <mesh position={[0, antennaHeight + 0.8, 0]}>
          <sphereGeometry args={[0.22, 16, 16]} />
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
