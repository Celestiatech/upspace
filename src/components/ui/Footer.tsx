'use client';

import React from 'react';
import { Layers, ArrowUp } from 'lucide-react';
import { ThemeMode } from '@/types/theme';

interface FooterProps {
  theme: ThemeMode;
}

export function Footer({ theme }: FooterProps) {
  const isDay = theme === 'day';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-black/10 dark:border-white/10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* Brand */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-lg tracking-wider">
              FLOOR<span className="text-cyan-400">VERSE</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-sm">
            The premier 3D virtual advertising skyline marketplace. Own physical floors in virtual skyscrapers.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-8 text-xs text-slate-400">
          <a href="#hero" className="hover:text-cyan-400 transition">Explore Tower</a>
          <a href="#marketplace" className="hover:text-cyan-400 transition">Available Floors</a>
          <a href="#arenas" className="hover:text-cyan-400 transition">Arenas</a>
          <a href="#how-it-works" className="hover:text-cyan-400 transition">How It Works</a>
        </div>

        {/* Back to top */}
        <button
          onClick={scrollToTop}
          className={`p-3 rounded-2xl border transition flex items-center gap-2 text-xs font-mono ${
            isDay
              ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
              : 'bg-slate-900/80 hover:bg-slate-800 border-white/10 text-slate-300'
          }`}
        >
          <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
          <span>Top</span>
        </button>
      </div>

      <div className="mt-12 pt-8 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 font-mono">
        <div>© 2026 UpSpace Metaverse Architecture Inc. All rights reserved.</div>
        <div className="mt-2 sm:mt-0 flex gap-4">
          <span>Terms</span>
          <span>Privacy</span>
          <span>Prototype v1.2</span>
        </div>
      </div>
    </footer>
  );
}
