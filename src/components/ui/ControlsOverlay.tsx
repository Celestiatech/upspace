'use client';

import React from 'react';
import { RotateCw, Maximize2, MousePointer, Move, ZoomIn } from 'lucide-react';
import { FloorData } from '@/types/floor';
import { ThemeMode } from '@/types/theme';

interface ControlsOverlayProps {
  autoRotate: boolean;
  theme: ThemeMode;
  onToggleAutoRotate: () => void;
  onResetCamera: () => void;
  selectedFloor: FloorData | null;
  onDeselectFloor: () => void;
}

export function ControlsOverlay({
  autoRotate,
  theme,
  onToggleAutoRotate,
  onResetCamera,
  selectedFloor,
  onDeselectFloor,
}: ControlsOverlayProps) {
  const isDay = theme === 'day';

  return (
    <>
      {/* LEFT FLOATING CONTROLS */}
      <div className="fixed top-24 left-4 sm:left-6 z-30 flex flex-col gap-2 pointer-events-none">
        {/* Quick Camera Buttons */}
        <div
          className={`pointer-events-auto backdrop-blur-xl rounded-2xl p-1.5 flex flex-col gap-1 shadow-xl transition-all border ${
            isDay
              ? 'bg-white/80 border-slate-200/90 shadow-slate-300/40 text-slate-800'
              : 'bg-slate-950/80 border-white/10 shadow-black/40 text-slate-200'
          }`}
        >
          {/* Auto Rotate Button */}
          <button
            onClick={onToggleAutoRotate}
            className={`p-2.5 rounded-xl transition flex items-center gap-2 text-xs font-medium ${
              autoRotate
                ? isDay
                  ? 'bg-cyan-100 text-cyan-800'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : isDay
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Toggle Continuous 3D Rotation"
          >
            <RotateCw
              className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`}
              style={{ animationDuration: '8s' }}
            />
            <span className="hidden sm:inline">Auto Rotate</span>
          </button>

          {/* Reset Camera Button */}
          <button
            onClick={() => {
              onResetCamera();
              onDeselectFloor();
            }}
            className={`p-2.5 rounded-xl transition flex items-center gap-2 text-xs font-medium ${
              isDay
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Reset 3D Camera to Full Building View"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="hidden sm:inline">Reset View</span>
          </button>
        </div>

        {/* 3D Navigation Guide Tooltip */}
        <div
          className={`hidden lg:flex pointer-events-auto backdrop-blur-md rounded-2xl p-3 text-[11px] flex-col gap-1.5 max-w-[210px] shadow-lg border transition-all ${
            isDay
              ? 'bg-white/75 border-slate-200/80 text-slate-600'
              : 'bg-slate-950/70 border-white/10 text-slate-400'
          }`}
        >
          <span
            className={`text-[10px] uppercase font-mono tracking-wider font-semibold ${
              isDay ? 'text-cyan-700' : 'text-cyan-400'
            }`}
          >
            3D Navigation
          </span>
          <div className="flex items-center gap-2">
            <Move className={`w-3.5 h-3.5 ${isDay ? 'text-slate-500' : 'text-slate-300'}`} />
            <span>Drag to rotate building</span>
          </div>
          <div className="flex items-center gap-2">
            <ZoomIn className={`w-3.5 h-3.5 ${isDay ? 'text-slate-500' : 'text-slate-300'}`} />
            <span>Scroll wheel to zoom</span>
          </div>
          <div className="flex items-center gap-2">
            <MousePointer className={`w-3.5 h-3.5 ${isDay ? 'text-slate-500' : 'text-slate-300'}`} />
            <span>Click any floor to inspect</span>
          </div>
        </div>
      </div>
    </>
  );
}
