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
import { getFloorLogoUrl } from '@/utils/logoHelper';

function fillRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

const logoImageCache = new Map<string, HTMLImageElement>();

function drawAdCanvas(floor: FloorData, daymode: boolean, index: number, totalFloors: number, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const w = canvas.width; // 1024
  const h = canvas.height; // 256

  const bg = pickPillColor(floor, index);

  // 1. Solid bright background
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // 2. Soft inner highlight for a backlit feel
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'rgba(255,255,255,0.42)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.08)');
  grad.addColorStop(1, 'rgba(0,0,0,0.14)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // 3. Left Company logo icon (x: 24 to 168)
  const logoX = 24;
  const logoSize = 144;
  const logoY = Math.round(h / 2 - logoSize / 2);
  
  ctx.fillStyle = 'rgba(255,255,255,0.96)';
  fillRoundedRect(ctx, logoX, logoY, logoSize, logoSize, 20);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(15,23,42,0.12)';
  ctx.stroke();

  const brand = floor.brandTitle || (floor.status === 'available' ? 'AVAILABLE' : 'YOUR BRAND');
  const logoUrl = getFloorLogoUrl(floor);

  let drewImage = false;
  if (logoUrl) {
    const cached = logoImageCache.get(logoUrl);
    if (cached && cached.complete && cached.naturalWidth > 0) {
      const pad = 16;
      ctx.save();
      ctx.beginPath();
      fillRoundedRect(ctx, logoX + 2, logoY + 2, logoSize - 4, logoSize - 4, 18);
      ctx.clip();
      ctx.drawImage(cached, logoX + pad, logoY + pad, logoSize - pad * 2, logoSize - pad * 2);
      ctx.restore();
      drewImage = true;
    } else if (!cached && typeof window !== 'undefined') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        logoImageCache.set(logoUrl, img);
        drawAdCanvas(floor, daymode, index, totalFloors, canvas, ctx);
        const tex = (canvas as any).__texture;
        if (tex) {
          tex.needsUpdate = true;
        }
      };
      img.onerror = () => {
        // Keep letter fallback
      };
      img.src = logoUrl;
      logoImageCache.set(logoUrl, img);
    }
  }

  if (!drewImage) {
    const initial = (brand.charAt(0) || 'U').toUpperCase();
    ctx.fillStyle = bg;
    ctx.font = '900 86px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initial, logoX + logoSize / 2, logoY + logoSize / 2 + 4);
  }

  // 4. Middle Column: Domain / brand name & category (x: 192 to 740, max width 550px)
  const brandX = 192;
  const brandY = Math.round(h / 2 - 36);

  // Exact measurement-based font auto-scaling to fit ANY long brand name cleanly without squeezing
  const maxBrandWidth = 540;
  let fontSize = 74;
  ctx.font = `900 ${fontSize}px "Segoe UI", Arial, sans-serif`;
  while (ctx.measureText(brand).width > maxBrandWidth && fontSize > 28) {
    fontSize -= 2;
    ctx.font = `900 ${fontSize}px "Segoe UI", Arial, sans-serif`;
  }

  ctx.fillStyle = '#0f172a';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(brand, brandX, brandY);

  // 5. Category sub-line with auto font scaling
  const catY = Math.round(h / 2 + 42);
  const catText = floor.category || (floor.status === 'available' ? 'Prime Commercial Space' : 'Brand Presence');
  const maxCatWidth = 540;
  let catFontSize = 42;
  ctx.font = `800 ${catFontSize}px "Segoe UI", Arial, sans-serif`;
  while (ctx.measureText(catText).width > maxCatWidth && catFontSize > 24) {
    catFontSize -= 2;
    ctx.font = `800 ${catFontSize}px "Segoe UI", Arial, sans-serif`;
  }
  ctx.fillStyle = 'rgba(15,23,42,0.85)';
  ctx.fillText(catText, brandX, catY);

  // 6. Right Column: Top Price Tag (right aligned at x = 996)
  const price = `₹${floor.price.toLocaleString()}`;
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 66px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(price, 996, brandY);

  // 7. Right Column: Large, Prominent #Rank Badge Pill (bottom-right under price)
  const displayNum = getDisplayFloorNumber(floor.floorNumber, totalFloors);
  const badge = `#${displayNum}`;
  const badgeW = 210;
  const badgeH = 82;
  const badgeX = 996 - badgeW;
  const badgeY = Math.round(h / 2 + 2);

  ctx.fillStyle = 'rgba(255,255,255,0.96)';
  fillRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 16);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(15,23,42,0.25)';
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = '900 54px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badge, badgeX + badgeW / 2, badgeY + badgeH / 2 + 2);
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
  const brandAccent = isAvailable ? '#00e676' : (floor.bannerColor || '#00c8ff');
  const activeColor = isSelected ? '#fff000' : isHovered ? '#00e5ff' : brandAccent;

  const radius = width / 2;
  const signWidth = width * 0.85;
  const signHeight = height * 0.78;

  // Optimized lightweight 512x128 texture from pool
  const textureKey = `ad-${floor.id}-${floor.brandTitle}-${floor.category}-${floor.adBannerUrl}-${floor.price}-${isDayMode}`;
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
      fetch('/api/floors/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ floorId: floor.id, action: 'click' }),
      }).catch(() => {});
    } catch {}
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
