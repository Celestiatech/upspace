'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
// Post‑processing imports removed to simplify build (no SSR issues) import removed (using dynamic import)
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Arena } from '@/types/arena';
import { FloorData } from '@/types/floor';
import { BuildingViewer } from './BuildingViewer';
import { ThemeMode } from '@/types/theme';

interface ArenaSceneProps {
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

export function ArenaScene({
  arena,
  floors,
  selectedFloor,
  autoRotate,
  theme,
  lowPower = false,
  onSelectFloor,
  onHoverFloor,
  resetCameraTrigger,
}: ArenaSceneProps) {
  const isDayMode = theme === 'day';
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();

  // Frame the upper half of the tower so the stacked silhouette + rooftop are visible on load.
  const defaultTargetY = arena.baseHeight + floors.length * arena.floorHeight * 0.8;
  const defaultCameraPosition = new THREE.Vector3(21, defaultTargetY + 10, 47);
  const targetFocus = useRef(new THREE.Vector3(0, defaultTargetY, 0));
  const targetCameraPos = useRef(defaultCameraPosition.clone());
  const [explodeAmount, setExplodeAmount] = React.useState(0);

  useEffect(() => {
    const handleSceneControl = (event: Event) => {
      const action = (event as CustomEvent<string>).detail;
      const target = targetFocus.current;
      const offset = targetCameraPos.current.clone().sub(target);

      if (action === 'zoom-in') targetCameraPos.current.copy(target).add(offset.multiplyScalar(0.82));
      if (action === 'zoom-out') targetCameraPos.current.copy(target).add(offset.multiplyScalar(1.22));
      if (action === 'rotate-left' || action === 'rotate-right') {
        const angle = action === 'rotate-left' ? 0.28 : -0.28;
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
        targetCameraPos.current.copy(target).add(offset);
      }
      if (action === 'toggle-explode') setExplodeAmount((value) => (value > 0 ? 0 : 0.55));
    };
    window.addEventListener('upspace:scene-control', handleSceneControl);
    return () => window.removeEventListener('upspace:scene-control', handleSceneControl);
  }, []);

  // When selectedFloor changes, smoothly reframe camera vertically
  useEffect(() => {
    if (selectedFloor) {
      const floorIndex = floors.findIndex((f) => f.id === selectedFloor.id);
      const floorY = arena.baseHeight + floorIndex * arena.floorHeight + arena.floorHeight / 2;

      targetFocus.current.set(0, floorY + 4.5, 0);

      const currentCam = camera.position;
      const horizontalDir = new THREE.Vector2(currentCam.x, currentCam.z).normalize();
      const focusDistance = 45;
      targetCameraPos.current.set(
        horizontalDir.x * focusDistance,
        floorY + 9,
        horizontalDir.y * focusDistance
      );
    } else {
      targetFocus.current.set(0, defaultTargetY, 0);
      targetCameraPos.current.copy(defaultCameraPosition);
    }
  }, [selectedFloor, floors, arena, camera]);

  // Reset Camera Trigger
  useEffect(() => {
    if (resetCameraTrigger && resetCameraTrigger > 0) {
      targetFocus.current.set(0, defaultTargetY, 0);
      targetCameraPos.current.copy(defaultCameraPosition);
      if (controlsRef.current) {
        controlsRef.current.reset();
      }
    }
  }, [resetCameraTrigger]);

  // Frame loop for smooth lerping
  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetFocus.current, 0.05);

      camera.position.lerp(targetCameraPos.current, 0.04);
      controlsRef.current.update();
    }
  });

  return (
    <>
      {/* 1. PHOTOREALISTIC ARCHITECTURAL SKY & ENVIRONMENT REFLECTION (Requirement #5) */}
      <Environment
        preset={isDayMode ? 'city' : 'night'}
        resolution={lowPower ? 64 : 256}
      />
        {/* Ground Plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
          <planeGeometry args={[500, 500]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Grid Helper */}
        {!lowPower && <gridHelper args={[200, 50, "#38bdf8", "#1e293b"]} position={[0, -1.9, 0]} />}

      // Post‑processing effects omitted for production build

      {/* Ambient fill */}
      <ambientLight
        intensity={isDayMode ? (lowPower ? 1.65 : 1.9) : 0.55}
        color={isDayMode ? '#ffffff' : '#94a3b8'}
      />

      {/* Main directional architectural sunlight casting crisp building shadows */}
      <directionalLight
        position={isDayMode ? [34, 52, 28] : [26, 44, 20]}
        intensity={isDayMode ? 3.1 : 1.2}
        color={isDayMode ? '#fffbeb' : '#ffffff'}
        castShadow
        shadow-mapSize={lowPower ? [512, 512] : [2048, 2048]}
        shadow-camera-left={-32}
        shadow-camera-right={32}
        shadow-camera-top={50}
        shadow-camera-bottom={-14}
        shadow-camera-near={0.5}
        shadow-camera-far={120}
        shadow-bias={-0.0001}
      />

      {/* Sky bounce & fill light */}
      <directionalLight
        position={[-24, 20, -24]}
        intensity={isDayMode ? 0.9 : 0.45}
        color={isDayMode ? '#bae6fd' : '#38bdf8'}
      />

      {/* Plaza entrance ground lighting */}
      <pointLight
        position={[0, 2.5, 4.5]}
        color="#fed7aa"
        intensity={isDayMode ? 0.9 : 2.4}
        distance={18}
        decay={2}
      />

      {/* 2. CAMERA CONTROLS */}
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.75}
        zoomSpeed={0.85}
        minDistance={15}
        maxDistance={120}
        minPolarAngle={1.45}
        maxPolarAngle={Math.PI / 2 - 0.01}
        autoRotate={autoRotate}
        autoRotateSpeed={0.35}
        target={[0, defaultTargetY, 0]}
      />

      {/* 3. 3D BUILDING & SURROUNDING URBAN ENVIRONMENT */}
      <BuildingViewer
        arena={arena}
        floors={floors}
        selectedFloor={selectedFloor}
        isDayMode={isDayMode}
        explodeAmount={explodeAmount}
        onSelectFloor={onSelectFloor}
        onHoverFloor={onHoverFloor}
      />
    </>
  );
}
