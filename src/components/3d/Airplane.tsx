'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { ThemeMode } from '@/types/theme';

interface AirplaneProps {
  theme: ThemeMode;
}

export function Airplane({ theme }: AirplaneProps) {
  const isDay = theme === 'day';
  const groupRef = useRef<THREE.Group>(null);
  const strobeRef = useRef<THREE.PointLight>(null);
  const strobeMeshRef = useRef<THREE.Mesh>(null);
  const engineGlowLeftRef = useRef<THREE.MeshStandardMaterial>(null);
  const engineGlowRightRef = useRef<THREE.MeshStandardMaterial>(null);

  // Trailing contrails animation
  const contrailLeftRef = useRef<THREE.Group>(null);
  const contrailRightRef = useRef<THREE.Group>(null);

  // Flight path constants
  const flightRadius = 68;
  const flightSpeed = 0.075;
  const bankAngle = 0.26; // ~15 degrees inward banking for realistic turn

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (groupRef.current) {
      const angle = t * flightSpeed;
      // Current position along wide circular orbit high in the sky
      const x = Math.sin(angle) * flightRadius;
      const z = Math.cos(angle) * flightRadius;
      const y = 43 + Math.sin(t * 0.18) * 1.8; // Gentle cruising altitude wave

      groupRef.current.position.set(x, y, z);

      // Next position slightly ahead along flight path (look ahead vector)
      const nextAngle = (t + 0.1) * flightSpeed;
      const nextX = Math.sin(nextAngle) * flightRadius;
      const nextZ = Math.cos(nextAngle) * flightRadius;
      const nextY = 43 + Math.sin((t + 0.1) * 0.18) * 1.8;

      // Orient aircraft so the aerodynamic nose (-Z) points forward along velocity vector
      groupRef.current.lookAt(nextX, nextY, nextZ);

      // Aerodynamic banking roll into the turn (left wing dips inward towards skyline tower)
      groupRef.current.rotateZ(bankAngle);
    }

    // Strobe light flashing (aviation double flash pattern)
    const strobePhase = (t * 2.5) % 1;
    const isStrobeActive = strobePhase < 0.08 || (strobePhase > 0.16 && strobePhase < 0.24);

    if (strobeRef.current) {
      strobeRef.current.intensity = isStrobeActive ? (isDay ? 6.0 : 8.0) : 0.0;
    }
    if (strobeMeshRef.current) {
      (strobeMeshRef.current.material as THREE.MeshBasicMaterial).opacity = isStrobeActive ? 1.0 : 0.2;
    }

    // Engine turbine glow pulse
    const engineIntensity = 0.85 + Math.sin(t * 12) * 0.15;
    if (engineGlowLeftRef.current) {
      engineGlowLeftRef.current.emissiveIntensity = engineIntensity;
    }
    if (engineGlowRightRef.current) {
      engineGlowRightRef.current.emissiveIntensity = engineIntensity;
    }

    // Contrail subtle drift/vibration
    if (contrailLeftRef.current && contrailRightRef.current) {
      const puff = 1 + Math.sin(t * 6) * 0.05;
      contrailLeftRef.current.scale.set(puff, puff, 1);
      contrailRightRef.current.scale.set(puff, puff, 1);
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
        {/* Port Wingtip Navigation Light (RED - Solid) */}
        <mesh position={[-4.9, 0.72, 0.1]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        {/* Port Wingtip High-Intensity Strobe */}
        <mesh position={[-4.9, 0.72, -0.2]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color="#ffffff" />
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
        {/* Starboard Wingtip Navigation Light (GREEN - Solid) */}
        <mesh position={[4.9, 0.72, 0.1]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
        {/* Starboard Wingtip High-Intensity Strobe */}
        <mesh position={[4.9, 0.72, -0.2]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color="#ffffff" />
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
        {/* Exhaust Nozzle & Afterburner/Core Glow */}
        <mesh position={[0, 0, 0.7]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.24, 0.2, 16]} />
          <meshStandardMaterial
            ref={engineGlowLeftRef}
            color="#f97316"
            emissive="#ea580c"
            emissiveIntensity={1.0}
          />
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
        {/* Exhaust Nozzle & Afterburner/Core Glow */}
        <mesh position={[0, 0, 0.7]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.24, 0.2, 16]} />
          <meshStandardMaterial
            ref={engineGlowRightRef}
            color="#f97316"
            emissive="#ea580c"
            emissiveIntensity={1.0}
          />
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
        {/* Top of Tail Fin Strobe Beacon */}
        <mesh ref={strobeMeshRef} position={[0, 0.88, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
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
      {/* 5. BEACONS & FLIGHT LIGHTING                               */}
      {/* ========================================================= */}
      {/* Fuselage Dorsal Anti-Collision Red Beacon (Top) */}
      <mesh position={[0, 0.44, -0.3]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      {/* Fuselage Ventral Beacon (Belly) */}
      <mesh position={[0, -0.44, 0.2]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>

      {/* High-Intensity Flash Strobe PointLight */}
      <pointLight
        ref={strobeRef}
        position={[0, 1.85, 1.95]}
        color="#ffffff"
        distance={25}
        intensity={4}
      />

      {/* ========================================================= */}
      {/* 6. EXPANSIVE VAPOR CONTRAILS (JET STREAM TRAILS)          */}
      {/* ========================================================= */}
      {/* Left Engine Contrail Trail */}
      <group ref={contrailLeftRef} position={[-1.75, -0.36, 1.0]}>
        {[
          { z: 2.2, len: 3.5, r1: 0.12, r2: 0.35, op: 0.45 },
          { z: 6.8, len: 6.0, r1: 0.35, r2: 0.75, op: 0.3 },
          { z: 14.5, len: 9.5, r1: 0.75, r2: 1.35, op: 0.15 },
          { z: 25.5, len: 12.5, r1: 1.35, r2: 2.1, op: 0.06 },
        ].map((seg, i) => (
          <mesh key={`c-left-${i}`} position={[0, 0, seg.z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[seg.r2, seg.r1, seg.len, 12, 1, true]} />
            <meshBasicMaterial
              color={isDay ? '#ffffff' : '#94a3b8'}
              transparent
              opacity={seg.op * (isDay ? 1 : 0.65)}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>

      {/* Right Engine Contrail Trail */}
      <group ref={contrailRightRef} position={[1.75, -0.36, 1.0]}>
        {[
          { z: 2.2, len: 3.5, r1: 0.12, r2: 0.35, op: 0.45 },
          { z: 6.8, len: 6.0, r1: 0.35, r2: 0.75, op: 0.3 },
          { z: 14.5, len: 9.5, r1: 0.75, r2: 1.35, op: 0.15 },
          { z: 25.5, len: 12.5, r1: 1.35, r2: 2.1, op: 0.06 },
        ].map((seg, i) => (
          <mesh key={`c-right-${i}`} position={[0, 0, seg.z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[seg.r2, seg.r1, seg.len, 12, 1, true]} />
            <meshBasicMaterial
              color={isDay ? '#ffffff' : '#94a3b8'}
              transparent
              opacity={seg.op * (isDay ? 1 : 0.65)}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
