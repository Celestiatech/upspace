'use client';

import React from 'react';
import { Html } from '@react-three/drei';
import { WORLD_LANDMARKS } from '@/data/landmarks';

interface HeightLadderMarkersProps {
  roofY: number;
  floorsCount: number;
  floorHeight: number;
  baseHeight: number;
  isDayMode?: boolean;
}

export function HeightLadderMarkers({
  roofY,
  floorsCount,
  floorHeight,
  baseHeight,
  isDayMode = false,
}: HeightLadderMarkersProps) {
  // Scale mapping: 4.5m real height = floorHeight in 3D
  const scaleRatio = floorHeight / 4.5;
  const baseY = baseHeight * 1.4;

  // Keep the ruler and its HTML cards within the closer terrace camera view.
  const rulerX = -4.6;
  const rulerZ = 0;

  return (
    <group position={[rulerX, 0, rulerZ]}>
      {/* Subtle vertical elevation ruler guideline */}
      <mesh position={[0, (roofY + 8) / 2, 0]}>
        <cylinderGeometry args={[0.015, 0.015, roofY + 8, 6]} />
        <meshBasicMaterial color={isDayMode ? '#94a3b8' : '#334155'} transparent opacity={0.35} />
      </mesh>

      {WORLD_LANDMARKS.map((landmark) => {
        // Compute 3D Y elevation
        const markerY = baseY + ((landmark.heightMeters - 18 - 12) * scaleRatio);

        // Only display relevant landmarks near or up to the current building height range
        // Do not render milestone cards above the current terrace; this keeps
        // the rooftop view clear and prevents cards floating beyond the tower.
        if (markerY < 0 || markerY > roofY) return null;

        const isSurpassed = markerY <= roofY;

        return (
          <group key={landmark.id} position={[0, markerY, 0]}>
            {/* Horizontal pointer tic towards building */}
            <mesh position={[0.45, 0, 0]}>
              <boxGeometry args={[0.9, 0.04, 0.04]} />
              <meshBasicMaterial
                color={isSurpassed ? '#10b981' : isDayMode ? '#f97316' : '#38bdf8'}
              />
            </mesh>

            {/* High-Fidelity 3D Landmark Photograph & Elevation Card */}
            <Html
              position={[0.55, 0, 0]}
              center
              distanceFactor={30}
              zIndexRange={[100, 0]}
              transform={false}
            >
              <div
                className={`flex scale-[0.45] origin-left items-center gap-1 px-1 py-0.5 rounded-lg shadow-xl backdrop-blur-xl border transition-all duration-300 pointer-events-none select-none whitespace-nowrap ${
                  isDayMode
                    ? 'bg-white/95 border-slate-300 shadow-slate-900/15 text-slate-950'
                    : 'bg-slate-950/90 border-white/15 shadow-black/60 text-white'
                } ${
                  isSurpassed
                    ? 'ring-1 ring-emerald-500/40'
                    : 'ring-1 ring-orange-500/30'
                }`}
              >
                {/* Real Landmark Photograph Thumbnail */}
                <div className="relative w-5 h-5 rounded-md overflow-hidden shrink-0 border border-black/10 dark:border-white/20 shadow-sm bg-slate-200">
                  <img
                    src={landmark.imageUrl}
                    alt={landmark.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-black/10 dark:ring-white/10 rounded-xl" />
                </div>

                {/* Landmark Info & Real Height */}
                <div className="flex flex-col text-left pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-xs tracking-tight text-slate-950 dark:text-white">
                      {landmark.name}
                    </span>
                    {isSurpassed ? (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                        Surpassed
                      </span>
                    ) : (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-orange-500/15 text-orange-800 dark:text-orange-300 border border-orange-500/30">
                        Milestone
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-800 dark:text-slate-300">
                    <span className="font-mono font-black text-orange-700 dark:text-cyan-400">
                      {landmark.heightMeters}m
                    </span>
                    <span>·</span>
                    <span className="text-slate-600 dark:text-slate-400">{landmark.location}</span>
                  </div>
                </div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
