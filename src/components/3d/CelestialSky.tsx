'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { ThemeMode } from '@/types/theme';
import { FloorData } from '@/types/floor';
import { Airplane } from './Airplane';

interface CelestialSkyProps {
  theme: ThemeMode;
  floors?: FloorData[];
  altitude?: number;
}

export function CelestialSky({ theme, floors = [], altitude }: CelestialSkyProps) {
  const isDay = theme === 'day';


  const cloudsRef = useRef<THREE.Group>(null);

  // Animate cloud drift
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = t * 0.005;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 0. EXPANSIVE SKY DOME (Guarantees no black void behind the building) */}
      <mesh position={[0, 20, 0]}>
        <sphereGeometry args={[140, 32, 32]} />
        <meshBasicMaterial
          side={THREE.BackSide}
          color={isDay ? '#ef9a71' : '#0c1222'}
        />
      </mesh>

      {/* 1. CELESTIAL SUN (Day Mode) */}
      {isDay ? (
        <group position={[48, 55, 38]}>
          {/* Core Sun Disk */}
          <mesh>
            <sphereGeometry args={[4.2, 32, 32]} />
            <meshBasicMaterial color="#fffbeb" />
          </mesh>
          {/* Luminous Sun Corona Halo */}
          <mesh>
            <sphereGeometry args={[6.8, 24, 24]} />
            <meshBasicMaterial color="#fef08a" transparent opacity={0.35} />
          </mesh>
          {/* Outer Solar Glow */}
          <mesh>
            <sphereGeometry args={[11.5, 24, 24]} />
            <meshBasicMaterial color="#fde047" transparent opacity={0.15} />
          </mesh>
        </group>
      ) : (
        /* 2. CELESTIAL MOON & STARS (Night Mode) */
        <group position={[-42, 52, -45]}>
          {/* Core Moon Sphere with Lunar Surface Tint */}
          <mesh>
            <sphereGeometry args={[5.2, 32, 32]} />
            <meshStandardMaterial
              color="#e2e8f0"
              emissive="#f1f5f9"
              emissiveIntensity={0.85}
              roughness={0.9}
            />
          </mesh>
          {/* Moon Surface Crater Details */}
          {[-1.2, 0.8, -0.4, 1.6].map((cx, i) => (
            <mesh key={`crater-${i}`} position={[cx, Math.sin(cx) * 1.8, 4.8]}>
              <circleGeometry args={[0.7 - i * 0.1, 16]} />
              <meshBasicMaterial color="#94a3b8" />
            </mesh>
          ))}
          {/* Atmospheric Moonlight Halo */}
          <mesh>
            <sphereGeometry args={[8.5, 24, 24]} />
            <meshBasicMaterial color="#93c5fd" transparent opacity={0.2} />
          </mesh>
          <mesh>
            <sphereGeometry args={[14.0, 24, 24]} />
            <meshBasicMaterial color="#60a5fa" transparent opacity={0.08} />
          </mesh>
        </group>
      )}

      {/* Twinkling Stars (Night) */}
      {!isDay && (
        <Stars
          radius={130}
          depth={60}
          count={5000}
          factor={5}
          saturation={1}
          fade
          speed={1.5}
        />
      )}

      {/* 3. COMMERCIAL / EXECUTIVE JET CRUISING WITH TOP-RANKED SKY BANNER AT TOP FLOOR ALTITUDE */}
      <Airplane theme={theme} floors={floors} altitude={altitude} />



      {/* 4. PROCEDURAL ATMOSPHERIC CLOUDS (Drifting in distance) */}
      <group ref={cloudsRef} position={[0, 36, 0]}>
        {[
          [-45, 0, -35, 12],
          [50, 4, 30, 15],
          [-30, -2, 55, 11],
          [40, 2, -45, 13],
        ].map(([cx, cy, cz, cscale], i) => (
          <group key={`cloud-${i}`} position={[cx, cy, cz]}>
            <mesh>
              <sphereGeometry args={[cscale * 0.4, 16, 16]} />
              <meshStandardMaterial
                color={isDay ? '#ffffff' : '#1e293b'}
                transparent
                opacity={isDay ? 0.45 : 0.3}
                roughness={1}
              />
            </mesh>
            <mesh position={[cscale * 0.25, 0, 0]}>
              <sphereGeometry args={[cscale * 0.3, 16, 16]} />
              <meshStandardMaterial
                color={isDay ? '#ffffff' : '#1e293b'}
                transparent
                opacity={isDay ? 0.4 : 0.25}
                roughness={1}
              />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
