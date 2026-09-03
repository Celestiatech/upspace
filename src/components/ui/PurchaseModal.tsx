'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Sparkles, X } from 'lucide-react';
import { FloorData } from '@/types/floor';
import { ThemeMode } from '@/types/theme';

interface PurchaseModalProps {
  floor: FloorData | null;
  theme: ThemeMode;
  onClose: () => void;
  onConfirm: (campaign: { title: string; bannerUrl: string; targetUrl: string }) => void;
}

export function PurchaseModal({ floor, theme, onClose, onConfirm }: PurchaseModalProps) {
  const [reserved, setReserved] = useState(false);
  const [adTitle, setAdTitle] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [targetUrl, setTargetUrl] = useState('');

  useEffect(() => {
    if (!floor) return;
    setReserved(false);
    setAdTitle(floor.brandTitle || '');
    setBannerUrl(floor.adBannerUrl || '');
    setTargetUrl(floor.targetUrl || '');
  }, [floor]);

  if (!floor) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-in fade-in duration-150 ${theme === 'day' ? '' : 'dark'}`}>
      <div className="glass-panel w-full max-w-2xl rounded-2xl p-5 text-slate-100 animate-in zoom-in-95 duration-150">
        {!reserved ? (
          <form onSubmit={(event) => {
            event.preventDefault();
            const title = adTitle.trim();
            if (!title) return;
            onConfirm({ title, bannerUrl: bannerUrl.trim(), targetUrl: targetUrl.trim() });
            setReserved(true);
          }}>
            <header className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-cyan-400/25 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-300">LVL {floor.floorNumber}</span>
                <h2 className="text-base font-bold tracking-tight text-white">Quick Floor Reserve</h2>
              </div>
              <button type="button" onClick={onClose} className="icon-button" aria-label="Close reserve floor dialog"><X className="h-4 w-4" /></button>
            </header>

            <div className="my-3 flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.045] p-2.5 text-xs">
              <div><span className="tech-label block">Elevation</span><span className="font-semibold text-slate-200">{floor.elevationMeters}m</span></div>
              <div className="h-6 w-px bg-white/10" />
              <div><span className="tech-label block">Est. views</span><span className="font-semibold text-slate-200">{floor.impressionsPerDay}</span></div>
              <div className="h-6 w-px bg-white/10" />
              <div><span className="tech-label block">Format</span><span className="block max-w-[82px] truncate font-semibold text-slate-200">{floor.dimensions}</span></div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1.08fr_.92fr]">
              <div className="space-y-2.5">
                <div>
                  <label htmlFor="campaign-title" className="tech-label mb-1 block">Campaign title</label>
                  <input id="campaign-title" required value={adTitle} onChange={(event) => setAdTitle(event.target.value)} placeholder="e.g. Cyber Genesis" className="w-full rounded-lg border border-white/10 bg-white/[0.055] px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/15" />
                </div>
                <div>
                  <label htmlFor="banner-url" className="tech-label mb-1 block">Texture image URL</label>
                  <input id="banner-url" type="url" value={bannerUrl} onChange={(event) => setBannerUrl(event.target.value)} placeholder="https://…/banner.jpg" className="w-full rounded-lg border border-white/10 bg-white/[0.055] px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/15" />
                </div>
                <div>
                  <label htmlFor="target-url" className="tech-label mb-1 block">Link URL</label>
                  <input id="target-url" type="url" value={targetUrl} onChange={(event) => setTargetUrl(event.target.value)} placeholder="https://yourlink.com" className="w-full rounded-lg border border-white/10 bg-white/[0.055] px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/15" />
                </div>
              </div>
              <aside className="overflow-hidden rounded-xl border border-white/10 bg-slate-900/70 p-2.5">
                <span className="tech-label mb-2 block">Live billboard preview</span>
                <div
                  className="relative flex aspect-[4/3] items-end overflow-hidden rounded-lg border border-cyan-400/20 bg-gradient-to-br from-cyan-500/20 via-slate-900 to-indigo-600/30 p-3"
                  style={bannerUrl ? { backgroundImage: `linear-gradient(180deg, rgba(3,7,18,0.08), rgba(3,7,18,0.82)), url("${bannerUrl}")`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-300 via-blue-400 to-transparent" />
                  <div className="relative min-w-0">
                    <span className="mb-1 inline-flex rounded-full border border-cyan-300/25 bg-slate-950/65 px-1.5 py-0.5 text-[8px] font-bold tracking-wider text-cyan-200">UPSPACE · LVL {floor.floorNumber}</span>
                    <div className="truncate text-sm font-extrabold text-white">{adTitle || 'YOUR CAMPAIGN'}</div>
                    <div className="mt-0.5 truncate text-[10px] text-cyan-200">{targetUrl || 'Destination link preview'}</div>
                  </div>
                </div>
                <p className="mt-2 text-[10px] leading-relaxed text-slate-500">{bannerUrl ? 'Artwork is ready for the floor billboard.' : 'Add a texture URL to preview campaign artwork.'}</p>
              </aside>
            </div>

            <footer className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
              <div><span className="tech-label block">Total due</span><span className="text-base font-extrabold text-cyan-300">₹{floor.price}</span></div>
              <div className="flex gap-2">
                <button type="button" onClick={onClose} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.07]">Cancel</button>
                <button type="submit" className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-cyan-500/20 transition hover:scale-[1.02] active:scale-[0.98]"><Sparkles className="h-3.5 w-3.5" /> Mint &amp; Reserve</button>
              </div>
            </footer>
          </form>
        ) : (
          <div className="space-y-3 py-3 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/35 bg-emerald-500/15 text-emerald-300"><CheckCircle2 className="h-6 w-6" /></div>
            <h2 className="text-xl font-extrabold">Campaign published</h2>
            <p className="text-xs text-slate-400">Floor {floor.floorNumber} now displays your campaign in the 3D tower.</p>
            <button onClick={onClose} className="primary-action">Back to UpSpace</button>
          </div>
        )}
      </div>
    </div>
  );
}
