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
  Music,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Arena } from '@/types/arena';
import { FloorData } from '@/types/floor';
import { ThemeMode } from '@/types/theme';
import { useAuth } from '@/components/auth/AuthProvider';
import { useAppStore } from '@/store/useAppStore';

interface HeaderProps {
  currentArena: Arena;
  floors: FloorData[];
  theme: ThemeMode;
  viewMode: '3d' | 'directory';
  penthouseMusic?: boolean;
  onTogglePenthouseMusic?: () => void;
  onToggleViewMode: () => void;
  onToggleTheme: () => void;
  onOpenHowItWorks: () => void;
  onOpenActivityFeed: () => void;
  onOpenGetFloor: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}

export function Header({
  currentArena,
  floors,
  theme,
  viewMode,
  penthouseMusic = false,
  onTogglePenthouseMusic,
  onToggleViewMode,
  onToggleTheme,
  onOpenHowItWorks,
  onOpenActivityFeed,
  onOpenGetFloor,
  onOpenAuth,
  onOpenProfile,
}: HeaderProps) {
  const isDay = theme === 'day';
  const { user: authUser } = useAuth();
  const storeUser = useAppStore((state) => state.user);
  const activeUser = storeUser || (authUser ? {
    name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Citizen',
    avatarUrl: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture,
    email: authUser.email || '',
    username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'citizen',
  } : null);

  const displayName = activeUser?.name || 'Citizen';

  const iconBtnClass = `w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-2xl flex items-center justify-center backdrop-blur-xl shadow-md border transition-all duration-200 hover:scale-105 active:scale-95 pointer-events-auto touch-manipulation ${
    isDay
      ? 'bg-white/95 border-slate-200/90 shadow-slate-900/10 text-slate-900 hover:bg-white hover:border-slate-300'
      : 'bg-slate-950/85 border-white/10 shadow-black/40 text-slate-200 hover:bg-slate-900 hover:border-white/20'
  }`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-7 py-3 sm:py-4 transition-all duration-300 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-start justify-between gap-2 sm:gap-3">
        
        {/* 1. BRAND LOGO ICON / PILL (Visible in Directory Mode) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {viewMode === 'directory' && (
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-2xl backdrop-blur-xl shadow-md border transition-all ${
                isDay
                  ? 'bg-white/95 border-slate-200 shadow-slate-900/10 text-slate-950'
                  : 'bg-slate-950/85 border-white/10 shadow-black/40 text-white'
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
                Get<span className="text-orange-600 dark:text-cyan-400">3DBillboards</span>
              </span>
            </div>
          )}
        </div>

        {/* 2. FLOATING ACTION ICONS (Top Right: Directory Toggle, Activity, Rules & User Profile) */}
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
              <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700 dark:text-slate-200" />
            ) : (
              <Box className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>

          {/* Live Activity Feed */}
          <button
            onClick={onOpenActivityFeed}
            className={`${iconBtnClass} relative`}
            title="Live Audit Log & Transactions"
            aria-label="Activity Feed"
          >
            <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600 dark:text-orange-400" />
            <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          {/* How It Works / Rules */}
          <button
            onClick={onOpenHowItWorks}
            className={iconBtnClass}
            title="How UpSpace Works & Rules"
            aria-label="How It Works"
          >
            <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700 dark:text-slate-300" />
          </button>

          {/* USER AUTH & PROFILE AVATAR */}
          {activeUser ? (
            <button
              onClick={onOpenProfile}
              className="relative p-0.5 rounded-2xl bg-gradient-to-tr from-cyan-500 via-amber-500 to-orange-500 shadow-md shadow-orange-500/20 transition-transform duration-200 hover:scale-105 active:scale-95 pointer-events-auto touch-manipulation group"
              title={`Citizen Profile: ${displayName} (Click to view profile)`}
              aria-label="User Profile"
            >
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-[0.9rem] overflow-hidden bg-slate-900 flex items-center justify-center">
                {activeUser.avatarUrl ? (
                  <img
                    src={activeUser.avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover rounded-[0.9rem]"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs sm:text-sm">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Online Pulse Indicator */}
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-slate-950" />
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className={`${iconBtnClass} group`}
              title="Sign In / Create Account"
              aria-label="Sign In"
            >
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700 dark:text-slate-300 group-hover:text-orange-500 transition-colors" />
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
