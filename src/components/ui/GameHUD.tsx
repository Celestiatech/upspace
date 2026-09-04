'use client';

import React from 'react';
import { RotateCcw, Sparkles, Crown } from 'lucide-react';
import { Arena } from '@/types/arena';
import { FloorData, getDisplayFloorNumber } from '@/types/floor';
import { ThemeMode } from '@/types/theme';

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
  onOpenHowItWorks?: () => void;
}

export function GameHUD({
  arena,
  floors,
  selectedFloor,
  theme,
  onResetCamera,
  onOpenPurchase,
  onOpenHowItWorks,
}: GameHUDProps) {
  const isDay = theme === 'day';
  const topFloor = [...floors].sort((a, b) => b.floorNumber - a.floorNumber)[0];
  const topBid = topFloor ? Math.ceil(topFloor.price * 1.1) : 8999;
  const topFloorNum = topFloor ? getDisplayFloorNumber(topFloor.floorNumber, floors.length) : floors.length;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 font-sans">
      {/* 1. CAMERA RESET BUTTON ONLY (Bottom Left - Minimal & Unobtrusive) */}
      <div className="pointer-events-auto absolute bottom-4 sm:bottom-6 left-4 sm:left-6">
        <button
          onClick={onResetCamera}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-black shadow-lg backdrop-blur-xl transition active:scale-95 ${
            isDay
              ? 'border-slate-300 bg-white text-slate-950 hover:bg-slate-50 shadow-slate-900/15'
              : 'border-white/10 bg-slate-950/85 text-slate-300 hover:bg-slate-900 shadow-black/40'
          }`}
          title="Reset camera to ground view"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-800 dark:text-slate-300" />
          <span className="hidden sm:inline">Reset Camera</span>
        </button>
      </div>

      {/* 2. STREAMLINED BOTTOM DOCK: PENTHOUSE OPPORTUNITY (Bottom Center) */}
      <div
        className={`pointer-events-auto absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-between gap-3 sm:gap-6 rounded-2xl border px-4 py-2.5 shadow-2xl backdrop-blur-2xl transition max-w-xl w-[calc(100%-2rem)] sm:w-auto ${
          isDay
            ? 'border-slate-300 bg-white shadow-slate-900/20 text-slate-950'
            : 'border-white/10 bg-slate-950/90 shadow-black/50 text-white'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-600 shrink-0">
            <Crown className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight text-slate-950 dark:text-white truncate">
                Penthouse Level {topFloorNum}
              </span>
              <span className="text-xs font-mono text-slate-800 dark:text-cyan-400 font-bold hidden sm:inline">
                ({topFloor?.brandTitle || 'arcadestudio.in'})
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
              Highest-traffic billboard spire · Next min bid: ₹{topBid.toLocaleString()}
            </p>
          </div>
        </div>

        <button
          onClick={() => (topFloor ? onOpenPurchase(topFloor) : onOpenPurchase())}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-md shadow-orange-500/25 transition active:scale-95 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Outbid ₹{topBid.toLocaleString()}</span>
        </button>
      </div>
    </div>
  );
}
