'use client';

import React from 'react';
import {
  Layers,
  Building2,
  HelpCircle,
  User,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';
import { Arena } from '@/types/arena';
import { ThemeMode } from '@/types/theme';
import { useAuth } from '@/components/auth/AuthProvider';

interface HeaderProps {
  currentArena: Arena;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenHowItWorks: () => void;
  onOpenGetFloor: () => void;
}

export function Header({
  currentArena,
  theme,
  onToggleTheme,
  onOpenHowItWorks,
  onOpenGetFloor,
}: HeaderProps) {
  const isDay = theme === 'day';
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const displayName = user?.user_metadata?.name || user?.email || 'Account';

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-6 py-3 transition-all duration-300">
      <div
        className={`max-w-7xl mx-auto flex items-center justify-between backdrop-blur-xl rounded-2xl px-4 sm:px-6 py-2.5 shadow-2xl transition-all duration-300 ${
          isDay
            ? 'bg-white/85 border border-slate-200/90 shadow-slate-400/20 text-slate-900'
            : 'bg-slate-950/75 border border-white/10 shadow-cyan-950/20 text-white'
        }`}
      >
        {/* LOGO & ARENA BADGE */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className={`relative flex items-center justify-center w-10 h-10 rounded-xl border transition-all ${
              isDay
                ? 'bg-cyan-50 border-cyan-400/60 text-cyan-600 shadow-md shadow-cyan-100'
                : 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-cyan-500/40 shadow-glow text-cyan-400'
            }`}
          >
            <Layers className="w-5 h-5 animate-pulse" />
            <span
              className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${
                isDay ? 'bg-cyan-600' : 'bg-cyan-400'
              } animate-ping`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`font-extrabold text-lg sm:text-xl tracking-wider font-sans ${
                  isDay ? 'text-slate-900' : 'text-white'
                }`}
              >
                FLOOR<span className={isDay ? 'text-cyan-600' : 'text-cyan-400'}>VERSE</span>
              </span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-medium">
                <Building2 className="w-3.5 h-3.5" />
                <span>{currentArena.name}</span>
              </div>
            </div>
            <p
              className={`text-[11px] hidden sm:block ${
                isDay ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Virtual Advertising Skyline • 20 Floors
            </p>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-2">
          <button
            onClick={onOpenHowItWorks}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              isDay
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>How It Works</span>
          </button>
        </nav>

        {/* ACTIONS: THEME TOGGLE ICON, LOGIN, GET A FLOOR */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* SMALL ICON TO TOGGLE LIGHT AND DARK MODE */}
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
              isDay
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-amber-600 shadow-sm'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-cyan-400 hover:text-cyan-300'
            }`}
            title={isDay ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle Light and Dark Mode"
          >
            {isDay ? (
              <Sun className="w-4 h-4 transition-transform hover:rotate-45 duration-300" />
            ) : (
              <Moon className="w-4 h-4 transition-transform hover:-rotate-12 duration-300" />
            )}
          </button>

          {/* Login Button */}
          {user ? (
            <button
              onClick={signOut}
              title={`Signed in as ${displayName}`}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition border ${
                isDay
                  ? 'text-cyan-700 hover:text-cyan-900 hover:bg-cyan-50 border-cyan-300'
                  : 'text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10 border-cyan-500/30'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="max-w-[120px] truncate">{displayName}</span>
            </button>
          ) : (
            <button
              onClick={signInWithGoogle}
              disabled={loading}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition border ${
                isDay
                  ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
                  : 'text-slate-300 hover:text-white hover:bg-white/10 border-white/10'
              } disabled:opacity-50`}
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>{loading ? '...' : 'Log in'}</span>
            </button>
          )}

          {/* Get a Floor CTA */}
          <button
            onClick={onOpenGetFloor}
            className="relative group overflow-hidden flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-black bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:shadow-glow transition-all duration-300 active:scale-95 shadow-md"
          >
            <Sparkles className="w-4 h-4 text-slate-950 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Get a Floor</span>
          </button>
        </div>
      </div>
    </header>
  );
}
