'use client';

import React from 'react';
import { X, Sparkles, Building, Coins, ShieldCheck, Zap } from 'lucide-react';

interface InfoModalProps {
  type: 'how-it-works' | 'get-floor' | null;
  onClose: () => void;
}

export function InfoModal({ type, onClose }: InfoModalProps) {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/70 animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6 sm:p-8 text-white animate-in zoom-in-95 duration-200">
        
        <button
          onClick={onClose}
          className="icon-button absolute top-5 right-5"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {type === 'how-it-works' ? (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
              <Zap className="w-6 h-6" />
            </div>

            <div className="tech-label text-cyan-400 mb-2">Platform guide</div>
            <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-white">How UpSpace Works</h2>
            <p className="text-sm text-slate-400 mt-1">
              The premier virtual 3D advertising skyline network.
            </p>

            <div className="mt-6 space-y-4 text-left">
              <div className="flex gap-3.5 items-start">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-bold text-cyan-400 shrink-0 text-sm font-mono">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Explore 3D Arena Towers</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Rotate, zoom, and navigate 8 distinct themed arenas across Business, Hospitality, Dining, Retail, and Gaming.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-bold text-cyan-400 shrink-0 text-sm font-mono">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Select Your Floor</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click any floor slab to highlight it in 3D. Check pricing (₹1 to ₹20 for prototype demo), daily impressions, and availability.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-bold text-cyan-400 shrink-0 text-sm font-mono">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Broadcast Your Brand</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Acquire floor rights to project high-luminance 360° digital wraps visible to global visitors across the metaverse.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="primary-action mt-6 w-full"
            >
              Start Exploring
            </button>
          </div>
        ) : (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-cyan-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <Sparkles className="w-6 h-6" />
            </div>

            <div className="tech-label text-amber-300 mb-2">Floor acquisition</div>
            <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-white">Acquire an Advertising Floor</h2>
            <p className="text-sm text-slate-400 mt-1">
              Own a permanent or sponsored floor level on the virtual skyline.
            </p>

            <div className="mt-5 p-4 rounded-xl bg-white/[0.045] border border-white/10 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Prototype Demo Pricing:</span>
                <span className="font-mono text-emerald-400 font-bold">₹1 – ₹20 / floor</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Included:</span>
                <span className="text-slate-200">360° Billboard + Brand Crest</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Next Phase:</span>
                <span className="text-cyan-300">Web3 / UPI Payments & Auctions</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-4">
              Simply click on any available floor on the 3D tower (marked with green LED rings) to inspect and claim your space instantly.
            </p>

            <button
              onClick={onClose}
              className="primary-action mt-6 w-full"
            >
              Select an Available Floor
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
