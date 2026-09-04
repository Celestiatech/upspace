'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { FloorData, getDisplayFloorNumber } from '@/types/floor';

interface AdvertisingPanelProps {
  floor: FloorData;
  width: number;
  height: number;
  totalFloors: number;
  isSelected: boolean;
  isHovered: boolean;
  isDayMode?: boolean;
  hideAdvertising?: boolean;
}

// Vibrant bright background options per floor (pill styling)
const PILL_BG = [
  '#22c9b8', // vibrant teal
  '#7cc0f2', // pastel blue
  '#a8e063', // lime green
  '#ff9b7d', // soft coral
  '#8fbfe0',
  '#ffd580',
];

function pickPillColor(floor: FloorData, index: number): string {
  if (floor.bannerColor) {
    // Force a bright, saturated read through the glass regardless of supplied color
    return floor.bannerColor;
  }
  return PILL_BG[index % PILL_BG.length];
}

import { floorTexturePool } from '@/utils/threeMemory';

function drawAdCanvas(floor: FloorData, daymode: boolean, index: number, totalFloors: number, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const w = canvas.width; // 512
  const h = canvas.height; // 128

  const bg = pickPillColor(floor, index);

  // 1. Solid bright square background with sharp corners
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // 2. Soft inner highlight for a backlit feel
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'rgba(255,255,255,0.35)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.06)');
  grad.addColorStop(1, 'rgba(0,0,0,0.12)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // 3. Company logo icon on the left
  const logoX = 24;
  const logoSize = 68;
  const logoY = h / 2 - logoSize / 2;
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.fillRect(logoX, logoY, logoSize, logoSize);

  const brand = floor.brandTitle || (floor.status === 'available' ? 'AVAILABLE' : 'YOUR BRAND');
  const initial = (brand.charAt(0) || 'U').toUpperCase();
  ctx.fillStyle = bg;
  ctx.font = '800 42px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initial, logoX + logoSize / 2, logoY + logoSize / 2 + 3);

  // 4. Domain / brand name
  ctx.fillStyle = '#111827';
  ctx.font = '800 42px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const brandX = logoX + logoSize + 20;
  const brandY = h / 2 - 14;
  ctx.fillText(brand.length > 16 ? brand.slice(0, 16) : brand, brandX, brandY, 280);

  // 5. Category sub-line
  ctx.fillStyle = 'rgba(17,24,39,0.78)';
  ctx.font = '600 22px "Segoe UI", Arial, sans-serif';
  ctx.fillText(floor.category || (floor.status === 'available' ? 'Prime Commercial Space' : 'Brand Presence'), brandX, h / 2 + 24, 280);

  // 6. Floor badge overlay (bottom-right)
  const displayNum = getDisplayFloorNumber(floor.floorNumber, totalFloors);
  const badge = `#${displayNum}`;
  const badgeW = 76;
  const badgeH = 34;
  const bx = w - 128;
  const by = h - 45;
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.fillRect(bx - badgeW / 2, by - badgeH / 2, badgeW, badgeH);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = 'rgba(30,41,59,0.75)';
  ctx.stroke();
  ctx.fillStyle = '#111827';
  ctx.font = '800 26px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badge, bx + 3, by + 1);

  // 7. Bid amount tag
  const price = `₹${floor.price}`;
  ctx.fillStyle = '#111827';
  ctx.font = '800 30px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(price, w - 38, h / 2 - 2);
}

