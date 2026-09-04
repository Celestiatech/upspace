'use client';

import React from 'react';
import { Text } from '@react-three/drei';
import { WORLD_LANDMARKS } from '@/data/landmarks';

interface HeightLadderMarkersProps {
  roofY: number;
  floorsCount: number;
  floorHeight: number;
  baseHeight: number;
  isDayMode?: boolean;
}

export function HeightLadderMarkers({
  roofY,
  floorsCount,
  floorHeight,
  baseHeight,
  isDayMode = false,
}: HeightLadderMarkersProps) {
  // Scale mapping: 4.5m real height = floorHeight in 3D
  const scaleRatio = floorHeight / 4.5;
  const baseY = baseHeight * 1.4;

  const rulerX = -6.4;
  const rulerZ = 0;

  return (
    <group position={[rulerX, 0, rulerZ]}>
      {/* Subtle vertical elevation ruler guideline */}
      <mesh position={[0, (roofY + 8) / 2, 0]}>
        <cylinderGeometry args={[0.015, 0.015, roofY + 8, 6]} />
        <meshBasicMaterial color={isDayMode ? '#94a3b8' : '#334155'} transparent opacity={0.35} />
      </mesh>

      {WORLD_LANDMARKS.map((landmark) => {
        // Compute 3D Y elevation
        const markerY = baseY + ((landmark.heightMeters - 18 - 12) * scaleRatio);

        // Only display relevant landmarks near or up to the current building height range
        if (markerY < 0 || markerY > roofY + 20) return null;

        const isSurpassed = markerY <= roofY;

        return (
          <group key={landmark.id} position={[0, markerY, 0]}>
            {/* Horizontal pointer tic */}
            <mesh position={[0.35, 0, 0]}>
              <boxGeometry args={[0.7, 0.03, 0.03]} />
              <meshBasicMaterial
                color={isSurpassed ? '#10b981' : isDayMode ? '#0284c7' : '#38bdf8'}
              />
            </mesh>

            {/* Minimalist Landmark Picture Icon & Height Tag */}
            <group position={[-0.15, 0, 0]}>
              <Text
                position={[0, 0, 0]}
                fontSize={0.32}
                color={isSurpassed ? (isDayMode ? '#065f46' : '#34d399') : isDayMode ? '#1e293b' : '#f8fafc'}
                anchorX="right"
                anchorY="middle"
                fontWeight="bold"
              >
                {landmark.icon} {landmark.name} · {landmark.heightMeters}m
              </Text>
            </group>
          </group>
        );
      })}
    </group>
  );
}
