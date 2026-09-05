'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Activity,
  Sparkles,
  TrendingUp,
  Clock,
  Loader2,
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
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadActivities() {
      try {
        const res = await fetch('/api/activity');
        if (res.ok) {
          const data = await res.json();
          if (data?.success && Array.isArray(data.activities) && isMounted) {
            setActivities(data.activities);
            setLoading(false);
            return;
          }
        }
      } catch {}
      if (isMounted) {
        setActivities([]);
        setLoading(false);
      }
    }
    loadActivities();
    return () => {
      isMounted = false;
    };
  }, []);

  const displayList = activities;
  const filteredEvents = displayList.filter((ev: any) => {
    if (filter === 'all') return true;
    return ev.type === filter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      <section
        className={`w-full max-w-lg rounded-[1.8rem] sm:rounded-3xl p-4 sm:p-7 border shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[88vh] ${
          isDay
            ? 'bg-white border-slate-200 text-slate-900 shadow-slate-900/20'
            : 'bg-slate-950 border-white/15 text-white shadow-black/80'
        }`}
      >
        {/* MODAL HEADER MATCHING HOW UPSPACE WORKS */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-black/5 dark:border-white/10 shrink-0">
          <div>
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              Live Registry &amp; Bids
            </p>
            <h2 className="mt-0.5 text-xl sm:text-2xl font-black tracking-tight">Skyline Activity Log</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl sm:rounded-full border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 transition touch-manipulation"
            aria-label="Close activity modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* FILTER PILLS */}
        <div className="flex items-center gap-1.5 sm:gap-2 pt-3 pb-2.5 shrink-0 text-xs overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 sm:px-3.5 py-1.5 rounded-xl font-bold transition border whitespace-nowrap touch-manipulation ${
              filter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-sm'
                : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            All Activity
          </button>
          <button
            onClick={() => setFilter('outbid')}
            className={`px-3 sm:px-3.5 py-1.5 rounded-xl font-bold transition border whitespace-nowrap touch-manipulation ${
              filter === 'outbid'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-sm'
                : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            Outbids
          </button>
          <button
            onClick={() => setFilter('claim')}
            className={`px-3 sm:px-3.5 py-1.5 rounded-xl font-bold transition border whitespace-nowrap touch-manipulation ${
              filter === 'claim'
                ? 'bg-cyan-500 text-white border-transparent shadow-sm'
                : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            New Claims
          </button>
        </div>

        {/* ACTIVITY LOG LIST */}
        <div className="flex-1 overflow-y-auto py-2 space-y-2.5 custom-scrollbar">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
              <span className="text-xs">Loading activity log...</span>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-center text-slate-500 dark:text-slate-400">
              <Activity className="w-8 h-8 text-slate-400 opacity-60" />
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">No activity or bids recorded yet</span>
              <span className="text-xs text-slate-400 max-w-xs">Live outbids and claims will appear here in real-time as citizens participate.</span>
            </div>
          ) : (
            filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border flex items-center justify-between gap-2.5 sm:gap-3 text-xs transition ${
                ev.type === 'outbid'
                  ? 'bg-orange-500/[0.05] border-orange-500/25'
                  : isDay
                  ? 'bg-slate-50 border-slate-200/80'
                  : 'bg-white/[0.03] border-white/10'
              }`}
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                    ev.type === 'outbid'
                      ? 'bg-gradient-to-tr from-orange-600 to-amber-500 text-white'
                      : 'bg-gradient-to-tr from-cyan-600 to-blue-500 text-white'
                  }`}
                >
                  {ev.type === 'outbid' ? <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                    <span className="font-black text-xs sm:text-sm text-slate-950 dark:text-white truncate">
                      {ev.brand || ev.title}
                    </span>
                    {ev.domain && (
                      <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-800 dark:text-cyan-400 truncate">
                        ({ev.domain})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mt-0.5 text-slate-800 dark:text-slate-300 text-[11px] sm:text-xs font-medium">
                    <span>
                      {ev.detail || (ev.type === 'outbid' ? 'Outbid' : 'Claimed')}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-400">
                      <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      {ev.timeAgo || ev.timestamp}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 font-mono">
                <div className="font-black text-xs sm:text-base text-slate-950 dark:text-white">
                  ₹{Number(ev.amount).toLocaleString()}
                </div>
                <span className="text-[9px] sm:text-[10px] uppercase font-black text-emerald-700 dark:text-emerald-400">
                  VERIFIED
                </span>
              </div>
            </div>
          )))}
        </div>

        {/* MODAL FOOTER NOTICE MATCHING HOW UPSPACE WORKS */}
        <div className="mt-3 pt-2.5 border-t border-black/5 dark:border-white/10 shrink-0">
          <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-orange-500/10 border border-orange-500/20 text-[11px] sm:text-xs text-orange-700 dark:text-orange-300 font-medium text-center">
            All floor outbids and billboard claims are permanently verified and tracked live.
          </div>
        </div>
      </section>
    </div>
  );
}
