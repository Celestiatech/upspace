'use client';

import React, { useRef, useState, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { FloorData } from '@/types/floor';
import { AdvertisingPanel } from './AdvertisingPanel';
import { FloorFacade } from './FloorFacade';
import { floorAnimationUpdaters, registerAnimation } from './AnimationSystems';

interface FloorMeshProps {
  floor: FloorData;
  yPosition: number;
  height: number;
  width: number;
  depth: number;
  totalFloors: number;
  cornerRadius?: number;
  isSelected: boolean;
  hasSelection: boolean;
  themeColor: string;
  isDayMode?: boolean;
  hideGlass?: boolean;
  hideAdvertising?: boolean;
  onSelect: (floor: FloorData) => void;
  onHover?: (floor: FloorData | null) => void;
}

function createRoundedRectShape(w: number, d: number, r: number) {
  const shape = new THREE.Shape();
  const x = -w / 2;
  const y = -d / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + d - r);
  shape.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  shape.lineTo(x + r, y + d);
  shape.quadraticCurveTo(x, y + d, x, y + d - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

export function FloorMesh({
  floor,
  yPosition,
  height,
  width,
  depth,
  totalFloors,
  cornerRadius = 0.55,
  isSelected,
  hasSelection,
  themeColor,
  isDayMode = false,
  hideGlass = false,
  hideAdvertising = false,
  onSelect,
  onHover,
}: FloorMeshProps) {
  const [hovered, setHovered] = useState(false);
  const glowRingRef = useRef<THREE.Mesh>(null);

  const brandColor = floor.status === 'available' ? '#00e676' : (floor.bannerColor || '#00c8ff');
  const glowColor = isSelected ? '#fff000' : hovered ? '#00e5ff' : brandColor;

  const slabThickness = 0.12;

  const slabShape = useMemo(() => {
    return createRoundedRectShape(width, depth, cornerRadius);
  }, [width, depth, cornerRadius]);

  const extrudeSettings = useMemo(
    () => ({
      depth: slabThickness,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.025,
      bevelThickness: 0.025,
    }),
    [slabThickness]
  );

  // When another floor is selected, dim unselected floors slightly for cinematic focus (Requirement #6)
  const isDimmed = hasSelection && !isSelected;

  useEffect(() => registerAnimation(floorAnimationUpdaters, (time) => {
    if (glowRingRef.current) {
      const mat = glowRingRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        if (isSelected) {
          mat.emissiveIntensity = 2.6 + Math.sin(time * 4) * 0.4;
        } else if (hovered) {
          mat.emissiveIntensity = 1.8;
        } else {
          mat.emissiveIntensity = isDimmed ? 0.3 : isDayMode ? 0.8 : 0.65;
        }
      }
    }
  }), [isSelected, hovered, isDimmed, isDayMode]);

  const handleClick = (e: any) => {
    e.stopPropagation();
    onSelect(floor);
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
    onHover?.(floor);
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = 'auto';
    onHover?.(null);
  };

  return (
    <group
      position={[0, yPosition, 0]}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* 1. ACTUAL CONCRETE / COMPOSITE FLOOR SLAB */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -height / 2 + slabThickness / 2, 0]}
        castShadow
        receiveShadow
      >
        <extrudeGeometry args={[slabShape, extrudeSettings]} />
        <meshStandardMaterial
          color={isDimmed ? '#3f3f46' : '#222222'}
          metalness={0.82}
          roughness={0.25}
        />
      </mesh>

      {/* 2. RECESSED PERIMETER LED ACCENT STRIP (Highlight line along floor slab) */}
      <mesh
        ref={glowRingRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -height / 2 + slabThickness + 0.02, 0]}
      >
        <extrudeGeometry
          args={[
            slabShape,
            { depth: 0.03, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015 },
          ]}
        />
        <meshStandardMaterial
          color={glowColor}
          emissive={glowColor}
          emissiveIntensity={isSelected ? 2.5 : hovered ? 1.6 : 0.6}
          roughness={0.2}
        />
      </mesh>

      {/* 3. PHYSICAL FACADE (Architectural Glass Curtain + Low-Poly Office Interior + Tenant Signage) */}
      <group position={[0, 0, 0]}>
        <FloorFacade
          floor={floor}
          width={width}
          depth={depth}
          height={height}
          totalFloors={totalFloors}
          cornerRadius={cornerRadius}
          isSelected={isSelected}
          isHovered={hovered}
          isDayMode={isDayMode}
          hideGlass={hideGlass}
          hideAdvertising={hideAdvertising}
        />
      </group>

      {/* Advertisement Panel */}
      <AdvertisingPanel
        floor={floor}
        width={width}
        height={height}
        totalFloors={totalFloors}
        isSelected={isSelected}
        isHovered={hovered}
        isDayMode={isDayMode}
        hideAdvertising={hideAdvertising}
      />
      {/* 4. UPPER CEILING SLAB DIVIDER */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, height / 2 - slabThickness, 0]}
        castShadow
      >
        <extrudeGeometry args={[slabShape, extrudeSettings]} />
        <meshStandardMaterial
          color={isDimmed ? '#3f3f46' : '#222222'}
          metalness={0.82}
          roughness={0.25}
        />
      </mesh>
    </group>
  );
}
