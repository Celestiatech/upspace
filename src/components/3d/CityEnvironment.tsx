'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { ThemeMode } from '@/types/theme';

interface CityEnvironmentProps {
  theme: ThemeMode;
}

function MovingRoadCar({ color, index }: { color: string; index: number }) {
  const carRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const car = carRef.current;
    if (!car) return;

    const route = index % 4;
    const distance = (state.clock.getElapsedTime() * 6 + index * 18) % 152;
    const start = 27;

    // Cars keep a fixed heading and drive in straight lines on the four boulevards.
    if (route === 0) {
      car.position.set(start + distance, 0.28, -1.5);
      car.rotation.y = 0;
    } else if (route === 1) {
      car.position.set(-start - distance, 0.28, 1.5);
      car.rotation.y = Math.PI;
    } else if (route === 2) {
      car.position.set(-1.5, 0.28, start + distance);
      car.rotation.y = Math.PI / 2;
    } else {
      car.position.set(1.5, 0.28, -start - distance);
      car.rotation.y = -Math.PI / 2;
    }
  });

  return (
    <group ref={carRef}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.7, 0.38, 0.82]} />
        <meshStandardMaterial color={color} metalness={0.75} roughness={0.24} />
      </mesh>
      <mesh position={[-0.12, 0.31, 0]} castShadow>
        <boxGeometry args={[0.9, 0.3, 0.7]} />
        <meshStandardMaterial color="#172033" metalness={0.85} roughness={0.16} />
      </mesh>
    </group>
  );
}

const SHARED_CITY_GEOMETRIES = {
  treeTrunk: new THREE.CylinderGeometry(0.08, 0.12, 1.5, 6),
  treeCanopy: new THREE.SphereGeometry(0.85, 8, 8),
  lightPole: new THREE.CylinderGeometry(0.04, 0.06, 2.8, 6),
  lightArm: new THREE.CylinderGeometry(0.03, 0.03, 0.6, 6),
  lanternBox: new THREE.BoxGeometry(0.16, 0.06, 0.28),
  pedLeg: new THREE.CapsuleGeometry(0.045, 0.32, 4, 6),
  pedTorso: new THREE.CylinderGeometry(0.1, 0.13, 0.34, 6),
  pedHead: new THREE.SphereGeometry(0.1, 8, 8),
};

