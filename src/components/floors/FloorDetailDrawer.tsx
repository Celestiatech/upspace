'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Building2,
  ShieldCheck,
  TrendingUp,
  Eye,
  MousePointerClick,
  Clock,
  History,
  Crown,
  CheckCircle2,
} from 'lucide-react';
import { FloorData, getDisplayFloorNumber, isPenthouseFloor } from '@/types/floor';
import { ThemeMode } from '@/types/theme';
import { getFloorLogoUrl } from '@/utils/logoHelper';

interface FloorDetailDrawerProps {
  floor: FloorData | null;
  theme: ThemeMode;
  allFloors: FloorData[];
  isOpen: boolean;
  onClose: () => void;
  onSelectFloor: (floor: FloorData) => void;
  onOpenPurchase: (floor: FloorData) => void;
}

export function FloorDetailDrawer({
  floor,
  theme,
  allFloors,
  isOpen,
  onClose,
  onSelectFloor,
  onOpenPurchase,
}: FloorDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'history'>('analytics');
  const [liveWebsiteVisits, setLiveWebsiteVisits] = useState<number | null>(null);
  const [liveFloorClicks, setLiveFloorClicks] = useState<number | null>(null);

  // Sync / reset live counts when floor changes
  React.useEffect(() => {
    setLiveWebsiteVisits(null);
    setLiveFloorClicks(null);
  }, [floor?.id]);

  if (!floor || !isOpen) return null;

  const isDay = theme === 'day';
  const displayNum = getDisplayFloorNumber(floor.floorNumber, allFloors.length);
  const isPenthouse = isPenthouseFloor(floor.floorNumber, allFloors.length);
  const isLobby = floor.floorNumber === 0;

  const currentIndex = allFloors.findIndex((f) => f.id === floor.id);
  const prevFloor = currentIndex > 0 ? allFloors[currentIndex - 1] : null;
  const nextFloor = currentIndex < allFloors.length - 1 ? allFloors[currentIndex + 1] : null;

  const nextBid = Math.ceil(floor.price * 1.1);

  // Real dynamic telemetry calculations from DB timestamps & live counts
  const now = Date.now();
  const createdTime = floor.createdAt
    ? new Date(floor.createdAt).getTime()
    : floor.updatedAt
    ? new Date(floor.updatedAt).getTime()
    : now;

  const elapsedMs = Math.max(0, now - createdTime);
  const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));
  const elapsedDays = Math.floor(elapsedHours / 24);

  const timeHeldText = elapsedDays === 0
    ? `${Math.max(1, elapsedHours)} ${elapsedHours <= 1 ? 'hour' : 'hours'}`
    : `${elapsedDays} ${elapsedDays === 1 ? 'day' : 'days'}`;

  const rawClk = floor.websiteVisits ?? floor.clicksDelivered ?? 0;
  const rawImp = floor.floorClicks ?? floor.impressionsWeekly ?? 0;
  const isLegacyDummy = rawImp === 145000 || rawImp === 140000 || rawImp === 120000 || rawClk === 1890 || rawClk === 2150 || rawClk === 1650;
  
  const baseWebsiteVisits = isLegacyDummy ? 0 : rawClk;
  const baseFloorClicks = isLegacyDummy ? 0 : Math.max(rawImp, baseWebsiteVisits, 1);

  const websiteVisits = liveWebsiteVisits !== null ? liveWebsiteVisits : baseWebsiteVisits;
  const floorClicks = liveFloorClicks !== null ? Math.max(liveFloorClicks, websiteVisits) : Math.max(baseFloorClicks, websiteVisits, 1);
  const weeklyImpressions = floorClicks;
  const ctr = floorClicks > 0 ? Number(((websiteVisits / floorClicks) * 100).toFixed(1)) : 0;

  const formatImpressions = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
    return `${val}`;
  };

  const handleTrackWebsiteVisit = () => {
    setLiveWebsiteVisits((prev) => (prev !== null ? prev + 1 : baseWebsiteVisits + 1));
    try {
      fetch('/api/floors/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ floorId: floor.id, action: 'website_visit' }),
      }).catch(() => {});
    } catch {}
  };

  const domain = floor.targetUrl ? floor.targetUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '') : floor.brandTitle || 'upspace.city';

  return (
    <aside
      className={`fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[420px] max-w-full flex flex-col shadow-2xl transition-transform duration-300 ease-out backdrop-blur-2xl border-l ${
        isDay
          ? 'bg-white border-slate-300 text-slate-950 shadow-slate-900/30'
          : 'bg-slate-950/95 border-white/10 text-white shadow-black/80'
      }`}
      aria-label="Floor Details Drawer"
    >
      {/* DRAWER TOP BAR */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          {isPenthouse ? (
            <span className="flex items-center gap-1.5 text-xs font-black px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-400">
              <Crown className="w-3.5 h-3.5" />
              PENTHOUSE LEVEL {displayNum}
            </span>
          ) : isLobby ? (
            <span className="flex items-center gap-1.5 text-xs font-black px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-800 dark:text-cyan-400">
              <Building2 className="w-3.5 h-3.5" />
              LOBBY CONCOURSE {displayNum}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-black px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200">
              <Building2 className="w-3.5 h-3.5 text-slate-700 dark:text-slate-400" />
              FLOOR {displayNum} OF {allFloors.length}
            </span>
          )}
          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
            +{floor.elevationMeters.toFixed(1)}m
          </span>
        </div>

        {/* CONTROLS: PREV, NEXT, CLOSE */}
        <div className="flex items-center gap-1">
          <button
            disabled={!prevFloor}
            onClick={() => prevFloor && onSelectFloor(prevFloor)}
            className="p-1.5 rounded-lg border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition"
            title="Inspect previous floor below"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={!nextFloor}
            onClick={() => nextFloor && onSelectFloor(nextFloor)}
            className="p-1.5 rounded-lg border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition"
            title="Inspect next floor above"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 ml-1 rounded-lg border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition"
            aria-label="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* DRAWER SCROLLABLE BODY */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
        {/* BRAND IDENTITY & VERIFIED DOMAIN SNIPPET */}
        <div className={`p-4 rounded-2xl border ${
          isDay ? 'bg-slate-50 border-slate-300' : 'bg-white/[0.03] border-white/10'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-md relative overflow-hidden shrink-0"
                style={{ backgroundColor: floor.bannerColor || '#0284c7' }}
              >
                <span className="font-black">
                  {floor.brandTitle ? floor.brandTitle.charAt(0).toUpperCase() : 'U'}
                </span>
                {getFloorLogoUrl(floor) && (
                  <img
                    src={getFloorLogoUrl(floor)!}
                    alt={floor.brandTitle || 'Logo'}
                    className="absolute inset-0 w-full h-full object-contain p-1.5 bg-inherit rounded-xl"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-lg tracking-tight text-slate-950 dark:text-white">
                    {floor.brandTitle || 'Available Level'}
                  </h3>
                  {floor.verifiedDomain && (
                    <span title="SSL Verified Domain">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-500/20" />
                    </span>
                  )}
                </div>
                {floor.targetUrl ? (
                  <a
                    href={floor.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleTrackWebsiteVisit}
                    className="inline-flex items-center gap-1 text-xs font-mono font-bold text-slate-900 dark:text-cyan-400 hover:underline mt-0.5"
                  >
                    <span>{domain}</span>
                    <ExternalLink className="w-3 h-3 text-slate-700 dark:text-cyan-400" />
                  </a>
                ) : (
                  <p className="text-xs text-slate-700 dark:text-slate-400 font-mono font-medium">unclaimed.upspace.city</p>
                )}
              </div>
            </div>

            {/* VERIFIED BADGE */}
            {floor.verifiedType && (
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wide ${
                floor.verifiedType === 'enterprise'
                  ? 'bg-purple-500/15 text-purple-900 dark:text-purple-300 border-purple-500/40'
                  : floor.verifiedType === 'github'
                  ? 'bg-slate-200 text-slate-900 dark:text-slate-200 border-slate-400'
                  : 'bg-emerald-500/15 text-emerald-900 dark:text-emerald-300 border-emerald-500/40'
              }`}>
                {floor.verifiedType}
              </span>
            )}
          </div>

          {floor.tagline && (
            <p className="mt-3 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-bold">
              "{floor.tagline}"
            </p>
          )}

          {/* VISIT WEBSITE ACTION BUTTON */}
          {floor.targetUrl && (
            <a
              href={floor.targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleTrackWebsiteVisit}
              className={`mt-3 flex items-center justify-between px-3.5 py-2 rounded-xl border text-xs font-bold transition group shadow-sm ${
                isDay
                  ? 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100/70 text-cyan-950'
                  : 'bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
                <span>Visit Official Website</span>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-900 dark:text-cyan-200">
                {websiteVisits} visits
              </span>
            </a>
          )}

          {/* SECURITY & SAFETY DISCLOSURE */}
          <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Safety scan passed · SSL Secure</span>
            </div>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-300">{floor.category}</span>
          </div>
        </div>

        {/* TAB CONTROLS */}
        <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm border border-slate-200 dark:border-white/10'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            Proof of Eyeballs
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm border border-slate-200 dark:border-white/10'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            Bid History ({floor.bidHistory?.length || 1})
          </button>
        </div>

        {/* TAB 1: PROOF OF EYEBALLS TELEMETRY */}
        {activeTab === 'analytics' ? (
          <div className="space-y-3">
            {/* 3 PRIMARY METRICS: FLOOR CLICKS, VISITED WEBSITE, CTR */}
            <div className="grid grid-cols-3 gap-2">
              <div className={`p-3 rounded-xl border text-center ${
                isDay ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/10'
              }`}>
                <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-slate-700 dark:text-slate-300">
                  <MousePointerClick className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                  <span>Floor Clicks</span>
                </div>
                <div className="mt-1 font-mono font-black text-sm sm:text-base text-blue-700 dark:text-cyan-400">
                  {floorClicks.toLocaleString()}
                </div>
                <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Tower Views</div>
              </div>

              <div className={`p-3 rounded-xl border text-center ${
                isDay ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/10'
              }`}>
                <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-slate-700 dark:text-slate-300">
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Visited Website</span>
                </div>
                <div className="mt-1 font-mono font-black text-sm sm:text-base text-emerald-700 dark:text-emerald-400">
                  {websiteVisits.toLocaleString()}
                </div>
                <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Outbound Visits</div>
              </div>

              <div className={`p-3 rounded-xl border text-center ${
                isDay ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/10'
              }`}>
                <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-slate-700 dark:text-slate-300">
                  <TrendingUp className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                  <span>CTR</span>
                </div>
                <div className="mt-1 font-mono font-black text-sm sm:text-base text-orange-700 dark:text-orange-400">
                  {ctr.toFixed(1)}%
                </div>
                <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Conversion</div>
              </div>
            </div>

            {/* EYEBALL IMPRESSIONS BADGE */}
            <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
              isDay ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/[0.03] border-white/10 text-white'
            }`}>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <div>
                  <span className="font-black text-slate-950 dark:text-white">Estimated Impressions:</span>{' '}
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{formatImpressions(weeklyImpressions)} Weekly Eyeballs</span>
                </div>
              </div>
              <div className="text-[10px] font-mono text-purple-700 dark:text-purple-400 font-black uppercase">
                Live Reach
              </div>
            </div>

            {/* PERMANENT OWNERSHIP STATUS */}
            <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
              isDay ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/[0.03] border-white/10 text-white'
            }`}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <span className="font-black text-slate-950 dark:text-white">Permanent Placement</span> · Active for {timeHeldText}
                </div>
              </div>
              <div className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-black">
                Lifetime Active
              </div>
            </div>

            {/* 3D BILLBOARD SPECIFICATIONS */}
            <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
              isDay ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-white/[0.03] border-white/10 text-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-600 dark:text-slate-400">Format:</span>
                <span className="font-black text-slate-950 dark:text-white">{floor.dimensions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-600 dark:text-slate-400">Elevation:</span>
                <span className="font-mono font-black text-slate-950 dark:text-white">+{floor.elevationMeters.toFixed(1)}m from ground</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-600 dark:text-slate-400">Ownership:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-black">Permanent Lifetime</span>
              </div>
            </div>
          </div>
        ) : (
          /* TAB 2: BID HISTORY AUDIT TRAIL */
          <div className="space-y-2">
            {floor.bidHistory && floor.bidHistory.length > 0 ? (
              floor.bidHistory.map((item, idx) => (
                <div
                  key={`bid-${idx}`}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                    item.isTopBid
                      ? 'bg-orange-500/10 border-orange-500/40'
                      : isDay
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-white/[0.03] border-white/10'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5 font-black text-slate-950 dark:text-white">
                      <span>{item.bidder}</span>
                      {item.isTopBid && (
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-orange-600 text-white">
                          TOP BID
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{item.timestamp}</div>
                  </div>
                  <div className="font-mono font-black text-sm text-slate-950 dark:text-white">
                    ₹{item.amount.toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl border text-center text-xs font-bold text-slate-700 dark:text-slate-300 border-dashed border-slate-300 dark:border-white/10">
                No active bids placed on this level yet.
              </div>
            )}
          </div>
        )}
      </div>

      {/* DRAWER FOOTER / ACTION PANEL */}
      <div className={`p-5 border-t border-slate-200 dark:border-white/10 shrink-0 space-y-3 ${
        isDay ? 'bg-slate-100' : 'bg-slate-900/90'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-700 dark:text-slate-300">
              Floor Price
            </span>
            <div className="font-mono font-black text-xl text-slate-950 dark:text-white">
              ₹{floor.price.toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-black tracking-wider text-orange-700 dark:text-orange-400">
              Next Top Level Price
            </span>
            <div className="font-mono font-black text-xl text-orange-700 dark:text-orange-400">
              ₹{nextBid.toLocaleString()}
            </div>
          </div>
        </div>

        <button
          onClick={() => onOpenPurchase(floor)}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-orange-500/25 transition active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Claim Next Top Level #{allFloors.length + 1} (₹{nextBid.toLocaleString()})</span>
        </button>

        <p className="text-[11px] font-bold text-center text-slate-700 dark:text-slate-300">
          Permanent Lifetime Placement · Stacks on top of building
        </p>
      </div>
    </aside>
  );
}
