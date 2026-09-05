'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  RotateCcw,
  Sparkles,
  Crown,
  Globe,
  Plus,
  Minus,
  ArrowRight,
  Zap,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Ruler,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Layers,
  Activity,
  Users,
  Building,
  DollarSign,
  Eye,
  Check,
} from 'lucide-react';
import { Arena } from '@/types/arena';
import { FloorData, getDisplayFloorNumber } from '@/types/floor';
import { ThemeMode } from '@/types/theme';

export const CATEGORIES_LIST = [
  'AI & Automation',
  'Developer Tools',
  'SaaS & Tech',
  'Finance & FinTech',
  'Education & EdTech',
  'Healthcare & Wellness',
  'Real Estate',
  'Travel & Hospitality',
  'Food & Beverage',
  'Professional Services',
  'E-Commerce',
  'Design & Agency',
  'Media & Gaming',
  'Web3 & Crypto',
  'Health & Fitness',
  'Directories & Launch',
  'Sales & Marketing',
  'Community & Nonprofit',
  'Other / Custom',
];

const CATEGORY_EMOJIS: Record<string, string> = {
  'AI & Automation': '🤖', 'Developer Tools': '🛠️', 'SaaS & Tech': '💻',
  'Finance & FinTech': '💳', 'Education & EdTech': '📚', 'Healthcare & Wellness': '🩺',
  'Real Estate': '🏢', 'Travel & Hospitality': '✈️', 'Food & Beverage': '🍔',
  'Professional Services': '💼', 'E-Commerce': '🛒', 'Design & Agency': '🎨',
  'Media & Gaming': '🎮', 'Web3 & Crypto': '🔗', 'Health & Fitness': '💪',
  'Directories & Launch': '🚀', 'Sales & Marketing': '📣', 'Community & Nonprofit': '🤝',
  'Other / Custom': '✨',
};

interface GameHUDProps {
  arena: Arena;
  floors: FloorData[];
  selectedFloor: FloorData | null;
  theme: ThemeMode;
  autoRotate: boolean;
  lowPower?: boolean;
  penthouseMusic?: boolean;
  onToggleTheme: () => void;
  onToggleAutoRotate: () => void;
  onToggleLowPower: () => void;
  onTogglePenthouseMusic?: () => void;
  onResetCamera: () => void;
  onOpenPurchase: (floor?: FloorData, initialUrl?: string, initialCategory?: string, initialBid?: number) => void;
  onOpenHowItWorks?: () => void;
  onOpenActivityFeed?: () => void;
  onOpenTerms?: () => void;
  onOpenPrivacy?: () => void;
}

