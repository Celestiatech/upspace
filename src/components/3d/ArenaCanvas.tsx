'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, OrbitControls, Environment, Sky } from '@react-three/drei';
import * as THREE from 'three';
import { Arena } from '@/types/arena';
import { FloorData } from '@/types/floor';
import { ArenaScene } from './ArenaScene';
import { ThemeMode } from '@/types/theme';

function ScenePreloader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 whitespace-nowrap rounded-3xl bg-white px-8 py-7 text-center text-slate-700 shadow-xl shadow-slate-900/15">
        <img src="/spinning-head.gif" alt="Loading UpSpace" className="h-36 w-36 object-contain" />
        <span className="text-xs font-semibold tracking-wide">Loading your skyline…</span>
      </div>
    </Html>
  );
}

interface ArenaCanvasProps {
  arena: Arena;
  floors: FloorData[];
  selectedFloor: FloorData | null;
  autoRotate: boolean;
  theme: ThemeMode;
  lowPower?: boolean;
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
  lowPower = false,
  onSelectFloor,
  onHoverFloor,
  resetCameraTrigger,
}: ArenaCanvasProps) {
  const isDayMode = theme === 'day';
  const bgColor = isDayMode ? '#ef9a71' : '#0f172a';

  return (
    <div className="relative w-full h-full select-none">
      <Canvas
        shadows={!lowPower}
        dpr={lowPower ? [1, 1.5] : [1, 2]}
        camera={{
          position: [18, 17, 42],
          fov: 32,
          near: 0.1,
          far: 2000,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: lowPower ? 'default' : 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        className="w-full h-full"
      >
        <color attach="background" args={[bgColor]} />
        <fog attach="fog" args={[bgColor, 60, isDayMode ? 220 : 160]} />
        {!lowPower && <Sky sunPosition={[100, 20, 100]} turbidity={8} rayleigh={6} mieCoefficient={0.005} />}

        <Suspense fallback={<ScenePreloader />}>
          <ArenaScene
            arena={arena}
            floors={floors}
            selectedFloor={selectedFloor}
            autoRotate={autoRotate}
            theme={theme}
            lowPower={lowPower}
            onSelectFloor={onSelectFloor}
            onHoverFloor={onHoverFloor}
            resetCameraTrigger={resetCameraTrigger}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
