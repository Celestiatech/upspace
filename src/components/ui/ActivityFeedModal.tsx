'use client';

import React, { useState } from 'react';
import {
  X,
  Activity,
  Sparkles,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { RECENT_ACTIVITY_LOG } from '@/data/activity';
import { ThemeMode } from '@/types/theme';

interface ActivityFeedModalProps {
  theme: ThemeMode;
  onClose: () => void;
  onSelectFloorNumber?: (floorNum: number) => void;
}

export function ActivityFeedModal({ theme, onClose }: ActivityFeedModalProps) {
  const isDay = theme === 'day';
  const [filter, setFilter] = useState<'all' | 'outbid' | 'claim'>('all');

  const filteredEvents = RECENT_ACTIVITY_LOG.filter((ev) => {
    if (filter === 'all') return true;
    return ev.type === filter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <section
        className={`w-full max-w-lg rounded-3xl p-6 sm:p-7 border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ${
          isDay
            ? 'bg-white border-slate-200 text-slate-900 shadow-slate-900/20'
            : 'bg-slate-950 border-white/15 text-white shadow-black/80'
        }`}
      >
        {/* MODAL HEADER MATCHING HOW UPSPACE WORKS */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-black/5 dark:border-white/10 shrink-0">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              Live Registry & Bids
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-tight">Skyline Activity Log</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 transition"
            aria-label="Close activity modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* FILTER PILLS */}
        <div className="flex items-center gap-2 pt-4 pb-3 shrink-0 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition border ${
              filter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-sm'
                : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            All Activity
          </button>
          <button
            onClick={() => setFilter('outbid')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition border ${
              filter === 'outbid'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-sm'
                : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            Outbids
          </button>
          <button
            onClick={() => setFilter('claim')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition border ${
              filter === 'claim'
                ? 'bg-cyan-500 text-white border-transparent shadow-sm'
                : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            New Claims
          </button>
        </div>

        {/* ACTIVITY LOG LIST */}
        <div className="flex-1 overflow-y-auto py-2 space-y-3 custom-scrollbar">
          {filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs transition ${
                ev.type === 'outbid'
                  ? 'bg-orange-500/[0.05] border-orange-500/25'
                  : isDay
                  ? 'bg-slate-50 border-slate-200/80'
                  : 'bg-white/[0.03] border-white/10'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                    ev.type === 'outbid'
                      ? 'bg-gradient-to-tr from-orange-600 to-amber-500 text-white'
                      : 'bg-gradient-to-tr from-cyan-600 to-blue-500 text-white'
                  }`}
                >
                  {ev.type === 'outbid' ? <TrendingUp className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-black text-sm text-slate-950 dark:text-white truncate">
                      {ev.brand}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-cyan-400">
                      ({ev.domain})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-0.5 text-slate-800 dark:text-slate-300 text-xs font-medium">
                    <span>
                      {ev.type === 'outbid' ? 'Outbid' : 'Claimed'}{' '}
                      <b className="text-slate-950 dark:text-white font-black">Floor {ev.floorDisplayNumber}</b>
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      {ev.timeAgo}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 font-mono">
                <div className="font-black text-sm sm:text-base text-slate-950 dark:text-white">
                  ₹{ev.amount.toLocaleString()}
                </div>
                <span className="text-[10px] uppercase font-black text-emerald-700 dark:text-emerald-400">
                  VERIFIED
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL FOOTER NOTICE MATCHING HOW UPSPACE WORKS */}
        <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 shrink-0">
          <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-700 dark:text-orange-300 font-medium text-center">
            All floor outbids and billboard claims are permanently verified and tracked live.
          </div>
        </div>
      </section>
    </div>
  );
}
