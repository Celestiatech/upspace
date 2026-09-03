'use client';

import React from 'react';
import { FloorData } from '@/types/floor';
import { ThemeMode } from '@/types/theme';

interface FloorSelectorProps {
  floors: FloorData[];
  selectedFloor: FloorData | null;
  theme: ThemeMode;
  onSelectFloor: (floor: FloorData) => void;
}

export function FloorSelector({
  floors,
  selectedFloor,
  theme,
  onSelectFloor,
}: FloorSelectorProps) {
  const isDay = theme === 'day';

  // Sorted from top (20) down to bottom (1)
  const reversedFloors = [...floors].sort((a, b) => b.floorNumber - a.floorNumber);

  return (
    <div className="flex flex-col items-center gap-1 max-h-[460px] overflow-y-auto custom-scrollbar px-1 py-1.5 backdrop-blur-xl rounded-2xl border transition-all shadow-xl select-none">
      <div
        className={`text-[9px] font-mono font-bold uppercase tracking-wider py-1 px-1.5 ${
          isDay ? 'text-slate-400' : 'text-slate-500'
        }`}
      >
        FLOOR
      </div>

      <div className="flex flex-col gap-1 w-full">
        {reversedFloors.map((floor) => {
          const isSelected = selectedFloor?.id === floor.id;
          const isAvailable = floor.status === 'available';

          return (
            <button
              key={floor.id}
              onClick={() => onSelectFloor(floor)}
              className={`relative flex items-center justify-between gap-1.5 px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                isSelected
                  ? 'bg-cyan-500 text-slate-950 shadow-glow scale-105 z-10'
                  : isDay
                  ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title={`Floor ${floor.floorNumber} - ${floor.brandTitle || 'Available'} (₹${floor.price})`}
            >
              <span>{floor.floorNumber}</span>

              {/* Status Dot */}
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  isSelected
                    ? 'bg-slate-950'
                    : isAvailable
                    ? 'bg-emerald-400'
                    : 'bg-amber-400/80'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
