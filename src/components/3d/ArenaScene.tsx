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
import { CityAnimationSystem, PlazaAnimationSystem, FloorAnimationSystem } from './AnimationSystems';

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
  const { camera, size } = useThree();
  const isMobileViewport = size.width < 640;

  // Exact GetTopFloor 3/4 isometric architectural camera angle framing rooftop helipad and top floors
  const roofY = arena.baseHeight * 1.4 + floors.length * arena.floorHeight;
  const defaultTargetY = roofY + 1.4;
  const defaultCameraPosition = new THREE.Vector3(
    isMobileViewport ? -18 : -14,
    roofY + (isMobileViewport ? 9 : 8.5),
    isMobileViewport ? 27 : 20
  );
  const targetFocus = useRef(new THREE.Vector3(0, defaultTargetY, 0));
  const targetCameraPos = useRef(defaultCameraPosition.clone());
  const [showRuler, setShowRuler] = React.useState(true);
  const [explodeAmount, setExplodeAmount] = React.useState(0);

  useEffect(() => {
    const handleSceneControl = (event: Event) => {
      const action = (event as CustomEvent<string>).detail;
      const target = targetFocus.current;
      const offset = targetCameraPos.current.clone().sub(target);

      if (action === 'zoom-in') targetCameraPos.current.copy(target).add(offset.multiplyScalar(0.8));
      if (action === 'zoom-out') targetCameraPos.current.copy(target).add(offset.multiplyScalar(1.25));
      if (action === 'rotate-left' || action === 'rotate-right') {
        const angle = action === 'rotate-left' ? 0.35 : -0.35;
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
        targetCameraPos.current.copy(target).add(offset);
      }
      if (action === 'move-up') {
        const maxY = arena.baseHeight + floors.length * arena.floorHeight + 10;
        targetFocus.current.y = Math.min(maxY, targetFocus.current.y + arena.floorHeight * 1.5);
        targetCameraPos.current.y = Math.min(maxY + 15, targetCameraPos.current.y + arena.floorHeight * 1.5);
      }
      if (action === 'move-down') {
        const minY = arena.baseHeight * 1.2;
        targetFocus.current.y = Math.max(minY, targetFocus.current.y - arena.floorHeight * 1.5);
        targetCameraPos.current.y = Math.max(minY + 6, targetCameraPos.current.y - arena.floorHeight * 1.5);
      }
      if (action === 'jump-top') {
        const terraceIndex = floors.length - 1;
        const terraceY = arena.baseHeight + terraceIndex * arena.floorHeight + arena.floorHeight / 2;
        const distance = isMobileViewport ? 38 : 30;
        targetFocus.current.set(0, terraceY + 7, 0);
        targetCameraPos.current.set(-0.58 * distance, terraceY + (isMobileViewport ? 11 : 10), 0.82 * distance);
      }
      if (action === 'jump-base') {
        const baseY = arena.baseHeight * 1.4;
        targetFocus.current.set(0, baseY, 0);
        targetCameraPos.current.set(targetCameraPos.current.x, baseY + 6, targetCameraPos.current.z);
      }
      if (action === 'toggle-ruler') {
        setShowRuler((prev) => !prev);
      }
      if (action === 'toggle-explode') setExplodeAmount((value) => (value > 0 ? 0 : 0.55));
    };
    window.addEventListener('upspace:scene-control', handleSceneControl);
    return () => window.removeEventListener('upspace:scene-control', handleSceneControl);
  }, [arena, floors, isMobileViewport]);

  // When selectedFloor changes, smoothly reframe camera vertically
  useEffect(() => {
    if (selectedFloor) {
      const floorIndex = floors.findIndex((f) => f.id === selectedFloor.id);
      const floorY = arena.baseHeight + floorIndex * arena.floorHeight + arena.floorHeight / 2;

      const isTerrace = floorIndex === floors.length - 1;
      targetFocus.current.set(0, floorY + (isTerrace ? 7 : 4.5), 0);

      const focusDistance = isTerrace ? (isMobileViewport ? 38 : 30) : 45;
      const currentCam = camera.position;
      // Keep the default terrace view on the left side of the building.
      const horizontalDir = isTerrace
        ? new THREE.Vector2(-0.58, 0.82)
        : new THREE.Vector2(currentCam.x, currentCam.z).normalize();
      targetCameraPos.current.set(
        horizontalDir.x * focusDistance,
        floorY + (isTerrace ? 10 : 9),
        horizontalDir.y * focusDistance
      );
    } else {
      targetFocus.current.set(0, defaultTargetY, 0);
      targetCameraPos.current.copy(defaultCameraPosition);
    }
  }, [selectedFloor, floors, arena, camera, isMobileViewport]);

  // Reset Camera Trigger
  useEffect(() => {
    if (resetCameraTrigger && resetCameraTrigger > 0) {
      const terraceIndex = floors.length - 1;
      const terraceFloor = floors[terraceIndex];
      if (terraceFloor) {
        const terraceY = arena.baseHeight + terraceIndex * arena.floorHeight + arena.floorHeight / 2;
        targetFocus.current.set(0, terraceY + 7, 0);
        const distance = isMobileViewport ? 38 : 30;
        targetCameraPos.current.set(-0.58 * distance, terraceY + (isMobileViewport ? 11 : 10), 0.82 * distance);
      } else {
        targetFocus.current.set(0, defaultTargetY, 0);
        targetCameraPos.current.copy(defaultCameraPosition);
      }
      if (controlsRef.current) {
        controlsRef.current.reset();
      }
    }
  }, [resetCameraTrigger, isMobileViewport]);

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
      <CityAnimationSystem />
      <PlazaAnimationSystem />
      <FloorAnimationSystem />
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
        shadow-mapSize={lowPower ? [512, 512] : [1024, 1024]}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={44}
        shadow-camera-bottom={-10}
        shadow-camera-near={0.5}
        shadow-camera-far={100}
        shadow-bias={-0.00015}
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
        minDistance={12}
        maxDistance={110}
        minPolarAngle={0.9}
        maxPolarAngle={Math.PI / 2 - 0.02}
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
        showRuler={showRuler}
        onSelectFloor={onSelectFloor}
          onHoverFloor={onHoverFloor}
          lowPower={lowPower}
        />
    </>
  );
}
