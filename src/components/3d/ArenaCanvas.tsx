'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Sky } from '@react-three/drei';
import { Arena } from '@/types/arena';
import { FloorData } from '@/types/floor';
import { ArenaScene } from './ArenaScene';
import { ThemeMode } from '@/types/theme';

interface ArenaCanvasProps {
  arena: Arena;
  floors: FloorData[];
  selectedFloor: FloorData | null;
  autoRotate: boolean;
  theme: ThemeMode;
  onSelectFloor: (floor: FloorData) => void;
  onHoverFloor?: (floor: FloorData | null) => void;
  resetCameraTrigger?: number;
}

export function ArenaCanvas({
  arena,
  floors,
  selectedFloor,
  autoRotate,
  theme,
  onSelectFloor,
  onHoverFloor,
  resetCameraTrigger,
}: ArenaCanvasProps) {
  const isDayMode = theme === 'day';
  const bgColor = isDayMode ? '#38bdf8' : '#0f172a';

  return (
    <div className="relative w-full h-full select-none">
      <Canvas
        shadows
        camera={{
          position: [0, 2.5, 65],
          fov: 30,
          near: 0.1,
          far: 2000,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        className="w-full h-full"
      >
        <color attach="background" args={[bgColor]} />
        <fog attach="fog" args={[bgColor, 60, isDayMode ? 220 : 160]} />
        <Sky sunPosition={[100, 20, 100]} turbidity={8} rayleigh={6} mieCoefficient={0.005} />

        <Suspense fallback={null}>
          <ArenaScene
            arena={arena}
            floors={floors}
            selectedFloor={selectedFloor}
            autoRotate={autoRotate}
            theme={theme}
            onSelectFloor={onSelectFloor}
            onHoverFloor={onHoverFloor}
            resetCameraTrigger={resetCameraTrigger}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
