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

  const iconBtnClass = `w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-xl shadow-lg border transition-all duration-200 hover:scale-105 active:scale-95 pointer-events-auto touch-manipulation ${
    isDay
      ? 'bg-white/95 border-slate-200 shadow-slate-900/10 text-slate-900 hover:bg-white hover:border-slate-300'
      : 'bg-slate-950/85 border-white/10 shadow-black/40 text-slate-200 hover:bg-slate-900 hover:border-white/20'
  }`;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-2 sm:px-6 py-2 sm:py-3 transition-all duration-300 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        
        {/* 1. BRAND LOGO ICON / PILL */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl backdrop-blur-xl shadow-lg border transition-all ${
              isDay
                ? 'bg-white/95 border-slate-200 shadow-slate-900/10 text-slate-950'
                : 'bg-slate-950/85 border-white/10 shadow-black/40 text-white'
            }`}
          >
            <div
              className={`flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl ${
                isDay
                  ? 'bg-slate-950 text-white'
                  : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              }`}
            >
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <span className="font-black text-xs sm:text-sm tracking-tight select-none">
              Up<span className="text-orange-600 dark:text-cyan-400">Space</span>
            </span>
          </div>
        </div>

        {/* 2. FLOATING ACTION ICONS */}
        <div className="flex items-center gap-1 sm:gap-2 pointer-events-auto">
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
              <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
            <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
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

          {/* Day / Night Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className={iconBtnClass}
            title={isDay ? 'Switch to Night Mode' : 'Switch to Day Mode'}
            aria-label="Toggle Theme"
          >
            {isDay ? (
              <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-900" />
            ) : (
              <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
            )}
          </button>

          {/* Penthouse Ambient Music Toggle */}
          <button
            onClick={onTogglePenthouseMusic}
            className={`${iconBtnClass} ${
              penthouseMusic
                ? isDay
                  ? 'bg-amber-50 border-amber-300 text-amber-600 shadow-amber-500/20'
                  : 'bg-cyan-950/90 border-cyan-400/60 text-cyan-300 shadow-cyan-500/30 ring-1 ring-cyan-400/40'
                : ''
            } relative overflow-hidden`}
            title={
              penthouseMusic
                ? 'Penthouse Lounge Music (Playing) - Click to Mute'
                : 'Penthouse Lounge Music (Muted) - Click to Play'
            }
            aria-label="Toggle Penthouse Music"
          >
            {penthouseMusic ? (
              <div className="flex items-end justify-center gap-[2.5px] h-3.5 sm:h-4 w-3.5 sm:w-4">
                <span className="w-[2.5px] bg-current rounded-full animate-soundwave-1" />
                <span className="w-[2.5px] bg-current rounded-full animate-soundwave-2" />
                <span className="w-[2.5px] bg-current rounded-full animate-soundwave-3" />
              </div>
            ) : (
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-70" />
            )}
          </button>

          {/* Claim / Outbid Floor CTA Button */}
          <button
            onClick={onOpenGetFloor}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 h-8 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-[11px] sm:text-xs font-black shadow-lg shadow-orange-500/25 transition hover:scale-105 active:scale-95 pointer-events-auto touch-manipulation"
            title="Claim or Outbid Floor Level"
            aria-label="Claim Level"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden md:inline">Claim Level</span>
            <span className="hidden xs:inline md:hidden">Claim</span>
          </button>

          {/* USER AUTH & PROFILE AVATAR */}
          {activeUser ? (
            <button
              onClick={onOpenProfile}
              className="relative p-0.5 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-cyan-500 via-amber-500 to-orange-500 shadow-md shadow-orange-500/20 transition-transform duration-200 hover:scale-105 active:scale-95 pointer-events-auto touch-manipulation group"
              title={`Citizen Profile: ${displayName} (Click to view profile)`}
              aria-label="User Profile"
            >
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-[0.7rem] sm:rounded-[0.9rem] overflow-hidden bg-slate-900 flex items-center justify-center">
                {activeUser.avatarUrl ? (
                  <img
                    src={activeUser.avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover rounded-[0.7rem] sm:rounded-[0.9rem]"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-black text-[10px] sm:text-xs">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Online Pulse Indicator */}
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-emerald-500 border border-white dark:border-slate-950" />
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className={`${iconBtnClass} group`}
              title="Sign In / Create Account"
              aria-label="Sign In"
            >
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700 dark:text-slate-300 group-hover:text-cyan-500 transition-colors" />
            </button>
          )}
        </div>

      </div>
    </header>
  );
}


