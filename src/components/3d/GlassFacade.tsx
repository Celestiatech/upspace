'use client';

import React from 'react';
import * as THREE from 'three';
import { InteriorOffice } from './InteriorOffice';

interface GlassFacadeProps {
  width: number;
  depth: number;
  height: number;
  glassShape: THREE.Shape;
  isSelected: boolean;
  isHovered: boolean;
  isDayMode?: boolean;
}

export function GlassFacade({
  width,
  depth,
  height,
  glassShape,
  isSelected,
  isHovered,
  isDayMode = false,
}: GlassFacadeProps) {
  const glassHeight = height - 0.16;

  return (
    <group position={[0, 0, 0]}>
      {/* 1. INTERIOR OFFICE ENVIRONMENT (Desks, monitors, chairs, and ceiling lights) */}
      <InteriorOffice
        width={width}
        depth={depth}
        height={height}
        isSelected={isSelected}
        isDayMode={isDayMode}
      />

      {/* 2. REALISTIC PBR ARCHITECTURAL GLASS (Fresnel, reflections, transmission, IOR 1.52) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -glassHeight / 2, 0]}>
        <extrudeGeometry args={[glassShape, { depth: glassHeight, bevelEnabled: false }]} />
        <meshPhysicalMaterial
          color={isSelected ? '#1e293b' : isHovered ? '#0f172a' : isDayMode ? '#475569' : '#02050e'}
          metalness={isDayMode ? 0.25 : 0.45}
          roughness={isDayMode ? 0.04 : 0.03}
          transmission={isDayMode ? 0.72 : 0.58}
          thickness={0.85}
          transparent
          opacity={isSelected ? 0.92 : isHovered ? 0.88 : isDayMode ? 0.82 : 0.72}
          emissive={isSelected ? '#ffea00' : isHovered ? '#00f0ff' : '#000000'}
          emissiveIntensity={isSelected ? 0.35 : isHovered ? 0.18 : 0.0}
          ior={1.52}
          reflectivity={0.96}
          clearcoat={1.0}
          clearcoatRoughness={0.03}
        />
      </mesh>

      {/* 3. RECESSED WINDOW FRAMES & STRUCTURAL MULLIONS (Physical architectural depth) */}
      {/* Vertical Window Mullions */}
      {[-0.36, -0.18, 0, 0.18, 0.36].map((xOffset) => (
        <React.Fragment key={`mullion-${xOffset}`}>
          {/* Front Face Mullion */}
          <mesh position={[xOffset * width, 0, depth / 2 + 0.015]} castShadow>
            <boxGeometry args={[0.04, glassHeight, 0.05]} />
            <meshStandardMaterial
              color={isDayMode ? '#334155' : '#0a0f1d'}
              metalness={0.95}
              roughness={0.15}
            />
          </mesh>
          {/* Back Face Mullion */}
          <mesh position={[xOffset * width, 0, -depth / 2 - 0.015]} castShadow>
            <boxGeometry args={[0.04, glassHeight, 0.05]} />
            <meshStandardMaterial
              color={isDayMode ? '#334155' : '#0a0f1d'}
              metalness={0.95}
              roughness={0.15}
            />
          </mesh>
        </React.Fragment>
      ))}

      {/* Horizontal Structural Spandrel Beams */}
      {[-glassHeight * 0.3, glassHeight * 0.3].map((yOffset, i) => (
        <React.Fragment key={`spandrel-${i}`}>
          <mesh position={[0, yOffset, depth / 2 + 0.01]} castShadow>
            <boxGeometry args={[width * 0.96, 0.04, 0.035]} />
            <meshStandardMaterial
              color={isDayMode ? '#475569' : '#1e293b'}
              metalness={0.92}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0, yOffset, -depth / 2 - 0.01]} castShadow>
            <boxGeometry args={[width * 0.96, 0.04, 0.035]} />
            <meshStandardMaterial
              color={isDayMode ? '#475569' : '#1e293b'}
              metalness={0.92}
              roughness={0.2}
            />
          </mesh>
        </React.Fragment>
      ))}
    </group>
  );
}
