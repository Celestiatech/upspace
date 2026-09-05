'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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

function AdaptiveRenderController({ enabled }: { enabled: boolean }) {
  const invalidate = useThree((state) => state.invalidate);
  const { gl } = useThree();

  useEffect(() => {
    let frameId: number | null = null;
    let lastActivity = 0;
    const idleDelay = 220;

    const stop = () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = null;
    };

    const tick = (now: number) => {
      invalidate();
      if (now - lastActivity < idleDelay && enabled && document.visibilityState === 'visible') {
        frameId = requestAnimationFrame(tick);
      } else {
        frameId = null;
      }
    };

    const wake = () => {
      if (!enabled || document.visibilityState !== 'visible') return;
      lastActivity = performance.now();
      invalidate();
      if (frameId === null) frameId = requestAnimationFrame(tick);
    };

    const element = gl.domElement;
    const events: Array<[keyof HTMLElementEventMap, EventListener]> = [
      ['pointerdown', wake], ['pointermove', wake], ['pointerup', wake],
      ['wheel', wake], ['touchstart', wake], ['touchmove', wake], ['touchend', wake],
    ];
    events.forEach(([type, handler]) => element.addEventListener(type, handler, { passive: true }));
    window.addEventListener('upspace:scene-control', wake);
    document.addEventListener('visibilitychange', wake);

    if (enabled && document.visibilityState === 'visible') wake();
    return () => {
      stop();
      events.forEach(([type, handler]) => element.removeEventListener(type, handler));
      window.removeEventListener('upspace:scene-control', wake);
      document.removeEventListener('visibilitychange', wake);
    };
  }, [enabled, gl, invalidate]);

  return null;
}

function DevPerformanceMonitor() {
  const { gl } = useThree();
  const frames = React.useRef(0);
  const started = React.useRef(performance.now());

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const timer = window.setInterval(() => {
      const elapsed = (performance.now() - started.current) / 1000;
      if (elapsed <= 0) return;
      const info = gl.info;
      console.debug(`[3D performance] ~${Math.round(frames.current / elapsed)} FPS | draw calls: ${info.render.calls} | triangles: ${info.render.triangles} | textures: ${info.memory.textures} | geometries: ${info.memory.geometries}`);
      frames.current = 0;
      started.current = performance.now();
    }, 2000);
    return () => window.clearInterval(timer);
  }, [gl]);

  useFrame(() => { frames.current += 1; });

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
  const [pixelRatio, setPixelRatio] = useState(1.25);

  // Stop the render loop while the browser tab is hidden. This prevents a
  // background tab from keeping the GPU/CPU (and laptop fans) busy.
  useEffect(() => {
    const updateVisibility = () => setPageVisible(document.visibilityState === 'visible');
    updateVisibility();
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  useEffect(() => {
    const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    const maxRatio = lowPower || deviceMemory <= 4 || cores <= 4 ? 1.25 : 1.5;
    setPixelRatio(Math.min(window.devicePixelRatio || 1, maxRatio));
  }, [lowPower]);

  return (
    <div className="relative w-full h-full select-none">
      <Canvas
        frameloop="demand"
        // Adaptive performance prevents frame dips while keeping rendering sharp
        performance={{ min: 0.75, max: 1, debounce: 200 }}
        shadows={!lowPower}
        dpr={[1, pixelRatio]}
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
          powerPreference: lowPower ? 'low-power' : 'high-performance',
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
        <AdaptiveRenderController enabled={pageVisible} />
        <DevPerformanceMonitor />

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
