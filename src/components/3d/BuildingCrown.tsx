'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text, useGLTF } from '@react-three/drei';
import { RealisticHuman } from './RealisticHuman';
import { FloorData } from '@/types/floor';

interface BuildingCrownProps {
  topWidth: number;
  topDepth: number;
  roofY: number;
  themeColor: string;
  isDayMode?: boolean;
  floors?: FloorData[];
}

function PolyPizzaHelicopter() {
  const { scene } = useGLTF('/models/poly-pizza-helicopter.glb');
  const mainRotorRef = useRef<THREE.Mesh | null>(null);
  const { model } = useMemo(() => {
    const clone = scene.clone(true);
    clone.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(clone);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    clone.position.sub(center);
    const scale = 3.25 / Math.max(size.x, size.y, size.z);
    clone.scale.setScalar(scale);

    let meshIndex = 0;
    let rotor: THREE.Mesh | null = null;
    clone.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
      const applyMaterial = (source: THREE.Material) => {
        const material = source.clone() as THREE.MeshStandardMaterial;
        material.color.set(meshIndex++ % 6 === 0 ? '#ef6c2f' : '#151515');
        material.metalness = 0.78;
        material.roughness = 0.2;
        return material;
      };
      object.material = Array.isArray(object.material)
        ? object.material.map(applyMaterial)
        : applyMaterial(object.material);

      const meshBounds = new THREE.Box3().setFromObject(object);
      const meshSize = meshBounds.getSize(new THREE.Vector3());
      if (Math.max(meshSize.x, meshSize.z) > 2.8 && meshSize.y < 0.55) rotor = object;
    });
    mainRotorRef.current = rotor;
    return { model: clone };
  }, [scene]);

  useFrame((state) => {
    if (mainRotorRef.current) mainRotorRef.current.rotation.z = state.clock.getElapsedTime() * 14;
  });

  return <primitive object={model} />;
}

