'use client';

import React, { useState } from 'react';
import { RotateCcw, Sparkles, Crown, Globe } from 'lucide-react';
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
  onOpenPurchase: (floor?: FloorData, initialUrl?: string) => void;
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

  const [websiteInput, setWebsiteInput] = useState('');

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (topFloor) {
      onOpenPurchase(topFloor, websiteInput.trim());
    } else {
      onOpenPurchase(undefined, websiteInput.trim());
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20 font-sans">
      {/* 1. CAMERA RESET BUTTON (Bottom Left, lifted above dock on mobile) */}
      <div className="pointer-events-auto absolute bottom-32 sm:bottom-6 left-3 sm:left-6">
        <button
          onClick={onResetCamera}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl border text-xs font-black shadow-lg backdrop-blur-xl transition active:scale-95 touch-manipulation ${
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

      {/* 2. COMPLETE PENTHOUSE DOCK WITH FULL TEXT & WEBSITE INPUT (Bottom Center) */}
      <form
        onSubmit={handleClaim}
        className={`pointer-events-auto absolute bottom-2 sm:bottom-6 left-1/2 -translate-x-1/2 flex flex-col md:flex-row items-center gap-2 sm:gap-3 rounded-2xl md:rounded-full border px-3 sm:px-4 py-2 sm:py-2.5 shadow-2xl backdrop-blur-2xl transition max-w-3xl w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] md:w-auto ${
          isDay
            ? 'border-slate-300 bg-white/95 shadow-slate-900/20 text-slate-950'
            : 'border-white/10 bg-slate-950/95 shadow-black/60 text-white'
        }`}
      >
        {/* Penthouse Info & Subtitle */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 w-full md:w-auto">
          <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-600 shrink-0">
            <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              <span className="text-xs font-black tracking-tight text-slate-950 dark:text-white truncate">
                Penthouse Level {topFloorNum}
              </span>
              <span className="text-xs font-bold text-slate-700 dark:text-cyan-400 truncate">
                ({topFloor?.brandTitle || 'arcadestudio.in'})
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-600 dark:text-slate-300 truncate">
              Highest-traffic billboard spire · Next min bid: ₹{topBid.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Website Input & Action Row on Mobile */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Website Input Field */}
          <div className="relative flex-1 md:w-52 lg:w-56 shrink-0">
            <Globe className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <input
              type="text"
              value={websiteInput}
              onChange={(e) => setWebsiteInput(e.target.value)}
              placeholder="Enter your website..."
              className={`w-full pl-7 sm:pl-8 pr-2.5 sm:pr-3 py-1.5 rounded-xl md:rounded-full text-xs font-bold border outline-none transition ${
                isDay
                  ? 'bg-slate-50 border-slate-300 focus:border-slate-900 text-slate-950 placeholder:text-slate-500 shadow-sm'
                  : 'bg-white/5 border-white/10 focus:border-cyan-400 text-white placeholder:text-slate-400'
              }`}
            />
          </div>

          {/* Outbid CTA Button */}
          <button
            type="submit"
            className="flex items-center justify-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl md:rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs shadow-md shadow-orange-500/25 transition active:scale-95 shrink-0 touch-manipulation"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">Outbid ₹{topBid.toLocaleString()}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
