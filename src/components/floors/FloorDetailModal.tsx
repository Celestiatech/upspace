'use client';

import React from 'react';
import { FloorData, getDisplayFloorNumber } from '@/types/floor';
import { Arena } from '@/types/arena';
import {
  X,
  ExternalLink,
  Tag,
  ShieldCheck,
  Eye,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

import { ThemeMode } from '@/types/theme';

interface FloorDetailModalProps {
  floor: FloorData | null;
  arena: Arena;
  theme?: ThemeMode;
  onClose: () => void;
  onSelectFloor: (floor: FloorData) => void;
  allFloors: FloorData[];
}

export function FloorDetailModal({
  floor,
  arena,
  theme = 'night',
  onClose,
  onSelectFloor,
  allFloors,
}: FloorDetailModalProps) {
  if (!floor) return null;

  const isDay = theme === 'day';
  const isAvailable = floor.status === 'available';
  const displayNum = getDisplayFloorNumber(floor.floorNumber, allFloors.length);
  const currentIndex = allFloors.findIndex((f) => f.id === floor.id);
  const prevFloor = currentIndex > 0 ? allFloors[currentIndex - 1] : null;
  const nextFloor = currentIndex < allFloors.length - 1 ? allFloors[currentIndex + 1] : null;

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-40 w-full max-w-sm animate-in fade-in slide-in-from-right-4 duration-200">
      <div
        className={`backdrop-blur-2xl rounded-3xl p-5 shadow-2xl relative overflow-hidden transition-all border ${
          isDay
            ? 'bg-white/90 border-slate-200/90 shadow-slate-400/30 text-slate-900'
            : 'bg-slate-950/90 border-white/15 shadow-cyan-950/40 text-white'
        }`}
      >
        
        {/* Top Glow Accent Bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{
            background: isAvailable
              ? 'linear-gradient(90deg, #10b981, #06b6d4)'
              : 'linear-gradient(90deg, #f59e0b, #ef4444)',
          }}
        />

        {/* HEADER: Floor Number & Close */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-bold text-white font-mono text-sm border border-white/10">
              #{displayNum}
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base leading-tight">
                Floor {displayNum}
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {arena.name} • {floor.elevationMeters}m Elevation
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Quick Prev/Next Floor Controls */}
            <button
              disabled={!prevFloor}
              onClick={() => prevFloor && onSelectFloor(prevFloor)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
              title="Previous floor"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={!nextFloor}
              onClick={() => nextFloor && onSelectFloor(nextFloor)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
              title="Next floor"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* OWNER / BRAND SECTION */}
        <div className="py-4 space-y-3">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">
              Occupant / Brand
            </span>
            <div className="mt-0.5 text-lg font-bold text-white flex items-center gap-2">
              {floor.ownerName ? (
                <>
                  <span>{floor.ownerName}</span>
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                </>
              ) : (
                <span className="text-emerald-400 italic">Available for Acquisition</span>
              )}
            </div>
            {floor.brandTitle && (
              <div className="text-xs text-slate-300 font-medium mt-0.5">
                {floor.brandTitle}
              </div>
            )}
            {floor.tagline && (
              <p className="text-xs text-slate-400 mt-1 italic line-clamp-2">
                &ldquo;{floor.tagline}&rdquo;
              </p>
            )}
          </div>

          {/* STATUS & PRICE BADGES (As specifically requested in prompt) */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {/* Status */}
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 flex flex-col">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1">
                <Tag className="w-3 h-3" /> Status
              </span>
              <span
                className={`text-sm font-bold capitalize mt-1 flex items-center gap-1.5 ${
                  isAvailable ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                {floor.status === 'sold' ? 'Sold' : 'Available'}
              </span>
            </div>

            {/* Price */}
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 flex flex-col">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Floor Price
              </span>
              <span className="text-base font-extrabold text-white font-mono mt-0.5">
                ₹{floor.price}
              </span>
            </div>
          </div>

          {/* ADVERTISING SPECS */}
          <div className="space-y-1.5 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-2xl border border-white/5">
            <div className="flex justify-between">
              <span className="text-slate-400">Ad Format:</span>
              <span className="font-mono text-slate-200">{floor.dimensions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Daily Exposure:</span>
              <span className="font-mono text-cyan-300">{floor.impressionsPerDay}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Category:</span>
              <span className="text-slate-300 truncate max-w-[170px] text-right">{floor.category}</span>
            </div>
          </div>
        </div>

        {/* PRIMARY ACTION BUTTONS */}
        <div className="pt-2 flex flex-col gap-2">
          {/* View Floor Button (specifically requested) */}
          <button
            onClick={() => {
              alert(`Floor ${displayNum} 3D Advertising Details:\n- Owner: ${floor.ownerName || 'None'}\n- Status: ${floor.status}\n- Price: ₹${floor.price}\n- Dimensions: ${floor.dimensions}\n\nFull advertising management console connects in Phase 2!`);
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm border border-white/15 flex items-center justify-center gap-2 transition hover:shadow-lg active:scale-98"
          >
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>[View Floor]</span>
          </button>

          {isAvailable ? (
            <button
              onClick={() => {
                alert(`Proceeding to reserve Floor ${displayNum} for ₹${floor.price}! (Payment Gateway integration ready for Phase 2)`);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950/30 active:scale-98"
            >
              <Sparkles className="w-4 h-4" />
              <span>Claim Floor for ₹{floor.price}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                alert(`Submitting advertising sponsorship inquiry to Floor ${displayNum} (${floor.ownerName}).`);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs border border-amber-500/40 flex items-center justify-center gap-2 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Contact Floor Owner / Sponsor</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
