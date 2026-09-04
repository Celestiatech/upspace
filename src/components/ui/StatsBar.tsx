'use client';

import React from 'react';
import { Arena } from '@/types/arena';
import { FloorData, getDisplayFloorNumber } from '@/types/floor';
import { Building, CheckCircle2, DollarSign, Trophy, ArrowUpRight } from 'lucide-react';

import { ThemeMode } from '@/types/theme';

interface StatsBarProps {
  arena: Arena;
  floors: FloorData[];
  selectedFloor: FloorData | null;
  theme: ThemeMode;
  onOpenDirectory: () => void;
}

export function StatsBar({ arena, floors, selectedFloor, theme, onOpenDirectory }: StatsBarProps) {
  const isDay = theme === 'day';
  const totalFloors = floors.length;
  const occupiedFloors = floors.filter((f) => f.status === 'sold').length;
  const availableFloors = floors.filter((f) => f.status === 'available').length;
  const highestFloor = Math.max(...floors.map((f) => getDisplayFloorNumber(f.floorNumber, floors.length)), 0);
  const totalHeightMeters = Math.round(arena.baseHeight * 3 + arena.totalFloors * 4.5);

  return (
    <div className="fixed bottom-5 left-4 right-4 sm:left-6 sm:right-6 z-30 pointer-events-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* KPI METRICS BADGE GROUP */}
        <div
          className={`pointer-events-auto backdrop-blur-xl rounded-2xl p-3 sm:px-5 sm:py-3 shadow-2xl flex flex-wrap items-center gap-4 sm:gap-6 justify-around sm:justify-start transition-all border ${
            isDay
              ? 'bg-white/85 border-slate-200/90 shadow-slate-300/30 text-slate-800'
              : 'bg-slate-950/80 border-white/10 shadow-cyan-950/20 text-white'
          }`}
        >
          
          {/* Building Height */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Tower Height
              </div>
              <div className="text-sm font-bold text-white font-mono flex items-center gap-1">
                {totalHeightMeters}m <span className="text-[11px] text-slate-400 font-normal">({totalFloors} Fl)</span>
              </div>
            </div>
          </div>

          <div className="h-7 w-[1px] bg-white/10 hidden sm:block" />

          {/* Occupied Floors */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Occupied Floors
              </div>
              <div className="text-sm font-bold text-amber-400 font-mono">
                {occupiedFloors} <span className="text-[11px] text-slate-400 font-normal">/ {totalFloors}</span>
              </div>
            </div>
          </div>

          <div className="h-7 w-[1px] bg-white/10 hidden sm:block" />

          {/* Available Floors */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Available Floors
              </div>
              <div className="text-sm font-bold text-emerald-400 font-mono">
                {availableFloors} <span className="text-[11px] text-slate-400 font-normal">floors</span>
              </div>
            </div>
          </div>

          <div className="h-7 w-[1px] bg-white/10 hidden sm:block" />

          {/* Current Highest Floor */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Highest Floor
              </div>
              <div className="text-sm font-bold text-purple-300 font-mono">
                Floor {highestFloor}
              </div>
            </div>
          </div>
        </div>

        {/* BROWSE ALL FLOORS TRIGGER BUTTON */}
        <button
          onClick={onOpenDirectory}
          className={`pointer-events-auto backdrop-blur-xl rounded-2xl px-5 py-3 shadow-2xl flex items-center justify-center gap-2 transition group text-sm font-medium border ${
            isDay
              ? 'bg-white/90 hover:bg-slate-50 text-slate-900 border-slate-200 shadow-slate-300/40 hover:border-cyan-500'
              : 'bg-slate-900/90 hover:bg-slate-800 text-white border-white/15 hover:border-cyan-500/50'
          }`}
        >
          <span>View All 20 Floors</span>
          <ArrowUpRight className="w-4 h-4 text-cyan-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>

      </div>
    </div>
  );
}
