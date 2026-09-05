'use client';

import React from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface BuildingPodiumProps {
  width: number;
  depth: number;
  height: number;
  themeColor: string;
  isDayMode?: boolean;
}

export function BuildingPodium({
  width,
  depth,
  height,
  themeColor,
  isDayMode = false,
}: BuildingPodiumProps) {
  const plazaSize = 25;

  return (
    <group position={[0, 0, 0]}>
      {/* 1. ARCHITECTURAL GRANITE PLAZA PAVING WITH JOINTS & CURBS */}
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[plazaSize, 0.08, plazaSize]} />
        <meshStandardMaterial
          color={isDayMode ? '#94a3b8' : '#0b101c'}
          roughness={isDayMode ? 0.45 : 0.65}
          metalness={isDayMode ? 0.15 : 0.35}
        />
      </mesh>

      {/* Plaza Inset Granite Curb & Accent Border */}
      <mesh position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[width / 2 + 1.2, width / 2 + 1.38, 64]} />
        <meshStandardMaterial
          color={themeColor}
          emissive={themeColor}
          emissiveIntensity={isDayMode ? 0.6 : 1.2}
        />
      </mesh>

      {/* Plaza Stone Benches for Pedestrians */}
      {[-3.2, 3.2].map((bx) => (
        <mesh key={`bench-${bx}`} position={[bx, 0.25, 4.5]} castShadow receiveShadow>
          <boxGeometry args={[1.6, 0.35, 0.5]} />
          <meshStandardMaterial
            color={isDayMode ? '#64748b' : '#1e293b'}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* 2. SUBSTANTIAL 3-STORY GLASS ATRIUM LOBBY (Floors 1-3) */}
      <group position={[0, height / 2, 0]}>
        {/* Slim central structural core (keeps the building rigid without a bulky pedestal) */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[width * 0.3, height, depth * 0.3]} />
          <meshStandardMaterial
            color={isDayMode ? '#334155' : '#070b14'}
            metalness={0.92}
            roughness={0.18}
          />
        </mesh>

        {/* 2A. SEGMENTED CURTAIN-WALL GLASS (separate window panels built on all 4 sides) */}
        {([
          { pos: [0, 0, (depth + 0.6) / 2 + 0.02], rot: [0, 0, 0], w: width - 0.4, cols: 5 },
          { pos: [0, 0, -(depth + 0.6) / 2 - 0.02], rot: [0, Math.PI, 0], w: width - 0.4, cols: 5 },
          { pos: [-(width + 0.6) / 2 - 0.02, 0, 0], rot: [0, -Math.PI / 2, 0], w: depth - 0.4, cols: 3 },
          { pos: [(width + 0.6) / 2 + 0.02, 0, 0], rot: [0, Math.PI / 2, 0], w: depth - 0.4, cols: 3 },
        ] as { pos: [number, number, number]; rot: [number, number, number]; w: number; cols: number }[]
        ).map((face, fi) => {
          const gh = height - 0.3;
          const rows = 4;
          const gap = 0.07;
          const paneW = face.w / face.cols;
          const paneH = gh / rows;
          const panes = [];
          for (let c = 0; c < face.cols; c++) {
            for (let r = 0; r < rows; r++) {
              panes.push({
                px: (c - (face.cols - 1) / 2) * paneW,
                py: -(r - (rows - 1) / 2) * paneH,
              });
            }
          }
          return (
            <group key={`face-${fi}`} position={face.pos} rotation={face.rot}>
              {/* Dark structural frame backer reveals the pane seams */}
              <mesh position={[0, 0, -0.012]} rotation={[0, 0, 0]}>
                <planeGeometry args={[face.w, gh]} />
                <meshStandardMaterial color={isDayMode ? '#1e293b' : '#0a0f1d'} metalness={0.9} roughness={0.2} />
              </mesh>
              {/* Individual solid, dull wall panels (fully sealed - no void) */}
              {panes.map(({ px, py }, i) => (
                <mesh key={`pane-${i}`} position={[px, py, 0]} rotation={[0, 0, 0]}>
                  <planeGeometry args={[paneW - gap, paneH - gap]} />
                  <meshStandardMaterial
                    color={isDayMode ? '#94a3b8' : '#1e293b'}
                    metalness={0.55}
                    roughness={0.7}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              ))}
            </group>
          );
        })}

        {/* Interior Lobby Reception Desk & Architectural Columns Visible Through Glass */}
        <mesh position={[0, -height * 0.25, 0]}>
          <boxGeometry args={[2.2, 0.5, 0.8]} />
          <meshStandardMaterial color="#f8fafc" emissive="#fed7aa" emissiveIntensity={0.6} />
        </mesh>

        {/* Revolving Glass Entrance Door Cylinder */}
        <group position={[0, -height * 0.28, (depth + 0.6) / 2 + 0.15]}>
          <mesh>
            <cylinderGeometry args={[0.7, 0.7, 1.1, 16]} />
            <meshPhysicalMaterial
              color="#ffffff"
              transmission={0.9}
              transparent
              opacity={0.5}
              roughness={0.1}
            />
          </mesh>
          <mesh rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[0.02, 1.0, 1.3]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} />
          </mesh>
        </group>

        {/* Grand Entrance Architectural Cantilevered Canopy */}
        <group position={[0, -height * 0.1, (depth + 0.6) / 2 + 0.85]}>
          {/* Under-Canopy Recessed Downlight Strip */}
          <mesh position={[0, -0.075, 0]}>
            <planeGeometry args={[width * 0.7, 1.4]} />
            <meshStandardMaterial
              color="#fed7aa"
              emissive="#fed7aa"
              emissiveIntensity={isDayMode ? 0.6 : 1.4}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Prominent Architectural Signage */}
          <Text
            position={[0, 0.22, 0.55]}
            fontSize={0.24}
            color={isDayMode ? '#0f172a' : '#ffffff'}
            anchorX="center"
            anchorY="bottom"
            fontWeight="bold"
            letterSpacing={0.16}
          >
            GET3DBILLBOARDS TOWER
          </Text>

          <Text
            position={[0, 0.08, 0.55]}
            fontSize={0.11}
            color={themeColor}
            anchorX="center"
            anchorY="bottom"
            letterSpacing={0.22}
          >
            GLOBAL ADVERTISING HEADQUARTERS
          </Text>
        </group>

      </group>

      {/* 2B. STRUCTURAL BASE PILLARS WITH AD BILLBOARDS ON ALL 4 SIDES */}
      {[
        { pos: [0, 0, depth / 2 + 0.75], rot: 0, brand: 'Get3DBillboards', tag: 'CLAIM YOUR 3D BILLBOARD', leader: true },
        { pos: [0, 0, -(depth / 2 + 0.55)], rot: Math.PI, brand: 'Floorverse', tag: 'OUTBID · STAND ABOVE', leader: false },
        { pos: [-(width / 2 + 0.55), 0, 0], rot: -Math.PI / 2, brand: 'Get3DBillboards', tag: 'YOUR BRAND UP HERE', leader: false },
        { pos: [width / 2 + 0.55, 0, 0], rot: Math.PI / 2, brand: 'Floorverse', tag: 'TOP SPACE FOR SALE', leader: false },
      ].map((side, i) => {
        const w = side.leader ? 4.2 : 3.2;
        const h = side.leader ? 1.6 : 1.3;
        const baseY = 0.1;
        return (
          <group key={`base-billboard-${i}`} position={side.pos as [number, number, number]} rotation={[0, side.rot, 0]}>
            {/* Pair of structural support pillars */}
            {[-w / 2 + 0.25, w / 2 - 0.25].map((px) => (
              <group key={`sb-pillar-${px}`}>
                <mesh position={[px, baseY + h / 2, 0]} castShadow>
                  <cylinderGeometry args={[0.14, 0.18, h, 12]} />
                  <meshStandardMaterial color={isDayMode ? '#d6d3d1' : '#3b3f46'} metalness={0.7} roughness={0.35} />
                </mesh>
                <mesh position={[px, baseY + h + 0.18, 0]}>
                  <cylinderGeometry args={[0.2, 0.2, 0.12, 12]} />
                  <meshStandardMaterial color={isDayMode ? '#a8a29e' : '#2b2f35'} metalness={0.85} roughness={0.3} />
                </mesh>
              </group>
            ))}
            {/* Billboard panel */}
            <mesh position={[0, baseY + h + 0.55, 0]} castShadow>
              <boxGeometry args={[w, h, 0.16]} />
              <meshStandardMaterial color={isDayMode ? '#f8fafc' : '#11151c'} roughness={0.5} />
            </mesh>
            {/* Frame trim */}
            <mesh position={[0, baseY + h + 0.55, -0.1]}>
              <boxGeometry args={[w + 0.14, h + 0.14, 0.05]} />
              <meshStandardMaterial color={isDayMode ? '#171717' : '#1c1917'} metalness={0.88} />
            </mesh>
            {/* Illuminated brand */}
            <Text
              position={[0, baseY + h + 0.68, 0.11]}
              rotation={[0, 0, 0]}
              fontSize={side.leader ? 0.5 : 0.38}
              color={isDayMode ? '#111827' : '#f8fafc'}
              fontWeight="bold"
              anchorX="center"
              anchorY="middle"
            >
              {side.brand}
            </Text>
            <Text
              position={[0, baseY + h + 0.42, 0.11]}
              rotation={[0, 0, 0]}
              fontSize={side.leader ? 0.22 : 0.18}
              color={themeColor}
              letterSpacing={0.15}
              anchorX="center"
              anchorY="middle"
            >
              {side.tag}
            </Text>
            {/* Base footing */}
            <mesh position={[0, baseY + 0.06, 0]} castShadow>
              <boxGeometry args={[w + 0.3, 0.12, 0.4]} />
              <meshStandardMaterial color={isDayMode ? '#64748b' : '#1e293b'} metalness={0.8} roughness={0.3} />
            </mesh>
          </group>
        );
      })}

      {/* 3. LANDSCAPED GRANITE PLANTERS WITH TREES & BOLLARD LIGHTS */}
      {[-1, 1].map((xSign) =>
        [-1, 1].map((zSign) => {
          const px = (xSign * (width + 2.8)) / 2;
          const pz = (zSign * (depth + 2.8)) / 2;
          return (
            <group key={`planter-${xSign}-${zSign}`} position={[px, 0.3, pz]}>
              {/* Granite Planter Curb */}
              <mesh castShadow receiveShadow>
                <boxGeometry args={[1.6, 0.45, 1.6]} />
                <meshStandardMaterial
                  color={isDayMode ? '#475569' : '#1e293b'}
                  metalness={0.8}
                  roughness={0.25}
                />
              </mesh>
              {/* Soil Bed */}
              <mesh position={[0, 0.23, 0]}>
                <boxGeometry args={[1.4, 0.04, 1.4]} />
                <meshStandardMaterial color="#271b12" roughness={0.9} />
              </mesh>
              {/* Architectural Evergreen Shrub */}
              <mesh position={[0, 0.65, 0]} castShadow>
                <coneGeometry args={[0.55, 0.9, 10]} />
                <meshStandardMaterial
                  color={isDayMode ? '#15803d' : '#166534'}
                  roughness={0.65}
                />
              </mesh>
              {/* LED Lighting Bollard */}
              <mesh position={[0.55, 0.35, 0.55]}>
                <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
                <meshStandardMaterial
                  color="#ffffff"
                  emissive={themeColor}
                  emissiveIntensity={1.4}
                />
              </mesh>
            </group>
          );
        })
      )}
    </group>
  );
}
