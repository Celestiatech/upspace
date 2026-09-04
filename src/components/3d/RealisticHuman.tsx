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
  pose?: 'standing' | 'walking' | 'sitting';
  skinTone?: string;
  hairColor?: string;
  headTilt?: number;
}

/**
 * A far more anatomically detailed low-poly human built from primitives.
 * Legs with knees, arms with elbows, a torso, neck, head with face, and hair.
 */
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

  const legSwing = pose === 'walking' ? 0.5 : pose === 'sitting' ? 1.3 : 0.08;

  return (
    <group position={[0, HIPS + 0.06, 0]}>
      {/* ---- HEAD ---- */}
      <group position={[0, HIPS + TORSO + NECK + HEAD * 0.55, 0]} rotation={[-headTilt, 0, 0]}>
        {/* Skull */}
        <mesh castShadow>
          <sphereGeometry args={[HEAD / 2, 20, 16]} />
          <meshStandardMaterial color={skin} roughness={0.6} />
        </mesh>
        {/* Face plane (slightly forward) - gives subtle facial depth */}
        <mesh position={[0, 0, HEAD / 2 - 0.006]} scale={[0.96, 1.02, 0.55]}>
          <sphereGeometry args={[HEAD / 2, 20, 16]} />
          <meshStandardMaterial color={skin} roughness={0.5} />
        </mesh>
        {/* Eyes */}
        {[-0.032, 0.032].map((x) => (
          <group key={`eye-${x}`} position={[x, HEAD * 0.06, HEAD * 0.52]}>
            <mesh>
              <sphereGeometry args={[0.009, 8, 8]} />
              <meshStandardMaterial color="#ffffff" roughness={0.1} />
            </mesh>
            <mesh position={[0, 0, 0.004]}>
              <sphereGeometry args={[0.005, 8, 8]} />
              <meshStandardMaterial color="#1f2937" roughness={0.1} />
            </mesh>
          </group>
        ))}
        {/* Eyebrows */}
        {[-0.032, 0.032].map((x) => (
          <mesh key={`brow-${x}`} position={[x, HEAD * 0.16, HEAD * 0.5]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.024, 0.006, 0.01]} />
            <meshStandardMaterial color={hair} roughness={0.9} />
          </mesh>
        ))}
        {/* Nose */}
        <mesh position={[0, -HEAD * 0.02, HEAD * 0.56]}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshStandardMaterial color={skin} roughness={0.55} />
        </mesh>
        {/* Mouth */}
        <mesh position={[0, -HEAD * 0.2, HEAD * 0.54]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.022, 0.0035, 0.008]} />
          <meshStandardMaterial color="#b0563a" roughness={0.5} />
        </mesh>
        {/* Ears */}
        {[-0.052, 0.052].map((x) => (
          <mesh key={`ear-${x}`} position={[x, 0, 0]} scale={[0.4, 0.7, 0.5]}>
            <sphereGeometry args={[0.014, 8, 8]} />
            <meshStandardMaterial color={skin} roughness={0.6} />
          </mesh>
        ))}
        {/* Hair cap */}
        <mesh position={[0, HEAD * 0.28, -HEAD * 0.03]} scale={[1.06, 0.68, 1.06]} castShadow>
          <sphereGeometry args={[HEAD / 2, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color={hair} roughness={0.92} />
        </mesh>
      </group>

      {/* ---- NECK ---- */}
      <mesh position={[0, HIPS + TORSO + NECK / 2, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.04, NECK, 10]} />
        <meshStandardMaterial color={skin} roughness={0.6} />
      </mesh>

      {/* ---- TORSO / CHEST ---- */}
      <group position={[0, HIPS + TORSO / 2, 0]}>
        {/* Chest (slightly puffed, tapering to waist) */}
        <mesh castShadow>
          <cylinderGeometry args={[0.10, 0.13, TORSO, 12]} />
          <meshStandardMaterial color={shirtColor} roughness={0.7} />
        </mesh>
        {/* Collar hint */}
        <mesh position={[0, TORSO / 2 - 0.02, 0]}>
          <torusGeometry args={[0.085, 0.012, 6, 12, Math.PI]} />
          <meshStandardMaterial color={shirtColor} roughness={0.7} />
        </mesh>
      </group>

      {/* ---- HIPS / WAIST ---- */}
      <mesh position={[0, HIPS / 2, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.09, HIPS, 12]} />
        <meshStandardMaterial color={pantColor} roughness={0.75} />
      </mesh>

      {/* ---- LEGS (thigh + calf + shoe) ---- */}
      {[-1, 1].map((side) => {
        const sw = pose === 'walking' ? side * legSwing : side * 0.03;
        return (
          <group key={`leg-${side}`} position={[side * 0.07, 0, 0]}>
            {/* Thigh */}
            <mesh position={[0, LEG * 0.5 - HIPS, 0]} rotation={[sw, 0, 0]} castShadow>
              <capsuleGeometry args={[0.055, LEG * 0.5 - 0.08, 6, 10]} />
              <meshStandardMaterial color={pantColor} roughness={0.75} />
            </mesh>
            {/* Calf */}
            <mesh position={[0, LEG * 0.18 - HIPS, 0]} rotation={[sw, 0, 0]} castShadow>
              <capsuleGeometry args={[0.042, LEG * 0.36 - 0.06, 6, 10]} />
              <meshStandardMaterial color={pantColor} roughness={0.75} />
            </mesh>
            {/* Knee */}
            <mesh position={[0, -HIPS + LEG * 0.72, 0]} rotation={[sw, 0, 0]}>
              <sphereGeometry args={[0.045, 8, 8]} />
              <meshStandardMaterial color={pantColor} roughness={0.75} />
            </mesh>
            {/* Shoe */}
            <mesh position={[0.02, -HIPS - 0.02 + (pose === 'sitting' ? 0 : 0), 0.035]} rotation={[sw, 0, 0]} castShadow>
              <boxGeometry args={[0.09, 0.05, 0.17]} />
              <meshStandardMaterial color={shoeColor} roughness={0.6} />
            </mesh>
          </group>
        );
      })}

      {/* ---- ARMS (upper + forearm + hand) ---- */}
      {[-1, 1].map((side) => (
        <group key={`arm-${side}`} position={[side * 0.12, HIPS + TORSO - 0.02, 0]} rotation={[0, 0, side * 0.06]}>
          {/* Upper arm */}
          <mesh position={[side * 0.03, -ARM * 0.28, 0]} rotation={[0, 0, side * 0.05]} castShadow>
            <capsuleGeometry args={[0.036, ARM * 0.3, 5, 8]} />
            <meshStandardMaterial color={shirtColor} roughness={0.7} />
          </mesh>
          {/* Forearm (skin, if short sleeves) */}
          <mesh position={[side * 0.045, -ARM * 0.62, 0]} rotation={[0, 0, side * 0.05]} castShadow>
            <capsuleGeometry args={[0.03, ARM * 0.28, 5, 8]} />
            <meshStandardMaterial color={skin} roughness={0.6} />
          </mesh>
          {/* Hand */}
          <mesh position={[side * 0.055, -ARM * 0.8, 0.01]} rotation={[0, 0, side * 0.05]}>
            <sphereGeometry args={[0.026, 8, 8]} />
            <meshStandardMaterial color={skin} roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
