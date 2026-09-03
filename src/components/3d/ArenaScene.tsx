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
  onSelectFloor,
  onHoverFloor,
  resetCameraTrigger,
}: ArenaSceneProps) {
  const isDayMode = theme === 'day';
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();

  // Locked front-facing product view: eye-level with the lower tower facade.
  const defaultTargetY = 2.5;
  const defaultCameraPosition = new THREE.Vector3(0, 2.5, 65);
  const targetFocus = useRef(new THREE.Vector3(0, defaultTargetY, 0));
  const targetCameraPos = useRef(defaultCameraPosition.clone());

  // When selectedFloor changes, smoothly reframe camera vertically
  useEffect(() => {
    if (selectedFloor) {
      const floorIndex = floors.findIndex((f) => f.id === selectedFloor.id);
      const floorY = arena.baseHeight + floorIndex * arena.floorHeight + arena.floorHeight / 2;

      targetFocus.current.set(0, floorY, 0);

      const currentCam = camera.position;
      const horizontalDir = new THREE.Vector2(currentCam.x, currentCam.z).normalize();
      const focusDistance = 45;
      targetCameraPos.current.set(
        horizontalDir.x * focusDistance,
        floorY,
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
      <Environment preset={isDayMode ? 'city' : 'night'} />
        {/* Ground Plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
          <planeGeometry args={[500, 500]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Grid Helper */}
        <gridHelper args={[200, 50, "#38bdf8", "#1e293b"]} position={[0, -1.9, 0]} />

      // Post‑processing effects omitted for production build

      {/* Ambient fill */}
      <ambientLight
        intensity={isDayMode ? 1.4 : 0.4}
        color={isDayMode ? '#ffffff' : '#94a3b8'}
      />

      {/* Main directional architectural sunlight casting crisp building shadows */}
      <directionalLight
        position={isDayMode ? [34, 52, 28] : [26, 44, 20]}
        intensity={isDayMode ? 2.4 : 1.2}
        color={isDayMode ? '#fffbeb' : '#ffffff'}
        castShadow
        shadow-mapSize={[2048, 2048]}
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
        onSelectFloor={onSelectFloor}
        onHoverFloor={onHoverFloor}
      />
    </>
  );
}
