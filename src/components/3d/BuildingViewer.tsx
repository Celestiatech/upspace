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
  explodeAmount?: number;
  showRuler?: boolean;
  onSelectFloor: (floor: FloorData) => void;
  onHoverFloor?: (floor: FloorData | null) => void;
  lowPower?: boolean;
}

export function BuildingViewer({
  arena,
  floors,
  selectedFloor,
  isDayMode = false,
  explodeAmount = 0,
  showRuler = true,
  onSelectFloor,
  onHoverFloor,
  lowPower = false,
}: BuildingViewerProps) {
  return (
    <BuildingStructure
      arena={arena}
      floors={floors}
      selectedFloor={selectedFloor}
      isDayMode={isDayMode}
      explodeAmount={explodeAmount}
      showRuler={showRuler}
      onSelectFloor={onSelectFloor}
      onHoverFloor={onHoverFloor}
      lowPower={lowPower}
    />
  );
}
