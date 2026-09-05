'use client';

import React from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface HeadquartersGroundFloorProps {
  width: number;
  height: number;
  themeColor: string;
  isDayMode?: boolean;
}

export function HeadquartersGroundFloor({
  width,
  height,
  themeColor,
  isDayMode = false,
}: HeadquartersGroundFloorProps) {
  const depth = width;
  const wallColor = isDayMode ? '#2a2a2a' : '#1e1e1e';
  const wallLight = isDayMode ? '#3a3a3a' : '#2a2a2a';
  const trim = '#b07d2b';
  const charcoal = '#222222';

  return (
    <group position={[0, 0, 0]}>
      {/* Solid fully-enclosed pedestal rises from ground (0) up to Floor #1's underside (height) */}
      <group position={[0, height / 2, 0]}>
        {/* 1. SOLID FULLY-ENCLOSED PEDESTAL CORE (all four sides, zero void) */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial color={wallColor} metalness={0.55} roughness={0.72} />
        </mesh>

        {/* Structural bronze top & bottom pedestal bands */}
        <mesh position={[0, height / 2 - 0.12, 0]}>
          <boxGeometry args={[width + 0.08, 0.24, depth + 0.08]} />
          <meshStandardMaterial color={trim} metalness={0.9} roughness={0.3} />
        </mesh>
        <mesh position={[0, -height / 2 + 0.12, 0]}>
          <boxGeometry args={[width + 0.08, 0.24, depth + 0.08]} />
          <meshStandardMaterial color={trim} metalness={0.9} roughness={0.3} />
        </mesh>

        {/* 2. FACADE PANELING ON ALL FOUR SIDES (opaque matte panels + bronze trims) */}
        {([
          { pos: [0, 0, depth / 2 + 0.01], w: width - 0.3, rot: 0 },
          { pos: [0, 0, -depth / 2 - 0.01], w: width - 0.3, rot: 0 },
          { pos: [-width / 2 - 0.01, 0, 0], w: depth - 0.3, rot: 1 },
          { pos: [width / 2 + 0.01, 0, 0], w: depth - 0.3, rot: 1 },
        ] as { pos: [number, number, number]; w: number; rot: number }[]).map((face, fi) => {
          const facePanels = [-0.44, -0.22, 0, 0.22, 0.44];
          return (
            <group key={`face-${fi}`} position={face.pos} rotation={face.rot === 1 ? [0, Math.PI / 2, 0] : [0, 0, 0]}>
              {[-0.33, -0.11, 0.11, 0.33].map((off, pi) => (
                <mesh key={`panel-${pi}`} position={[off * face.w, 0, 0]}>
                  <planeGeometry args={[face.w * 0.2, height]} />
                  <meshStandardMaterial color={wallLight} side={THREE.DoubleSide} />
                </mesh>
              ))}
              {facePanels.map((off) => (
                <mesh key={`vt-${off}`} position={[off * face.w, 0, 0.012]}>
                  <boxGeometry args={[0.05, height, 0.05]} />
                  <meshStandardMaterial color={trim} metalness={0.9} roughness={0.32} />
                </mesh>
              ))}
            </group>
          );
        })}

        {/* Bronze corner edge trims */}
        {([[-1, -1], [1, -1], [-1, 1], [1, 1]] as [number, number][]).map(([sx, sz], i) => (
          <mesh key={`corner-${i}`} position={[sx * width / 2, 0, sz * depth / 2]}>
            <boxGeometry args={[0.09, height, 0.09]} />
            <meshStandardMaterial color={trim} metalness={0.9} roughness={0.32} />
          </mesh>
        ))}

        {/* 3. COVERED RECESSED ENTRANCE PORTAL (front face, near the ground) */}
        <group position={[0, -height * 0.34, depth / 2]}>
          {/* Recessed dark portal opening */}
          <mesh position={[0, 0.05, 0.02]}>
            <boxGeometry args={[2.9, 2.6, 0.35]} />
            <meshStandardMaterial color="#0b0b0b" metalness={0.6} roughness={0.5} />
          </mesh>
          {/* Dark metallic double doors */}
          {[-0.62, 0.62].map((dx) => (
            <mesh key={`door-${dx}`} position={[dx, -0.42, 0.05]}>
              <boxGeometry args={[1.28, 1.9, 0.12]} />
              <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.28} />
            </mesh>
          ))}
          {/* Vertical center door split */}
          <mesh position={[0, -0.42, 0.05]}>
            <boxGeometry args={[0.06, 1.9, 0.13]} />
            <meshStandardMaterial color={charcoal} metalness={0.85} roughness={0.35} />
          </mesh>
          {/* Sleek frame border */}
          <mesh position={[0, 1.4, 0.02]}>
            <boxGeometry args={[3.0, 0.22, 0.4]} />
            <meshStandardMaterial color={trim} metalness={0.9} roughness={0.3} />
          </mesh>
          <mesh position={[0, -1.42, 0.02]}>
            <boxGeometry args={[3.0, 0.2, 0.4]} />
            <meshStandardMaterial color={trim} metalness={0.9} roughness={0.3} />
          </mesh>
          {[-1.5, 1.5].map((dx) => (
            <mesh key={`jamb-${dx}`} position={[dx, -0.05, 0.02]}>
              <boxGeometry args={[0.2, 2.9, 0.4]} />
              <meshStandardMaterial color={trim} metalness={0.9} roughness={0.3} />
            </mesh>
          ))}
        </group>

        {/* 4. ILLUMINATED UPSPACE LOGO PLATE ABOVE THE DOORWAY */}
        <group position={[0, -height * 0.34 + 1.65, depth / 2 + 0.1]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[2.5, 0.55, 0.14]} />
            <meshStandardMaterial color={isDayMode ? '#111827' : '#05070d'} metalness={0.5} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[2.5, 0.32, 0.02]} />
            <meshStandardMaterial color={themeColor} metalness={0.9} roughness={0.2} />
          </mesh>
          <Text
            position={[0, 0.01, 0.1]}
            fontSize={0.34}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
            letterSpacing={0.04}
          >
            Get3DBillboards
          </Text>
        </group>
      </group>

      {/* 5. CONCRETE PLAZA PLATFORM + CURVED ASPHALT ROAD RING AROUND IT */}
      <mesh position={[0, 0.055, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[width / 2 + 2.2, 15.5, 96]} />
        <meshStandardMaterial color={isDayMode ? '#94a3b8' : '#1a2333'} roughness={0.6} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.057, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[11.2, 11.28, 96]} />
        <meshStandardMaterial color={isDayMode ? '#cbd5e1' : '#334155'} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.068, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[15.5, 18.5, 96]} />
        <meshStandardMaterial color={isDayMode ? '#475569' : '#0f172a'} roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[15.5, 15.62, 96]} />
        <meshStandardMaterial color={isDayMode ? '#e2e8f0' : '#475569'} roughness={0.6} />
      </mesh>

      {/* 6. SMALL GARDEN AROUND THE BASE */}
      {/* Circular ring of low shrub beds wrapping the pedestal */}
      {Array.from({ length: 20 }, (_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const r = width / 2 + 1.15;
        return (
          <group key={`shrub-${i}`} position={[Math.cos(angle) * r, 0.06, Math.sin(angle) * r]} rotation={[0, -angle, 0]}>
            {/* planter bed */}
            <mesh position={[0, 0.04, 0]}>
              <boxGeometry args={[0.85, 0.09, 0.5]} />
              <meshStandardMaterial color={isDayMode ? '#57534e' : '#292524'} roughness={0.85} />
            </mesh>
            {/* shrub mound */}
            <mesh position={[0, 0.14, 0]}>
              <sphereGeometry args={[0.3, 10, 8]} />
              <meshStandardMaterial color={isDayMode ? '#15803d' : '#14532d'} roughness={0.75} />
            </mesh>
            <mesh position={[0.14, 0.12, 0.1]}>
              <sphereGeometry args={[0.2, 8, 6]} />
              <meshStandardMaterial color={isDayMode ? '#16a34a' : '#166534'} roughness={0.75} />
            </mesh>
          </group>
        );
      })}

      {/* Small garden trees scattered on the plaza near the road ring */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2 + 0.4;
        const r = 12.6;
        return (
          <group key={`garden-tree-${i}`} position={[Math.cos(angle) * r, 0.06, Math.sin(angle) * r]}>
            <mesh position={[0, 0.35, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.13, 0.7, 8]} />
              <meshStandardMaterial color="#451a03" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.9, 0]} castShadow>
              <sphereGeometry args={[0.55, 10, 8]} />
              <meshStandardMaterial color={isDayMode ? '#15803d' : '#166534'} roughness={0.75} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
