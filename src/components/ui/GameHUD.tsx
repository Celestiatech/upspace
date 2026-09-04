'use client';

import React, { useState } from 'react';
import { Eye, HelpCircle, Layers3, Moon, RotateCcw, Sparkles, Sun, Trophy, X, TrendingUp } from 'lucide-react';
import { Arena } from '@/types/arena';
import { FloorData } from '@/types/floor';
import { ThemeMode } from '@/types/theme';
import { getLandmarkComparison } from '@/data/landmarks';
import { HeightLadderModal } from './HeightLadderModal';

interface GameHUDProps {
  arena: Arena;
  floors: FloorData[];
  selectedFloor: FloorData | null;
  theme: ThemeMode;
  autoRotate: boolean;
  lowPower?: boolean;
  onToggleTheme: () => void;
  onToggleAutoRotate: () => void;
  onToggleLowPower: () => void;
  onResetCamera: () => void;
  onOpenPurchase: (floor?: FloorData) => void;
}

export function GameHUD({
  arena,
  floors,
  selectedFloor,
  theme,
  onToggleTheme,
  onResetCamera,
  onOpenPurchase,
}: GameHUDProps) {
  const [rulesOpen, setRulesOpen] = useState(false);
  const [heightModalOpen, setHeightModalOpen] = useState(false);

  const isDay = theme === 'day';
  const claimed = floors.filter((floor) => floor.status === 'sold').length;
  const topFloor = [...floors].sort((a, b) => b.floorNumber - a.floorNumber)[0];
  const topBid = topFloor ? Math.ceil(topFloor.price * 1.1) : 0;

  // Real-time Landmark comparison stats
  const landmarkStats = getLandmarkComparison(floors.length);

  return (
    <div className="pointer-events-none absolute inset-0 z-30 font-sans text-slate-900">
      {/* 1. TOP HEADER: LOGO & HEIGHT LEADERBOARD PILL */}
      <header className="pointer-events-auto absolute left-4 top-4 flex items-center gap-3 sm:left-6 sm:top-6">
        <div
          className={`rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-xl transition ${
            isDay ? 'border-white/60 bg-white/85 shadow-slate-900/10' : 'border-white/10 bg-slate-950/80 shadow-black/30 text-white'
          }`}
        >
          <div className="text-lg font-black tracking-[-0.07em]">UpSpace</div>
          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            Virtual billboard skyline
          </p>
        </div>

        {/* Dynamic Height & Landmark Comparison Badge */}
        <button
          onClick={() => setHeightModalOpen(true)}
          className={`group flex items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 shadow-lg backdrop-blur-xl transition active:scale-95 ${
            isDay
              ? 'border-white/70 bg-white/90 hover:bg-white text-slate-800 shadow-slate-900/10'
              : 'border-white/15 bg-slate-950/85 hover:bg-slate-900 text-white shadow-black/30'
          }`}
          title="Open Skyline Height Leaderboard"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white shadow-md shadow-orange-500/20">
            <Trophy className="h-4 w-4" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight">{landmarkStats.currentHeight.toFixed(0)}m</span>
              <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">
                ({floors.length} Floors)
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[140px] sm:max-w-[180px]">
              {landmarkStats.highestSurpassed
                ? `Higher than ${landmarkStats.highestSurpassed.name.split(' ')[0]}!`
                : `Next: ${landmarkStats.nextMilestone?.name || 'Taj Mahal'}`}
            </p>
          </div>
        </button>
      </header>

      {/* 2. TOP RIGHT ACTIONS */}
      <div className="pointer-events-auto absolute right-4 top-4 flex items-center gap-2 sm:right-6 sm:top-6">
        <button
          onClick={onResetCamera}
          className={`rounded-full border p-3 shadow-lg backdrop-blur-xl transition ${
            isDay ? 'border-white/70 bg-white/85 text-slate-600 hover:bg-white' : 'border-white/10 bg-slate-950/85 text-slate-300 hover:bg-slate-900'
          }`}
          aria-label="Reset tower view"
        >
          <RotateCcw size={17} />
        </button>
        <button
          onClick={onToggleTheme}
          className={`rounded-full border p-3 shadow-lg backdrop-blur-xl transition ${
            isDay ? 'border-white/70 bg-white/85 text-slate-600 hover:bg-white' : 'border-white/10 bg-slate-950/85 text-slate-300 hover:bg-slate-900'
          }`}
          aria-label="Toggle theme"
        >
          {isDay ? <Moon size={17} /> : <Sun size={17} />}
        </button>
      </div>

      {/* Center exploration tip */}
      <div className="pointer-events-none absolute left-1/2 top-5 hidden -translate-x-1/2 text-center md:block">
        <p className="rounded-full border border-white/35 bg-slate-950/20 px-4 py-2 text-xs font-medium text-white shadow-sm backdrop-blur-md">
          Drag to explore · Click any floor to inspect
        </p>
      </div>

      {/* 3. SIDEBAR STATS */}
      <aside className="pointer-events-auto absolute bottom-24 left-4 hidden flex-col gap-2 sm:left-6 lg:flex">
        {/* Landmark Milestone Banner */}
        <button
          onClick={() => setHeightModalOpen(true)}
          className={`group rounded-2xl border px-4 py-3 text-left shadow-lg backdrop-blur-xl transition hover:scale-[1.02] ${
            isDay
              ? 'border-white/60 bg-white/85 shadow-slate-900/10 text-slate-800'
              : 'border-white/10 bg-slate-950/85 shadow-black/30 text-white'
          }`}
        >
          <div className="flex items-center gap-2 text-xs">
            <Trophy size={14} className="text-orange-500" />
            <b className="font-bold">Height Leaderboard</b>
          </div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            {landmarkStats.highestSurpassed
              ? `Taller than ${landmarkStats.highestSurpassed.name} (${landmarkStats.highestSurpassed.heightMeters}m)`
              : `Target: ${landmarkStats.nextMilestone?.name}`}
          </p>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-orange-600 dark:text-orange-400">
            <span>View all world landmarks</span>
            <TrendingUp className="h-3 w-3" />
          </div>
        </button>

        <div
          className={`rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-xl ${
            isDay ? 'border-white/60 bg-white/85 shadow-slate-900/10' : 'border-white/10 bg-slate-950/85 shadow-black/30 text-white'
          }`}
        >
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Eye size={14} className="text-orange-500" />
            <b className="text-slate-800 dark:text-white">Growing audience</b>
          </div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Live campaign analytics unlock after launch.</p>
        </div>

        <div
          className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs shadow-lg backdrop-blur-xl ${
            isDay ? 'border-white/60 bg-white/85 text-slate-600 shadow-slate-900/10' : 'border-white/10 bg-slate-950/85 text-slate-300 shadow-black/30'
          }`}
        >
          <Layers3 size={15} className="text-orange-500" />
          <b className="text-slate-900 dark:text-white">{claimed}</b> floors claimed · <b className="text-slate-900 dark:text-white">{floors.length}</b> total
        </div>
      </aside>

      {/* 4. BOTTOM ACTION BAR */}
      <div
        className={`pointer-events-auto absolute bottom-4 left-1/2 flex w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 items-center justify-between gap-3 rounded-2xl border p-3 shadow-2xl backdrop-blur-xl sm:bottom-6 sm:p-4 ${
          isDay
            ? 'border-white/70 bg-white/90 shadow-slate-900/20 text-slate-900'
            : 'border-white/10 bg-slate-950/90 shadow-black/40 text-white'
        }`}
      >
        <div className="min-w-0 pl-1">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-orange-600 dark:text-orange-400">
            Top-floor opportunity
          </p>
          <p className="mt-0.5 truncate text-xs text-slate-600 dark:text-slate-400">
            Currently held by {topFloor?.brandTitle || 'a brand'} · next bid ₹{topBid} · Click floors to compare
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => setRulesOpen(true)}
            className={`hidden items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition sm:flex ${
              isDay ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <HelpCircle size={16} />
            How it works
          </button>
          <button
            onClick={() => (topFloor ? onOpenPurchase(topFloor) : onOpenPurchase())}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 px-3.5 py-2.5 text-xs font-extrabold text-white shadow-[0_3px_0_#d95e26] transition hover:-translate-y-0.5 sm:px-4"
          >
            <Sparkles size={15} />
            Outbid ₹{topBid}
          </button>
        </div>
      </div>

      {/* How it works modal */}
      {rulesOpen && (
        <div className="pointer-events-auto absolute inset-0 flex items-end justify-center bg-slate-950/30 p-4 backdrop-blur-sm sm:items-center">
          <section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-600">Before you claim</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight">How UpSpace works</h2>
              </div>
              <button
                onClick={() => setRulesOpen(false)}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close rules"
              >
                <X size={18} />
              </button>
            </div>
            <ol className="mt-5 space-y-3 text-sm leading-relaxed text-slate-600">
              <li>
                <b className="text-slate-900">1. Pick a floor.</b> Click a level to view its owner, format, and current price.
              </li>
              <li>
                <b className="text-slate-900">2. Create your campaign.</b> Add your brand name, destination link, and billboard artwork before checkout.
              </li>
              <li>
                <b className="text-slate-900">3. Your campaign goes live.</b> Claims are reviewed before publishing; renewal and outbid terms must be shown at checkout.
              </li>
            </ol>
            <p className="mt-5 rounded-xl bg-orange-50 p-3 text-xs text-orange-800">
              Audience metrics are shown only when verified—never as invented impressions.
            </p>
          </section>
        </div>
      )}

      {/* Height Ladder Landmark Modal */}
      {heightModalOpen && (
        <div className="pointer-events-auto">
          <HeightLadderModal
            floorCount={floors.length}
            theme={theme}
            onClose={() => setHeightModalOpen(false)}
            onOpenPurchase={() => onOpenPurchase()}
          />
        </div>
      )}
    </div>
  );
}
