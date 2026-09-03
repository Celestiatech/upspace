'use client';

import React from 'react';
import { Arena } from '@/types/arena';
import { FloorData } from '@/types/floor';
import { BuildingStructure } from './BuildingStructure';

interface BuildingViewerProps {
  arena: Arena;
  floors: FloorData[];
  selectedFloor: FloorData | null;
  isDayMode?: boolean;
  onSelectFloor: (floor: FloorData) => void;
  onHoverFloor?: (floor: FloorData | null) => void;
}

export function BuildingViewer({
  arena,
  floors,
  selectedFloor,
  isDayMode = false,
  onSelectFloor,
  onHoverFloor,
}: BuildingViewerProps) {
  return (
    <BuildingStructure
      arena={arena}
      floors={floors}
      selectedFloor={selectedFloor}
      isDayMode={isDayMode}
      onSelectFloor={onSelectFloor}
      onHoverFloor={onHoverFloor}
    />
  );
}
