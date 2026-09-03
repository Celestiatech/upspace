'use client';

import React from 'react';
import { Arena } from '@/types/arena';
import { ARENAS } from '@/data/arenas';
import { Building2 } from 'lucide-react';

interface ArenaSelectorProps {
  currentArena: Arena;
  onSelectArena: (arena: Arena) => void;
}

export function ArenaSelector({ currentArena, onSelectArena }: ArenaSelectorProps) {
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-30 hidden md:block">
      <div className="backdrop-blur-xl bg-slate-950/80 border border-white/10 rounded-2xl p-1 shadow-2xl flex items-center gap-1">
        {ARENAS.slice(0, 5).map((arena) => {
          const isActive = arena.id === currentArena.id;
          return (
            <button
              key={arena.id}
              onClick={() => onSelectArena(arena)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
                isActive
                  ? 'bg-white/15 text-white shadow-sm border border-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: arena.themeColor }}
              />
              <span>{arena.name.replace(' Tower', '')}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
