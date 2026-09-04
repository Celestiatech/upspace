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

function drawAdCanvas(floor: FloorData, daymode: boolean, index: number, totalFloors: number): HTMLCanvasElement {
  const w = 1024;
  const h = 248;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

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

  // 3. Enlarged square company logo icon on the left
  const logoX = 46;
  const logoSize = 132;
  const logoY = h / 2 - logoSize / 2;
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.fillRect(logoX, logoY, logoSize, logoSize);

  const brand = floor.brandTitle || (floor.status === 'available' ? 'AVAILABLE' : 'YOUR BRAND');
  const initial = (brand.charAt(0) || 'U').toUpperCase();
  ctx.fillStyle = bg;
  ctx.font = '800 84px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initial, logoX + logoSize / 2, logoY + logoSize / 2 + 6);

  // 4. Domain / brand name (dark, high-contrast, ~28% larger)
  ctx.fillStyle = '#111827';
  ctx.font = '800 84px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const brandX = logoX + logoSize + 38;
  const brandY = h / 2 - 28;
  ctx.fillText(brand.length > 16 ? brand.slice(0, 16) : brand, brandX, brandY, 560);

  // 5. Category sub-line (scaled up)
  ctx.fillStyle = 'rgba(17,24,39,0.78)';
  ctx.font = '600 44px "Segoe UI", Arial, sans-serif';
  ctx.fillText(floor.category || (floor.status === 'available' ? 'Prime Virtual Commercial Space' : 'High-Impact Brand Presence'), brandX, h / 2 + 46, 560);

  // 6. Floor badge overlay (bottom-right) with metallic border
  const displayNum = getDisplayFloorNumber(floor.floorNumber, totalFloors);
  const badge = `#${displayNum}`;
  const badgeW = 148;
  const badgeH = 66;
  const bx = w - 250;
  const by = h - 88;
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.fillRect(bx - badgeW / 2, by - badgeH / 2, badgeW, badgeH);
  ctx.lineWidth = 5;
  ctx.strokeStyle = 'rgba(30,41,59,0.75)';
  ctx.stroke();
  ctx.fillStyle = '#111827';
  ctx.font = '800 50px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badge, bx + 6, by + 3);

  // 7. Bid amount tag (right edge, scaled up)
  const price = `₹${floor.price}`;
  ctx.fillStyle = '#111827';
  ctx.font = '800 58px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(price, w - 74, h / 2 - 4);

  return canvas;
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
  // Large banner spanning ~85% of the face width, filling the glass with thin top/bottom margins
  const signWidth = width * 0.85;
  const signHeight = height * 0.78;

  // Dynamic HTML5 canvas texture for the ad banner
  const adTexture = useMemo(() => {
    const index = Math.abs(floor.floorNumber) + (floor.floorNumber * 7) % PILL_BG.length;
    const canvas = drawAdCanvas(floor, isDayMode, index, totalFloors);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 2;
    return texture;
  }, [floor, isDayMode]);

  // Dispose the texture when unmounted
  useEffect(() => () => adTexture.dispose(), [adTexture]);

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