function PenthouseDiscoClub({
  topWidth,
  topDepth,
  penthouseHeight,
  isDayMode,
}: {
  topWidth: number;
  topDepth: number;
  penthouseHeight: number;
  isDayMode?: boolean;
}) {
  const discoBallRef = useRef<THREE.Group>(null);
  const djRef = useRef<THREE.Group>(null);
  const dancersRef = useRef<(THREE.Group | null)[]>([]);
  const floorTilesRef = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const spotLight1Ref = useRef<THREE.PointLight>(null);
  const spotLight2Ref = useRef<THREE.PointLight>(null);

  // 6x6 LED Dance Floor Grid
  const gridRows = 6;
  const gridCols = 6;
  const tileSize = 0.72;
  const DISCO_COLORS = ['#ff007f', '#00f0ff', '#39ff14', '#9d00ff', '#ffe600', '#ff0055'];

  // 8 Diverse dancers on the floor
  const dancers = useMemo(
    () => [
      { x: -1.2, z: -0.6, shirt: '#ec4899', rot: 0.4, scale: 0.92, speed: 6.2, delay: 0 },
      { x: 0.0, z: -0.4, shirt: '#06b6d4', rot: -0.8, scale: 0.95, speed: 6.8, delay: 1.2 },
      { x: 1.1, z: -0.5, shirt: '#8b5cf6', rot: 0.9, scale: 0.88, speed: 6.0, delay: 2.1 },
      { x: -0.8, z: 0.7, shirt: '#f59e0b', rot: 1.8, scale: 0.96, speed: 6.5, delay: 0.7 },
      { x: 0.6, z: 0.8, shirt: '#10b981', rot: -2.1, scale: 0.9, speed: 6.4, delay: 1.8 },
      { x: -1.5, z: 0.2, shirt: '#3b82f6', rot: 0.2, scale: 0.94, speed: 6.6, delay: 2.5 },
      { x: 1.4, z: 0.3, shirt: '#f43f5e', rot: -0.5, scale: 0.91, speed: 6.3, delay: 1.0 },
      { x: 0.0, z: 1.2, shirt: '#a855f7', rot: 3.14, scale: 0.93, speed: 6.7, delay: 0.4 },
    ],
    []
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // 1. Rotate Disco Ball
    if (discoBallRef.current) {
      discoBallRef.current.rotation.y = t * 1.6;
    }

    // 2. Animated DJ Bobbing
    if (djRef.current) {
      djRef.current.position.y = 0.52 + Math.abs(Math.sin(t * 6.5)) * 0.04;
      djRef.current.rotation.y = Math.sin(t * 2) * 0.15;
    }

    // 3. Animated Dancing Crowd (Grooving, hopping to the beat)
    dancersRef.current.forEach((dancer, i) => {
      if (!dancer) return;
      const d = dancers[i];
      const hop = Math.abs(Math.sin(t * d.speed + d.delay)) * 0.07;
      const sway = Math.sin(t * (d.speed * 0.5) + d.delay) * 0.18;
      dancer.position.y = 0.38 + hop;
      dancer.rotation.y = d.rot + sway;
    });

    // 4. Pulsing Multi-Color LED Floor Tiles
    floorTilesRef.current.forEach((mat, idx) => {
      if (!mat) return;
      const row = Math.floor(idx / gridCols);
      const col = idx % gridCols;
      const wave = Math.sin(t * 7 + row * 0.9 + col * 0.9);
      const colorIdx = Math.floor(Math.abs(t * 2 + row + col)) % DISCO_COLORS.length;
      mat.color.set(DISCO_COLORS[colorIdx]);
      mat.emissive.set(DISCO_COLORS[colorIdx]);
      mat.emissiveIntensity = 0.6 + wave * 0.5;
    });

    // 5. Sweeping Disco Moving Spotlights
    if (spotLight1Ref.current) {
      spotLight1Ref.current.position.x = Math.sin(t * 2.5) * 2.5;
      spotLight1Ref.current.position.z = Math.cos(t * 2.5) * 2.5;
      spotLight1Ref.current.intensity = 1.6 + Math.sin(t * 8) * 0.4;
    }
    if (spotLight2Ref.current) {
      spotLight2Ref.current.position.x = Math.cos(t * 3) * 2.2;
      spotLight2Ref.current.position.z = Math.sin(t * 3) * 2.2;
      spotLight2Ref.current.intensity = 1.6 + Math.cos(t * 8) * 0.4;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Dark Club Penthouse Base Floor Slab with LED perimeter accent */}
      <RoundedBox args={[topWidth + 0.8, 0.36, topDepth + 0.8]} radius={0.12} smoothness={4} position={[0, 0.18, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.25} />
      </RoundedBox>
      <mesh position={[0, 0.34, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[topWidth + 0.85, topDepth + 0.85]} />
        <meshBasicMaterial color="#ff007f" transparent opacity={0.7} />
      </mesh>

      {/* 2. 4 Architectural Corner Structural Pillars (NO glass walls - 100% open club!) */}
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <mesh
            key={`disco-col-${sx}-${sz}`}
            position={[sx * (topWidth / 2 - 0.35), penthouseHeight / 2, sz * (topDepth / 2 - 0.35)]}
            castShadow
          >
            <boxGeometry args={[0.55, penthouseHeight, 0.55]} />
            <meshStandardMaterial color="#090d16" metalness={0.92} roughness={0.15} />
          </mesh>
        ))
      )}

      {/* 3. DYNAMIC PULSING 6x6 LED DISCO DANCE FLOOR */}
      <group position={[0, 0.38, 0.1]}>
        {Array.from({ length: gridRows }).map((_, r) =>
          Array.from({ length: gridCols }).map((_, c) => {
            const idx = r * gridCols + c;
            const x = (c - (gridCols - 1) / 2) * tileSize;
            const z = (r - (gridRows - 1) / 2) * tileSize;
            return (
              <mesh key={`tile-${r}-${c}`} position={[x, 0.01, z]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[tileSize * 0.94, tileSize * 0.94]} />
                <meshStandardMaterial
                  ref={(el) => {
                    floorTilesRef.current[idx] = el;
                  }}
                  color={DISCO_COLORS[idx % DISCO_COLORS.length]}
                  emissive={DISCO_COLORS[idx % DISCO_COLORS.length]}
                  emissiveIntensity={1.0}
                  roughness={0.2}
                />
              </mesh>
            );
          })
        )}
      </group>

      {/* 4. ROTATING MIRROR DISCO BALL & LIGHT RIG */}
      <group position={[0, penthouseHeight - 0.5, 0.1]}>
        {/* Chrome hanging wire */}
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.6, 8]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} />
        </mesh>
        {/* Faceted Mirror Disco Ball */}
        <group ref={discoBallRef}>
          <mesh castShadow>
            <sphereGeometry args={[0.34, 20, 16]} />
            <meshStandardMaterial color="#ffffff" metalness={1.0} roughness={0.05} />
          </mesh>
          {/* Subtle glowing core */}
          <pointLight color="#ffffff" intensity={2.0} distance={5} />
        </group>
      </group>

      {/* Dynamic Sweeping Club Spotlights (Cyan & Magenta) */}
      <pointLight ref={spotLight1Ref} position={[0, penthouseHeight - 0.4, 0]} color="#00f0ff" intensity={2.0} distance={8} />
      <pointLight ref={spotLight2Ref} position={[0, penthouseHeight - 0.4, 0]} color="#ff007f" intensity={2.0} distance={8} />

      {/* 5. ELEVATED DJ STAGE, TURNTABLES & DJ */}
      <group position={[0, 0.38, -topDepth * 0.32]}>
        {/* DJ Riser Stage */}
        <RoundedBox args={[3.4, 0.22, 1.4]} radius={0.06} smoothness={3} position={[0, 0.11, 0]} castShadow>
          <meshStandardMaterial color="#090d16" metalness={0.8} />
        </RoundedBox>
        {/* Glowing Equalizer Front Graphic */}
        <mesh position={[0, 0.11, 0.71]}>
          <planeGeometry args={[3.2, 0.18]} />
          <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.8} />
        </mesh>

        {/* DJ Console Table */}
        <RoundedBox args={[2.4, 0.75, 0.6]} radius={0.04} smoothness={3} position={[0, 0.48, 0.25]} castShadow>
          <meshStandardMaterial color="#020617" metalness={0.9} roughness={0.2} />
        </RoundedBox>

        {/* Dual Vinyl Turntables & Mixer */}
        {[-0.6, 0.6].map((tx) => (
          <group key={`turntable-${tx}`} position={[tx, 0.87, 0.25]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 0.02, 24]} />
              <meshStandardMaterial color="#111827" metalness={0.9} />
            </mesh>
            <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.07, 0.07, 0.025, 16]} />
              <meshBasicMaterial color="#ec4899" />
            </mesh>
          </group>
        ))}
        {/* DJ Audio Mixer */}
        <mesh position={[0, 0.88, 0.25]}>
          <boxGeometry args={[0.38, 0.03, 0.42]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        {/* DJ Laptop */}
        <group position={[0, 0.9, 0.1]} rotation={[0, 0, 0]}>
          <mesh position={[0, 0.01, 0]}><boxGeometry args={[0.3, 0.015, 0.22]} /><meshStandardMaterial color="#475569" metalness={0.9} /></mesh>
          <mesh position={[0, 0.11, -0.1]} rotation={[-0.35, 0, 0]}><boxGeometry args={[0.3, 0.2, 0.015]} /><meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.6} /></mesh>
        </group>

        {/* Huge Club Speaker Stacks (Left & Right) */}
        {[-1.9, 1.9].map((spx) => (
          <group key={`speaker-${spx}`} position={[spx, 0.8, 0.1]}>
            <RoundedBox args={[0.65, 1.6, 0.55]} radius={0.04} smoothness={3}>
              <meshStandardMaterial color="#020617" metalness={0.85} />
            </RoundedBox>
            {/* Pulsing Subwoofer Cones */}
            {[-0.45, 0.1, 0.55].map((sy, si) => (
              <mesh key={`woofer-${si}`} position={[0, sy, 0.28]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.18, 0.14, 0.03, 16]} />
                <meshStandardMaterial color="#1e293b" metalness={0.9} emissive="#00f0ff" emissiveIntensity={0.2} />
              </mesh>
            ))}
          </group>
        ))}

        {/* The Live DJ Character */}
        <group ref={djRef} position={[0, 0.52, -0.25]}>
          <RealisticHuman
            shirtColor="#111827"
            skinTone="#d99a6c"
            hairColor="#1c1917"
            pose="standing"
            height={0.95}
            isDayMode={false}
          />
          {/* DJ Headphones */}
          <group position={[0, 0.86, 0]}>
            <mesh position={[0, 0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.09, 0.018, 8, 16, Math.PI]} />
              <meshStandardMaterial color="#ff007f" emissive="#ff007f" emissiveIntensity={0.5} />
            </mesh>
            {[-0.09, 0.09].map((hx) => (
              <mesh key={`earpad-${hx}`} position={[hx, 0.02, 0]}>
                <cylinderGeometry args={[0.035, 0.035, 0.025, 12]} />
                <meshStandardMaterial color="#ff007f" metalness={0.8} />
              </mesh>
            ))}
          </group>
        </group>
      </group>

      {/* 6. ANIMATED DANCING PARTY CROWD ON THE DANCE FLOOR */}
      {dancers.map((d, i) => (
        <group
          key={`dancer-${i}`}
          ref={(el) => {
            dancersRef.current[i] = el;
          }}
          position={[d.x, 0.38, d.z]}
          scale={d.scale}
        >
          <RealisticHuman
            shirtColor={d.shirt}
            pose="dancing"
            height={1.0}
            isDayMode={isDayMode}
          />
        </group>
      ))}

      {/* 7. NIGHTCLUB VIP LOUNGES & COCKTAIL BAR */}
      {/* Left VIP Lounge Area */}
      <group position={[-topWidth * 0.3, 0.38, 0.2]} rotation={[0, 0.3, 0]}>
        <RoundedBox args={[1.8, 0.45, 0.8]} radius={0.06} smoothness={3} position={[0, 0.22, 0]} castShadow>
          <meshStandardMaterial color="#1e1b4b" roughness={0.6} />
        </RoundedBox>
        {/* VIP Glowing Table with Champagne Bucket */}
        <mesh position={[0, 0.2, 0.65]}>
          <cylinderGeometry args={[0.3, 0.3, 0.4, 16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.45, 0.65]}>
          <cylinderGeometry args={[0.1, 0.08, 0.14, 12]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
        </mesh>
        <pointLight position={[0, 0.55, 0.65]} color="#a855f7" intensity={0.8} distance={2} />
      </group>

      {/* Right Nightclub Bar Counter */}
      <group position={[topWidth * 0.3, 0.38, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <RoundedBox args={[2.4, 0.85, 0.5]} radius={0.05} smoothness={3} position={[0, 0.42, 0]} castShadow>
          <meshStandardMaterial color="#020617" metalness={0.85} />
        </RoundedBox>
        <mesh position={[0, 0.86, 0]}>
          <boxGeometry args={[2.5, 0.05, 0.58]} />
          <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.6} />
        </mesh>
        {/* Neon Bottle Rack */}
        <group position={[0, 0.7, -0.4]}>
          <boxGeometry args={[2.0, 0.8, 0.15]} />
          <meshStandardMaterial color="#ff007f" emissive="#ff007f" emissiveIntensity={0.4} />
        </group>
        {/* Bar Stools */}
        {[-0.7, 0, 0.7].map((bx) => (
          <group key={`cstool-${bx}`} position={[bx, 0, 0.5]}>
            <mesh position={[0, 0.28, 0]}><cylinderGeometry args={[0.03, 0.04, 0.56, 8]} /><meshStandardMaterial color="#0f172a" metalness={0.9} /></mesh>
            <mesh position={[0, 0.58, 0]}><cylinderGeometry args={[0.16, 0.16, 0.05, 16]} /><meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.3} /></mesh>
          </group>
        ))}
      </group>

      {/* 8. NEON CLUB SIGNAGE (Floating Open Air) */}
      <group position={[0, 2.35, topDepth / 2 - 0.2]}>
        <Text position={[0, 0.26, 0]} fontSize={0.38} color="#ff007f" anchorX="center" anchorY="middle" fontWeight="bold">
          CLUB PENTHOUSE
        </Text>
        <Text position={[0, -0.16, 0]} fontSize={0.18} color="#00f0ff" anchorX="center" anchorY="middle" fontWeight="bold">
          SKY DISCO · LIVE DJ & DANCE FLOOR
        </Text>
      </group>
    </group>
  );
}

