'use client';

import React from 'react';
import { FloorData } from '@/types/floor';
import { ThemeMode } from '@/types/theme';

interface StatsPanelProps {
  floors: FloorData[];
  theme: ThemeMode;
}

export function StatsPanel({ floors, theme }: StatsPanelProps) {
  const isDay = theme === 'day';

  const totalFloors = floors.length;
  const occupiedCount = floors.filter((f) => f.status === 'sold').length;
  const availableCount = floors.filter((f) => f.status === 'available').length;
  const maxPrice = Math.max(...floors.map((f) => f.price), 20);

  const stats = [
    {
      value: totalFloors,
      label: 'TOTAL FLOORS',
      colorClass: isDay ? 'text-slate-900' : 'text-white',
    },
    {
      value: occupiedCount,
      label: 'OCCUPIED',
      colorClass: isDay ? 'text-amber-600' : 'text-amber-400',
    },
    {
      value: availableCount,
      label: 'AVAILABLE',
      colorClass: isDay ? 'text-emerald-600' : 'text-emerald-400',
    },
    {
      value: `₹${maxPrice}`,
      label: 'STARTING RANGE',
      colorClass: isDay ? 'text-cyan-700' : 'text-cyan-400',
    },
  ];

  return (
    <div
      className={`backdrop-blur-xl rounded-2xl p-4 border transition-all shadow-xl grid grid-cols-2 gap-3 sm:gap-3.5 ${
        isDay
          ? 'bg-white/85 border-slate-200/90 shadow-slate-300/30'
          : 'bg-slate-950/75 border-white/10 shadow-black/40'
      }`}
    >
      {stats.map((stat, idx) => (
        <div key={idx} className="flex flex-col">
          <span className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${stat.colorClass}`}>
            {stat.value}
          </span>
          <span
            className={`text-[10px] font-mono tracking-widest mt-1 font-semibold uppercase ${
              isDay ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}
