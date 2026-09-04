'use client';

import React from 'react';
import {
  Layers,
  Sparkles,
  Sun,
  Moon,
  Activity,
  HelpCircle,
  LayoutGrid,
  Box,
  User,
  LogOut,
} from 'lucide-react';
import { Arena } from '@/types/arena';
import { FloorData } from '@/types/floor';
import { ThemeMode } from '@/types/theme';
import { useAuth } from '@/components/auth/AuthProvider';

interface HeaderProps {
  currentArena: Arena;
  floors: FloorData[];
  theme: ThemeMode;
  viewMode: '3d' | 'directory';
  onToggleViewMode: () => void;
  onToggleTheme: () => void;
  onOpenHowItWorks: () => void;
  onOpenActivityFeed: () => void;
  onOpenGetFloor: () => void;
}

export function Header({
  currentArena,
  floors,
  theme,
  viewMode,
  onToggleViewMode,
  onToggleTheme,
  onOpenHowItWorks,
  onOpenActivityFeed,
  onOpenGetFloor,
}: HeaderProps) {
  const isDay = theme === 'day';
  const { user, signInWithGoogle, signOut } = useAuth();
  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Account';

  const iconBtnClass = `w-10 h-10 rounded-2xl flex items-center justify-center backdrop-blur-xl shadow-lg border transition-all duration-200 hover:scale-105 active:scale-95 pointer-events-auto ${
    isDay
      ? 'bg-white/90 border-slate-200 shadow-slate-900/10 text-slate-900 hover:bg-white hover:border-slate-300'
      : 'bg-slate-950/80 border-white/10 shadow-black/40 text-slate-200 hover:bg-slate-900 hover:border-white/20'
  }`;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-3 sm:px-6 py-3 transition-all duration-300 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* 1. BRAND LOGO ICON / PILL */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-2xl backdrop-blur-xl shadow-lg border transition-all ${
              isDay
                ? 'bg-white/90 border-slate-200 shadow-slate-900/10 text-slate-950'
                : 'bg-slate-950/80 border-white/10 shadow-black/40 text-white'
            }`}
          >
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-xl ${
                isDay
                  ? 'bg-slate-950 text-white'
                  : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              }`}
            >
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-black text-sm tracking-tight select-none">
              Up<span className="text-orange-600 dark:text-cyan-400">Space</span>
            </span>
          </div>
        </div>

        {/* 2. FLOATING ACTION ICONS */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* 3D Skyline / 2D Directory Toggle */}
          <button
            onClick={onToggleViewMode}
            className={`${iconBtnClass} ${
              viewMode === 'directory'
                ? isDay
                  ? 'bg-slate-950 text-white border-slate-900'
                  : 'bg-cyan-500 text-slate-950 border-cyan-400'
                : ''
            }`}
            title={viewMode === '3d' ? 'Switch to 2D Directory' : 'Switch to 3D Skyline'}
            aria-label="Toggle View Mode"
          >
            {viewMode === '3d' ? (
              <LayoutGrid className="w-4 h-4" />
            ) : (
              <Box className="w-4 h-4" />
            )}
          </button>

          {/* Live Activity Feed */}
          <button
            onClick={onOpenActivityFeed}
            className={`${iconBtnClass} relative`}
            title="Live Audit Log & Transactions"
            aria-label="Activity Feed"
          >
            <Activity className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          {/* How It Works / Rules */}
          <button
            onClick={onOpenHowItWorks}
            className={iconBtnClass}
            title="How UpSpace Works & Rules"
            aria-label="How It Works"
          >
            <HelpCircle className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          </button>

          {/* Day / Night Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className={iconBtnClass}
            title={isDay ? 'Switch to Night Mode' : 'Switch to Day Mode'}
            aria-label="Toggle Theme"
          >
            {isDay ? (
              <Moon className="w-4 h-4 text-slate-900" />
            ) : (
              <Sun className="w-4 h-4 text-amber-300" />
            )}
          </button>

          {/* Claim / Outbid Floor CTA Button */}
          <button
            onClick={onOpenGetFloor}
            className="flex items-center gap-1.5 px-3.5 h-10 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black shadow-lg shadow-orange-500/25 transition hover:scale-105 active:scale-95 pointer-events-auto"
            title="Claim or Outbid Floor Level"
            aria-label="Claim Level"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Claim Level</span>
          </button>

          {/* User Auth */}
          {user ? (
            <button
              onClick={signOut}
              className={`${iconBtnClass} group`}
              title={`Signed in as ${displayName} (Click to sign out)`}
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4 text-slate-700 dark:text-slate-300 group-hover:text-red-500 transition-colors" />
            </button>
          ) : (
            <button
              onClick={signInWithGoogle}
              className={iconBtnClass}
              title="Sign In"
              aria-label="Sign In"
            >
              <User className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
