'use client';

import React from 'react';
import { X, Trophy, ArrowUpRight, TrendingUp, Sparkles, Building, CheckCircle2, Lock } from 'lucide-react';
import { WORLD_LANDMARKS, calculateBuildingHeight, getLandmarkComparison, Landmark } from '@/data/landmarks';
import { ThemeMode } from '@/types/theme';

interface HeightLadderModalProps {
  floorCount: number;
  theme: ThemeMode;
  onClose: () => void;
  onOpenPurchase?: () => void;
}

export function HeightLadderModal({ floorCount, theme, onClose, onOpenPurchase }: HeightLadderModalProps) {
  const isDay = theme === 'day';
  const comparison = getLandmarkComparison(floorCount);
  const currentHeight = comparison.currentHeight;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/65 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-2xl max-h-[92dvh] sm:max-h-[90vh] overflow-hidden rounded-[1.8rem] sm:rounded-3xl border shadow-2xl flex flex-col ${
          isDay
            ? 'bg-white/95 border-slate-200/90 text-slate-900 shadow-slate-900/20'
            : 'bg-slate-900/95 border-slate-700/80 text-white shadow-cyan-950/40'
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200/60 dark:border-white/10 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white shrink-0">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-extrabold tracking-tight">Skyline Height Leaderboard</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-orange-500/10 text-orange-600 border border-orange-500/20">
                  Global Scale
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Compare UpSpace's elevation against the world's most famous monuments.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl sm:rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Stats Hero Banner */}
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border-b border-slate-200/50 dark:border-white/5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
              Current Tower Elevation
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-black">{currentHeight.toFixed(0)}</span>
              <span className="text-sm font-bold text-slate-500">Meters</span>
              <span className="text-sm font-semibold text-slate-400">({floorCount} Floors)</span>
            </div>
          </div>

          {comparison.highestSurpassed && (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Higher than {comparison.highestSurpassed.name} ({comparison.highestSurpassed.heightMeters}m)!</span>
            </div>
          )}
        </div>

        {/* Scrollable Landmarks List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5 custom-scrollbar">
          {WORLD_LANDMARKS.map((landmark) => {
            const isPassed = currentHeight >= landmark.heightMeters;
            const isNext = comparison.nextMilestone?.id === landmark.id;
            const progress = Math.min(100, (currentHeight / landmark.heightMeters) * 100);

            return (
              <div
                key={landmark.id}
                className={`relative p-4 rounded-2xl border transition-all duration-300 ${
                  isPassed
                    ? 'bg-emerald-500/5 border-emerald-500/30 dark:bg-emerald-950/20'
                    : isNext
                    ? 'bg-orange-500/10 border-orange-500/40 ring-1 ring-orange-500/30 dark:bg-orange-950/20'
                    : 'bg-slate-100/50 border-slate-200/70 dark:bg-white/5 dark:border-white/10 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    {/* Real Landmark Photograph */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shrink-0 border border-slate-300 dark:border-white/15 shadow-md bg-slate-100 relative">
                      <img
                        src={landmark.imageUrl}
                        alt={landmark.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute top-1 left-1 w-5 h-5 rounded-md bg-black/40 backdrop-blur-sm flex items-center justify-center text-xs">
                        {landmark.icon}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-sm sm:text-base leading-snug text-slate-950 dark:text-white">
                          {landmark.name}
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-slate-200">
                          {landmark.location}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1 line-clamp-2">
                        {landmark.description}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white">
                      {landmark.heightMeters} m
                    </div>
                    {isPassed ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> Surpassed
                      </span>
                    ) : isNext ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 dark:text-orange-400">
                        <TrendingUp className="w-3 h-3" /> Next Target
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                        <Lock className="w-3 h-3" /> +{landmark.floorsRequired - floorCount} Floors
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isPassed
                          ? 'bg-emerald-500'
                          : isNext
                          ? 'bg-gradient-to-r from-orange-500 to-amber-400'
                          : 'bg-slate-400'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  {isNext && (
                    <div className="flex justify-between items-center mt-1.5 text-[11px] font-semibold text-orange-600 dark:text-orange-400">
                      <span>{progress.toFixed(0)}% reached ({currentHeight.toFixed(0)}m / {landmark.heightMeters}m)</span>
                      <span>Need {comparison.floorsToNext} more floors to outclimb</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="p-4 sm:p-5 border-t border-slate-200/60 dark:border-white/10 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Every added floor increases the tower's global prominence by 4.5m.
          </div>
          {onOpenPurchase && (
            <button
              onClick={() => {
                onClose();
                onOpenPurchase();
              }}
              className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/25 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Add Floor & Climb Skyline</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