export function GameHUD({
  arena,
  floors,
  selectedFloor,
  theme,
  autoRotate,
  penthouseMusic = false,
  onToggleTheme,
  onToggleAutoRotate,
  onTogglePenthouseMusic,
  onResetCamera,
  onOpenPurchase,
  onOpenHowItWorks,
  onOpenActivityFeed,
  onOpenTerms,
  onOpenPrivacy,
}: GameHUDProps) {
  const isDay = theme === 'day';

  // Find topmost floor (Floor #1 / Penthouse)
  const topFloor = floors.length > 0 ? [...floors].sort((a, b) => b.floorNumber - a.floorNumber)[0] : null;
  const isSold = topFloor?.status === 'sold';
  const minRequiredBid = topFloor
    ? (isSold ? Math.ceil(topFloor.price * 1.1) : topFloor.price)
    : 50;
  const topFloorNum = topFloor ? getDisplayFloorNumber(topFloor.floorNumber, floors.length) : 1;

  // Form states
  const [customBid, setCustomBid] = useState<number>(minRequiredBid);
  const [websiteInput, setWebsiteInput] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState<boolean>(false);
  const [rulerActive, setRulerActive] = useState<boolean>(true);
  const [isEditingBid, setIsEditingBid] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync customBid when minRequiredBid changes if user hasn't modified it
  useEffect(() => {
    if (customBid < minRequiredBid) {
      setCustomBid(minRequiredBid);
    }
  }, [minRequiredBid]);

  // Click outside category dropdown handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStepDown = () => {
    setCustomBid((prev) => Math.max(minRequiredBid, prev - 1));
  };

  const handleStepUp = () => {
    setCustomBid((prev) => prev + 1);
  };

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = websiteInput.trim();
    const finalBid = Math.max(minRequiredBid, customBid);
    onOpenPurchase(topFloor || undefined, cleanUrl, selectedCategory || undefined, finalBid);
  };

  const dispatchSceneAction = (action: string) => {
    window.dispatchEvent(new CustomEvent('upspace:scene-control', { detail: action }));
  };

  const handleToggleRuler = () => {
    setRulerActive((prev) => !prev);
    dispatchSceneAction('toggle-ruler');
  };

  // Live telemetry stats calculation
  const totalHeightFt = Math.max(12, floors.length * 12);
  const totalSales = floors.reduce((acc, f) => acc + (f.price || 0), 0);
  const totalVisitors = Math.max(846, floors.reduce((acc, f) => acc + (f.impressionsWeekly || 0), 0) + 846);
  const totalCountries = 19;
  const onlineCount = 10;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 font-sans overflow-hidden">
      
      {/* 1. TOP BRAND HEADER */}
      <div className="pointer-events-auto absolute top-14 sm:top-7 left-0 right-0 flex items-center justify-center z-30">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white select-none">
          Get3DBillboards
        </h1>
      </div>

      {/* 2. TOP HERO SECTION (Headline, Interactive Stepper, Floating Action Bar, Subtitle & Policy links) */}
      <div className="pointer-events-auto absolute top-24 sm:top-20 left-0 right-0 flex flex-col items-center justify-center px-3 sm:px-6 text-center max-w-4xl mx-auto w-full z-30">
        
        {/* Outbid top floor for ₹[price] headline with (+) and (-) buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3.5 mb-3 sm:mb-4">
          <span className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Outbid top floor for
          </span>

          <div className="inline-flex items-center gap-2 sm:gap-3">
            {/* Minus Button */}
            <button
              type="button"
              onClick={handleStepDown}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 dark:bg-slate-900/90 border border-slate-300 dark:border-white/20 shadow-sm flex items-center justify-center text-slate-800 dark:text-white hover:bg-white hover:scale-105 active:scale-95 transition touch-manipulation"
              aria-label="Lower bid"
            >
              <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            </button>

            {/* Editable Direct Price Display with dotted orange underline */}
            <div className="relative inline-flex items-center border-b-2 border-dotted border-orange-500 pb-0.5">
              <span className="text-xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                ₹
              </span>
              <input
                type="number"
                min={minRequiredBid}
                value={customBid}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setCustomBid(isNaN(val) ? minRequiredBid : val);
                }}
                className="w-[3.6ch] sm:w-[4ch] bg-transparent text-xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight outline-none text-left [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                aria-label="Custom Bid Price in INR"
              />
            </div>

            {/* Plus Button */}
            <button
              type="button"
              onClick={handleStepUp}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 dark:bg-slate-900/90 border border-slate-300 dark:border-white/20 shadow-sm flex items-center justify-center text-slate-800 dark:text-white hover:bg-white hover:scale-105 active:scale-95 transition touch-manipulation"
              aria-label="Raise bid"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* 3-Pill Floating Form Bar: [ yourcompany.com ] [ Category ⌄ ] [ ⚡ Outbid Top Floor #1 for ₹501 → ] */}
        <form
          onSubmit={handleClaim}
          className="grid grid-cols-2 sm:flex items-center justify-center gap-2 sm:gap-2.5 w-full max-w-2xl px-2"
        >
          {/* 1. Website Input Pill */}
          <div className="relative col-span-2 flex-1 w-full sm:col-span-1 sm:w-auto">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Globe className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={websiteInput}
              onChange={(e) => setWebsiteInput(e.target.value)}
              placeholder="yourcompany.com"
              className="w-full pl-9 pr-3 py-2.5 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-300/80 dark:border-white/15 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition"
            />
          </div>

          {/* 2. Category Dropdown Pill */}
          <div className="relative w-full sm:w-auto" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setCategoryDropdownOpen((prev) => !prev)}
              className="w-full sm:w-auto flex-1 px-4 py-2.5 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-300/80 dark:border-white/15 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 shadow-md flex items-center justify-between gap-1.5 hover:bg-white transition"
              aria-expanded={categoryDropdownOpen}
            >
              <div className="flex items-center gap-1.5 truncate">
                <Layers className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{selectedCategory || 'Category'}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Custom Category Popup Menu */}
            {categoryDropdownOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl py-1.5 z-50 max-h-64 overflow-y-auto custom-scrollbar text-left animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-white/5 mb-1">
                  Select Category
                </div>
                {CATEGORIES_LIST.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setCategoryDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-xs font-semibold flex items-center justify-between hover:bg-orange-50 dark:hover:bg-white/5 transition ${
                      selectedCategory === cat ? 'text-orange-600 dark:text-orange-400 bg-orange-50/60 dark:bg-white/5 font-bold' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span><span className="mr-1.5" aria-hidden="true">{CATEGORY_EMOJIS[cat] || '✨'}</span>{cat}</span>
                    {selectedCategory === cat && <Check className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Orange Outbid CTA Button */}
          <button
            type="submit"
            className="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-full bg-gradient-to-r from-[#ff6827] to-[#fa8c16] hover:from-[#f4511e] hover:to-[#f57c00] text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shrink-0 touch-manipulation"
          >
            <Zap className="w-4 h-4 fill-white text-white" />
            <span className="whitespace-nowrap">
              Outbid Top Floor #1 for ₹{minRequiredBid.toLocaleString()}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Subtitle Text (Black, single line) */}
        <p className="mt-3 max-w-xl px-3 text-[10px] leading-relaxed sm:text-sm font-semibold text-black dark:text-slate-100 text-center whitespace-normal">
          Claim your startup&apos;s floor on the digital skyscraper. Outbid competitors to take Top Floor #1.
        </p>
      </div>

      {/* 3. LEFT-SIDE FLOATING STAT BADGES STACK */}
      <div className="hidden lg:flex flex-col items-start gap-2.5 absolute left-6 top-[240px] pointer-events-auto">
        {/* 1. Online badge */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-sm text-[13.5px] font-semibold text-slate-800 dark:text-slate-200 select-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span><b className="font-bold">{onlineCount}</b> online</span>
        </div>

        {/* 2. Height badge */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-sm text-[13.5px] font-semibold text-slate-800 dark:text-slate-200 select-none">
          <Building className="w-4 h-4 text-slate-500 dark:text-slate-400 stroke-[2.2]" />
          <span><b className="font-bold">{totalHeightFt}</b> ft tall</span>
        </div>

        {/* 3. Floors claimed badge */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-sm text-[13.5px] font-semibold text-slate-800 dark:text-slate-200 select-none">
          <Layers className="w-4 h-4 text-slate-500 dark:text-slate-400 stroke-[2.2]" />
          <span><b className="font-bold">{floors.length}</b> floors claimed</span>
        </div>

        {/* 4. Sales made badge */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-sm text-[13.5px] font-semibold text-slate-800 dark:text-slate-200 select-none">
          <DollarSign className="w-4 h-4 text-slate-500 dark:text-slate-400 stroke-[2.2]" />
          <span><b className="font-bold">₹{totalSales.toLocaleString()}</b> sales made</span>
        </div>

        {/* 5. Visitors since launch badge */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-sm text-[13.5px] font-semibold text-slate-800 dark:text-slate-200 select-none">
          <Eye className="w-4 h-4 text-slate-500 dark:text-slate-400 stroke-[2.2]" />
          <span><b className="font-bold">{totalVisitors.toLocaleString()}</b> visitors since launch</span>
        </div>

        {/* 6. Countries visited from badge */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-sm text-[13.5px] font-semibold text-slate-800 dark:text-slate-200 select-none">
          <Globe className="w-4 h-4 text-slate-500 dark:text-slate-400 stroke-[2.2]" />
          <span><b className="font-bold">{totalCountries}</b> countries visited from</span>
        </div>

        {/* 7. Backed by W3TECH */}
        <a
          href="https://w3tech.co.in"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-sm text-[13.5px] font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 transition"
        >
          <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-500 to-orange-500 flex items-center justify-center text-[9px] font-black text-white shadow-sm shrink-0">
            W
          </span>
          <span>Backed by <b className="font-extrabold text-slate-950 dark:text-white">W3TECH</b></span>
        </a>
      </div>

      {/* 4. RIGHT-SIDE FLOATING CONTROLS COLUMN (Aligned to right edge with clean pill geometry) */}
      <div className="hidden lg:flex flex-col items-end gap-2.5 absolute right-6 top-[260px] pointer-events-auto">
        {/* Reset */}
        <button
          type="button"
          onClick={onResetCamera}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-sm text-[13.5px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 hover:text-slate-950 transition active:scale-95"
          title="Reset Camera View"
        >
          <RotateCcw className="w-4 h-4 text-slate-600 dark:text-slate-400 stroke-[2.2]" />
          <span>Reset</span>
        </button>

        {/* Zoom In */}
        <button
          type="button"
          onClick={() => dispatchSceneAction('zoom-in')}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-sm text-[13.5px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 hover:text-slate-950 transition active:scale-95"
          title="Zoom In"
        >
          <Plus className="w-4 h-4 text-slate-600 dark:text-slate-400 stroke-[2.4]" />
          <span>Zoom in</span>
        </button>

        {/* Zoom Out */}
        <button
          type="button"
          onClick={() => dispatchSceneAction('zoom-out')}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-sm text-[13.5px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 hover:text-slate-950 transition active:scale-95"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4 text-slate-600 dark:text-slate-400 stroke-[2.4]" />
          <span>Zoom out</span>
        </button>

        {/* Evening / Day / Night Theme */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-sm text-[13.5px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 hover:text-slate-950 transition active:scale-95"
          title="Toggle Theme"
        >
          {isDay ? (
            <Sun className="w-4 h-4 text-amber-500 stroke-[2.2]" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400 stroke-[2.2]" />
          )}
          <span>{isDay ? 'Evening' : 'Night'}</span>
        </button>

        {/* Sound Toggle */}
        <button
          type="button"
          onClick={onTogglePenthouseMusic}
          className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full border shadow-sm text-[13.5px] font-semibold transition active:scale-95 ${
            penthouseMusic
              ? 'bg-amber-50 dark:bg-white/10 border-amber-300 dark:border-amber-400/40 text-amber-600 dark:text-amber-400'
              : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
          }`}
          title="Toggle Sound"
        >
          {penthouseMusic ? (
            <Volume2 className="w-4 h-4 text-amber-500 stroke-[2.2]" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-600 dark:text-slate-400 stroke-[2.2]" />
          )}
          <span>Sound {penthouseMusic ? 'on' : 'off'}</span>
        </button>

        {/* Ruler Toggle */}
        <button
          type="button"
          onClick={handleToggleRuler}
          className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full border shadow-sm text-[13.5px] font-semibold transition active:scale-95 ${
            rulerActive
              ? 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-white/5 text-slate-400'
          }`}
          title="Toggle Height Ruler"
        >
          <Ruler className="w-4 h-4 text-slate-600 dark:text-slate-400 stroke-[2.2]" />
          <span>Ruler {rulerActive ? 'on' : 'off'}</span>
        </button>

        {/* Rotate Group with distinct mini-button bubbles */}
        <div className="inline-flex items-center gap-1.5 p-1 pl-1.5 pr-3.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-sm text-[13.5px] font-semibold text-slate-700 dark:text-slate-200">
          <button
            type="button"
            onClick={() => dispatchSceneAction('rotate-left')}
            className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 flex items-center justify-center transition active:scale-90"
            title="Rotate Left"
            aria-label="Rotate Left"
          >
            <ChevronLeft className="w-3.5 h-3.5 stroke-[2.6]" />
          </button>
          <button
            type="button"
            onClick={() => dispatchSceneAction('rotate-right')}
            className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 flex items-center justify-center transition active:scale-90"
            title="Rotate Right"
            aria-label="Rotate Right"
          >
            <ChevronRight className="w-3.5 h-3.5 stroke-[2.6]" />
          </button>
          <span className="ml-0.5">Rotate</span>
        </div>

        {/* Move Floors Group with distinct mini-button bubbles */}
        <div className="inline-flex items-center gap-1.5 p-1 pl-1.5 pr-3.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-sm text-[13.5px] font-semibold text-slate-700 dark:text-slate-200">
          <button
            type="button"
            onClick={() => dispatchSceneAction('move-up')}
            className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 flex items-center justify-center transition active:scale-90"
            title="Move Floors Up"
            aria-label="Move Floors Up"
          >
            <ChevronUp className="w-3.5 h-3.5 stroke-[2.6]" />
          </button>
          <button
            type="button"
            onClick={() => dispatchSceneAction('move-down')}
            className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 flex items-center justify-center transition active:scale-90"
            title="Move Floors Down"
            aria-label="Move Floors Down"
          >
            <ChevronDown className="w-3.5 h-3.5 stroke-[2.6]" />
          </button>
          <span className="ml-0.5">Move floors</span>
        </div>
      </div>

      {/* 5. MOBILE NAVIGATION DOCK (Visible on mobile only) */}
      <div className="lg:hidden pointer-events-auto absolute bottom-3 left-0 right-0 pb-[env(safe-area-inset-bottom)] px-3 flex items-center justify-center z-40">
        <nav className="flex max-w-full flex-wrap items-center justify-center gap-1 px-2 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-white/10 shadow-2xl backdrop-blur-xl">
          <button
            type="button"
            onClick={() => dispatchSceneAction('jump-top')}
            className="flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition"
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>Top</span>
          </button>

          <button
            type="button"
            onClick={() => dispatchSceneAction('jump-base')}
            className="flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition"
          >
            <Building className="w-3.5 h-3.5 text-cyan-500" />
            <span>Base</span>
          </button>

          <button
            type="button"
            onClick={onToggleAutoRotate}
            className="flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
            <span>Rotate</span>
          </button>

          <div className="w-[1px] h-5 bg-slate-200 dark:bg-white/10" />

          <button
            type="button"
            onClick={onTogglePenthouseMusic}
            className="flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition"
          >
            {penthouseMusic ? (
              <Volume2 className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>Sound</span>
          </button>

          <button
            type="button"
            onClick={handleToggleRuler}
            className="flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition"
          >
            <Ruler className="w-3.5 h-3.5 text-slate-600" />
            <span>Ruler</span>
          </button>

          <button
            type="button"
            onClick={onOpenActivityFeed}
            className="flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl text-[10px] font-bold text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-white/10 transition"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Stats</span>
          </button>
        </nav>
      </div>

    </div>
  );
}
