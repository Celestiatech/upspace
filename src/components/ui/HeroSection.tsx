'use client';

import React from 'react';
import { Sparkles, Compass } from 'lucide-react';
import { FloorData } from '@/types/floor';
import { Arena } from '@/types/arena';
import { ThemeMode } from '@/types/theme';
import { StatsPanel } from './StatsPanel';
import { FloorSelector } from './FloorSelector';
import { FloorDetailCard } from '../floors/FloorDetailCard';
import { ArenaCanvas } from '../3d/ArenaCanvas';

interface HeroSectionProps {
  arena: Arena;
  floors: FloorData[];
  selectedFloor: FloorData | null;
  theme: ThemeMode;
  autoRotate: boolean;
  onSelectFloor: (floor: FloorData) => void;
  onDeselectFloor: () => void;
  onOpenPurchase: (floor: FloorData) => void;
  onExploreClick: () => void;
  onOwnFloorClick: () => void;
}

export function HeroSection({
  arena,
  floors,
  selectedFloor,
  theme,
  autoRotate,
  onSelectFloor,
  onDeselectFloor,
  onOpenPurchase,
  onExploreClick,
  onOwnFloorClick,
}: HeroSectionProps) {
  const isDay = theme === 'day';

  return (
    <section
      id="hero"
      className="relative w-full h-[calc(100vh-20px)] min-h-[720px] max-h-[1050px] overflow-hidden"
    >
      {/* 1. CENTER FOCUS: 3D SKYSCRAPER CANVAS (Fills center hero completely) */}
      <div id="tower-view" className="absolute inset-0 z-0 w-full h-full">
        <ArenaCanvas
          arena={arena}
          floors={floors}
          selectedFloor={selectedFloor}
          autoRotate={autoRotate}
          theme={theme}
          onSelectFloor={onSelectFloor}
        />
      </div>

      {/* 2. LEFT SIDE: DOCKED TO THE FAR LEFT (Headline, Subtitle, CTAs, Stats & Detail Card) */}
      <div className="absolute left-4 sm:left-8 lg:left-12 top-24 bottom-6 z-20 w-full max-w-[390px] sm:max-w-[430px] flex flex-col justify-between pointer-events-none pb-2">
        
        {/* Top Group: Eyebrow, Headline, Supporting text, CTAs */}
        <div className="space-y-4 pointer-events-auto">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider">
              {arena.name} • Virtual Commercial Skyline
            </span>
          </div>

          {/* Large Headline */}
          <h1
            className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.08] ${
              isDay ? 'text-slate-950' : 'text-white'
            }`}
          >
            Own Your Place in the <span className="text-cyan-500 dark:text-cyan-400">Virtual City</span>
          </h1>

          {/* Supporting Text */}
          <p
            className={`text-sm sm:text-base font-normal leading-relaxed ${
              isDay ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            Buy a floor. Build your presence. Get discovered.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              onClick={onExploreClick}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm shadow-glow transition-all active:scale-95"
            >
              <Compass className="w-4 h-4 text-slate-950" />
              <span>Explore the Tower</span>
            </button>

            <button
              onClick={onOwnFloorClick}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all active:scale-95 border ${
                isDay
                  ? 'bg-white/90 hover:bg-white text-slate-900 border-slate-300 shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-white border-white/15'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Own a Floor</span>
            </button>
          </div>
        </div>

        {/* Bottom Group: Detail Card or Live Stats Panel */}
        <div className="pointer-events-auto pt-4">
          {selectedFloor ? (
            <FloorDetailCard
              floor={selectedFloor}
              theme={theme}
              allFloors={floors}
              onClose={onDeselectFloor}
              onSelectFloor={onSelectFloor}
              onOpenPurchase={onOpenPurchase}
            />
          ) : (
            <StatsPanel floors={floors} theme={theme} />
          )}
        </div>
      </div>

      {/* 3. RIGHT SIDE: VERTICAL FLOOR LIST (Floors 20 down to 1) */}
      <div className="absolute right-4 sm:right-6 lg:right-8 top-24 bottom-6 z-20 pointer-events-auto flex items-center">
        <FloorSelector
          floors={floors}
          selectedFloor={selectedFloor}
          theme={theme}
          onSelectFloor={onSelectFloor}
        />
      </div>

      {/* 4. CENTER BOTTOM HINT BADGE */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div
          className={`backdrop-blur-md px-3.5 py-1.5 rounded-full border text-[11px] font-mono flex items-center gap-2 shadow-lg ${
            isDay
              ? 'bg-white/80 border-slate-300/80 text-slate-700 shadow-slate-200'
              : 'bg-slate-950/80 border-white/10 text-slate-300 shadow-black/60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Left-click & drag to orbit • Scroll to zoom • Click floors to inspect</span>
        </div>
      </div>
    </section>
  );
}
