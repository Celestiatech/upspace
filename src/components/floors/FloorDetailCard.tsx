'use client';

import React from 'react';
import { FloorData } from '@/types/floor';
import { ThemeMode } from '@/types/theme';
import { X, Sparkles, ExternalLink, ChevronLeft, ChevronRight, Building2, MapPin } from 'lucide-react';

interface FloorDetailCardProps {
  floor: FloorData | null;
  theme: ThemeMode;
  allFloors: FloorData[];
  onClose: () => void;
  onSelectFloor: (floor: FloorData) => void;
  onOpenPurchase: (floor: FloorData) => void;
}

export function FloorDetailCard({
  floor,
  theme,
  allFloors,
  onClose,
  onSelectFloor,
  onOpenPurchase,
}: FloorDetailCardProps) {
  if (!floor) return null;

  const isDay = theme === 'day';
  const isAvailable = floor.status === 'available';

  const currentIndex = allFloors.findIndex((f) => f.id === floor.id);
  const prevFloor = currentIndex > 0 ? allFloors[currentIndex - 1] : null;
  const nextFloor = currentIndex < allFloors.length - 1 ? allFloors[currentIndex + 1] : null;

  return (
    <div className={`glass-panel w-full max-w-sm rounded-2xl p-5 sm:p-6 text-white transition-all animate-in fade-in slide-in-from-right-3 duration-200 ${isDay ? 'bg-white/85 !text-slate-900 !border-slate-200/90' : ''}`}>
      <div
        className={`relative overflow-hidden ${
          isDay ? 'text-slate-900' : 'text-white'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 text-cyan-400" strokeWidth={1.7} />
            <span className="tech-label text-cyan-400">
              UpSpace / Skyline
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={!prevFloor}
              onClick={() => prevFloor && onSelectFloor(prevFloor)}
              className="icon-button"
              title="Previous floor"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={!nextFloor}
              onClick={() => nextFloor && onSelectFloor(nextFloor)}
              className="icon-button"
              title="Next floor"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="icon-button ml-1"
              aria-label="Close floor details"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="py-5 space-y-4">
          {/* FLOOR NUMBER & TITLE */}
          <div>
            <div className="tech-label">
              FLOOR {floor.floorNumber}
            </div>
            <div className="mt-1 text-2xl font-extrabold tracking-[-0.03em]">
              {floor.brandTitle || 'AVAILABLE'}
            </div>
            {floor.tagline && (
              <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
                <MapPin className="h-3.5 w-3.5 text-indigo-300" strokeWidth={1.7} />
                {floor.tagline}
              </div>
            )}
          </div>

          {/* OCCUPIED VS AVAILABLE LAYOUT (Requirement #3) */}
          {isAvailable ? (
            <div className="space-y-3 pt-1">
              <div className="p-3.5 rounded-xl bg-emerald-500/[0.09] border border-emerald-400/25">
                <div className="tech-label text-emerald-400">
                  STATUS
                </div>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Available for Acquisition
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/[0.045] border border-black/5 dark:border-white/[0.08]">
                <div className="tech-label">
                  STARTING PRICE
                </div>
                <div className="text-2xl font-extrabold font-mono mt-0.5 text-cyan-600 dark:text-cyan-400">
                  ₹{floor.price}
                </div>
              </div>

              <button
                onClick={() => onOpenPurchase(floor)}
                className="primary-action w-full"
              >
                <Sparkles className="w-4 h-4" />
                <span>Acquire floor</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3.5 rounded-xl bg-amber-500/[0.09] border border-amber-400/25">
                  <div className="tech-label text-amber-400">
                    STATUS
                  </div>
                  <div className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                    Occupied
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/[0.045] border border-black/5 dark:border-white/[0.08]">
                  <div className="tech-label">
                    FLOOR VALUE
                  </div>
                  <div className="text-sm font-extrabold font-mono mt-0.5">
                    ₹{floor.price}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/[0.045] border border-black/5 dark:border-white/[0.08]">
                <div className="tech-label">
                  OWNER
                </div>
                <div className="text-sm font-bold mt-0.5">
                  {floor.ownerName || 'Private Corporation'}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Category: {floor.category}
                </div>
              </div>

              <button
                onClick={() => {
                  alert(
                    `Commercial Space Details for Floor ${floor.floorNumber}:\n- Business: ${floor.brandTitle}\n- Owner: ${floor.ownerName}\n- Exposure: ${floor.impressionsPerDay}\n- Format: ${floor.dimensions}\n\nVisitor showroom console connects in Phase 2!`
                  );
                }}
                className="w-full py-3 px-4 rounded-xl bg-black/5 dark:bg-white/[0.07] hover:bg-black/10 dark:hover:bg-white/[0.12] text-sm font-semibold border border-black/10 dark:border-white/10 flex items-center justify-center gap-2 transition hover:scale-[1.01] active:scale-[0.99]"
              >
                <ExternalLink className="w-4 h-4 text-cyan-500" />
                <span>View tenant details</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