/** A deliberately clean top floor: a white structural deck and its helipad. */
export function BuildingCrown({ topWidth, topDepth, roofY, isDayMode = false, floors = [] }: BuildingCrownProps) {
  const padRadius = Math.min(topWidth, topDepth) * 0.38;

  // Extract top-ranked floor and its sponsor brand
  const topFloor = useMemo(() => {
    if (!floors || floors.length === 0) return null;
    return [...floors].sort((a, b) => b.price - a.price)[0] || floors[floors.length - 1];
  }, [floors]);

  const topBrandTitle = topFloor?.brandTitle || topFloor?.ownerName || 'W3Tech';
  const topBrandPrice = topFloor?.price ? `₹${topFloor.price.toLocaleString('en-IN')}` : '₹50,000';
  const topBrandTagline = topFloor?.tagline || 'PINNACLE SKYLINE LEADER';

  // Dynamic font sizing for billboard text to ensure long strings (e.g. SHOPIFYTHEMEDOWNLOADER) never overflow
  const topBrandFontSize = useMemo(() => {
    const len = topBrandTitle.length || 1;
    // Available billboard width is ~4.4 units
    // Standard bold characters take ~0.60 * fontSize in width
    return Math.min(0.54, Math.max(0.18, 4.4 / (len * 0.60)));
  }, [topBrandTitle]);

  const topBottomText = `${topBrandPrice} · ${topBrandTagline.toUpperCase().slice(0, 36)}`;
  const topBottomFontSize = useMemo(() => {
    const len = topBottomText.length || 1;
    return Math.min(0.19, Math.max(0.11, 4.5 / (len * 0.55)));
  }, [topBottomText]);

  const helicopterX = 1.15;
  const helicopterZ = 0.05;
  const helicopterHoverY = 2.45;
  const helicopterUndersideY = 2.04;
  // Door position is offset toward the cockpit side, away from the tail boom.
  const helicopterDoorX = helicopterX - 0.24;
  const helicopterDoorZ = helicopterZ + 0.5;
  const helicopterRef = useRef<THREE.Group>(null);
  const rotorRef = useRef<THREE.Group>(null);
  const tailRotorRef = useRef<THREE.Group>(null);
  const passengerRef = useRef<THREE.Group>(null);
  const ropeRef = useRef<THREE.Mesh>(null);
  const pizzaRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const hoverOffset = Math.sin(time * 1.7) * 0.06;
    if (helicopterRef.current) helicopterRef.current.position.y = helicopterHoverY + hoverOffset;
    if (rotorRef.current) rotorRef.current.rotation.y = time * 8;
    if (tailRotorRef.current) tailRotorRef.current.rotation.z = time * 11;
    const sequence = time % 15;
    const kioskX = -topWidth * 0.38 + 0.2;
    const kioskZ = -topDepth * 0.28 + 0.82;

    if (passengerRef.current) {
      if (sequence < 4) {
        const progress = sequence / 4;
        passengerRef.current.position.set(helicopterDoorX, 1.72 - progress * 1.04, helicopterDoorZ);
        passengerRef.current.rotation.y = -0.45;
      } else if (sequence < 9) {
        const progress = (sequence - 4) / 5;
        passengerRef.current.position.set(THREE.MathUtils.lerp(helicopterDoorX, kioskX, progress), 0.68 + Math.abs(Math.sin(progress * Math.PI * 5)) * 0.035, THREE.MathUtils.lerp(helicopterDoorZ, kioskZ, progress));
        passengerRef.current.rotation.y = -0.85;
      } else {
        passengerRef.current.position.set(kioskX, 0.66, kioskZ);
        passengerRef.current.rotation.y = -1.35;
      }
    }
    if (ropeRef.current) {
      ropeRef.current.visible = sequence < 4;
      if (sequence < 4) {
        const personY = 1.72 - (sequence / 4) * 1.04;
        const length = Math.max(0.15, helicopterUndersideY + hoverOffset - personY);
        ropeRef.current.scale.y = length;
        ropeRef.current.position.set(helicopterDoorX, personY + length / 2, helicopterDoorZ);
      }
    }
    if (pizzaRef.current) pizzaRef.current.visible = sequence >= 9;
  });

  const penthouseHeight = 3.0;

  return (
    <group position={[0, roofY, 0]}>
      {/* 1. OPEN-AIR PENTHOUSE DISCO CLUB (Dancing crowd, DJ, pulsing LED floor, mirror disco ball) */}
      <PenthouseDiscoClub
        topWidth={topWidth}
        topDepth={topDepth}
        penthouseHeight={penthouseHeight}
        isDayMode={isDayMode}
      />

      {/* ========================================================================= */}
      {/* 2. ROOFTOP TERRACE LEVEL (Directly above the Open-Air Penthouse Level)    */}
      {/* ========================================================================= */}
      <group position={[0, penthouseHeight, 0]}>
        {/* Raised white concrete roof deck slab */}
        <RoundedBox args={[topWidth + 1.05, 0.44, topDepth + 1.05]} radius={0.13} smoothness={4} position={[0, 0.22, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={isDayMode ? '#f5f5f4' : '#d6d3d1'} metalness={0.2} roughness={0.62} />
        </RoundedBox>
        <mesh position={[0, -0.04, 0]} castShadow>
          <boxGeometry args={[topWidth + 1.1, 0.1, topDepth + 1.1]} />
          <meshStandardMaterial color="#292524" metalness={0.75} roughness={0.28} />
        </mesh>

        {/* Bright yellow helipad (H) with high-contrast decal on the roof deck. */}
        <group position={[0, 0.47, 0]}>
          {/* Dark rimmed base disc */}
          <mesh position={[0, -0.035, 0]} receiveShadow>
            <cylinderGeometry args={[padRadius * 1.08, padRadius * 1.08, 0.09, 48]} />
            <meshStandardMaterial color="#292524" metalness={0.72} roughness={0.3} />
          </mesh>
          {/* Bright yellow pad surface */}
          <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[padRadius, 48]} />
            <meshStandardMaterial color="#f8d765" metalness={0.15} roughness={0.4} />
          </mesh>
          {/* Prominent yellow circular border ring */}
          <mesh position={[0, 0.014, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[padRadius * 0.97, padRadius * 0.995, 48]} />
            <meshBasicMaterial color="#facc15" />
          </mesh>
          {/* Inner painted accent ring */}
          <mesh position={[0, 0.016, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[padRadius * 0.16, padRadius * 0.28, 48]} />
            <meshBasicMaterial color="#facc15" />
          </mesh>
          {/* High-contrast central H logo */}
          <Text position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={padRadius * 0.95} color="#111827" anchorX="center" anchorY="middle" fontWeight="bold">H</Text>
        </group>

        {/* Soft painted safety markers and a contact shadow ground the landing zone. */}
        <mesh position={[helicopterX, 0.485, helicopterZ]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.82, 32]} /><meshBasicMaterial color="#111827" transparent opacity={0.13} depthWrite={false} /></mesh>

        {/* ========================================================================= */}
        {/* 1. MAIN GRAND BILLBOARD (CENTER BACK) - PROMINENT TOP-RANKED BRAND NAME  */}
        {/* ========================================================================= */}
        <group position={[0, 0.5, -topDepth / 2 - 0.45]} rotation={[0, Math.PI, 0]}>
          {/* Heavy Steel Support Columns & Cross Braces */}
          {[-1.85, 1.85].map((x) => (
            <group key={`bb-main-col-${x}`}>
              <mesh position={[x, 0.75, 0]}>
                <boxGeometry args={[0.13, 1.6, 0.13]} />
                <meshStandardMaterial color="#171717" metalness={0.92} roughness={0.25} />
              </mesh>
              <mesh position={[x, -0.02, 0]}>
                <cylinderGeometry args={[0.22, 0.22, 0.08, 16]} />
                <meshStandardMaterial color="#171717" metalness={0.95} />
              </mesh>
            </group>
          ))}
          {/* Diagonal Angle Bracing */}
          <mesh position={[-1.45, 0.45, 0]} rotation={[0, 0, -0.6]}>
            <boxGeometry args={[0.08, 1.15, 0.09]} />
            <meshStandardMaterial color="#171717" metalness={0.9} />
          </mesh>
          <mesh position={[1.45, 0.45, 0]} rotation={[0, 0, 0.6]}>
            <boxGeometry args={[0.08, 1.15, 0.09]} />
            <meshStandardMaterial color="#171717" metalness={0.9} />
          </mesh>

          {/* Main Billboard Chassis Box */}
          <mesh position={[0, 1.55, 0]} castShadow>
            <boxGeometry args={[5.2, 2.1, 0.18]} />
            <meshStandardMaterial color="#0b0f19" metalness={0.9} roughness={0.35} />
          </mesh>
          {/* Top & Bottom Cyber Trim Bars */}
          <mesh position={[0, 2.62, 0]}>
            <boxGeometry args={[5.35, 0.1, 0.22]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.6} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.48, 0]}>
            <boxGeometry args={[5.35, 0.1, 0.22]} />
            <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.6} metalness={0.8} />
          </mesh>

          {/* Overhead Floodlight Lamps */}
          {[-1.6, -0.55, 0.55, 1.6].map((fx, fi) => (
            <group key={`bb-flood-${fi}`} position={[fx, 2.7, 0.35]}>
              <mesh rotation={[0.4, 0, 0]}>
                <boxGeometry args={[0.24, 0.12, 0.18]} />
                <meshStandardMaterial color="#222" metalness={0.9} />
              </mesh>
              <mesh position={[0, -0.05, 0]} rotation={[0.4, 0, 0]}>
                <planeGeometry args={[0.2, 0.1]} />
                <meshStandardMaterial color="#ffffff" emissive="#fff" emissiveIntensity={1.8} />
              </mesh>
            </group>
          ))}

          {/* FRONT DISPLAY: TOP RANK BRAND */}
          <mesh position={[0, 1.55, 0.1]}>
            <planeGeometry args={[4.95, 1.85]} />
            <meshStandardMaterial color="#060c18" roughness={0.2} metalness={0.5} />
          </mesh>
          {/* Front Golden Rank Crown Pill */}
          <Text
            position={[0, 2.15, 0.15]}
            fontSize={0.21}
            color="#f59e0b"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
            maxWidth={4.6}
            textAlign="center"
          >
            👑 #1 TOP RANKED BRAND
          </Text>
          {/* Front Main Brand Title */}
          <Text
            position={[0, 1.62, 0.15]}
            fontSize={topBrandFontSize}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
            maxWidth={4.6}
            textAlign="center"
          >
            {topBrandTitle.toUpperCase()}
          </Text>
          {/* Front Price & Tagline */}
          <Text
            position={[0, 1.08, 0.15]}
            fontSize={topBottomFontSize}
            color="#38bdf8"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
            maxWidth={4.6}
            textAlign="center"
          >
            {topBottomText}
          </Text>

          {/* BACK DISPLAY: TOP RANK BRAND */}
          <mesh position={[0, 1.55, -0.1]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[4.95, 1.85]} />
            <meshStandardMaterial color="#060c18" roughness={0.2} metalness={0.5} />
          </mesh>
          <Text
            position={[0, 2.15, -0.15]}
            rotation={[0, Math.PI, 0]}
            fontSize={0.21}
            color="#f59e0b"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
            maxWidth={4.6}
            textAlign="center"
          >
            👑 #1 TOP RANKED BRAND
          </Text>
          <Text
            position={[0, 1.62, -0.15]}
            rotation={[0, Math.PI, 0]}
            fontSize={topBrandFontSize}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
            maxWidth={4.6}
            textAlign="center"
          >
            {topBrandTitle.toUpperCase()}
          </Text>
          <Text
            position={[0, 1.08, -0.15]}
            rotation={[0, Math.PI, 0]}
            fontSize={topBottomFontSize}
            color="#38bdf8"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
            maxWidth={4.6}
            textAlign="center"
          >
            {topBottomText}
          </Text>
        </group>

        {/* ========================================================================= */}
        {/* 2. UPSPACE BILLBOARD #1 (EAST SIDE PATIO EDGE)                           */}
        {/* ========================================================================= */}
        <group position={[topWidth / 2 + 0.48, 0.47, 0]} rotation={[0, -Math.PI / 2, 0]}>
          {/* Support Columns */}
          {[-1.7, 1.7].map((x) => (
            <mesh key={`bb-e-col-${x}`} position={[x, 0.65, 0]}>
              <boxGeometry args={[0.1, 1.4, 0.1]} />
              <meshStandardMaterial color="#171717" metalness={0.92} />
            </mesh>
          ))}
          {[-1.7, 1.7].map((x) => (
            <mesh key={`bb-e-base-${x}`} position={[x, -0.03, 0]}>
              <cylinderGeometry args={[0.18, 0.18, 0.08, 14]} />
              <meshStandardMaterial color="#171717" metalness={0.92} />
            </mesh>
          ))}
          {/* Diagonal Braces */}
          <mesh position={[-1.4, 0.35, 0]} rotation={[0, 0, -0.55]}>
            <boxGeometry args={[0.07, 0.95, 0.08]} />
            <meshStandardMaterial color="#171717" metalness={0.9} />
          </mesh>
          <mesh position={[1.4, 0.35, 0]} rotation={[0, 0, 0.55]}>
            <boxGeometry args={[0.07, 0.95, 0.08]} />
            <meshStandardMaterial color="#171717" metalness={0.9} />
          </mesh>

          {/* Billboard Chassis */}
          <mesh position={[0, 1.25, 0]} castShadow>
            <boxGeometry args={[4.6, 1.45, 0.14]} />
            <meshStandardMaterial color="#090d16" metalness={0.88} roughness={0.3} />
          </mesh>
          <mesh position={[0, 1.99, 0]}>
            <boxGeometry args={[4.75, 0.08, 0.18]} />
            <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0, 0.51, 0]}>
            <boxGeometry args={[4.75, 0.08, 0.18]} />
            <meshStandardMaterial color="#171717" metalness={0.9} />
          </mesh>

          {/* FRONT DISPLAY: UPSPACE */}
          <mesh position={[0, 1.25, 0.08]}>
            <planeGeometry args={[4.38, 1.25]} />
            <meshStandardMaterial color="#051020" roughness={0.2} metalness={0.6} />
          </mesh>
          <Text position={[0, 1.68, 0.12]} fontSize={0.17} color="#38bdf8" anchorX="center" anchorY="middle" fontWeight="bold" maxWidth={4.2} textAlign="center">
            🌐 3D VIRTUAL ADVERTISING SKYLINE
          </Text>
          <Text position={[0, 1.28, 0.12]} fontSize={0.54} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="bold" maxWidth={4.2} textAlign="center">
            UpSpace
          </Text>
          <Text position={[0, 0.88, 0.12]} fontSize={0.18} color="#facc15" anchorX="center" anchorY="middle" fontWeight="bold" maxWidth={4.2} textAlign="center">
            CLAIM YOUR FLOOR ON THE SKYLINE
          </Text>

          {/* BACK DISPLAY: UPSPACE */}
          <mesh position={[0, 1.25, -0.08]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[4.38, 1.25]} />
            <meshStandardMaterial color="#051020" roughness={0.2} metalness={0.6} />
          </mesh>
          <Text position={[0, 1.68, -0.12]} rotation={[0, Math.PI, 0]} fontSize={0.17} color="#38bdf8" anchorX="center" anchorY="middle" fontWeight="bold" maxWidth={4.2} textAlign="center">
            🌐 3D VIRTUAL ADVERTISING SKYLINE
          </Text>
          <Text position={[0, 1.28, -0.12]} rotation={[0, Math.PI, 0]} fontSize={0.54} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="bold" maxWidth={4.2} textAlign="center">
            UpSpace
          </Text>
          <Text position={[0, 0.88, -0.12]} rotation={[0, Math.PI, 0]} fontSize={0.18} color="#facc15" anchorX="center" anchorY="middle" fontWeight="bold" maxWidth={4.2} textAlign="center">
            CLAIM YOUR FLOOR ON THE SKYLINE
          </Text>
        </group>

        {/* Roaming low-poly visitors add scale to the upper roof deck. */}
        <group position={[0, 0.5, 0]}>
          {[
            { x: -topWidth * 0.18, z: topDepth * 0.16, c: '#ef4444', r: Math.PI, s: 0.9 },
            { x: -topWidth * 0.05, z: topDepth * 0.32, c: '#3b82f6', r: Math.PI, s: 0.82 },
            { x: topWidth * 0.2, z: topDepth * 0.05, c: '#10b981', r: Math.PI * 0.9, s: 0.95 },
          ].map((p, i) => (
            <group key={`roof-${i}`} position={[p.x, 0, p.z]} rotation={[0, p.r, 0]} scale={p.s}>
              <RealisticHuman
                shirtColor={p.c}
                height={1.0}
                isDayMode={isDayMode}
                pose="standing"
                skinTone={['#f4c7a1', '#d99a6c', '#9a5d3b'][i % 3]}
                hairColor={['#1c1917', '#3f2a1d', '#713f12'][i % 3]}
                headTilt={0.12}
              />
              <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.16, 16]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.2} />
              </mesh>
            </group>
          ))}
        </group>

        {/* Downloaded CC0 Poly Pizza aircraft, centred and recolored for this rooftop. */}
        <group ref={helicopterRef} position={[helicopterX, helicopterHoverY, helicopterZ]} rotation={[0, -0.45, 0]}>
          <PolyPizzaHelicopter />
        </group>

        {/* Passenger journey: rope descent, walk to the pizzeria, then pizza break. */}
        <mesh ref={ropeRef} position={[helicopterDoorX, 1.88, helicopterDoorZ]}><boxGeometry args={[0.018, 1, 0.018]} /><meshStandardMaterial color="#292524" /></mesh>
        <group ref={passengerRef} position={[helicopterDoorX, 1.72, helicopterDoorZ]}>
          <mesh position={[0, 0.25, 0]}><capsuleGeometry args={[0.085, 0.27, 4, 8]} /><meshStandardMaterial color="#2563eb" roughness={0.75} /></mesh>
          <mesh position={[0, 0.5, 0]}><sphereGeometry args={[0.1, 10, 10]} /><meshStandardMaterial color="#d9a07a" roughness={0.92} /></mesh>
          <mesh position={[-0.1, 0.27, 0.02]} rotation={[0, 0, 0.45]}><boxGeometry args={[0.035, 0.24, 0.035]} /><meshStandardMaterial color="#2563eb" /></mesh>
          <mesh position={[0.1, 0.27, 0.02]} rotation={[0, 0, -0.45]}><boxGeometry args={[0.035, 0.24, 0.035]} /><meshStandardMaterial color="#2563eb" /></mesh>
          <mesh position={[-0.055, 0.02, 0]} rotation={[0, 0, 0.08]}><boxGeometry args={[0.055, 0.25, 0.055]} /><meshStandardMaterial color="#1f2937" /></mesh>
          <mesh position={[0.055, 0.02, 0]} rotation={[0, 0, -0.08]}><boxGeometry args={[0.055, 0.25, 0.055]} /><meshStandardMaterial color="#1f2937" /></mesh>
          <mesh ref={pizzaRef} position={[0.16, 0.36, 0.12]} rotation={[-Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.1, 0.1, 0.025, 16]} /><meshStandardMaterial color="#f59e0b" emissive="#f97316" emissiveIntensity={0.2} /></mesh>
        </group>

        {/* Left-side pizzeria kiosk with green fascia and red/white striped awning. */}
        <group position={[-topWidth * 0.38, 0.53, -topDepth * 0.28]} rotation={[0, 0.18, 0]} scale={[1.32, 1.32, 1.32]}>
          <mesh position={[0, 0.36, 0]} castShadow><boxGeometry args={[1.55, 0.74, 0.94]} /><meshStandardMaterial color="#fafaf9" roughness={0.65} /></mesh>
          <mesh position={[0, 0.7, 0]}><boxGeometry args={[1.64, 0.1, 1.0]} /><meshStandardMaterial color="#15803d" /></mesh>
          <mesh position={[0, 0.37, 0.49]}><planeGeometry args={[0.85, 0.4]} /><meshStandardMaterial color="#1f1f1f" emissive="#512116" emissiveIntensity={0.35} /></mesh>
          <mesh position={[0, 0.14, 0.55]}><boxGeometry args={[1.05, 0.07, 0.24]} /><meshStandardMaterial color="#d6d3d1" roughness={0.55} /></mesh>
          {/* Stone service counter, pizza oven and open kitchen glow. */}
          <RoundedBox args={[0.92, 0.28, 0.22]} radius={0.03} smoothness={3} position={[0, 0.22, 0.61]} castShadow><meshStandardMaterial color="#d7d0c6" roughness={0.7} /></RoundedBox>
          <RoundedBox args={[0.38, 0.45, 0.34]} radius={0.08} smoothness={3} position={[-0.52, 0.29, -0.18]} castShadow><meshStandardMaterial color="#bb4a2d" roughness={0.72} /></RoundedBox>
          <mesh position={[-0.52, 0.28, 0.0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[0.115, 0.035, 10, 20, Math.PI]} /><meshStandardMaterial color="#27272a" /></mesh>
          <pointLight position={[-0.52, 0.29, 0.05]} color="#ff7a24" intensity={0.7} distance={1.6} />
          <mesh position={[0.63, 0.38, 0.485]}><planeGeometry args={[0.21, 0.32]} /><meshStandardMaterial color="#e7e5e4" roughness={0.7} /></mesh>
          <Text position={[0.63, 0.4, 0.5]} fontSize={0.055} color="#334155" anchorX="center" anchorY="middle">MENU</Text>
          <mesh position={[-0.58, 0.31, 0.49]}><planeGeometry args={[0.28, 0.5]} /><meshPhysicalMaterial color="#183142" metalness={0.4} roughness={0.12} transparent opacity={0.82} /></mesh>
          <mesh position={[0.58, 0.31, 0.49]}><planeGeometry args={[0.28, 0.5]} /><meshPhysicalMaterial color="#183142" metalness={0.4} roughness={0.12} transparent opacity={0.82} /></mesh>
          {[-0.58, -0.29, 0, 0.29, 0.58].map((x, index) => <mesh key={x} position={[x, 0.62, 0.61]} rotation={[0.5, 0, 0]}><boxGeometry args={[0.28, 0.04, 0.34]} /><meshStandardMaterial color={index % 2 === 0 ? '#d9362b' : '#f8fafc'} /></mesh>)}
          {/* Fresh pizzas on the counter: crust, sauce, cheese, and pepperoni. */}
          {[[-0.16, 0.39], [0.25, 0.42]].map(([x, y], pizzaIndex) => <group key={`counter-pizza-${pizzaIndex}`} position={[x, y, 0.72]} rotation={[-Math.PI / 2, 0, pizzaIndex * 0.3]}><mesh><cylinderGeometry args={[0.13, 0.13, 0.025, 20]} /><meshStandardMaterial color="#d98a3c" roughness={0.8} /></mesh><mesh position={[0, 0.016, 0]}><cylinderGeometry args={[0.105, 0.105, 0.008, 20]} /><meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.15} /></mesh>{[[0.04, 0.03], [-0.04, 0.02], [0, -0.045]].map(([px, pz], index) => <mesh key={index} position={[px, 0.026, pz]}><sphereGeometry args={[0.018, 8, 8]} /><meshStandardMaterial color="#b91c1c" /></mesh>)}</group>)}
          <Text position={[0, 0.93, 0.51]} fontSize={0.22} color="#d9362b" anchorX="center" anchorY="middle" fontWeight="bold">Pizzeria</Text>
          {/* Big rooftop pizza sign: golden crust, cheese, and pepperoni. */}
          <group position={[0, 1.13, 0.03]} rotation={[-Math.PI / 2, 0, 0]}>
            <mesh><cylinderGeometry args={[0.23, 0.23, 0.05, 24]} /><meshStandardMaterial color="#d78a3c" roughness={0.8} /></mesh>
            <mesh position={[0, 0.03, 0]}><cylinderGeometry args={[0.19, 0.19, 0.012, 24]} /><meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.18} /></mesh>
            {/* Four cut lines make eight visible pizza slices. */}
            {[0, Math.PI / 4, Math.PI / 2, Math.PI * 0.75].map((angle) => <mesh key={angle} position={[0, 0.049, 0]} rotation={[0, angle, 0]}><boxGeometry args={[0.37, 0.011, 0.011]} /><meshStandardMaterial color="#c67a2b" roughness={0.86} /></mesh>)}
            {[[0.07, 0.05], [-0.07, 0.05], [0, -0.08], [0.1, -0.055], [-0.11, -0.035]].map(([x, z], index) => <mesh key={`pepperoni-${index}`} position={[x, 0.052, z]}><cylinderGeometry args={[0.032, 0.032, 0.012, 12]} /><meshStandardMaterial color="#b91c1c" roughness={0.7} /></mesh>)}
            {[[0.03, 0.11], [-0.12, 0.02], [0.1, -0.01]].map(([x, z], index) => <mesh key={`pepper-${index}`} position={[x, 0.055, z]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.023, 0.008, 6, 10]} /><meshStandardMaterial color="#3f8f4d" roughness={0.7} /></mesh>)}
            {[[0.12, 0.08], [-0.03, -0.11]].map(([x, z], index) => <mesh key={`mushroom-${index}`} position={[x, 0.055, z]}><sphereGeometry args={[0.025, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#f3dfbd" roughness={0.9} /></mesh>)}
          </group>
          <mesh position={[0.48, 1.02, -0.12]}><cylinderGeometry args={[0.08, 0.1, 0.38, 10]} /><meshStandardMaterial color="#475569" metalness={0.76} /></mesh>
          <pointLight position={[0, 0.38, 0.2]} color="#ffb35c" intensity={0.9} distance={2.8} />
          {/* Small rooftop patio table with pizza and two red café stools. */}
          <group position={[0.55, 0.04, 1.08]}>
            <mesh position={[0, 0.22, 0]}><cylinderGeometry args={[0.18, 0.18, 0.04, 18]} /><meshStandardMaterial color="#f8fafc" roughness={0.42} /></mesh>
            <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.026, 0.045, 0.22, 10]} /><meshStandardMaterial color="#27272a" metalness={0.85} /></mesh>
            <mesh position={[0, 0.25, 0]} rotation={[-Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.11, 0.11, 0.025, 20]} /><meshStandardMaterial color="#fbbf24" /></mesh>
            {[-0.29, 0.29].map((x) => <group key={x} position={[x, 0.1, 0]}><mesh><cylinderGeometry args={[0.11, 0.11, 0.12, 12]} /><meshStandardMaterial color="#cf3f31" /></mesh><mesh position={[0, -0.11, 0]}><cylinderGeometry args={[0.025, 0.025, 0.12, 8]} /><meshStandardMaterial color="#27272a" /></mesh></group>)}
          </group>
        </group>

        {/* Roof-edge lamps and planters add scale without crowding the helipad. */}
        {[-1, 1].map((side) => <group key={`roof-lamp-${side}`} position={[side * (topWidth / 2 + 0.18), 0.52, topDepth * 0.18]}><mesh position={[0, 0.34, 0]}><cylinderGeometry args={[0.025, 0.035, 0.68, 8]} /><meshStandardMaterial color="#242424" metalness={0.85} /></mesh><mesh position={[side * -0.1, 0.67, 0]} rotation={[0, 0, side * 0.75]}><boxGeometry args={[0.22, 0.035, 0.035]} /><meshStandardMaterial color="#242424" /></mesh><mesh position={[side * -0.18, 0.64, 0]}><sphereGeometry args={[0.065, 10, 10]} /><meshStandardMaterial color="#fff7a8" emissive="#ffff55" emissiveIntensity={1.4} /></mesh><pointLight position={[side * -0.18, 0.62, 0]} color="#ffe98a" intensity={0.8} distance={3} /></group>)}
        {[[-topWidth * 0.43, -topDepth * 0.42], [topWidth * 0.43, topDepth * 0.38]].map(([x, z], index) => <group key={`roof-plant-${index}`} position={[x, 0.55, z]}><mesh><cylinderGeometry args={[0.13, 0.17, 0.2, 12]} /><meshStandardMaterial color="#a65e2e" roughness={0.85} /></mesh><mesh position={[0, 0.22, 0]}><sphereGeometry args={[0.2, 12, 10]} /><meshStandardMaterial color="#4d7c3f" roughness={0.92} /></mesh></group>)}
      </group>
    </group>
  );
}
