'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { ThemeMode } from '@/types/theme';
import { FloorData } from '@/types/floor';

interface AirplaneProps {
  theme: ThemeMode;
  floors?: FloorData[];
  altitude?: number;
}

export function Airplane({ theme, floors = [], altitude }: AirplaneProps) {
  const isDay = theme === 'day';
  const groupRef = useRef<THREE.Group>(null);

  // Trailing flag / banner reference
  const flagMeshRef = useRef<THREE.Mesh>(null);

  // Dynamic cruise altitude matching top floor / penthouse roof height
  const topFloorAltitude = useMemo(() => {
    if (altitude && altitude > 0) return altitude;
    const count = floors?.length || 8;
    return 12 + count * 4.5;
  }, [altitude, floors]);

  // Extract top-ranked floor / brand title
  const topFloor = useMemo(() => {
    if (!floors || floors.length === 0) return null;
    return [...floors].sort((a, b) => b.price - a.price)[0] || floors[floors.length - 1];
  }, [floors]);

  const brandTitle = topFloor?.brandTitle || topFloor?.ownerName || 'W3Tech';
  const brandPrice = topFloor?.price || 50000;

  // Generate dynamic ultra-high-resolution texture for the sky banner flag (clearly visible from orbit)
  const bannerTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Glowing vibrant Amber/Gold-Orange gradient background
    const grad = ctx.createLinearGradient(0, 0, 2048, 0);
    grad.addColorStop(0, '#f59e0b');
    grad.addColorStop(0.2, '#ea580c');
    grad.addColorStop(0.5, '#d97706');
    grad.addColorStop(0.8, '#ea580c');
    grad.addColorStop(1, '#f59e0b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 2048, 512);

    // Thick crisp white outer border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 18;
    ctx.strokeRect(16, 16, 2016, 480);

    // Inner gold pinstripe accent
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.6)';
    ctx.lineWidth = 4;
    ctx.strokeRect(32, 32, 1984, 448);

    // Crown / Top Rank Badge Pill
    ctx.fillStyle = '#fef08a';
    ctx.font = '900 58px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('👑 #1 SKYLINE PINNACLE LEADER', 1024, 110);

    // Giant Brand Name (Extra Bold & High-Contrast with measurement-based font auto-scaling)
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const brandName = brandTitle.toUpperCase();
    const maxBrandWidth = 1880;
    let brandFontSize = 156;
    ctx.font = `900 ${brandFontSize}px "Segoe UI", Inter, Arial, sans-serif`;
    while (ctx.measureText(brandName).width > maxBrandWidth && brandFontSize > 44) {
      brandFontSize -= 4;
      ctx.font = `900 ${brandFontSize}px "Segoe UI", Inter, Arial, sans-serif`;
    }
    ctx.fillText(brandName, 1024, 268);

    // Live price telemetry badge pill with auto-scaling
    const subText = `₹${brandPrice.toLocaleString('en-IN')} · TOP SKYLINE BIDDER`;
    let subFontSize = 64;
    ctx.font = `bold ${subFontSize}px monospace`;
    while (ctx.measureText(subText).width > 1880 && subFontSize > 32) {
      subFontSize -= 2;
      ctx.font = `bold ${subFontSize}px monospace`;
    }
    ctx.fillStyle = '#fef3c7';
    ctx.fillText(subText, 1024, 415);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.needsUpdate = true;
    return tex;
  }, [brandTitle, brandPrice]);

  // Flight path constants aligned with top floor level
  const flightRadius = 54;
  const flightSpeed = 0.075;
  const bankAngle = 0.26; // Inward banking into the turn

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (groupRef.current) {
      const angle = t * flightSpeed;
      // Positioned along orbit matching top floor altitude
      const x = Math.sin(angle) * flightRadius;
      const z = Math.cos(angle) * flightRadius;
      const y = topFloorAltitude + Math.sin(t * 0.18) * 0.8; // Cruising level with top floor

      groupRef.current.position.set(x, y, z);

      // Next position slightly ahead along flight path (look ahead vector)
      const nextAngle = (t + 0.1) * flightSpeed;
      const nextX = Math.sin(nextAngle) * flightRadius;
      const nextZ = Math.cos(nextAngle) * flightRadius;
      const nextY = topFloorAltitude + Math.sin((t + 0.1) * 0.18) * 0.8;

      // Orient aircraft towards flight vector and rotate shape 180 degrees to face forward
      groupRef.current.lookAt(nextX, nextY, nextZ);
      groupRef.current.rotateY(Math.PI);

      // Aerodynamic banking roll into the turn
      groupRef.current.rotateZ(bankAngle);
    }

    // Animate large trailing banner cloth fluttering wave
    if (flagMeshRef.current) {
      const geo = flagMeshRef.current.geometry as THREE.PlaneGeometry;
      const posAttr = geo.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        // Wave starts at leading edge (x = -9.0) and intensifies towards trailing edge (x = +9.0)
        const progress = (x + 9.0) / 18.0;
        const wave = Math.sin(t * 9 - progress * 9) * 0.55 * Math.max(0.08, progress);
        posAttr.setZ(i, wave);
      }
      // The banner deformation changes vertex positions only. Keep the initial
      // normals; rebuilding the full normal buffer every frame was a major CPU cost.
      posAttr.needsUpdate = true;
    }
  });


  // Reusable window positions along passenger cabin
  const cabinWindows = useMemo(() => {
    const windows = [];
    for (let i = -1.4; i <= 1.2; i += 0.38) {
      windows.push(i);
    }
    return windows;
  }, []);

  return (
    <group ref={groupRef} position={[0, 43, 68]}>

      {/* ========================================================= */}

      {/* 1. AERODYNAMIC FUSELAGE (BODY, NOSE, COCKPIT & TAIL CONE) */}
      {/* ========================================================= */}
      {/* Main Cabin Tube (aligned along Z axis, nose at -Z, tail at +Z) */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.42, 3.6, 24]} />
        <meshStandardMaterial
          color="#f8fafc"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Titanium Underbelly / Lower Fuselage Fairing */}
      <mesh position={[0, -0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.39, 0.4, 3.5, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial
          color="#94a3b8"
          metalness={0.85}
          roughness={0.25}
        />
      </mesh>

      {/* Aerodynamic Nose Section */}
      <mesh position={[0, -0.02, -2.25]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.42, 0.9, 24]} />
        <meshStandardMaterial
          color="#f8fafc"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      {/* Radome Nose Tip Cone */}
      <mesh position={[0, -0.02, -2.72]} rotation={[-Math.PI / 2, 0, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.5}
          roughness={0.4}
        />
      </mesh>

      {/* Cockpit Windshield (Tinted Curved Flight Deck Visor) */}
      <mesh position={[0, 0.22, -1.95]} rotation={[0.42, 0, 0]}>
        <boxGeometry args={[0.46, 0.18, 0.32]} />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.95}
          roughness={0.05}
          emissive="#38bdf8"
          emissiveIntensity={isDay ? 0.2 : 0.5}
        />
      </mesh>

      {/* Cockpit Side Windows */}
      <mesh position={[-0.26, 0.18, -1.82]} rotation={[0.35, -0.4, 0]}>
        <boxGeometry args={[0.02, 0.14, 0.24]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0.26, 0.18, -1.82]} rotation={[0.35, 0.4, 0]}>
        <boxGeometry args={[0.02, 0.14, 0.24]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Passenger Cabin Windows (Illuminated) */}
      {cabinWindows.map((zPos, idx) => (
        <group key={`win-${idx}`}>
          {/* Port Side Windows */}
          <mesh position={[-0.425, 0.08, zPos]}>
            <sphereGeometry args={[0.055, 10, 10]} />
            <meshStandardMaterial
              color={isDay ? '#38bdf8' : '#fef08a'}
              emissive={isDay ? '#38bdf8' : '#fde047'}
              emissiveIntensity={isDay ? 0.3 : 1.2}
            />
          </mesh>
          {/* Starboard Side Windows */}
          <mesh position={[0.425, 0.08, zPos]}>
            <sphereGeometry args={[0.055, 10, 10]} />
            <meshStandardMaterial
              color={isDay ? '#38bdf8' : '#fef08a'}
              emissive={isDay ? '#38bdf8' : '#fde047'}
              emissiveIntensity={isDay ? 0.3 : 1.2}
            />
          </mesh>
        </group>
      ))}

      {/* Tapering Tail Cone */}
      <mesh position={[0, 0.05, 2.35]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.42, 1.1, 24]} />
        <meshStandardMaterial
          color="#f8fafc"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      {/* APU Exhaust Port at very tail tip */}
      <mesh position={[0, 0.05, 2.92]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.1, 12]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* ========================================================= */}
      {/* 2. SWEPT WINGS & AERODYNAMIC WINGLETS                     */}
      {/* ========================================================= */}
      {/* Left Wing (Swept back with slight dihedral upward tilt) */}
      <group position={[-0.35, -0.04, -0.2]} rotation={[0.03, 0.38, 0.04]}>
        {/* Main Wing Foil */}
        <mesh position={[-2.4, 0, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[4.8, 0.06, 1.1]} />
          <meshStandardMaterial
            color="#f1f5f9"
            metalness={0.85}
            roughness={0.2}
          />
        </mesh>
        {/* Leading Edge Slat (Polished Silver) */}
        <mesh position={[-2.4, 0, -0.56]}>
          <cylinderGeometry args={[0.035, 0.035, 4.8, 8]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
        </mesh>
        {/* Port Winglet (Upward curved aerodynamic fin) */}
        <mesh position={[-4.78, 0.38, 0]} rotation={[0, 0, -0.45]}>
          <boxGeometry args={[0.05, 0.8, 0.65]} />
          <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.25} />
        </mesh>
      </group>

      {/* Right Wing (Swept back with symmetrical dihedral) */}
      <group position={[0.35, -0.04, -0.2]} rotation={[0.03, -0.38, -0.04]}>
        {/* Main Wing Foil */}
        <mesh position={[2.4, 0, 0]}>
          <boxGeometry args={[4.8, 0.06, 1.1]} />
          <meshStandardMaterial
            color="#f1f5f9"
            metalness={0.85}
            roughness={0.2}
          />
        </mesh>
        {/* Leading Edge Slat (Polished Silver) */}
        <mesh position={[2.4, 0, -0.56]}>
          <cylinderGeometry args={[0.035, 0.035, 4.8, 8]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
        </mesh>
        {/* Starboard Winglet (Upward curved aerodynamic fin) */}
        <mesh position={[4.78, 0.38, 0]} rotation={[0, 0, 0.45]}>
          <boxGeometry args={[0.05, 0.8, 0.65]} />
          <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.25} />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 3. DUAL HIGH-BYPASS TURBOFAN JET ENGINES                 */}
      {/* ========================================================= */}
      {/* Left Jet Engine */}
      <group position={[-1.75, -0.36, -0.1]}>
        {/* Pylon / Strut connecting engine to wing */}
        <mesh position={[0, 0.22, 0.1]}>
          <boxGeometry args={[0.08, 0.32, 0.8]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
        </mesh>
        {/* Engine Nacelle Cowling */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.28, 1.4, 20]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.25} />
        </mesh>
        {/* Front Intake Lip (Polished Chrome Rim) */}
        <mesh position={[0, 0, -0.7]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.26, 0.04, 12, 24]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
        </mesh>
        {/* Intake Spinner Bullet Cone */}
        <mesh position={[0, 0, -0.6]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.09, 0.26, 16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Clean Titanium Exhaust Nozzle */}
        <mesh position={[0, 0, 0.7]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.24, 0.2, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.3} />
        </mesh>
      </group>

      {/* Right Jet Engine */}
      <group position={[1.75, -0.36, -0.1]}>
        {/* Pylon / Strut connecting engine to wing */}
        <mesh position={[0, 0.22, 0.1]}>
          <boxGeometry args={[0.08, 0.32, 0.8]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
        </mesh>
        {/* Engine Nacelle Cowling */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.28, 1.4, 20]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.25} />
        </mesh>
        {/* Front Intake Lip (Polished Chrome Rim) */}
        <mesh position={[0, 0, -0.7]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.26, 0.04, 12, 24]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
        </mesh>
        {/* Intake Spinner Bullet Cone */}
        <mesh position={[0, 0, -0.6]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.09, 0.26, 16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Clean Titanium Exhaust Nozzle */}
        <mesh position={[0, 0, 0.7]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.24, 0.2, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.3} />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 4. EMPENNAGE (VERTICAL TAIL FIN & HORIZONTAL STABILIZERS) */}
      {/* ========================================================= */}
      {/* Swept Vertical Stabilizer (Tail Fin) */}
      <group position={[0, 0.95, 1.95]} rotation={[-0.42, 0, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.08, 1.7, 0.95]} />
          <meshStandardMaterial
            color="#0284c7"
            metalness={0.8}
            roughness={0.25}
          />
        </mesh>
        {/* Tail Leading Edge Trim */}
        <mesh position={[0, 0, -0.48]}>
          <cylinderGeometry args={[0.04, 0.04, 1.7, 8]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>

      {/* Horizontal Stabilizers (Tail Wings) */}
      <mesh position={[0, 0.28, 2.25]} rotation={[-0.08, 0, 0]}>
        <boxGeometry args={[2.5, 0.04, 0.68]} />
        <meshStandardMaterial
          color="#e2e8f0"
          metalness={0.8}
          roughness={0.25}
        />
      </mesh>

      {/* ========================================================= */}
      {/* 5. TOP-RANKED BRAND AERIAL BANNER & TOW RIG               */}
      {/* ========================================================= */}
      <group position={[0, 0, 0]}>
        {/* Upper Tow Cable */}
        <mesh position={[0, 0.9, 4.7]} rotation={[0.46, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 4.1, 6]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Lower Tow Cable */}
        <mesh position={[0, -0.9, 4.7]} rotation={[-0.46, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 4.1, 6]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Vertical Banner Spreader Bar Rod */}
        <mesh position={[0, 0, 6.5]}>
          <cylinderGeometry args={[0.045, 0.045, 3.8, 8]} />
          <meshStandardMaterial color="#475569" metalness={0.95} roughness={0.1} />
        </mesh>

        {/* Dynamic Waving Cloth Banner Flag (Large High-Visibility 18m x 3.6m) */}
        {bannerTexture && (
          <group position={[0, 0, 15.5]} rotation={[0, -Math.PI / 2, 0]}>
            <mesh ref={flagMeshRef} castShadow receiveShadow>
              <planeGeometry args={[18.0, 3.6, 36, 6]} />
              <meshStandardMaterial
                map={bannerTexture}
                roughness={0.35}
                metalness={0.1}
                side={THREE.DoubleSide}
                emissive="#ffffff"
                emissiveMap={bannerTexture}
                emissiveIntensity={isDay ? 0.5 : 0.9}
              />
            </mesh>
          </group>
        )}
      </group>

    </group>
  );
}
