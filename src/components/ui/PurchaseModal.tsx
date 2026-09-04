'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Sparkles,
  X,
  ShieldCheck,
  Building2,
  Globe,
  Tag,
  Crown,
} from 'lucide-react';
import { FloorData, getDisplayFloorNumber, isPenthouseFloor } from '@/types/floor';
import { ThemeMode } from '@/types/theme';

interface PurchaseModalProps {
  floor: FloorData | null;
  floors: FloorData[];
  theme: ThemeMode;
  onClose: () => void;
  onConfirm: (campaign: {
    title: string;
    bannerUrl: string;
    targetUrl: string;
    bidAmount: number;
    claimCode: string;
  }) => void;
}

export function PurchaseModal({ floor, floors, theme, onClose, onConfirm }: PurchaseModalProps) {
  const isDay = theme === 'day';

  const [reserved, setReserved] = useState(false);
  const [adTitle, setAdTitle] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [bidAmount, setBidAmount] = useState(0);
  const [claimCode, setClaimCode] = useState('');

  useEffect(() => {
    if (!floor) return;
    setReserved(false);
    setAdTitle(floor.brandTitle || '');
    setBannerUrl(floor.adBannerUrl || '');
    setTargetUrl(floor.targetUrl || '');
    const minBid = floor.status === 'sold' ? Math.ceil(floor.price * 1.1) : floor.price;
    setBidAmount(minBid);
    setClaimCode('');
  }, [floor]);

  if (!floor) return null;

  const displayNum = getDisplayFloorNumber(floor.floorNumber, floors.length);
  const isPenthouse = isPenthouseFloor(floor.floorNumber, floors.length);
  const isOutbid = floor.status === 'sold';
  const minRequiredBid = isOutbid ? Math.ceil(floor.price * 1.1) : floor.price;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const title = adTitle.trim();
    if (!title) return;
    if (!Number.isFinite(bidAmount) || bidAmount < minRequiredBid) return;

    const generatedCode = `UPS-${Math.random().toString(36).slice(2, 8).toUpperCase()}-L${displayNum}`;
    setClaimCode(generatedCode);
    onConfirm({
      title,
      bannerUrl: bannerUrl.trim(),
      targetUrl: targetUrl.trim(),
      bidAmount,
      claimCode: generatedCode,
    });
    setReserved(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <section
        className={`w-full max-w-xl rounded-3xl p-6 sm:p-7 border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
          isDay
            ? 'bg-white border-slate-300 text-slate-950 shadow-slate-900/20'
            : 'bg-slate-950 border-white/15 text-white shadow-black/80'
        }`}
      >
        {/* MODAL HEADER MATCHING HOW UPSPACE WORKS */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10 shrink-0">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-orange-700 dark:text-orange-400">
              {isPenthouse ? 'Penthouse Pinnacle Billboard' : 'Spatial Billboard Reservation'}
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
              {isOutbid ? `Outbid Level ${displayNum}` : `Claim Level ${displayNum}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full border border-slate-300 dark:border-white/10 text-slate-700 hover:bg-slate-100 dark:hover:bg-white/10 transition"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 custom-scrollbar">
          {!reserved ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* FLOOR SUMMARY CARD */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between text-xs ${
                  isDay ? 'bg-slate-100 border-slate-300' : 'bg-white/[0.03] border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-600 flex items-center justify-center shrink-0">
                    {isPenthouse ? <Crown className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-black text-sm sm:text-base text-slate-950 dark:text-white">
                      Floor Level {displayNum}
                    </div>
                    <div className="text-slate-800 dark:text-slate-300 text-xs font-mono font-bold">
                      +{floor.elevationMeters.toFixed(1)}m · {floor.dimensions}
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[10px] uppercase font-black text-slate-700 dark:text-slate-400">Min Bid</span>
                  <div className="font-black text-base sm:text-lg text-orange-700 dark:text-orange-400">
                    ₹{minRequiredBid.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* OUTBID WARNING / INFO NOTICE */}
              {isOutbid && (
                <div className="p-3.5 rounded-2xl bg-orange-500/15 border border-orange-500/30 text-xs text-orange-950 dark:text-orange-300 font-bold">
                  Your bid is 10% above the current sponsor value. It initiates a fresh 7-day protected billboard cycle.
                </div>
              )}

              {/* CAMPAIGN INPUT FIELDS */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-black text-slate-900 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-orange-600 dark:text-cyan-400" />
                    Brand or Campaign Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={adTitle}
                    onChange={(e) => setAdTitle(e.target.value)}
                    placeholder="e.g. Acme Studio / Cyber Genesis"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border outline-none transition ${
                      isDay
                        ? 'bg-slate-50 border-slate-300 focus:border-slate-900 text-slate-950 placeholder:text-slate-500 shadow-sm'
                        : 'bg-white/5 border-white/10 focus:border-cyan-400 text-white placeholder:text-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-900 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-orange-600 dark:text-cyan-400" />
                    Destination URL (Website, App, or GitHub) *
                  </label>
                  <input
                    type="url"
                    required
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://yourbrand.com"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border outline-none transition ${
                      isDay
                        ? 'bg-slate-50 border-slate-300 focus:border-slate-900 text-slate-950 placeholder:text-slate-500 shadow-sm'
                        : 'bg-white/5 border-white/10 focus:border-cyan-400 text-white placeholder:text-slate-400'
                    }`}
                  />
                  <p className="mt-1 text-[11px] font-bold text-slate-700 dark:text-slate-400">
                    All URLs undergo automated SSL &amp; anti-malware verification.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black text-slate-900 dark:text-slate-200 mb-1 block">
                      Custom Billboard Texture Image URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={bannerUrl}
                      onChange={(e) => setBannerUrl(e.target.value)}
                      placeholder="https://…/billboard.jpg"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border outline-none transition ${
                        isDay
                          ? 'bg-slate-50 border-slate-300 focus:border-slate-900 text-slate-950 placeholder:text-slate-500 shadow-sm'
                          : 'bg-white/5 border-white/10 focus:border-cyan-400 text-white placeholder:text-slate-400'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-900 dark:text-slate-200 mb-1 block">
                      Your Bid Amount (₹) *
                    </label>
                    <input
                      type="number"
                      min={minRequiredBid}
                      required
                      value={bidAmount || ''}
                      onChange={(e) => setBidAmount(Number(e.target.value))}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-black border outline-none transition ${
                        isDay
                          ? 'bg-slate-50 border-slate-300 focus:border-slate-900 text-slate-950 shadow-sm'
                          : 'bg-white/5 border-white/10 focus:border-cyan-400 text-white'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-black text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-orange-500/25 transition active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Confirm &amp; Publish Campaign (₹{(bidAmount || minRequiredBid).toLocaleString()})</span>
                </button>
              </div>
            </form>
          ) : (
            /* SUCCESS CONFIRMATION STEP */
            <div className="py-6 space-y-4 text-center animate-in fade-in">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                  Campaign Published Live!
                </h3>
                <p className="mt-1 text-xs font-bold text-slate-700 dark:text-slate-400 max-w-sm mx-auto">
                  Level {displayNum} is now active on the UpSpace 3D skyline. Your campaign registry token:
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 font-mono font-black text-sm text-cyan-950 dark:text-cyan-300 tracking-wider">
                {claimCode}
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-950 hover:bg-slate-800 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white dark:text-slate-950 font-black text-xs sm:text-sm shadow-md transition active:scale-[0.98]"
              >
                Return to 3D Skyline
              </button>
            </div>
          )}
        </div>

        {/* MODAL FOOTER NOTICE */}
        {!reserved && (
          <div className="mt-2 pt-3 border-t border-slate-200 dark:border-white/10 shrink-0">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>7-Day lease protection · Verified impression telemetry guaranteed</span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
