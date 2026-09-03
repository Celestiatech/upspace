'use client';

import React, { useState } from 'react';
import { FloorData } from '@/types/floor';
import { ThemeMode } from '@/types/theme';
import { Eye, Sparkles, Filter, CheckCircle2 } from 'lucide-react';

interface FloorMarketplaceProps {
  floors: FloorData[];
  theme: ThemeMode;
  onSelectFloor: (floor: FloorData) => void;
  onOpenPurchase: (floor: FloorData) => void;
}

export function FloorMarketplace({
  floors,
  theme,
  onSelectFloor,
  onOpenPurchase,
}: FloorMarketplaceProps) {
  const isDay = theme === 'day';
  const [filter, setFilter] = useState<'available' | 'all' | 'occupied'>('available');

  const filteredFloors = floors.filter((f) => {
    if (filter === 'available') return f.status === 'available';
    if (filter === 'occupied') return f.status === 'sold';
    return true;
  });

  return (
    <section id="marketplace" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-10 border-b border-black/10 dark:border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold uppercase">
            LIVE ADVERTISING INVENTORY
          </div>
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mt-2 ${
              isDay ? 'text-slate-900' : 'text-white'
            }`}
          >
            Available Floors
          </h2>
          <p
            className={`text-base sm:text-lg mt-1 ${
              isDay ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            Claim an elevated commercial floor level in the virtual city skyline.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {(['available', 'all', 'occupied'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition ${
                filter === mode
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : isDay
                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Floor Cards (Requirement #6) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-10">
        {filteredFloors.map((floor) => {
          const isAvailable = floor.status === 'available';

          return (
            <div
              key={floor.id}
              className={`backdrop-blur-xl rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-between group hover:-translate-y-1 ${
                isDay
                  ? 'bg-white/85 border-slate-200 shadow-md hover:shadow-xl hover:border-cyan-400'
                  : 'bg-slate-950/70 border-white/10 hover:border-cyan-500/40 hover:shadow-glow'
              }`}
            >
              <div>
                {/* Header: Floor Number & Preview Badge */}
                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-mono font-bold text-xs text-cyan-400">
                      {floor.floorNumber}
                    </span>
                    <span className="font-bold text-sm">
                      FLOOR {floor.floorNumber}
                    </span>
                  </div>

                  {/* Status indicator */}
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase border ${
                      isAvailable
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {isAvailable ? 'Available' : 'Occupied'}
                  </span>
                </div>

                {/* Small Visual Preview Box (Requirement #6) */}
                <div
                  className="w-full h-20 rounded-2xl flex flex-col justify-center items-center p-3 my-2 border transition-all"
                  style={{
                    backgroundColor: isDay ? '#f8fafc' : '#070a12',
                    borderColor: isAvailable ? '#10b98130' : '#38bdf830',
                  }}
                >
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    {floor.brandTitle ? 'Billboard Preview' : 'Reserved Slot'}
                  </span>
                  <span className="font-extrabold text-sm text-center truncate max-w-full mt-0.5 text-cyan-500 dark:text-cyan-400">
                    {floor.brandTitle || 'YOUR BRAND HERE'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {floor.elevationMeters}m Elevation
                  </span>
                </div>

                {/* Price Display */}
                <div className="pt-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    {isAvailable ? 'Starting Price' : 'Acquisition Value'}
                  </span>
                  <div className="text-2xl font-extrabold font-mono text-white dark:text-white">
                    <span className={isDay ? 'text-slate-950' : 'text-white'}>
                      ₹{floor.price}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-2 flex gap-2">
                <button
                  onClick={() => {
                    onSelectFloor(floor);
                    const el = document.getElementById('hero');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition border ${
                    isDay
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                      : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>[View]</span>
                </button>

                {isAvailable ? (
                  <button
                    onClick={() => onOpenPurchase(floor)}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition hover:shadow-glow active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>[Own]</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onSelectFloor(floor)}
                    className="flex-1 py-2 rounded-xl bg-black/5 dark:bg-white/5 text-slate-400 text-xs font-medium cursor-default"
                  >
                    <span>Occupied</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
