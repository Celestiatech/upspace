'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text, useTexture } from '@react-three/drei';
import { FloorData } from '@/types/floor';

interface AdvertisingPanelProps {
  floor: FloorData;
  width: number;
  height: number;
  isSelected: boolean;
  isHovered: boolean;
  isDayMode?: boolean;
}

function AdCreativeTexture({ url, width, height }: { url: string; width: number; height: number }) {
  const texture = useTexture(url);
  texture.colorSpace = THREE.SRGBColorSpace;

  return (
    <mesh position={[0, 0, 0.044]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

export function AdvertisingPanel({
  floor,
  width,
  height,
  isSelected,
  isHovered,
  isDayMode = false,
}: AdvertisingPanelProps) {
  const backlightRef = useRef<THREE.Mesh>(null);

  const isAvailable = floor.status === 'available';
  const brandAccent = isAvailable ? '#10b981' : (floor.bannerColor || '#38bdf8');
  const activeColor = isSelected ? '#ffea00' : isHovered ? '#38bdf8' : brandAccent;

  // Real-world tenant sign proportion: Sleek horizontal architectural signage band scaled for bulkier facade
  // Expanded banner dimensions for better readability
  // Expanded banner covering most of the floor height and width
  // Scaled-down proportional banner dimensions
  const radius = width / 2;
  const signWidth = Math.min(radius * 1.3, 5.2);
  const signHeight = 1.1;

  const handleAdClick = (event: any) => {
    if (!floor.targetUrl) return;
    event.stopPropagation();
    try {
      const destination = new URL(floor.targetUrl);
      if (destination.protocol === 'https:' || destination.protocol === 'http:') {
        window.open(destination.href, '_blank', 'noopener,noreferrer');
      }
    } catch {
      // The form uses URL validation; this avoids navigating if a saved legacy value is invalid.
    }
  };

  useFrame((state) => {
    if (backlightRef.current) {
      const mat = backlightRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        if (isSelected) {
          mat.emissiveIntensity = 2.4 + Math.sin(state.clock.getElapsedTime() * 4) * 0.4;
        } else if (isHovered) {
          mat.emissiveIntensity = 1.6;
        } else {
          mat.emissiveIntensity = isDayMode ? 0.6 : 0.9;
        }
      }
    }
  });
  return (
    <group position={[0, 0, radius + 0.15]} onClick={handleAdClick}>
      {/* 1. ANODIZED DARK TITANIUM HOUSING BOX */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow visible={false}>
        <boxGeometry args={[signWidth, signHeight, 0.08]} />
        <meshStandardMaterial
          color={isDayMode ? '#334155' : '#0a0f1d'}
          metalness={0.92}
          roughness={0.2}
        />
      </mesh>

      {/* 2. RECESSED BACKLIT ACRYLIC SIGN FACE */}
      <mesh ref={backlightRef} position={[0, 0, 0.08]}>
        <planeGeometry args={[signWidth, signHeight]} />
        <meshStandardMaterial
          color={isDayMode ? '#1e293b' : '#030712'}
          emissive={activeColor}
          emissiveIntensity={isSelected ? 2.2 : isHovered ? 1.4 : isDayMode ? 0.5 : 0.8}
          roughness={0.15}
          metalness={0.8}
        />
      </mesh>
      {/* 3. ILLUMINATED ACCENT BORDER STRIP */}
      <lineSegments position={[0, 0, 0.035]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(signWidth, signHeight)]} />
        <lineBasicMaterial color={activeColor} linewidth={1.5} transparent opacity={0.8} />
      </lineSegments>

      {/* 4. HIGH-PRECISION ARCHITECTURAL TENANT TYPOGRAPHY */}
      <group position={[0, 0, 0.042]}>
        {floor.adBannerUrl && (
          <React.Suspense fallback={null}>
            <AdCreativeTexture url={floor.adBannerUrl} width={signWidth} height={signHeight} />
          </React.Suspense>
        )}
        {/* Left: Floor Badge Emblem */}
        {!floor.adBannerUrl && <group position={[-signWidth / 2 + 0.38, 0, 0]}>
          <mesh>
            <circleGeometry args={[0.15, 24]} />
            <meshStandardMaterial
              color={activeColor}
              emissive={activeColor}
              emissiveIntensity={isSelected ? 1.8 : 1.0}
            />
          </mesh>
          <Text
            position={[0, 0, 0.005]}
            fontSize={0.11}
            color="#090d16"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {isAvailable ? 'OPEN' : `F${floor.floorNumber}`}
          </Text>
        </group>}

        {/* Center: Tenant Title & Tagline */}
        {!floor.adBannerUrl && <group position={[-signWidth / 2 + 0.78, 0, 0]}>
          {/* Tenant Name */}
          <Text
            position={[0, 0.08, 0]}
            fontSize={0.2}
            color={isAvailable ? '#34d399' : '#ffffff'}
            anchorX="left"
            anchorY="middle"
            fontWeight="bold"
            letterSpacing={0.05}
            maxWidth={signWidth - 1.0}
          >
            {floor.brandTitle || 'AVAILABLE FLOOR'}
          </Text>

          {/* Subtitle / Category */}
          <Text
            position={[0, -0.09, 0]}
            fontSize={0.11}
            color={activeColor}
            anchorX="left"
            anchorY="middle"
            maxWidth={signWidth - 1.0}
          >
            {floor.tagline || (isAvailable ? 'Prime Virtual Commercial Space' : floor.category)}
          </Text>
        </group>}
      </group>
    </group>
  );
}
