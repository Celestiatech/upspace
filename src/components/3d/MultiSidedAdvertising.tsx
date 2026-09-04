'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { FloorData, getDisplayFloorNumber } from '@/types/floor';

const SIDE_PILL_BG = ['#22c9b8', '#7cc0f2', '#a8e063', '#ff9b7d', '#8fbfe0', '#ffd580'];

function drawSideSignCanvas(floor: FloorData, index: number, totalFloors: number): HTMLCanvasElement {
  const w = 1024;
  const h = 248;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const bg = floor.bannerColor || SIDE_PILL_BG[index % SIDE_PILL_BG.length];

  // 1. Solid bright square background
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // 2. Soft inner highlight
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'rgba(255,255,255,0.35)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.06)');
  grad.addColorStop(1, 'rgba(0,0,0,0.12)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // 3. Square company logo icon on the left
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

  // 4. Domain / brand name (dark, high-contrast)
  ctx.fillStyle = '#111827';
  ctx.font = '800 84px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const brandX = logoX + logoSize + 38;
  const brandY = h / 2 - 28;
  ctx.fillText(brand.length > 16 ? brand.slice(0, 16) : brand, brandX, brandY, 560);

  // 5. Category sub-line
  ctx.fillStyle = 'rgba(17,24,39,0.78)';
  ctx.font = '600 44px "Segoe UI", Arial, sans-serif';
  ctx.fillText(floor.category || (floor.status === 'available' ? 'Prime Virtual Commercial Space' : 'High-Impact Brand Presence'), brandX, h / 2 + 46, 560);

  // 6. Floor badge overlay (bottom-right)
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

  // 7. Bid amount tag (right edge)
  const price = `₹${floor.price}`;
  ctx.fillStyle = '#111827';
  ctx.font = '800 58px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(price, w - 74, h / 2 - 4);

  return canvas;
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
  const brandColor = isAvailable ? '#10b981' : (floor.bannerColor || '#38bdf8');
  const activeColor = isSelected ? '#ffea00' : isHovered ? '#38bdf8' : brandColor;

  // Determine advertising style based on floor data
  const styleType = floor.floorNumber % 3; // 0: 360° Panoramic Wrap, 1: 4-Sided Multi-Screen Suite, 2: Dual Split & Corner Ticker

  // Dynamic HTML5 canvas texture for the side wrap-around sign plates
  const sideTexture = useMemo(() => {
    const index = Math.floor(floor.floorNumber) % SIDE_PILL_BG.length;
    const canvas = drawSideSignCanvas(floor, index, totalFloors);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 2;
    return texture;
  }, [floor]);

  useEffect(() => () => sideTexture.dispose(), [sideTexture]);

  const signWidthFront = width * 0.85;
  const signWidthSide = signWidthFront;
  const signHeight = height * 0.78;

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
