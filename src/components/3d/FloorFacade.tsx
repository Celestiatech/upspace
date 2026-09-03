'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { FloorData } from '@/types/floor';
import { MultiSidedAdvertising } from './MultiSidedAdvertising';
import { GlassFacade } from './GlassFacade';

interface FloorFacadeProps {
  floor: FloorData;
  width: number;
  depth: number;
  height: number;
  cornerRadius?: number;
  isSelected: boolean;
  isHovered: boolean;
  isDayMode?: boolean;
}

// Generate rounded rectangle profile for architectural glass
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

export function FloorFacade({
  floor,
  width,
  depth,
  height,
  cornerRadius = 0.55,
  isSelected,
  isHovered,
  isDayMode = false,
}: FloorFacadeProps) {
  const glassShape = useMemo(() => {
    return createRoundedRectShape(width - 0.08, depth - 0.08, cornerRadius - 0.04);
  }, [width, depth, cornerRadius]);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. CURTAIN WALL GLASS & INTERIOR OFFICE ENVIRONMENT */}
      <GlassFacade
        width={width}
        depth={depth}
        height={height}
        glassShape={glassShape}
        isSelected={isSelected}
        isHovered={isHovered}
        isDayMode={isDayMode}
      />

      {/* 2. MULTI-SIDED ADVERTISING SUITE (Front, Back, Left, Right, 360° Ribbon & Corner Displays) */}
      <MultiSidedAdvertising
        floor={floor}
        width={width}
        depth={depth}
        height={height}
        isSelected={isSelected}
        isHovered={isHovered}
        isDayMode={isDayMode}
      />
    </group>
  );
}
