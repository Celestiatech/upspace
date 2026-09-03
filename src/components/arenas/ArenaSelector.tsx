'use client';

import React from 'react';
import { ARENA_LIST, ArenaInfo } from '@/data/arenas';
import { ThemeMode } from '@/types/theme';
import { Building2, Utensils, ShoppingBag, Gamepad2, Hotel, Video, ArrowRight, Lock } from 'lucide-react';

interface ArenaSelectorProps {
  theme: ThemeMode;
  onSelectActiveArena?: () => void;
}

const arenaIcons: Record<string, any> = {
  'business-tower': Building2,
  'restaurant-district': Utensils,
  'shopping-mall': ShoppingBag,
  'gaming-arena': Gamepad2,
  'hotel-district': Hotel,
  'creator-tower': Video,
};

export function ArenaSelector({ theme, onSelectActiveArena }: ArenaSelectorProps) {
  const isDay = theme === 'day';

  return (
    <section id="arenas" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold uppercase">
          METAVERSE SKYLINE DISTRICTS
        </div>
        <h2
          className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight ${
            isDay ? 'text-slate-900' : 'text-white'
          }`}
        >
          Explore Arenas
        </h2>
        <p
          className={`text-base sm:text-lg ${
            isDay ? 'text-slate-600' : 'text-slate-400'
          }`}
        >
          Iconic architectural towers tailored for distinct global commercial ecosystems.
        </p>
      </div>

      {/* Grid of 6 Arena Cards (Requirement #5) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        {ARENA_LIST.map((arena: ArenaInfo) => {
          const Icon = arenaIcons[arena.id] || Building2;
          const isActive = arena.status === 'active';

          return (
            <div
              key={arena.id}
              className={`relative rounded-3xl p-6 sm:p-7 border transition-all duration-300 flex flex-col justify-between group overflow-hidden ${
                isActive
                  ? isDay
                    ? 'bg-white border-cyan-400/50 shadow-xl shadow-cyan-100/50 hover:border-cyan-500'
                    : 'bg-slate-950/80 border-cyan-500/40 shadow-glow hover:border-cyan-400'
                  : isDay
                  ? 'bg-slate-100/60 border-slate-200 opacity-90'
                  : 'bg-slate-900/40 border-white/5 opacity-85'
              }`}
            >
              {/* Subtle Top Gradient Glow */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5 opacity-80"
                style={{ backgroundColor: arena.themeColor }}
              />

              <div>
                {/* Status Badge & Icon */}
                <div className="flex items-center justify-between pb-5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: `${arena.themeColor}15`,
                      borderColor: `${arena.themeColor}40`,
                      color: arena.themeColor,
                    }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 animate-pulse'
                        : 'bg-white/5 text-slate-400 border-white/10'
                    }`}
                  >
                    {arena.badge}
                  </span>
                </div>

                {/* Arena Title & Category */}
                <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
                  {arena.category}
                </span>
                <h3
                  className={`text-xl font-extrabold tracking-tight mt-1 ${
                    isDay ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {arena.name}
                </h3>
                <div className="text-xs font-semibold text-cyan-500 dark:text-cyan-400 mt-0.5">
                  &ldquo;{arena.tagline}&rdquo;
                </div>

                <p
                  className={`text-xs mt-3 leading-relaxed ${
                    isDay ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  {arena.description}
                </p>
              </div>

              {/* Action Trigger */}
              <div className="pt-6 mt-6 border-t border-black/5 dark:border-white/5">
                {isActive ? (
                  <button
                    onClick={onSelectActiveArena}
                    className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <span>Explore 3D Tower</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-mono py-2">
                    <Lock className="w-3.5 h-3.5" />
                    <span>In Development</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
