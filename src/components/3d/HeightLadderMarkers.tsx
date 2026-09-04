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
  // Compute Y coordinate corresponding to real-world landmark height meters
  // Scale mapping: 4.5m in real life = floorHeight (2.45 units in 3D)
  const scaleRatio = floorHeight / 4.5;
  const baseY = baseHeight * 1.4;

  const rulerX = -6.8;
  const rulerZ = 0;

  return (
    <group position={[rulerX, 0, rulerZ]}>
      {/* Vertical subtle elevation guide wire */}
      <mesh position={[0, (roofY + 8) / 2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, roofY + 8, 6]} />
        <meshBasicMaterial color={isDayMode ? '#94a3b8' : '#334155'} transparent opacity={0.4} />
      </mesh>

      {WORLD_LANDMARKS.map((landmark) => {
        // Compute 3D Y elevation
        const markerY = baseY + ((landmark.heightMeters - 18 - 12) * scaleRatio);

        // Only show markers that are within reasonable range of current tower height
        if (markerY < 0 || markerY > roofY + 25) return null;

        const isSurpassed = markerY <= roofY;

        return (
          <group key={landmark.id} position={[0, markerY, 0]}>
            {/* Horizontal pointer tic */}
            <mesh position={[0.4, 0, 0]}>
              <boxGeometry args={[0.8, 0.04, 0.04]} />
              <meshBasicMaterial
                color={isSurpassed ? '#10b981' : isDayMode ? '#f97316' : '#fb923c'}
              />
            </mesh>

            {/* 3D Floating Milestone Label */}
            <group position={[-0.2, 0, 0]}>
              <Text
                position={[0, 0.18, 0]}
                fontSize={0.34}
                color={isSurpassed ? (isDayMode ? '#047857' : '#34d399') : isDayMode ? '#c2410c' : '#fb923c'}
                anchorX="right"
                anchorY="middle"
                fontWeight="bold"
              >
                {landmark.icon} {landmark.name} ({landmark.heightMeters}m)
              </Text>
              <Text
                position={[0, -0.16, 0]}
                fontSize={0.22}
                color={isSurpassed ? (isDayMode ? '#059669' : '#10b981') : isDayMode ? '#64748b' : '#94a3b8'}
                anchorX="right"
                anchorY="middle"
              >
                {isSurpassed ? '✓ Surpassed by UpSpace' : 'Next Height Target'}
              </Text>
            </group>
          </group>
        );
      })}
    </group>
  );
}
