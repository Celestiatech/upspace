'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text, useGLTF } from '@react-three/drei';
import { RealisticHuman } from './RealisticHuman';

interface BuildingCrownProps {
  topWidth: number;
  topDepth: number;
  roofY: number;
  themeColor: string;
  isDayMode?: boolean;
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

/** A deliberately clean top floor: a white structural deck and its helipad. */
export function BuildingCrown({ topWidth, topDepth, roofY, isDayMode = false }: BuildingCrownProps) {
  const padRadius = Math.min(topWidth, topDepth) * 0.38;
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

  return (
    <group position={[0, roofY, 0]}>
      {/* Raised white concrete top-floor slab. */}
      <RoundedBox args={[topWidth + 1.05, 0.44, topDepth + 1.05]} radius={0.13} smoothness={4} position={[0, 0.22, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={isDayMode ? '#f5f5f4' : '#d6d3d1'} metalness={0.2} roughness={0.62} />
      </RoundedBox>
      <mesh position={[0, -0.04, 0]} castShadow>
        <boxGeometry args={[topWidth + 1.1, 0.1, topDepth + 1.1]} />
        <meshStandardMaterial color="#292524" metalness={0.75} roughness={0.28} />
      </mesh>

      {/* Structural support columns rooting the terrace deck to the floor below */}
      <group position={[0, 0, 0]}>
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
          <mesh key={`corner-support-${i}`} position={[sx * (topWidth / 2 - 0.35), -1.5, sz * (topDepth / 2 - 0.35)]} castShadow>
            <boxGeometry args={[0.55, 3.0, 0.55]} />
            <meshStandardMaterial color={isDayMode ? '#e7e5e4' : '#a8a29e'} metalness={0.3} roughness={0.55} />
          </mesh>
        ))}
      </group>

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

      {/* Center billboard structure mounted behind the roof deck. */}
      <group position={[0, 0.5, -topDepth / 2 - 0.1]} rotation={[0, Math.PI, 0]}>
        {[-1.3, 1.3].map((x) => <mesh key={`bb-col-${x}`} position={[x, 0.4, 0]}><boxGeometry args={[0.09, 1.15, 0.09]} /><meshStandardMaterial color="#1c1917" metalness={0.85} roughness={0.3} /></mesh>)}
        <mesh position={[0, 1.02, 0]} castShadow><boxGeometry args={[3.0, 1.3, 0.12]} /><meshStandardMaterial color="#f8fafc" roughness={0.5} /></mesh>
        <mesh position={[0, 1.62, 0]}><boxGeometry args={[3.12, 0.08, 0.16]} /><meshStandardMaterial color="#171717" metalness={0.88} /></mesh>
        <mesh position={[0, 0.42, 0]}><boxGeometry args={[3.12, 0.08, 0.16]} /><meshStandardMaterial color="#171717" metalness={0.88} /></mesh>
        <mesh position={[0, 1.04, 0.07]}><planeGeometry args={[2.85, 1.16]} /><meshBasicMaterial color="#0b1b2b" /></mesh>
        <Text position={[0, 1.1, 0.13]} fontSize={0.5} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="bold">UpSpace</Text>
        <Text position={[0, 0.7, 0.13]} fontSize={0.2} color="#f8d765" anchorX="center" anchorY="middle">THE TOP FLOOR AWAITS</Text>
        <mesh position={[0, 1.04, -0.07]} rotation={[0, Math.PI, 0]}><planeGeometry args={[2.85, 1.16]} /><meshBasicMaterial color="#0b1b2b" /></mesh>
        <Text position={[0, 1.1, -0.13]} rotation={[0, Math.PI, 0]} fontSize={0.5} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="bold">UpSpace</Text>
        <Text position={[0, 0.7, -0.13]} rotation={[0, Math.PI, 0]} fontSize={0.2} color="#f8d765" anchorX="center" anchorY="middle">THE TOP FLOOR AWAITS</Text>
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

      {/* Procedural aircraft remains available as a hidden fallback. */}
      <group visible={false} position={[0.12, 1.82, 0.05]} rotation={[0, -0.45, 0]}>
        {/* Fuselage and faceted, smoke-tinted cockpit canopy. */}
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow><capsuleGeometry args={[0.33, 1.02, 8, 20]} /><meshStandardMaterial color="#171717" metalness={0.84} roughness={0.17} /></mesh>
        <mesh position={[-0.4, 0.04, 0]} scale={[1.15, 1, 1]}><sphereGeometry args={[0.31, 16, 12, 0, Math.PI * 1.15]} /><meshPhysicalMaterial color="#1e3a4b" metalness={0.58} roughness={0.06} transmission={0.16} transparent opacity={0.94} clearcoat={1} /></mesh>
        <mesh position={[-0.08, 0.29, 0]}><boxGeometry args={[0.54, 0.12, 0.48]} /><meshStandardMaterial color="#f06b2e" metalness={0.58} roughness={0.27} /></mesh>
        {[-0.16, 0.16].map((z) => <mesh key={`engine-${z}`} position={[0.25, 0.28, z]} rotation={[0, Math.PI / 2, 0]}><cylinderGeometry args={[0.09, 0.11, 0.32, 12]} /><meshStandardMaterial color="#292929" metalness={0.9} roughness={0.2} /></mesh>)}
        {/* Tail boom, orange stripe and tail fin. */}
        <mesh position={[0.91, 0.02, 0]} rotation={[0, 0, -Math.PI / 2]}><boxGeometry args={[1.22, 0.1, 0.12]} /><meshStandardMaterial color="#1b1b1b" metalness={0.82} roughness={0.22} /></mesh>
        <mesh position={[0.87, 0.1, 0]} rotation={[0, 0, -Math.PI / 2]}><boxGeometry args={[0.58, 0.13, 0.13]} /><meshStandardMaterial color="#ef6c2f" metalness={0.62} roughness={0.25} /></mesh>
        <mesh position={[1.45, 0.27, 0]}><boxGeometry args={[0.3, 0.48, 0.055]} /><meshStandardMaterial color="#ef6c2f" metalness={0.62} /></mesh>
        {/* Rotor mast and four long carbon blades. */}
        <mesh position={[-0.08, 0.37, 0]}><cylinderGeometry args={[0.04, 0.065, 0.25, 10]} /><meshStandardMaterial color="#27272a" metalness={0.92} /></mesh>
        <group ref={rotorRef} position={[-0.08, 0.5, 0]}>{[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle) => <mesh key={angle} rotation={[0, angle, 0]} position={[0.56 * Math.cos(angle), 0, 0.56 * Math.sin(angle)]}><boxGeometry args={[1.2, 0.024, 0.075]} /><meshStandardMaterial color="#151515" metalness={0.88} roughness={0.26} /></mesh>)}</group>
        <group ref={tailRotorRef} position={[1.48, 0.08, 0]} rotation={[0, Math.PI / 2, 0]}>{[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle) => <mesh key={angle} rotation={[0, 0, angle]}><boxGeometry args={[0.44, 0.022, 0.045]} /><meshStandardMaterial color="#ef6c2f" metalness={0.6} /></mesh>)}</group>
        {/* Skid landing gear with cross struts. */}
        {[-0.21, 0.21].map((z) => <React.Fragment key={z}><mesh position={[-0.05, -0.31, z]} rotation={[0, 0, 0.42]}><boxGeometry args={[0.045, 0.34, 0.045]} /><meshStandardMaterial color="#101010" metalness={0.75} /></mesh><mesh position={[0.05, -0.45, z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.035, 0.035, 1.12, 10]} /><meshStandardMaterial color="#111111" metalness={0.86} /></mesh></React.Fragment>)}
        <mesh position={[-0.42, 0.13, 0.27]}><sphereGeometry args={[0.035, 8, 8]} /><meshBasicMaterial color="#22c55e" /></mesh>
        <mesh position={[-0.42, 0.13, -0.27]}><sphereGeometry args={[0.035, 8, 8]} /><meshBasicMaterial color="#ef4444" /></mesh>
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

      {/* Framed advertisement banner next to the rooftop pizzeria. */}
      <group position={[topWidth / 2 + 0.24, 0.47, 0]} rotation={[0, -Math.PI / 2, 0]}>
        {[-1.55, 1.55].map((x) => <mesh key={x} position={[x, 0.52, 0]}><boxGeometry args={[0.07, 1.25, 0.08]} /><meshStandardMaterial color="#171717" metalness={0.9} /></mesh>)}
        {[-1.55, 1.55].map((x) => <mesh key={`base-${x}`} position={[x, -0.03, 0]}><cylinderGeometry args={[0.14, 0.14, 0.06, 12]} /><meshStandardMaterial color="#171717" metalness={0.9} roughness={0.24} /></mesh>)}
        <mesh position={[0, 0.95, 0]} castShadow><boxGeometry args={[3.85, 0.9, 0.1]} /><meshStandardMaterial color="#f8fafc" roughness={0.5} /></mesh>
        <mesh position={[0, 1.42, 0]}><boxGeometry args={[3.98, 0.07, 0.15]} /><meshStandardMaterial color="#171717" metalness={0.88} /></mesh>
        <mesh position={[0, 0.48, 0]}><boxGeometry args={[3.98, 0.07, 0.15]} /><meshStandardMaterial color="#171717" metalness={0.88} /></mesh>
        <mesh position={[-1.32, 0.26, 0]} rotation={[0, 0, -0.55]}><boxGeometry args={[0.06, 0.8, 0.08]} /><meshStandardMaterial color="#171717" metalness={0.9} /></mesh>
        <mesh position={[1.32, 0.26, 0]} rotation={[0, 0, 0.55]}><boxGeometry args={[0.06, 0.8, 0.08]} /><meshStandardMaterial color="#171717" metalness={0.9} /></mesh>
        <mesh position={[0, 0.95, 0.06]}><planeGeometry args={[3.62, 0.68]} /><meshBasicMaterial color="#fffdfa" /></mesh>
        <Text position={[0, 0.97, 0.12]} fontSize={0.31} color="#111827" anchorX="center" anchorY="middle" fontWeight="bold">UpSpace</Text>
        <mesh position={[0, 0.95, -0.06]} rotation={[0, Math.PI, 0]}><planeGeometry args={[3.62, 0.68]} /><meshBasicMaterial color="#fffdfa" /></mesh>
        <Text position={[0, 0.97, -0.12]} rotation={[0, Math.PI, 0]} fontSize={0.31} color="#111827" anchorX="center" anchorY="middle" fontWeight="bold">UpSpace</Text>
      </group>

      {/* Roof-edge lamps and planters add scale without crowding the helipad. */}
      {[-1, 1].map((side) => <group key={`roof-lamp-${side}`} position={[side * (topWidth / 2 + 0.18), 0.52, topDepth * 0.18]}><mesh position={[0, 0.34, 0]}><cylinderGeometry args={[0.025, 0.035, 0.68, 8]} /><meshStandardMaterial color="#242424" metalness={0.85} /></mesh><mesh position={[side * -0.1, 0.67, 0]} rotation={[0, 0, side * 0.75]}><boxGeometry args={[0.22, 0.035, 0.035]} /><meshStandardMaterial color="#242424" /></mesh><mesh position={[side * -0.18, 0.64, 0]}><sphereGeometry args={[0.065, 10, 10]} /><meshStandardMaterial color="#fff7a8" emissive="#ffff55" emissiveIntensity={1.4} /></mesh><pointLight position={[side * -0.18, 0.62, 0]} color="#ffe98a" intensity={0.8} distance={3} /></group>)}
      {[[-topWidth * 0.43, -topDepth * 0.42], [topWidth * 0.43, topDepth * 0.38]].map(([x, z], index) => <group key={`roof-plant-${index}`} position={[x, 0.55, z]}><mesh><cylinderGeometry args={[0.13, 0.17, 0.2, 12]} /><meshStandardMaterial color="#a65e2e" roughness={0.85} /></mesh><mesh position={[0, 0.22, 0]}><sphereGeometry args={[0.2, 12, 10]} /><meshStandardMaterial color="#4d7c3f" roughness={0.92} /></mesh></group>)}
    </group>
  );
}
