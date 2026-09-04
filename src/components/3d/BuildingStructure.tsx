'use client';

import React from 'react';
import { Arena } from '@/types/arena';
import { FloorData } from '@/types/floor';
import { BuildingCrown } from './BuildingCrown';
import { HeadquartersGroundFloor } from './HeadquartersGroundFloor';
import { FloorMesh } from './FloorMesh';
import { CityEnvironment } from './CityEnvironment';
import { CelestialSky } from './CelestialSky';
import { PlazaLife } from './PlazaLife';
import { HeightLadderMarkers } from './HeightLadderMarkers';

interface BuildingStructureProps {
  arena: Arena;
  floors: FloorData[];
  selectedFloor: FloorData | null;
  isDayMode?: boolean;
  explodeAmount?: number;
  onSelectFloor: (floor: FloorData) => void;
  onHoverFloor?: (floor: FloorData | null) => void;
}

export function BuildingStructure({
  arena,
  floors,
  selectedFloor,
  isDayMode = false,
  explodeAmount = 0,
  onSelectFloor,
  onHoverFloor,
}: BuildingStructureProps) {
  const {
    floorHeight,
    baseHeight,
    themeColor,
  } = arena;

  const totalFloors = floors.length;
  const totalFloorsHeight = totalFloors * floorHeight + Math.max(0, totalFloors - 1) * explodeAmount;
  // The headquarters ground floor is a modest-height solid base, not an oversized tower base.
  const headquartersHeight = baseHeight * 1.4;
  const floorsStartY = headquartersHeight;
  const roofY = headquartersHeight + totalFloorsHeight;

  // Scalable architectural setback algorithm:
  // All floors share identical proportions (no tapering)
  const getFloorDimensions = (floorNumber: number) => {
    const w = 9.2;
    return { w, d: w, r: 0.85 };
  };

  const topDimensions = getFloorDimensions(totalFloors - 1);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. CELESTIAL BACKGROUND: SUN, MOON WITH CRATERS, AIRPLANE WITH TOP BRAND BANNER, DRIFTING CLOUDS */}
      <CelestialSky theme={isDayMode ? 'day' : 'night'} floors={floors} altitude={roofY} />



      {/* 2. PLAZA ENVIRONMENT & PEDESTRIANS FOR REALISTIC HUMAN SCALE */}
      <CityEnvironment theme={isDayMode ? 'day' : 'night'} />
      <PlazaLife theme={isDayMode ? 'day' : 'night'} gazeHeight={roofY} />

      {/* 2.5 WORLD LANDMARK 3D HEIGHT MARKERS & ELEVATION RULER */}
      <HeightLadderMarkers
        roofY={roofY}
        floorsCount={floors.length}
        floorHeight={floorHeight}
        baseHeight={baseHeight}
        isDayMode={isDayMode}
      />

      {/* 2. GRAND HEADQUARTERS GROUND FLOOR - tall, imposing high-rise base */}
      <HeadquartersGroundFloor
        width={getFloorDimensions(0).w * 1.2}
        height={headquartersHeight}
        themeColor={themeColor}
        isDayMode={isDayMode}
      />

      {/* 3. ALL 20 ARCHITECTURAL FLOORS */}
      {floors.map((floor, index) => {
        const yPos = floorsStartY + index * (floorHeight + explodeAmount) + floorHeight / 2;
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
              totalFloors={floors.length}
              cornerRadius={r}
              isSelected={isSelected}
              hasSelection={!!selectedFloor}
              themeColor={themeColor}
              isDayMode={isDayMode}
              hideGlass={false}
              hideAdvertising={false}
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
        themeColor={themeColor}
        isDayMode={isDayMode}
        floors={floors}
      />
    </group>
  );
}
