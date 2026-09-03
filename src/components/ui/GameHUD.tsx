'use client';

import React, { useState } from 'react';
import {
  Layers,
  Sun,
  Moon,
  RotateCw,
  Focus,
  Search,
  Info,
  Sparkles,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Building2,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Arena } from '@/types/arena';
import { FloorData } from '@/types/floor';
import { ThemeMode } from '@/types/theme';

interface GameHUDProps {
  arena: Arena;
  floors: FloorData[];
  selectedFloor: FloorData | null;
  theme: ThemeMode;
  autoRotate: boolean;
  onToggleTheme: () => void;
  onToggleAutoRotate: () => void;
  onResetCamera: () => void;
  onSelectFloor: (floor: FloorData) => void;
  onOpenPurchase: () => void;
}

export function GameHUD({
  arena,
  floors,
  selectedFloor,
  theme,
  autoRotate,
  onToggleTheme,
  onToggleAutoRotate,
  onResetCamera,
  onSelectFloor,
  onOpenPurchase,
}: GameHUDProps) {
  const isDay = theme === 'day';
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDistrictInfo, setShowDistrictInfo] = useState(false);
  const [showElevator, setShowElevator] = useState(false); // Collapsed by default for clean view
  const [showFloorCard, setShowFloorCard] = useState(true);
  const [zenMode, setZenMode] = useState(false);

  // Sorted 20 down to 1
  const reversedFloors = [...floors].sort((a, b) => b.floorNumber - a.floorNumber);

  const currentFloor = selectedFloor || reversedFloors[0];
  const isAvailable = currentFloor.status === 'available';
  const nextFloorNumber = Math.max(...floors.map((floor) => floor.floorNumber), 0) + 1;

  const currentIndex = reversedFloors.findIndex((f) => f.id === currentFloor.id);
  const goUp = () => {
    if (currentIndex > 0) onSelectFloor(reversedFloors[currentIndex - 1]);
  };
  const goDown = () => {
    if (currentIndex < reversedFloors.length - 1) onSelectFloor(reversedFloors[currentIndex + 1]);
  };

  const filteredFloors = floors.filter(
    (f) =>
      f.floorNumber.toString().includes(searchQuery) ||
      (f.brandTitle && f.brandTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.tagline && f.tagline.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className={`absolute inset-0 pointer-events-none z-30 select-none ${isDay ? '' : 'dark'}`}>
      
      {/* 1. TOP NAVIGATION BAR (Consolidated & Re-positioned) */}
      <header className="absolute top-4 left-4 sm:left-6 right-4 sm:right-6 flex items-center justify-between z-20 pointer-events-none">
        {/* Brand mark */}
        <div className="pointer-events-auto flex h-14 items-center gap-3 bg-white/92 dark:bg-slate-950/90 backdrop-blur-xl px-3.5 rounded-xl shadow-lg shadow-slate-950/10 border border-slate-200/90 dark:border-slate-700/80">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden">
            <img src="/brand/upspace-mark.png" alt="UpSpace" className="h-full w-full object-contain" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-bold tracking-[0.16em] text-slate-900 dark:text-white uppercase">
                UP<span className="text-cyan-400">SPACE</span>
              </h1>
              <span className="text-[9px] font-semibold tracking-wide px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                LIVE
              </span>
            </div>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              {arena.name}
            </span>
          </div>
        </div>

        {/* Utility controls */}
        <div className="pointer-events-auto flex h-14 items-center gap-1 sm:gap-1.5 bg-white/92 dark:bg-slate-950/90 backdrop-blur-xl p-1.5 rounded-xl shadow-lg shadow-slate-950/10 border border-slate-200/90 dark:border-slate-700/80">
          {/* Quick Search Input */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Floors..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value) setShowSearch(true);
              }}
              onFocus={() => {
                if (searchQuery) setShowSearch(true);
              }}
              className="bg-slate-100/80 dark:bg-slate-900 text-slate-900 dark:text-white pl-8 pr-3 py-1.5 text-xs rounded-lg outline-none w-28 sm:w-36 focus:w-44 transition-all border border-transparent focus:border-slate-400 dark:focus:border-cyan-500 placeholder:text-slate-400"
            />
          </div>

          {/* Sun / Moon Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-200 transition"
            title={isDay ? "Switch to Night Mode" : "Switch to Day Mode"}
          >
            {isDay ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Auto-Rotate Toggle */}
          <button
            onClick={onToggleAutoRotate}
            className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition ${
              autoRotate ? 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40' : 'text-slate-700 dark:text-slate-300'
            }`}
            title={autoRotate ? "Pause Rotation" : "Auto Rotate Building"}
          >
            <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '12s' }} />
          </button>

          {/* Focus / Reset View */}
          <button
            onClick={onResetCamera}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 transition"
            title="Focus Top Floor"
          >
            <Focus className="w-4 h-4" />
          </button>

          {/* Zen / Cinematic View (Hide UI) */}
          <button
            onClick={() => setZenMode(!zenMode)}
            className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition ${
              zenMode ? 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40' : 'text-slate-700 dark:text-slate-300'
            }`}
            title={zenMode ? "Exit Zen Mode" : "Zen View (Hide UI)"}
          >
            {zenMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* District Info */}
          <button
            onClick={() => setShowDistrictInfo(!showDistrictInfo)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 transition"
            title="District Information"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Primary CTA: create the next upper level */}
          <button
            onClick={onOpenPurchase}
            className="bg-slate-900 hover:bg-slate-800 dark:bg-cyan-400 dark:hover:bg-cyan-300 text-white dark:text-slate-950 text-xs px-3.5 py-2 rounded-lg font-semibold transition active:scale-[0.98] flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Build LVL {nextFloorNumber}</span>
          </button>
        </div>
      </header>

      {/* 2. RIGHT SIDE: FIXED SIDE-RAIL FLOOR SELECTOR */}
      {!zenMode && (
        <aside className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 pointer-events-auto flex flex-col items-end">
          {showElevator ? (
            <div className="flex flex-col items-center gap-1 max-h-[65vh] overflow-y-auto custom-scrollbar p-1.5 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/80 dark:border-slate-800 shadow-2xl select-none animate-in fade-in slide-in-from-right-2">
              {/* Collapse Button */}
              <button
                onClick={() => setShowElevator(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
                title="Collapse Floor Rail"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Elevator Up Button */}
              <button
                onClick={goUp}
                disabled={currentIndex <= 0}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-20 transition"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>

              <span className="text-[8px] font-mono font-bold text-slate-400 tracking-wider">
                LVL
              </span>

              {/* Floor Scrubber Strip */}
              <div className="flex flex-col gap-1 w-full">
                {reversedFloors.map((f) => {
                  const isSelected = currentFloor.id === f.id;
                  const isFloorAvail = f.status === 'available';

                  return (
                    <button
                      key={f.id}
                      onClick={() => onSelectFloor(f)}
                      className={`flex items-center justify-between gap-2 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                        isSelected
                          ? 'bg-indigo-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-md scale-105 z-10'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title={`Floor ${f.floorNumber} - ${f.brandTitle || 'Available'} (₹${f.price})`}
                    >
                      <span>{f.floorNumber}</span>
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          isSelected
                            ? 'bg-white dark:bg-slate-950'
                            : isFloorAvail
                            ? 'bg-emerald-500'
                            : 'bg-amber-500'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Elevator Down Button */}
              <button
                onClick={goDown}
                disabled={currentIndex >= reversedFloors.length - 1}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-20 transition"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Fixed Collapsed Side-Rail Pill */
            <button
              onClick={() => setShowElevator(true)}
              className="flex items-center gap-2 px-3 py-3 rounded-2xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-white/80 dark:border-slate-800 shadow-xl text-slate-800 dark:text-white transition hover:scale-105"
              title="Open Floor Selector"
            >
              <ChevronLeft className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
              <span className="text-xs font-mono font-bold">LVL {currentFloor.floorNumber}</span>
            </button>
          )}
        </aside>
      )}

      {/* 3. BOTTOM CARDS: DISTRICT STATS & HIGH-CONTRAST FLOOR CARD */}
      {!zenMode && (
        <footer className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 flex flex-col sm:flex-row items-end justify-between gap-4 pointer-events-none z-20">
          
          {/* Bottom-Left: Compact district control bar */}
          <div className="pointer-events-auto flex h-14 items-center gap-3 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl px-3.5 rounded-xl border border-white/80 dark:border-slate-800 shadow-xl text-slate-900 dark:text-white transition">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <Building2 className="h-4 w-4 text-cyan-500" strokeWidth={1.7} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-600 dark:text-cyan-400">{arena.name}</div>
              <div className="text-xs font-bold whitespace-nowrap">Business Tower</div>
            </div>
            <div className="hidden sm:flex items-center gap-3 border-l border-slate-200 dark:border-slate-700 pl-3 font-mono text-[10px]">
              <span><b className="text-slate-900 dark:text-white">{floors.length}</b> <i className="not-italic text-slate-500">FLR</i></span>
              <span><b className="text-amber-600 dark:text-amber-400">{floors.filter((f) => f.status === 'sold').length}</b> <i className="not-italic text-slate-500">USED</i></span>
              <span><b className="text-emerald-600 dark:text-emerald-400">{floors.filter((f) => f.status === 'available').length}</b> <i className="not-italic text-slate-500">OPEN</i></span>
            </div>
          </div>

          {/* Bottom-Right: High-Contrast Popover Card */}
          {showFloorCard ? (
            <div className="pointer-events-auto flex h-14 w-full sm:w-[340px] items-center gap-2.5 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl px-3.5 rounded-xl border border-white/80 dark:border-slate-800 shadow-2xl text-slate-900 dark:text-white transition animate-in fade-in slide-in-from-bottom-2">
              <span className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                  isAvailable
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                }`}>
                LVL {currentFloor.floorNumber}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-extrabold uppercase tracking-tight">{currentFloor.brandTitle || 'Available Floor'}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">{currentFloor.elevationMeters}m elevation · <b className="text-cyan-600 dark:text-cyan-400">₹{currentFloor.price}</b></div>
              </div>
              <button
                onClick={onOpenPurchase}
                className="shrink-0 rounded-lg bg-indigo-600 px-3 py-2 text-[10px] font-bold text-white transition hover:bg-indigo-700 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400 active:scale-[0.98]"
              >
                Build next
              </button>
            </div>
          ) : (
            /* Minimized Card Pill */
            <button
              onClick={() => setShowFloorCard(true)}
              className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-white/80 dark:border-slate-800 shadow-xl text-slate-900 dark:text-white transition hover:scale-105"
              title="Expand Floor Details"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <span className="text-xs font-bold font-mono">F{currentFloor.floorNumber} • {currentFloor.brandTitle || 'AVAILABLE'}</span>
              <span className="text-xs text-indigo-600 dark:text-cyan-400 font-bold">₹{currentFloor.price}</span>
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </footer>
      )}

      {/* 4. SEARCH MODAL */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/70 pointer-events-auto">
          <div
            className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl ${
              isDay ? 'bg-white text-slate-900 border-slate-300' : 'bg-slate-950 text-white border-white/20'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
              <span className="font-bold text-sm font-mono">SEARCH VIRTUAL FLOORS</span>
              <button onClick={() => setShowSearch(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Search by floor number, brand, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full mt-4 px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/15 text-sm font-sans focus:outline-none focus:border-cyan-400"
              autoFocus
            />

            <div className="mt-3 max-h-60 overflow-y-auto custom-scrollbar space-y-1">
              {filteredFloors.map((f) => (
                <div
                  key={f.id}
                  onClick={() => {
                    onSelectFloor(f);
                    setShowSearch(false);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer text-xs font-sans transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-400">F{f.floorNumber}</span>
                    <span className="font-semibold">{f.brandTitle || 'Available'}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">₹{f.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. DISTRICT INFO MODAL */}
      {showDistrictInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/70 pointer-events-auto">
          <div
            className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl ${
              isDay ? 'bg-white text-slate-900 border-slate-300' : 'bg-slate-950 text-white border-white/20'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-sm font-mono">{arena.name.toUpperCase()}</span>
              </div>
              <button onClick={() => setShowDistrictInfo(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs leading-relaxed text-slate-300">
              <p>
                <strong>UpSpace 3D City Engine</strong> is an interactive virtual marketplace where businesses claim physical advertising floors inside virtual skyscrapers.
              </p>
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] font-mono space-y-1 text-slate-300">
                <div>🏢 Total Height: 36.6 Meters</div>
                <div>📍 Floor Plate: 9.2m × 9.2m (Bulkier Tapered)</div>
                <div>🌐 Rendering: Three.js / WebGL with PBR & Environment Map</div>
                <div>🛰️ Infrastructure: Real-time Camera Orbit & Elevator Teleport</div>
              </div>
            </div>

            <button
              onClick={() => setShowDistrictInfo(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs transition hover:bg-cyan-400"
            >
              Resume 3D Experience
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
