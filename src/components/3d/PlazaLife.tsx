'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { ThemeMode } from '@/types/theme';
import { RealisticHuman } from './RealisticHuman';

interface PlazaLifeProps {
  theme: ThemeMode;
  gazeHeight?: number;
}

function TowerWatcher({
  x,
  z,
  index,
  children,
}: {
  x: number;
  z: number;
  index: number;
  children: React.ReactNode;
}) {
  const visitorRef = useRef<THREE.Group>(null);
  const startingAngle = Math.atan2(z, x);
  // Keep every visitor outside the podium and glass facade.
  const startingRadius = Math.max(Math.hypot(x, z), 14);

  useFrame((state) => {
    const visitor = visitorRef.current;
    if (!visitor) return;

    const time = state.clock.getElapsedTime();
    // Short, gentle paths keep visitors alive while they remain focused on the tower.
    const angle = startingAngle + Math.sin(time * 0.32 + index * 1.7) * 0.055;
    const radius = startingRadius + Math.sin(time * 0.7 + index) * 0.22;
    visitor.position.set(
      Math.cos(angle) * radius,
      0.08 + Math.abs(Math.sin(time * 1.4 + index)) * 0.025,
      Math.sin(angle) * radius
    );
    // Face the tower horizontally; the head is tilted upward separately.
    visitor.lookAt(0, visitor.position.y, 0);
  });

  return <group ref={visitorRef}>{children}</group>;
}

export function PlazaLife({ theme, gazeHeight = 1.8 }: PlazaLifeProps) {
  const isDay = theme === 'day';

  // 18 pedestrians placed realistically around the entrance plaza, curbs, and benches
  const people = useMemo(
    () => [
      // Walking toward grand entrance
      { x: 0, z: 7.2, rot: Math.PI, color: '#3b82f6', height: 1.0 },
      { x: 0.8, z: 7.8, rot: Math.PI, color: '#ef4444', height: 0.95 },
      { x: -0.9, z: 6.5, rot: Math.PI, color: '#10b981', height: 1.05 },
      { x: 1.6, z: 5.5, rot: Math.PI * 0.9, color: '#f59e0b', height: 1.0 },
      // People chatting in pairs on the plaza
      { x: -3.8, z: 5.8, rot: Math.PI / 4, color: '#6366f1', height: 1.02 },
      { x: -3.2, z: 6.2, rot: -3 * Math.PI / 4, color: '#ec4899', height: 0.98 },
      { x: 4.2, z: 6.0, rot: -Math.PI / 3, color: '#06b6d4', height: 1.0 },
      { x: 4.8, z: 5.6, rot: 2 * Math.PI / 3, color: '#e2e8f0', height: 1.04 },
      // Sitting on plaza stone benches
      { x: -3.2, z: 4.5, rot: 0, color: '#64748b', height: 0.85 },
      { x: 3.2, z: 4.5, rot: 0, color: '#334155', height: 0.85 },
      // Walking along the street sidewalk / crosswalk
      { x: -6.5, z: 9.8, rot: Math.PI / 2, color: '#e2e8f0', height: 1.0 },
      { x: -3.5, z: 10.2, rot: Math.PI / 2, color: '#3b82f6', height: 1.02 },
      { x: 5.2, z: 9.8, rot: -Math.PI / 2, color: '#ef4444', height: 0.96 },
      { x: 7.8, z: 10.2, rot: -Math.PI / 2, color: '#10b981', height: 1.0 },
      // Near landscaped planters
      { x: -5.8, z: 3.5, rot: Math.PI / 6, color: '#f59e0b', height: 0.98 },
      { x: 5.8, z: 3.5, rot: -Math.PI / 6, color: '#8b5cf6', height: 1.02 },
      // A denser crowd gathering directly below the building entrance canopy
      { x: -2.2, z: 8.8, rot: Math.PI, color: '#0ea5e9', height: 1.0 },
      { x: -1.4, z: 9.3, rot: Math.PI, color: '#f43f5e', height: 0.96 },
      { x: -0.5, z: 8.9, rot: Math.PI, color: '#22c55e', height: 1.04 },
      { x: 0.5, z: 9.5, rot: Math.PI, color: '#f97316', height: 0.98 },
      { x: 1.4, z: 8.9, rot: Math.PI, color: '#a855f7', height: 1.02 },
      { x: 2.3, z: 9.3, rot: Math.PI, color: '#eab308', height: 0.95 },
      { x: -2.8, z: 10.2, rot: Math.PI * 0.9, color: '#14b8a6', height: 1.0 },
      { x: -1.8, z: 10.7, rot: Math.PI, color: '#f8fafc', height: 1.03 },
      { x: -0.8, z: 10.3, rot: Math.PI, color: '#3b82f6', height: 0.97 },
      { x: 0.3, z: 10.8, rot: Math.PI, color: '#ec4899', height: 1.01 },
      { x: 1.3, z: 10.3, rot: Math.PI, color: '#84cc16', height: 0.96 },
      { x: 2.6, z: 10.6, rot: Math.PI * 1.1, color: '#fb7185', height: 1.04 },
    ],
    []
  );

  return (
    <group position={[0, 0, 0]}>
      {people.map((p, i) => {
        const skinTones = ['#f4c7a1', '#d99a6c', '#9a5d3b', '#6f3e27'];
        const hair = ['#1c1917', '#3f2a1d', '#713f12', '#0f172a'][i % 4];
        const seated = p.height < 0.9;
        const headY = p.height * 0.85 + 0.1;
        const distance = Math.max(Math.hypot(p.x, p.z), 14);
        const headTilt = Math.min(Math.atan2(Math.max(0, gazeHeight - headY), distance), Math.PI / 2.1);

        return (
          <TowerWatcher key={`plaza-person-${i}`} x={p.x} z={p.z} index={i}>
            <RealisticHuman
              shirtColor={p.color}
              height={p.height}
              isDayMode={isDay}
              pose={seated ? 'sitting' : 'walking'}
              skinTone={skinTones[i % skinTones.length]}
              hairColor={hair}
              headTilt={seated ? headTilt * 0.6 : headTilt}
            />
            <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.2, 16]} />
              <meshBasicMaterial color="#000000" transparent opacity={0.22} />
            </mesh>
          </TowerWatcher>
        );
      })}
    </group>
  );
}
