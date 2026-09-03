'use client';

import React from 'react';
import { Arena } from '@/types/arena';
import { FloorData } from '@/types/floor';
import { BuildingPodium } from './BuildingPodium';
import { BuildingCrown } from './BuildingCrown';
import { FloorMesh } from './FloorMesh';
import { CityEnvironment } from './CityEnvironment';
import { CelestialSky } from './CelestialSky';
import { PlazaLife } from './PlazaLife';

interface BuildingStructureProps {
  arena: Arena;
  floors: FloorData[];
  selectedFloor: FloorData | null;
  isDayMode?: boolean;
  onSelectFloor: (floor: FloorData) => void;
  onHoverFloor?: (floor: FloorData | null) => void;
}

export function BuildingStructure({
  arena,
  floors,
  selectedFloor,
  isDayMode = false,
  onSelectFloor,
  onHoverFloor,
}: BuildingStructureProps) {
  const {
    floorHeight,
    baseHeight,
    antennaHeight,
    themeColor,
  } = arena;

  const totalFloors = floors.length;
  const totalFloorsHeight = totalFloors * floorHeight;
  const floorsStartY = baseHeight;
  const roofY = baseHeight + totalFloorsHeight;

  // Scalable architectural setback algorithm:
  // Substantially bulkier proportions (9.2m base tapering to 6.8m top)
  const getFloorDimensions = (floorNumber: number) => {
    const progress = floorNumber / Math.max(totalFloors - 1, 1);
    const baseW = 9.2;
    const topW = 6.8;
    const currentW = baseW - Math.floor(progress * 4) * ((baseW - topW) / 3);
    const radius = 0.85 - progress * 0.2;
    return { w: currentW, d: currentW, r: radius };
  };

  const baseLobbyWidth = 10.6;
  const baseLobbyDepth = 10.6;
  const topDimensions = getFloorDimensions(totalFloors - 1);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. CELESTIAL BACKGROUND: SUN, MOON WITH CRATERS, AIRPLANE, DRIFTING CLOUDS */}
      <CelestialSky theme={isDayMode ? 'day' : 'night'} />

      {/* 2. PLAZA ENVIRONMENT & PEDESTRIANS FOR REALISTIC HUMAN SCALE */}
      <CityEnvironment theme={isDayMode ? 'day' : 'night'} />
      <PlazaLife theme={isDayMode ? 'day' : 'night'} />

      {/* 2. REALISTIC ENTRANCE PODIUM & PLAZA */}
      <BuildingPodium
        width={baseLobbyWidth}
        depth={baseLobbyDepth}
        height={baseHeight}
        themeColor={themeColor}
        isDayMode={isDayMode}
      />

      {/* 3. ALL 20 ARCHITECTURAL FLOORS */}
      {floors.map((floor, index) => {
        const yPos = floorsStartY + index * floorHeight + floorHeight / 2;
        const isSelected = selectedFloor?.id === floor.id;
        const { w, d, r } = getFloorDimensions(floor.floorNumber);

        // Floor 10 acts as a realistic mid-tower mechanical / service floor
        const isMechanicalFloor = floor.floorNumber === 10;

        return (
          <React.Fragment key={floor.id}>
            <FloorMesh
              floor={floor}
              yPosition={yPos}
              height={floorHeight}
              width={w}
              depth={d}
              cornerRadius={r}
              isSelected={isSelected}
              hasSelection={!!selectedFloor}
              themeColor={themeColor}
              isDayMode={isDayMode}
              onSelect={onSelectFloor}
              onHover={onHoverFloor}
            />

            {/* Architectural Mechanical Ventilation Grilles for Floor 10 (Requirement #2) */}
            {isMechanicalFloor && (
              <group position={[0, yPos, 0]}>
                {[-w / 2 - 0.02, w / 2 + 0.02].map((gx, gi) => (
                  <mesh key={`louver-x-${gi}`} position={[gx, 0, 0]}>
                    <boxGeometry args={[0.04, floorHeight * 0.8, d * 0.85]} />
                    <meshStandardMaterial color="#020617" metalness={0.95} roughness={0.4} />
                  </mesh>
                ))}
              </group>
            )}
          </React.Fragment>
        );
      })}

      {/* 6. REAL ROOFTOP MECHANICAL CROWN & SPIRE */}
      <BuildingCrown
        topWidth={topDimensions.w}
        topDepth={topDimensions.d}
        roofY={roofY}
        antennaHeight={antennaHeight}
        themeColor={themeColor}
        isDayMode={isDayMode}
      />
    </group>
  );
}
