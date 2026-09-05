'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import * as THREE from 'three';
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
  lowPower?: boolean;
  onSelectFloor: (floor: FloorData) => void;
  onHoverFloor?: (floor: FloorData | null) => void;
  resetCameraTrigger?: number;
}

function RenderScheduler({ enabled }: { enabled: boolean }) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (!enabled) return;
    invalidate();
    // Render at 30 FPS instead of an unrestricted 60+ FPS loop.
    const timer = window.setInterval(invalidate, 1000 / 30);
    return () => window.clearInterval(timer);
  }, [enabled, invalidate]);

  return null;
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
  const [pageVisible, setPageVisible] = useState(true);

  // Stop the render loop while the browser tab is hidden. This prevents a
  // background tab from keeping the GPU/CPU (and laptop fans) busy.
  useEffect(() => {
    const updateVisibility = () => setPageVisible(document.visibilityState === 'visible');
    updateVisibility();
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  return (
    <div className="relative w-full h-full select-none">
      <Canvas
        frameloop="demand"
        // Adaptive performance prevents frame dips while keeping rendering sharp
        performance={{ min: 0.75, max: 1, debounce: 200 }}
        shadows={!lowPower}
        dpr={lowPower ? [1, 1.25] : [1, 2]}
        camera={{
          position: [18, 17, 42],
          fov: 32,
          near: 0.1,
          far: 2000,
        }}
        gl={{
          antialias: true,
          alpha: false,
          stencil: false,
          depth: true,
          powerPreference: 'high-performance',
          precision: 'highp',
          toneMapping: THREE.ACESFilmicToneMapping,
          // Brighter HDR-style highlights without a costly bloom pass.
          toneMappingExposure: lowPower ? 1.3 : 1.5,
        }}
        className="w-full h-full"
      >
        <color attach="background" args={[bgColor]} />
        <fog attach="fog" args={[bgColor, 60, isDayMode ? 220 : 160]} />
        {!lowPower && <Sky sunPosition={[100, 20, 100]} turbidity={8} rayleigh={6} mieCoefficient={0.005} />}
        <RenderScheduler enabled={pageVisible} />

        <Suspense fallback={null}>
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
