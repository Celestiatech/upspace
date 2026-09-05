'use client';

import React, { useEffect, useState } from 'react';
import { Layers, Sparkles } from 'lucide-react';

export function CloudReveal() {
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState('INITIALIZING 3D ENGINE...');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    // Stage 1: Fast initial burst
    const t1 = setTimeout(() => {
      setProgress(48);
      setStatusText('COMPILING SKYLINE SHADERS...');
    }, 280);

    // Stage 2: Mesh & textures
    const t2 = setTimeout(() => {
      setProgress(82);
      setStatusText('STREAMING ARENA BILLBOARDS...');
    }, 620);

    // Stage 3: Ready
    const t3 = setTimeout(() => {
      setProgress(100);
      setStatusText('ENTERING GET3DBILLBOARDS SKYLINE...');
    }, 980);

    // Stage 4: Trigger smooth fade out
    const t4 = setTimeout(() => {
      setIsFadingOut(true);
    }, 1250);

    // Stage 5: Unmount
    const t5 = setTimeout(() => {
      setIsMounted(false);
    }, 1950);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  if (!isMounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050814] select-none transition-all duration-700 ease-out ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100 pointer-events-auto'
      }`}
      aria-label="Loading Get3DBillboards"
    >
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-cyan-600/20 via-indigo-600/15 to-orange-500/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
      </div>

      {/* Main Preloader Centerpiece */}
      <div className="relative z-10 flex flex-col items-center px-6 max-w-sm w-full animate-float-slow">
        
        {/* Animated Cyber Core Icon with Dual Orbiting Rings */}
        <div className="relative mb-6 flex items-center justify-center w-24 h-24">
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 border-r-cyan-400/60 animate-spin" />
          
          {/* Reverse Inner Ring */}
          <div className="absolute inset-2 rounded-full border-2 border-orange-500/20 border-b-orange-400 border-l-amber-400/60 animate-spin-reverse" />
          
          {/* Center Brand Glass Orb */}
          <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-white/20 shadow-2xl shadow-cyan-500/30 backdrop-blur-xl">
            <Layers className="w-7 h-7 text-cyan-400 animate-pulse" />
          </div>

          {/* Sparkle Accent */}
          <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-300 animate-bounce" />
        </div>

        {/* Brand Title */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Get<span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">3DBillboards</span>
          </span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
            3D LIVE
          </span>
        </div>

        {/* Subtitle / Status */}
        <p className="text-[11px] font-mono font-semibold tracking-widest text-slate-400 uppercase mb-4 h-4 text-center">
          {statusText}
        </p>

        {/* Glowing Progress Bar Container */}
        <div className="relative w-full h-2 rounded-full bg-slate-800/80 border border-white/10 p-0.5 overflow-hidden backdrop-blur-md shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-orange-400 shadow-lg shadow-cyan-400/50 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress Percentage */}
        <div className="flex justify-between w-full mt-2 text-[10px] font-mono text-slate-500">
          <span>CALIBRATING</span>
          <span className="text-cyan-400 font-bold">{progress}%</span>
        </div>

      </div>
    </div>
  );
}
