'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';

// Skin tones, hair colors and wardrobe presets for variety
const SKIN_TONES = ['#f4c7a1', '#d99a6c', '#b07a4f', '#9a5d3b', '#6f3e27'];
const HAIR_COLORS = ['#1c1917', '#3f2a1d', '#713f12', '#0f172a', '#c9a227', '#5f4330'];
const CLOTH_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#06b6d4', '#8b5cf6', '#22c55e', '#64748b'];

export interface RealisticHumanProps {
  shirtColor?: string;
  height?: number;
  isDayMode?: boolean;
  pose?: 'standing' | 'walking' | 'sitting' | 'dancing' | 'cheering';
  skinTone?: string;
  hairColor?: string;
  headTilt?: number;
}

// Pre-allocated shared geometries for all human instances
const SHARED_HUMAN_GEOMETRIES = {
  headSphere: new THREE.SphereGeometry(0.065, 10, 8),
  hairSphere: new THREE.SphereGeometry(0.065, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55),
  neckCylinder: new THREE.CylinderGeometry(0.035, 0.04, 0.03, 8),
  torsoCylinder: new THREE.CylinderGeometry(0.10, 0.13, 0.32, 8),
  hipsCylinder: new THREE.CylinderGeometry(0.12, 0.09, 0.10, 8),
  thighCapsule: new THREE.CapsuleGeometry(0.05, 0.14, 4, 6),
  calfCapsule: new THREE.CapsuleGeometry(0.04, 0.12, 4, 6),
  shoeBox: new THREE.BoxGeometry(0.09, 0.05, 0.16),
  armCapsule: new THREE.CapsuleGeometry(0.035, 0.16, 4, 6),
  handSphere: new THREE.SphereGeometry(0.025, 6, 6),
  shadowCircle: new THREE.CircleGeometry(0.18, 12),
};

export function RealisticHuman({
  shirtColor = '#3b82f6',
  height = 1.0,
  isDayMode = true,
  pose = 'standing',
  skinTone,
  hairColor,
  headTilt = 0,
}: RealisticHumanProps) {
  // Height proportions modeled on real human anatomy
  const HEAD = 0.13;
  const NECK = 0.03;
  const TORSO = height * 0.32;
  const HIPS = height * 0.10;
  const LEG = height * 0.42;
  const ARM = height * 0.34;

  const skin = useMemo(
    () => skinTone || (isDayMode ? SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)] : '#b9c3d2'),
    [skinTone, isDayMode]
  );
  const hair = useMemo(
    () => hairColor || HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
    [hairColor]
  );

  const pantColor = '#1e293b';
  const shoeColor = '#0f172a';
  const legSwing = pose === 'walking' ? 0.5 : pose === 'sitting' ? 1.3 : pose === 'dancing' ? 0.2 : 0.08;

  return (
    <group position={[0, HIPS + 0.06, 0]}>
      {/* ---- HEAD ---- */}
      <group position={[0, HIPS + TORSO + NECK + HEAD * 0.55, 0]} rotation={[-headTilt, 0, 0]}>
        {/* Skull */}
        <mesh geometry={SHARED_HUMAN_GEOMETRIES.headSphere} castShadow>
          <meshStandardMaterial color={skin} roughness={0.6} />
        </mesh>
        {/* Hair cap */}
        <mesh
          geometry={SHARED_HUMAN_GEOMETRIES.hairSphere}
          position={[0, HEAD * 0.26, -HEAD * 0.02]}
          scale={[1.06, 0.72, 1.06]}
          castShadow
        >
          <meshStandardMaterial color={hair} roughness={0.92} />
        </mesh>
      </group>

      {/* ---- NECK ---- */}
      <mesh geometry={SHARED_HUMAN_GEOMETRIES.neckCylinder} position={[0, HIPS + TORSO + NECK / 2, 0]} castShadow>
        <meshStandardMaterial color={skin} roughness={0.6} />
      </mesh>

      {/* ---- TORSO / CHEST ---- */}
      <mesh geometry={SHARED_HUMAN_GEOMETRIES.torsoCylinder} position={[0, HIPS + TORSO / 2, 0]} castShadow>
        <meshStandardMaterial color={shirtColor} roughness={0.7} />
      </mesh>

      {/* ---- HIPS / WAIST ---- */}
      <mesh geometry={SHARED_HUMAN_GEOMETRIES.hipsCylinder} position={[0, HIPS / 2, 0]} castShadow>
        <meshStandardMaterial color={pantColor} roughness={0.75} />
      </mesh>

      {/* ---- LEGS ---- */}
      {[-1, 1].map((side) => {
        const sw = pose === 'walking' ? side * legSwing : pose === 'dancing' ? (side === 1 ? 0.15 : -0.1) : side * 0.03;
        const sideSpread = pose === 'dancing' ? side * 0.09 : side * 0.07;
        return (
          <group key={`leg-${side}`} position={[sideSpread, 0, 0]}>
            {/* Thigh */}
            <mesh
              geometry={SHARED_HUMAN_GEOMETRIES.thighCapsule}
              position={[0, LEG * 0.5 - HIPS, 0]}
              rotation={[sw, 0, pose === 'dancing' ? side * 0.12 : 0]}
              castShadow
            >
              <meshStandardMaterial color={pantColor} roughness={0.75} />
            </mesh>
            {/* Calf */}
            <mesh
              geometry={SHARED_HUMAN_GEOMETRIES.calfCapsule}
              position={[0, LEG * 0.18 - HIPS, 0]}
              rotation={[sw, 0, pose === 'dancing' ? side * 0.12 : 0]}
              castShadow
            >
              <meshStandardMaterial color={pantColor} roughness={0.75} />
            </mesh>
            {/* Shoe */}
            <mesh
              geometry={SHARED_HUMAN_GEOMETRIES.shoeBox}
              position={[0.01, -HIPS - 0.02, 0.035]}
              rotation={[sw, 0, pose === 'dancing' ? side * 0.12 : 0]}
              castShadow
            >
              <meshStandardMaterial color={shoeColor} roughness={0.6} />
            </mesh>
          </group>
        );
      })}

      {/* ---- ARMS ---- */}
      {[-1, 1].map((side) => {
        const isDancing = pose === 'dancing' || pose === 'cheering';
        const armAngleZ = isDancing ? side * 2.3 : side * 0.06;
        const armAngleX = isDancing ? (side === 1 ? 0.4 : -0.2) : 0;
        const armOffsetY = isDancing ? 0.14 : -ARM * 0.35;
        const handOffsetY = isDancing ? 0.32 : -ARM * 0.72;

        return (
          <group
            key={`arm-${side}`}
            position={[side * 0.12, HIPS + TORSO - 0.02, 0]}
            rotation={[armAngleX, 0, armAngleZ]}
          >
            <mesh
              geometry={SHARED_HUMAN_GEOMETRIES.armCapsule}
              position={[side * 0.03, armOffsetY, 0]}
              castShadow
            >
              <meshStandardMaterial color={shirtColor} roughness={0.7} />
            </mesh>
            <mesh
              geometry={SHARED_HUMAN_GEOMETRIES.handSphere}
              position={[side * 0.045, handOffsetY, 0.01]}
            >
              <meshStandardMaterial color={skin} roughness={0.6} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

