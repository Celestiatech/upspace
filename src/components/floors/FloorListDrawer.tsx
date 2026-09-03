'use client';

import React, { useState } from 'react';
import { FloorData } from '@/types/floor';
import { Arena } from '@/types/arena';
import { X, Search, CheckCircle, Tag, ArrowRight } from 'lucide-react';

interface FloorListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  arena: Arena;
  floors: FloorData[];
  selectedFloor: FloorData | null;
  onSelectFloor: (floor: FloorData) => void;
}

export function FloorListDrawer({
  isOpen,
  onClose,
  arena,
  floors,
  selectedFloor,
  onSelectFloor,
}: FloorListDrawerProps) {
  const [filter, setFilter] = useState<'all' | 'available' | 'sold'>('all');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredFloors = floors.filter((f) => {
    const matchesFilter =
      filter === 'all' ? true : f.status === filter;
    const matchesSearch =
      `floor ${f.floorNumber}`.toLowerCase().includes(search.toLowerCase()) ||
      (f.ownerName && f.ownerName.toLowerCase().includes(search.toLowerCase())) ||
      (f.brandTitle && f.brandTitle.toLowerCase().includes(search.toLowerCase())) ||
      (f.category && f.category.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-start backdrop-blur-md bg-slate-950/65 animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md h-full rounded-r-2xl border-l-0 p-6 flex flex-col text-white animate-in slide-in-from-left duration-250">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <div className="tech-label text-cyan-400 mb-1">Inventory directory</div>
            <h2 className="text-xl font-extrabold tracking-[-0.03em] text-white">
              {arena.name} Directory
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              All 20 Advertising Floors • ₹1 to ₹20
            </p>
          </div>
          <button
            onClick={onClose}
            className="icon-button"
            aria-label="Close floor directory"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="py-4 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by floor #, brand, or industry..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/[0.045] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/15 transition"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2">
            {(['all', 'available', 'sold'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilter(mode)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition ${
                  filter === mode
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/35 shadow-sm shadow-cyan-500/10'
                    : 'bg-white/[0.035] border border-transparent text-slate-400 hover:border-white/10 hover:text-white'
                }`}
              >
                {mode === 'all' ? `All (${floors.length})` : mode}
              </button>
            ))}
          </div>
        </div>

        {/* Floor List Scrollable */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {filteredFloors.map((floor) => {
            const isSelected = selectedFloor?.id === floor.id;
            const isAvailable = floor.status === 'available';

            return (
              <div
                key={floor.id}
                onClick={() => {
                  onSelectFloor(floor);
                  onClose();
                }}
                className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between group ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-400/50 shadow-glow'
                    : 'bg-white/[0.035] border-white/[0.07] hover:border-white/20 hover:bg-white/[0.08]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-950/70 border border-white/10 flex items-center justify-center font-mono font-bold text-sm text-white">
                    F{floor.floorNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">
                        {floor.brandTitle || `Floor ${floor.floorNumber}`}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded capitalize ${
                          isAvailable
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {floor.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {floor.ownerName ? floor.ownerName : 'Available for purchase'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-right">
                  <div>
                    <div className="text-xs font-mono font-bold text-white">
                      ₹{floor.price}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {floor.elevationMeters}m
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
