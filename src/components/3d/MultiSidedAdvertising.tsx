'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { FloorData, getDisplayFloorNumber } from '@/types/floor';
import { floorAnimationUpdaters, registerAnimation } from './AnimationSystems';

const SIDE_PILL_BG = ['#22c9b8', '#7cc0f2', '#a8e063', '#ff9b7d', '#8fbfe0', '#ffd580'];

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

const sideLogoImageCache = new Map<string, HTMLImageElement>();

function drawSideSignCanvas(floor: FloorData, index: number, totalFloors: number, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const w = canvas.width; // 1024
  const h = canvas.height; // 256

  const bg = floor.bannerColor || SIDE_PILL_BG[index % SIDE_PILL_BG.length];

  // 1. Solid bright background
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // 2. Soft inner highlight
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
    const cached = sideLogoImageCache.get(logoUrl);
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
        sideLogoImageCache.set(logoUrl, img);
        drawSideSignCanvas(floor, index, totalFloors, canvas, ctx);
        const tex = (canvas as any).__texture;
        if (tex) {
          tex.needsUpdate = true;
        }
      };
      img.onerror = () => {
        // Keep letter fallback
      };
      img.src = logoUrl;
      sideLogoImageCache.set(logoUrl, img);
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

  // 4. Middle Column: Domain / brand name & category (x: 192 to 740, max width 540px)
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

interface MultiSidedAdvertisingProps {
  floor: FloorData;
  width: number;
  depth: number;
  height: number;
  totalFloors: number;
  isSelected: boolean;
  isHovered: boolean;
  isDayMode?: boolean;
  hideAdvertising?: boolean;
}

export function MultiSidedAdvertising({
  floor,
  width,
  depth,
  height,
  totalFloors,
  isSelected,
  isHovered,
  isDayMode = false,
  hideAdvertising = false,
}: MultiSidedAdvertisingProps) {
  const ribbonGlowRef = useRef<THREE.Mesh>(null);
  const tickerTextRef = useRef<THREE.Group>(null);

  const isAvailable = floor.status === 'available';
  const brandColor = isAvailable ? '#00e676' : (floor.bannerColor || '#00c8ff');
  const activeColor = isSelected ? '#fff000' : isHovered ? '#00e5ff' : brandColor;

  // Determine advertising style based on floor data
  const styleType = floor.floorNumber % 3;

  // Dynamic HTML5 canvas texture for the side wrap-around sign plates via shared pool
  const sideKey = `side-${floor.id}-${floor.brandTitle}-${floor.category}-${floor.adBannerUrl}-${floor.price}`;
  const sideTexture = useMemo(() => {
    const index = Math.floor(floor.floorNumber) % SIDE_PILL_BG.length;
    return floorTexturePool.getOrCreate(sideKey, (canvas, ctx) => {
      drawSideSignCanvas(floor, index, totalFloors, canvas, ctx);
    });
  }, [floor, totalFloors, sideKey]);

  useEffect(() => {
    return () => {
      floorTexturePool.release(sideKey);
    };
  }, [sideKey]);

  const signWidthFront = width * 0.85;
  const signWidthSide = signWidthFront;
  const signHeight = height * 0.78;

  // Subtle scrolling ticker animation for 360 ribbon
  useEffect(() => registerAnimation(floorAnimationUpdaters, (t) => {
    if (tickerTextRef.current) {
      tickerTextRef.current.position.x = -((t * 0.4) % 4);
    }
    if (ribbonGlowRef.current) {
      const mat = ribbonGlowRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = isSelected ? 2.5 : isHovered ? 1.8 : isDayMode ? 0.65 : 0.9;
      }
    }
  }), [isSelected, isHovered, isDayMode]);

  return (
    !hideAdvertising && (
    <group position={[0, 0, 0]}>
      {/* ========================================================== */}
      {/* 1. BACK FACE ADVERTISING (Symmetrical Corporate Slogan)    */}
      {/* ========================================================== */}
      <group position={[0, 0, -depth / 2 - 0.05]} rotation={[0, Math.PI, 0]}>
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
        {/* Canvas-Texture Ad Banner (bright pill design) */}
        <mesh position={[0, 0, 0.045]}>
          <planeGeometry args={[signWidthFront, signHeight]} />
          <meshStandardMaterial
            map={sideTexture}
            emissive="#ffffff"
            emissiveMap={sideTexture}
            emissiveIntensity={isSelected || isHovered ? 0.5 : 0.25}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* ========================================================== */}
      {/* 2. RIGHT FACE ADVERTISING (Side Digital Screen Bay)       */}
      {/* ========================================================== */}
      <group position={[width / 2 + 0.05, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
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
        {/* Canvas-Texture Side Banner */}
        <mesh position={[0, 0, 0.045]}>
          <planeGeometry args={[signWidthSide, signHeight]} />
          <meshStandardMaterial
            map={sideTexture}
            emissive="#ffffff"
            emissiveMap={sideTexture}
            emissiveIntensity={isSelected || isHovered ? 0.5 : 0.25}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* ========================================================== */}
      {/* 3. LEFT FACE ADVERTISING (Side Metrics & Verification)     */}
      {/* ========================================================== */}
      <group position={[-width / 2 - 0.05, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
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
        {/* Canvas-Texture Side Banner */}
        <mesh position={[0, 0, 0.045]}>
          <planeGeometry args={[signWidthSide, signHeight]} />
          <meshStandardMaterial
            map={sideTexture}
            emissive="#ffffff"
            emissiveMap={sideTexture}
            emissiveIntensity={isSelected || isHovered ? 0.5 : 0.25}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* ========================================================== */}
      {/* 4. 360° PERIMETER ILLUMINATED DIGITAL TICKER RIBBON        */}
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
      {/* 5. CORNER CURVED LED TICKER DISPLAY PLATES                 */}
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
    )
  );
}