export function AdvertisingPanel({
  floor,
  width,
  height,
  totalFloors,
  isSelected,
  isHovered,
  isDayMode = false,
  hideAdvertising = false,
}: AdvertisingPanelProps) {
  const backlightRef = useRef<THREE.Mesh>(null);
  const bannerRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const hoverRef = useRef(false);
  const [bannerHover, setBannerHover] = useState(false);

  const isAvailable = floor.status === 'available';
  const brandAccent = isAvailable ? '#10b981' : (floor.bannerColor || '#38bdf8');
  const activeColor = isSelected ? '#ffea00' : isHovered ? '#38bdf8' : brandAccent;

  const radius = width / 2;
  const signWidth = width * 0.85;
  const signHeight = height * 0.78;

  // Optimized lightweight 512x128 texture from pool
  const textureKey = `ad-${floor.id}-${floor.brandTitle}-${floor.price}-${isDayMode}`;
  const adTexture = useMemo(() => {
    const index = Math.abs(floor.floorNumber) + (floor.floorNumber * 7) % PILL_BG.length;
    return floorTexturePool.getOrCreate(textureKey, (canvas, ctx) => {
      drawAdCanvas(floor, isDayMode, index, totalFloors, canvas, ctx);
    });
  }, [floor, isDayMode, totalFloors, textureKey]);

  useEffect(() => {
    return () => {
      floorTexturePool.release(textureKey);
    };
  }, [textureKey]);

  // Emissive backlight + pop-out animation (mutates mesh transform directly, no React re-render)
  const popRef = useRef(0);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const hov = hoverRef.current;
    if (backlightRef.current) {
      const mat = backlightRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = isSelected
          ? 2.2 + Math.sin(t * 4) * 0.3
          : hov ? 0.6 : 0.2;
      }
    }
    const target = hov ? 1 : 0;
    popRef.current += (target - popRef.current) * 0.18;
    if (groupRef.current) {
      groupRef.current.position.z = radius + 0.05 + popRef.current * 0.12;
    }
  });

  const handleAdClick = (event: any) => {
    if (!floor.targetUrl) return;
    event.stopPropagation();
    try {
      const destination = new URL(floor.targetUrl);
      if (destination.protocol === 'https:' || destination.protocol === 'http:') {
        window.open(destination.href, '_blank', 'noopener,noreferrer');
      }
    } catch {
      // ignore invalid legacy URLs
    }
  };

  return (
    !hideAdvertising && (
    <group
      ref={groupRef}
      onClick={handleAdClick}
      onPointerOver={(e) => { e.stopPropagation(); hoverRef.current = true; setBannerHover(true); }}
      onPointerOut={() => { hoverRef.current = false; setBannerHover(false); }}
    >
      {/* 1. RECESSED BACKLIT COLOR-CODED SIGN FACE */}
      <mesh ref={backlightRef} position={[0, 0, 0]} castShadow>
        <planeGeometry args={[signWidth, signHeight]} />
        <meshStandardMaterial
          color={brandAccent}
          emissive={brandAccent}
          emissiveIntensity={isSelected ? 2.2 : 0.2}
          roughness={0.18}
          metalness={0.7}
        />
      </mesh>

      {/* 2. ILLUMINATED ACCENT BORDER STRIP */}
      <lineSegments position={[0, 0, 0.005]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(signWidth, signHeight)]} />
        <lineBasicMaterial color={activeColor} linewidth={1.5} transparent opacity={0.9} />
      </lineSegments>

      {/* 3. CANVAS-TEXTURE AD BANNER (elevated decal with bright pill design) */}
      <mesh ref={bannerRef} position={[0, 0, 0.02]}>
        <planeGeometry args={[signWidth, signHeight]} />
        <meshStandardMaterial
          map={adTexture}
          emissive="#ffffff"
          emissiveMap={adTexture}
          emissiveIntensity={bannerHover || isSelected ? 0.5 : 0.25}
          toneMapped={false}
        />
      </mesh>

      {/* 5. BACKLIT INTERIOR DISPLAY PANEL (glows out through the glass from inside) */}
      <group position={[0, 0, -0.55]} rotation={[0, -Math.PI, 0]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[signWidth * 0.82, signHeight * 0.82]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveMap={adTexture}
            emissiveIntensity={isSelected || bannerHover ? 0.6 : 0.4}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
    )
  );
}