export function CityEnvironment({ theme }: CityEnvironmentProps) {
  const isDay = theme === 'day';

  // Tree groves wrap the building and road network.
  const treePositions = useMemo(
    () => Array.from({ length: 36 }, (_, index) => {
      const angle = (index / 36) * Math.PI * 2;
      const radius = index % 2 === 0 ? 34 : 46;
      return [Math.cos(angle) * radius, Math.sin(angle) * radius] as [number, number];
    }),
    []
  );

  // Modern Street Lights positions
  const streetLightPositions = useMemo(
    () => Array.from({ length: 16 }, (_, index) => {
      const angle = (index / 16) * Math.PI * 2;
      return [Math.cos(angle) * 27, Math.sin(angle) * 27] as [number, number];
    }),
    []
  );

  const cars = useMemo(
    () => [
      { x: -16, z: 22, rot: 0, color: '#3b82f6' },
      { x: -5, z: 22, rot: 0, color: '#ef4444' },
      { x: 8, z: 22, rot: 0, color: '#f8fafc' },
      { x: 22, z: 11, rot: Math.PI / 2, color: '#10b981' },
      { x: 22, z: -8, rot: Math.PI / 2, color: '#f59e0b' },
      { x: 14, z: -22, rot: Math.PI, color: '#8b5cf6' },
      { x: 0, z: -22, rot: Math.PI, color: '#e2e8f0' },
      { x: -18, z: -22, rot: Math.PI, color: '#06b6d4' },
      { x: -22, z: -9, rot: -Math.PI / 2, color: '#f97316' },
      { x: -22, z: 10, rot: -Math.PI / 2, color: '#94a3b8' },
    ],
    []
  );

  // Pedestrians strolling on the plaza
  const pedestrians = useMemo(
    () => [
      { x: -12, z: 10 }, { x: -8, z: 14 }, { x: 8, z: 13 },
      { x: 13, z: 10 }, { x: -14, z: 7 }, { x: 14, z: 7 },
      { x: 13, z: -10 }, { x: -13, z: -10 }, { x: 0, z: 15 },
    ],
    []
  );

  return (
    <group position={[0, 0, 0]}>
      {/* 1. MINIATURE WORLD: a floating landscaped island, rather than an endless flat plane */}
      <mesh position={[0, -179.8, 0]} castShadow receiveShadow>
        <sphereGeometry args={[180, 48, 24]} />
        <meshStandardMaterial
          color={isDay ? '#6b4226' : '#172033'}
          roughness={0.95}
          metalness={0}
        />
      </mesh>

      {/* Soft grass cap makes the island read as a small, complete world from every orbit angle */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[179.5, 64]} />
        <meshStandardMaterial
          color={isDay ? '#4d7c3a' : '#14302a'}
          roughness={0.92}
          metalness={0.02}
        />
      </mesh>

      {/* Raised shoreline / island edge */}
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[179, 179.55, 64]} />
        <meshStandardMaterial
          color={isDay ? '#d6b879' : '#334155'}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* Circular boulevard around the building and garden. */}
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[19, 26, 64]} />
        <meshStandardMaterial color={isDay ? '#475569' : '#111827'} roughness={0.86} />
      </mesh>
      <mesh position={[0, 0.075, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[22.25, 22.7, 64]} />
        <meshStandardMaterial color={isDay ? '#f8fafc' : '#94a3b8'} roughness={0.55} />
      </mesh>

      {/* Four radial boulevards connect the ring to each side of the garden world. */}
      {[
        { position: [0, 0.05, 102], size: [7, 0.04, 154] },
        { position: [0, 0.05, -102], size: [7, 0.04, 154] },
        { position: [102, 0.05, 0], size: [154, 0.04, 7] },
        { position: [-102, 0.05, 0], size: [154, 0.04, 7] },
      ].map((road, index) => (
        <mesh key={`boulevard-${index}`} position={road.position as [number, number, number]} receiveShadow>
          <boxGeometry args={road.size as [number, number, number]} />
          <meshStandardMaterial color={isDay ? '#475569' : '#111827'} roughness={0.86} />
        </mesh>
      ))}

      {/* 2. TREES ACROSS THE FULL GARDEN */}
      {treePositions.map(([tx, tz], i) => (
        <group key={`tree-${i}`} position={[tx, 0, tz]}>
          <mesh geometry={SHARED_CITY_GEOMETRIES.treeTrunk} position={[0, 0.75, 0]} castShadow>
            <meshStandardMaterial color="#451a03" roughness={0.9} />
          </mesh>
          <mesh geometry={SHARED_CITY_GEOMETRIES.treeCanopy} position={[0, 1.9, 0]} castShadow>
            <meshStandardMaterial
              color={isDay ? '#15803d' : '#166534'}
              roughness={0.7}
              metalness={0.05}
            />
          </mesh>
        </group>
      ))}

      {/* 3. GARDEN LIGHTS WITH ILLUMINATED LANTERNS */}
      {streetLightPositions.map(([lx, lz], i) => (
        <group key={`light-${i}`} position={[lx, 0, lz]}>
          <mesh geometry={SHARED_CITY_GEOMETRIES.lightPole} position={[0, 1.4, 0]} castShadow>
            <meshStandardMaterial color={isDay ? '#64748b' : '#1e293b'} metalness={0.9} />
          </mesh>
          <mesh geometry={SHARED_CITY_GEOMETRIES.lightArm} position={[0, 2.8, 0.25]} rotation={[Math.PI / 4, 0, 0]}>
            <meshStandardMaterial color={isDay ? '#64748b' : '#1e293b'} metalness={0.9} />
          </mesh>
          <mesh geometry={SHARED_CITY_GEOMETRIES.lanternBox} position={[0, 2.95, 0.45]}>
            <meshStandardMaterial
              color="#ffffff"
              emissive="#fef08a"
              emissiveIntensity={isDay ? 0.8 : 2.5}
            />
          </mesh>
        </group>
      ))}

      {/* 4. CARS ON THE CIRCULAR BOULEVARD */}
      {cars.map((car, i) => (
        <MovingRoadCar key={`car-${i}`} color={car.color} index={i} />
      ))}

      {/* 5. PLAZA PEDESTRIANS */}
      {pedestrians.map((p, i) => (
        <group key={`ped-${i}`} position={[p.x, 0, p.z]}>
          {[-0.055, 0.055].map((x) => (
            <mesh key={x} geometry={SHARED_CITY_GEOMETRIES.pedLeg} position={[x, 0.22, 0]} castShadow>
              <meshStandardMaterial color="#1e293b" roughness={0.82} />
            </mesh>
          ))}
          <mesh geometry={SHARED_CITY_GEOMETRIES.pedTorso} position={[0, 0.54, 0]} castShadow>
            <meshStandardMaterial color={['#2563eb', '#dc2626', '#059669', '#ca8a04'][i % 4]} roughness={0.72} />
          </mesh>
          <mesh geometry={SHARED_CITY_GEOMETRIES.pedHead} position={[0, 0.91, 0]} castShadow>
            <meshStandardMaterial color={isDay ? ['#f4c7a1', '#d99a6c', '#9a5d3b'][i % 3] : '#b9c3d2'} roughness={0.68} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
