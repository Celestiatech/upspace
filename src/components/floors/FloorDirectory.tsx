'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Eye,
  MousePointerClick,
  Crown,
  ArrowUpDown,
  Box,
} from 'lucide-react';
import { FloorData, getDisplayFloorNumber, isPenthouseFloor } from '@/types/floor';
import { ThemeMode } from '@/types/theme';

interface FloorDirectoryProps {
  floors: FloorData[];
  theme: ThemeMode;
  onSelectFloor: (floor: FloorData) => void;
  onOpenPurchase: (floor: FloorData) => void;
  onSwitchTo3D: () => void;
}

export function FloorDirectory({
  floors,
  theme,
  onSelectFloor,
  onOpenPurchase,
  onSwitchTo3D,
}: FloorDirectoryProps) {
  const isDay = theme === 'day';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // desc = Penthouse (Floor 20) down to Ground (Floor 1)

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    floors.forEach((f) => {
      if (f.category) set.add(f.category);
    });
    return ['all', ...Array.from(set)];
  }, [floors]);

  // Filtered and sorted floors
  const filteredFloors = useMemo(() => {
    return [...floors]
      .filter((floor) => {
        const matchesSearch =
          searchQuery === '' ||
          (floor.brandTitle && floor.brandTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (floor.tagline && floor.tagline.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (floor.targetUrl && floor.targetUrl.toLowerCase().includes(searchQuery.toLowerCase())) ||
          floor.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          `floor ${getDisplayFloorNumber(floor.floorNumber, floors.length)}`.includes(searchQuery.toLowerCase());

        const matchesCat = selectedCategory === 'all' || floor.category === selectedCategory;
        return matchesSearch && matchesCat;
      })
      .sort((a, b) => {
        if (sortOrder === 'desc') {
          return b.floorNumber - a.floorNumber; // Top floor first
        }
        return a.floorNumber - b.floorNumber; // Ground floor first
      });
  }, [floors, searchQuery, selectedCategory, sortOrder]);

  return (
    <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16 transition-colors min-h-screen ${
      isDay ? 'text-slate-950' : 'text-white'
    }`}>
      {/* DIRECTORY HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-300 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-orange-700 dark:text-orange-400">
            <span>2D Directory &amp; Leaderboard</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-950 dark:text-white">
            Skyline Billboard Index
          </h1>
          <p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-300">
            Browse, search, and claim verified advertising floor levels across the UpSpace tower.
          </p>
        </div>

        {/* 3D SWITCH CTA BUTTON */}
        <button
          onClick={onSwitchTo3D}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white dark:bg-cyan-500 dark:hover:bg-cyan-600 font-black text-xs shadow-md transition active:scale-95"
        >
          <Box className="w-4 h-4" />
          <span>Switch to 3D Skyline Orbit</span>
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 my-6">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 dark:text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by brand, category or floor..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-bold border outline-none transition ${
              isDay
                ? 'bg-white border-slate-300 focus:border-slate-900 text-slate-950 placeholder:text-slate-500 shadow-sm'
                : 'bg-white/5 border-white/10 focus:border-cyan-400 text-white placeholder:text-slate-400'
            }`}
          />
        </div>

        {/* Sort Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-black border transition ${
              isDay
                ? 'bg-white border-slate-300 text-slate-900 hover:bg-slate-50 shadow-sm'
                : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-orange-600 dark:text-cyan-400" />
            <span>{sortOrder === 'desc' ? 'Top Floor (Penthouse) First' : 'Lobby First'}</span>
          </button>
        </div>
      </div>

      {/* DIRECTORY VIEW: MOBILE CARDS (< 768px) & DESKTOP TABLE (>= 768px) */}

      {/* 1. MOBILE RESPONSIVE CARDS (Visible on phones & small tablets) */}
      <div className="block md:hidden space-y-3">
        {filteredFloors.map((floor) => {
          const displayNum = getDisplayFloorNumber(floor.floorNumber, floors.length);
          const isPenthouse = isPenthouseFloor(floor.floorNumber, floors.length);
          const nextBid = Math.ceil(floor.price * 1.1);
          const domain = floor.targetUrl
            ? floor.targetUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
            : floor.brandTitle || 'upspace.city';

          return (
            <div
              key={`mob-${floor.id}`}
              onClick={() => onSelectFloor(floor)}
              className={`p-4 rounded-2xl border shadow-lg transition active:scale-[0.99] cursor-pointer ${
                isPenthouse
                  ? isDay
                    ? 'bg-amber-50/90 border-amber-300 shadow-amber-500/10'
                    : 'bg-amber-950/30 border-amber-500/30 shadow-amber-500/10'
                  : isDay
                  ? 'bg-white border-slate-300 shadow-slate-900/10'
                  : 'bg-slate-950/80 border-white/10 shadow-black/40'
              }`}
            >
              {/* CARD TOP HEADER: LEVEL & ELEVATION */}
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-1.5">
                  {isPenthouse ? (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/40 text-xs font-black">
                      <Crown className="w-3.5 h-3.5 text-amber-600" />
                      #{displayNum} PENTHOUSE
                    </span>
                  ) : floor.floorNumber === 0 ? (
                    <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/15 text-cyan-900 dark:text-cyan-300 border border-cyan-500/40 text-xs font-black">
                      #{displayNum} LOBBY
                    </span>
                  ) : (
                    <span className="font-mono text-sm font-black text-slate-950 dark:text-white">
                      Level #{displayNum}
                    </span>
                  )}
                  <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400">
                    +{floor.elevationMeters.toFixed(1)}m
                  </span>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">
                  {floor.category}
                </span>
              </div>

              {/* CARD BRAND INFO */}
              <div className="flex items-center gap-3 py-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm shrink-0 shadow-sm"
                  style={{ backgroundColor: floor.bannerColor || '#0284c7' }}
                >
                  {floor.brandTitle ? floor.brandTitle.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-black text-sm text-slate-950 dark:text-white truncate">
                      {floor.brandTitle || 'Available Level'}
                    </h3>
                    {floor.verifiedDomain && (
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-slate-700 dark:text-cyan-400 font-mono font-bold truncate">
                    {domain}
                  </div>
                </div>
              </div>

              {/* METRICS & ACTION BUTTON */}
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-200 dark:border-white/10">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Current Value</span>
                  <div className="font-mono font-black text-sm text-slate-950 dark:text-white">
                    ₹{floor.price.toLocaleString()}
                  </div>
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onOpenPurchase(floor)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs shadow-md shadow-orange-500/20 transition active:scale-95 touch-manipulation"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Outbid ₹{nextBid.toLocaleString()}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. DESKTOP/TABLET TABLE VIEW (Visible on screens >= 768px) */}
      <div className={`hidden md:block overflow-x-auto rounded-2xl border shadow-xl backdrop-blur-xl ${
        isDay ? 'bg-white border-slate-300 shadow-slate-900/10' : 'bg-slate-950/80 border-white/10 shadow-black/40'
      }`}>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className={`border-b font-black uppercase tracking-wider text-[11px] ${
              isDay ? 'bg-slate-100 text-slate-800 border-slate-300' : 'bg-white/[0.04] text-slate-300 border-white/10'
            }`}>
              <th className="py-4 px-4">Level</th>
              <th className="py-4 px-4">Elevation</th>
              <th className="py-4 px-4">Brand / Sponsor</th>
              <th className="py-4 px-4 hidden md:table-cell">Category</th>
              <th className="py-4 px-4 hidden lg:table-cell">Weekly Impressions</th>
              <th className="py-4 px-4 hidden sm:table-cell">Clicks Delivered</th>
              <th className="py-4 px-4 text-right">Current Value</th>
              <th className="py-4 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/5 font-bold">
            {filteredFloors.map((floor) => {
              const displayNum = getDisplayFloorNumber(floor.floorNumber, floors.length);
              const isPenthouse = isPenthouseFloor(floor.floorNumber, floors.length);
              const nextBid = Math.ceil(floor.price * 1.1);
              const domain = floor.targetUrl
                ? floor.targetUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
                : floor.brandTitle || 'upspace.city';

              return (
                <tr
                  key={floor.id}
                  className={`transition hover:bg-slate-50 dark:hover:bg-white/[0.03] cursor-pointer ${
                    isPenthouse ? 'bg-amber-500/[0.06]' : ''
                  }`}
                  onClick={() => onSelectFloor(floor)}
                >
                  {/* LEVEL BADGE */}
                  <td className="py-4 px-4 font-black">
                    <div className="flex items-center gap-1.5">
                      {isPenthouse ? (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/40 text-xs font-black">
                          <Crown className="w-3.5 h-3.5 text-amber-600" />
                          #{displayNum} PENTHOUSE
                        </span>
                      ) : floor.floorNumber === 0 ? (
                        <span className="px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-900 dark:text-cyan-300 border border-cyan-500/40 text-xs font-black">
                          #{displayNum} LOBBY
                        </span>
                      ) : (
                        <span className="font-mono text-sm font-black text-slate-950 dark:text-white">#{displayNum}</span>
                      )}
                    </div>
                  </td>

                  {/* ELEVATION */}
                  <td className="py-4 px-4 font-mono font-black text-slate-900 dark:text-slate-300 text-xs">
                    +{floor.elevationMeters.toFixed(1)}m
                  </td>

                  {/* BRAND & VERIFICATION */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-xs shrink-0 shadow-sm"
                        style={{ backgroundColor: floor.bannerColor || '#0284c7' }}
                      >
                        {floor.brandTitle ? floor.brandTitle.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-sm text-slate-950 dark:text-white truncate">
                            {floor.brandTitle || 'Available Level'}
                          </span>
                          {floor.verifiedDomain && (
                            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          )}
                        </div>
                        <div className="text-xs text-slate-800 dark:text-cyan-400 font-mono font-bold truncate">
                          {domain}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* CATEGORY */}
                  <td className="py-4 px-4 hidden md:table-cell">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs font-black text-slate-900 dark:text-slate-200">
                      {floor.category}
                    </span>
                  </td>

                  {/* IMPRESSIONS */}
                  <td className="py-4 px-4 hidden lg:table-cell font-mono font-black text-slate-950 dark:text-white">
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-slate-800 dark:text-cyan-400" />
                      <span>{((floor.impressionsWeekly || 140000) / 1000).toFixed(0)}k/wk</span>
                    </div>
                  </td>

                  {/* CLICKS */}
                  <td className="py-4 px-4 hidden sm:table-cell font-mono font-black text-emerald-800 dark:text-emerald-400">
                    <div className="flex items-center gap-1.5">
                      <MousePointerClick className="w-3.5 h-3.5" />
                      <span>{(floor.clicksDelivered || 2150).toLocaleString()}</span>
                    </div>
                  </td>

                  {/* CURRENT VALUE */}
                  <td className="py-4 px-4 text-right font-mono font-black text-sm sm:text-base text-slate-950 dark:text-white">
                    ₹{floor.price.toLocaleString()}
                  </td>

                  {/* ACTION CTA */}
                  <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onOpenPurchase(floor)}
                      className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs shadow-sm transition active:scale-95 touch-manipulation"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Outbid (₹{nextBid.toLocaleString()})</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* POLICY DISCLAIMER FOOTER */}
      <div className="mt-8 p-4 rounded-2xl border text-center text-xs font-bold text-slate-900 dark:text-slate-300 border-slate-300 dark:border-white/10 bg-white dark:bg-transparent shadow-sm">
        <div className="flex items-center justify-center gap-1.5 font-black text-slate-950 dark:text-white mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>All UpSpace Billboard Submissions Undergo Automated SSL &amp; Anti-Malware Verification</span>
        </div>
        No adult, scam, phishing, or malicious websites permitted. Standard 7-day retention cycle with outbid protection.
      </div>
    </div>
  );
}
