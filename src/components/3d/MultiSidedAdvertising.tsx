'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { FloorData } from '@/types/floor';

interface MultiSidedAdvertisingProps {
  floor: FloorData;
  width: number;
  depth: number;
  height: number;
  isSelected: boolean;
  isHovered: boolean;
  isDayMode?: boolean;
}

export function MultiSidedAdvertising({
  floor,
  width,
  depth,
  height,
  isSelected,
  isHovered,
  isDayMode = false,
}: MultiSidedAdvertisingProps) {
  const ribbonGlowRef = useRef<THREE.Mesh>(null);
  const tickerTextRef = useRef<THREE.Group>(null);

  const isAvailable = floor.status === 'available';
  const brandColor = isAvailable ? '#10b981' : (floor.bannerColor || '#38bdf8');
  const activeColor = isSelected ? '#ffea00' : isHovered ? '#38bdf8' : brandColor;

  // Determine advertising style based on floor data
  const styleType = floor.floorNumber % 3; // 0: 360° Panoramic Wrap, 1: 4-Sided Multi-Screen Suite, 2: Dual Split & Corner Ticker

  const signWidthFront = Math.min(width * 0.65, 5.2);
  const signWidthSide = Math.min(depth * 0.55, 4.2);
  const signHeight = 0.44;

  // Subtle scrolling ticker animation for 360 ribbon
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (tickerTextRef.current) {
      tickerTextRef.current.position.x = -((t * 0.4) % 4);
    }
    if (ribbonGlowRef.current) {
      const mat = ribbonGlowRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = isSelected ? 2.5 : isHovered ? 1.8 : isDayMode ? 0.65 : 0.9;
      }
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ========================================================== */}
      {/* 1. FRONT FACE ADVERTISING (Primary Brand Billboard)        */}
      {/* ========================================================== */}
      <group position={[0, -height * 0.18, depth / 2 + 0.02]}>
        {/* Housing */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[signWidthFront + 0.12, signHeight + 0.08, 0.06]} />
          <meshStandardMaterial
            color={isDayMode ? '#334155' : '#0a0f1d'}
            metalness={0.92}
            roughness={0.2}
          />
        </mesh>
        {/* Luminous Backlit Face */}
        <mesh position={[0, 0, 0.032]}>
          <planeGeometry args={[signWidthFront, signHeight]} />
          <meshStandardMaterial
            color={isDayMode ? '#1e293b' : '#030712'}
            emissive={activeColor}
            emissiveIntensity={isSelected ? 2.4 : isHovered ? 1.5 : isDayMode ? 0.5 : 0.8}
            roughness={0.15}
            metalness={0.8}
          />
        </mesh>
        {/* Glowing Frame */}
        <lineSegments position={[0, 0, 0.035]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(signWidthFront, signHeight)]} />
          <lineBasicMaterial color={activeColor} linewidth={1.5} transparent opacity={0.8} />
        </lineSegments>
        {/* Typography & Crest */}
        <group position={[0, 0, 0.042]}>
          <group position={[-signWidthFront / 2 + 0.38, 0, 0]}>
            <mesh>
              <circleGeometry args={[0.15, 24]} />
              <meshStandardMaterial color={activeColor} emissive={activeColor} emissiveIntensity={isSelected ? 1.8 : 1.0} />
            </mesh>
            <Text position={[0, 0, 0.005]} fontSize={0.11} color="#090d16" anchorX="center" anchorY="middle" fontWeight="bold">
              {isAvailable ? 'OPEN' : `F${floor.floorNumber}`}
            </Text>
          </group>
          <group position={[-signWidthFront / 2 + 0.78, 0, 0]}>
            <Text position={[0, 0.08, 0]} fontSize={0.2} color={isAvailable ? '#34d399' : '#ffffff'} anchorX="left" anchorY="middle" fontWeight="bold">
              {floor.brandTitle || 'AVAILABLE FLOOR'}
            </Text>
            <Text position={[0, -0.09, 0]} fontSize={0.11} color={activeColor} anchorX="left" anchorY="middle" maxWidth={signWidthFront - 1.0}>
              {floor.tagline || (isAvailable ? 'Prime Virtual Commercial Space' : floor.category)}
            </Text>
          </group>
        </group>
      </group>

      {/* ========================================================== */}
      {/* 2. BACK FACE ADVERTISING (Symmetrical Corporate Slogan)    */}
      {/* ========================================================== */}
      <group position={[0, -height * 0.18, -depth / 2 - 0.02]} rotation={[0, Math.PI, 0]}>
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[signWidthFront + 0.12, signHeight + 0.08, 0.06]} />
          <meshStandardMaterial color={isDayMode ? '#334155' : '#0a0f1d'} metalness={0.92} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.032]}>
          <planeGeometry args={[signWidthFront, signHeight]} />
          <meshStandardMaterial
            color={isDayMode ? '#1e293b' : '#030712'}
            emissive={activeColor}
            emissiveIntensity={isSelected ? 2.2 : isHovered ? 1.3 : isDayMode ? 0.45 : 0.75}
            roughness={0.15}
            metalness={0.8}
          />
        </mesh>
        <lineSegments position={[0, 0, 0.035]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(signWidthFront, signHeight)]} />
          <lineBasicMaterial color={activeColor} linewidth={1.5} transparent opacity={0.7} />
        </lineSegments>
        <group position={[0, 0, 0.042]}>
          <Text position={[0, 0.07, 0]} fontSize={0.18} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="bold">
            {floor.brandTitle ? `${floor.brandTitle} • GLOBAL` : 'COMMERCIAL SUITE'}
          </Text>
          <Text position={[0, -0.08, 0]} fontSize={0.1} color={activeColor} anchorX="center" anchorY="middle">
            {floor.dimensions} • {floor.impressionsPerDay}
          </Text>
        </group>
      </group>

      {/* ========================================================== */}
      {/* 3. RIGHT FACE ADVERTISING (Side Digital Screen Bay)       */}
      {/* ========================================================== */}
      <group position={[width / 2 + 0.02, -height * 0.18, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[signWidthSide + 0.1, signHeight + 0.08, 0.06]} />
          <meshStandardMaterial color={isDayMode ? '#334155' : '#0a0f1d'} metalness={0.92} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.032]}>
          <planeGeometry args={[signWidthSide, signHeight]} />
          <meshStandardMaterial
            color={isDayMode ? '#1e293b' : '#030712'}
            emissive={activeColor}
            emissiveIntensity={isSelected ? 2.0 : isHovered ? 1.2 : 0.65}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        <group position={[0, 0, 0.042]}>
          <Text position={[0, 0.06, 0]} fontSize={0.15} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="bold">
            {floor.brandTitle || 'UPSPACE'}
          </Text>
          <Text position={[0, -0.08, 0]} fontSize={0.09} color={activeColor} anchorX="center" anchorY="middle">
            {floor.category || 'High-Impact Brand Presence'}
          </Text>
        </group>
      </group>

      {/* ========================================================== */}
      {/* 4. LEFT FACE ADVERTISING (Side Metrics & Verification)     */}
      {/* ========================================================== */}
      <group position={[-width / 2 - 0.02, -height * 0.18, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[signWidthSide + 0.1, signHeight + 0.08, 0.06]} />
          <meshStandardMaterial color={isDayMode ? '#334155' : '#0a0f1d'} metalness={0.92} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.032]}>
          <planeGeometry args={[signWidthSide, signHeight]} />
          <meshStandardMaterial
            color={isDayMode ? '#1e293b' : '#030712'}
            emissive={activeColor}
            emissiveIntensity={isSelected ? 2.0 : isHovered ? 1.2 : 0.65}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        <group position={[0, 0, 0.042]}>
          <Text position={[0, 0.06, 0]} fontSize={0.15} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="bold">
            {isAvailable ? 'AVAILABLE TIER' : `VERIFIED • LVL ${floor.floorNumber}`}
          </Text>
          <Text position={[0, -0.08, 0]} fontSize={0.09} color={activeColor} anchorX="center" anchorY="middle">
            {isAvailable ? `Starting ₹${floor.price}` : floor.ownerName || 'Commercial License'}
          </Text>
        </group>
      </group>

      {/* ========================================================== */}
      {/* 5. 360° PERIMETER ILLUMINATED DIGITAL TICKER RIBBON        */}
      {/* (Wraps around all 4 sides for wrap/ribbon floor styles)    */}
      {/* ========================================================== */}
      {styleType === 0 && (
        <group position={[0, height * 0.28, 0]}>
          {/* Front Ribbon Bar */}
          <mesh ref={ribbonGlowRef} position={[0, 0, depth / 2 + 0.015]}>
            <boxGeometry args={[width * 0.94, 0.1, 0.02]} />
            <meshStandardMaterial
              color={activeColor}
              emissive={activeColor}
              emissiveIntensity={isSelected ? 2.2 : 1.2}
            />
          </mesh>
          {/* Back Ribbon Bar */}
          <mesh position={[0, 0, -depth / 2 - 0.015]}>
            <boxGeometry args={[width * 0.94, 0.1, 0.02]} />
            <meshStandardMaterial
              color={activeColor}
              emissive={activeColor}
              emissiveIntensity={isSelected ? 2.2 : 1.2}
            />
          </mesh>
          {/* Left Ribbon Bar */}
          <mesh position={[-width / 2 - 0.015, 0, 0]}>
            <boxGeometry args={[0.02, 0.1, depth * 0.94]} />
            <meshStandardMaterial
              color={activeColor}
              emissive={activeColor}
              emissiveIntensity={isSelected ? 2.2 : 1.2}
            />
          </mesh>
          {/* Right Ribbon Bar */}
          <mesh position={[width / 2 + 0.015, 0, 0]}>
            <boxGeometry args={[0.02, 0.1, depth * 0.94]} />
            <meshStandardMaterial
              color={activeColor}
              emissive={activeColor}
              emissiveIntensity={isSelected ? 2.2 : 1.2}
            />
          </mesh>
        </group>
      )}

      {/* ========================================================== */}
      {/* 6. CORNER CURVED LED TICKER DISPLAY PLATES                 */}
      {/* (Times Square / Piccadilly curved corner displays)         */}
      {/* ========================================================== */}
      {styleType === 2 && (
        <group position={[0, 0, 0]}>
          {[-1, 1].map((xSign) =>
            [-1, 1].map((zSign) => (
              <mesh
                key={`corner-display-${xSign}-${zSign}`}
                position={[(xSign * (width - 0.6)) / 2, 0, (zSign * (depth - 0.6)) / 2]}
              >
                <cylinderGeometry args={[0.35, 0.35, height * 0.65, 12]} />
                <meshStandardMaterial
                  color={activeColor}
                  emissive={activeColor}
                  emissiveIntensity={isSelected ? 2.2 : 1.0}
                />
              </mesh>
            ))
          )}
        </group>
      )}
    </group>
  );
}
