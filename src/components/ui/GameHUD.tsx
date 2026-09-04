'use client';

import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, ChevronLeft, ChevronRight, Eye, Globe2, Layers3, Leaf, Minus, Plus, RotateCcw, Ruler, Settings2, Sun, VolumeX, Zap } from 'lucide-react';
import { Arena } from '@/types/arena';
import { FloorData, getDisplayFloorNumber } from '@/types/floor';
import { ThemeMode } from '@/types/theme';

interface GameHUDProps {
  arena: Arena; floors: FloorData[]; selectedFloor: FloorData | null; theme: ThemeMode; autoRotate: boolean;
  lowPower?: boolean;
  onToggleTheme: () => void; onToggleAutoRotate: () => void; onToggleLowPower: () => void; onResetCamera: () => void;
  onSelectFloor: (floor: FloorData) => void; onOpenPurchase: () => void;
}

const Button = ({ className = '', children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...props} className={`pointer-events-auto inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-700 shadow-[0_4px_12px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(15,23,42,0.16)] active:translate-y-0 ${className}`}>{children}</button>
);

export function GameHUD({ arena, floors, selectedFloor, theme, autoRotate, lowPower, onToggleTheme, onToggleAutoRotate, onToggleLowPower, onResetCamera, onSelectFloor, onOpenPurchase }: GameHUDProps) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [category, setCategory] = useState('Category');
  const [domain, setDomain] = useState('yourcompany.com');
  const [ruler, setRuler] = useState(false);
  const [muted, setMuted] = useState(false);
  const sortedFloors = useMemo(() => [...floors].sort((a, b) => a.floorNumber - b.floorNumber), [floors]);
  const activeFloor = selectedFloor || sortedFloors[0];
  const claimed = Math.max(floors.length, floors.filter((floor) => floor.status === 'sold').length);
  const available = floors.filter((floor) => floor.status === 'available').length;
  const topPrice = Math.max(...floors.map((floor) => floor.price), 202);
  const moveFloor = (direction: 1 | -1) => { const index = sortedFloors.findIndex((floor) => floor.id === activeFloor?.id); const next = sortedFloors[index + direction]; if (next) onSelectFloor(next); };
  const sceneAction = (action: string) => window.dispatchEvent(new CustomEvent('upspace:scene-control', { detail: action }));

  return <div className="pointer-events-none absolute inset-0 z-30 select-none font-sans text-slate-900">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.32),transparent_35%),linear-gradient(180deg,rgba(255,176,129,0.52),rgba(255,239,229,0.24)_44%,rgba(255,250,246,0.06))]" />
    <header className="pointer-events-auto absolute inset-x-4 top-6 z-20 text-center sm:top-7">
      <div className="text-[22px] font-black tracking-[-0.07em] sm:text-[24px]">UpSpace</div>
      <h1 className="mt-5 text-[36px] font-black leading-none tracking-[-0.065em] sm:mt-7 sm:text-[54px] lg:text-[58px]">Outbid top floor for
        <span className="mx-2 inline-flex translate-y-[-0.08em] items-center gap-2 align-middle sm:mx-3"><button onClick={() => moveFloor(-1)} aria-label="Previous floor" className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-100/80 text-slate-500 shadow-sm transition hover:bg-slate-200 sm:h-10 sm:w-10"><ChevronLeft size={17} /></button><span className="border-b-[3px] border-dashed border-orange-500 pb-1">₹{topPrice}</span><button onClick={() => moveFloor(1)} aria-label="Next floor" className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-100/80 text-slate-500 shadow-sm transition hover:bg-slate-200 sm:h-10 sm:w-10"><ChevronRight size={17} /></button></span>
      </h1>
      <div className="relative mx-auto mt-8 flex max-w-[780px] flex-col items-center justify-center gap-3 px-2 md:flex-row">
        <label className="pointer-events-auto flex h-[52px] w-full max-w-[296px] items-center gap-3 rounded-full border border-slate-200 bg-white px-5 text-left shadow-[0_5px_14px_rgba(71,40,24,0.12)]"><Globe2 size={17} className="shrink-0 text-slate-400" /><input value={domain} onChange={(event) => setDomain(event.target.value)} className="min-w-0 flex-1 bg-transparent text-[14px] font-semibold text-slate-400 outline-none" aria-label="Company website" /></label>
        <div className="relative pointer-events-auto w-full max-w-[150px]"><button onClick={() => setCategoryOpen(!categoryOpen)} className="flex h-[52px] w-full items-center justify-between rounded-full border border-slate-200 bg-white px-5 text-[13px] font-medium text-slate-600 shadow-[0_5px_14px_rgba(71,40,24,0.12)]"><span className="truncate">{category}</span><ChevronDown size={16} /></button>{categoryOpen && <div className="absolute left-0 right-0 top-[58px] overflow-hidden rounded-2xl bg-white p-1 text-left shadow-xl">{['Technology', 'Retail', 'Food & drink'].map((item) => <button key={item} onClick={() => { setCategory(item); setCategoryOpen(false); }} className="block w-full rounded-xl px-3 py-2 text-left text-xs hover:bg-orange-50">{item}</button>)}</div>}</div>
        <button onClick={onOpenPurchase} className="pointer-events-auto flex h-[52px] w-full max-w-[286px] items-center justify-center gap-2 rounded-full border border-orange-400 bg-gradient-to-b from-orange-500 to-orange-600 px-5 text-[14px] font-extrabold text-white shadow-[0_5px_0_#ed7438,0_12px_18px_rgba(238,107,35,0.28)] transition hover:-translate-y-0.5"><Zap size={18} fill="currentColor" /> Outbid Top Floor #1 for ₹{topPrice} <ChevronRight size={16} /></button>
      </div>
      <div className="mx-auto mt-5 flex max-w-[620px] flex-col items-center gap-2 rounded-2xl border border-white/40 bg-white/70 px-6 py-3 shadow-[0_8px_30px_rgba(15,23,42,0.12)] backdrop-blur-md">
        <p className="text-[13px] font-medium text-slate-700">Claim the top space for your brand and stand above the rest.</p>
        <div className="flex justify-center gap-3 text-[11px] text-slate-600"><span>Platform Rules</span><span>·</span><span>Terms</span><span>·</span><span>Privacy</span></div>
      </div>
    </header>
    <aside className="absolute left-5 top-1/2 hidden -translate-y-1/2 flex-col items-start gap-2.5 xl:flex"><button className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg"><Settings2 size={16} />Manage</button><Stat icon={<span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />} value={available} label="online" /><Stat icon={<Ruler size={15} />} value="731" label="ft tall" /><Stat icon={<Layers3 size={15} />} value={claimed} label="floors claimed" /><Stat icon={<Eye size={15} />} value="151" label="visitors since launch" /><Stat icon={<Globe2 size={15} />} value="16" label="countries visited from" /><div className="rounded-full bg-white px-4 py-2.5 text-[13px] font-medium text-slate-600 shadow-[0_4px_12px_rgba(15,23,42,0.1)]"><span className="mr-2 inline-block h-4 w-4 rounded-full bg-orange-300 align-middle" />Backed by UpSpace</div></aside>
    {ruler && <div className="absolute bottom-14 right-[19%] hidden h-[35vh] w-12 border-r-4 border-yellow-500 md:block"><span className="absolute -right-7 top-1/2 rotate-90 whitespace-nowrap rounded bg-yellow-300 px-1.5 py-0.5 text-[10px] font-black text-slate-800">731 FT</span></div>}
    <aside className="absolute right-5 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-2.5 md:flex"><Button onClick={onResetCamera}><RotateCcw size={16} />Reset</Button><Button onClick={() => sceneAction('zoom-in')}><Plus size={16} />Zoom in</Button><Button onClick={() => sceneAction('zoom-out')}><Minus size={16} />Zoom out</Button><Button onClick={onToggleTheme}><Sun size={16} />{theme === 'day' ? 'Evening' : 'Daytime'}</Button><Button onClick={() => setMuted(!muted)}><VolumeX size={16} />Sound {muted ? 'on' : 'off'}</Button><Button onClick={() => setRuler(!ruler)} className={ruler ? 'border-orange-300 text-orange-600' : ''}><Ruler size={16} />Ruler {ruler ? 'off' : 'on'}</Button><Button onClick={() => sceneAction('rotate-left')}><ChevronLeft size={16} />Rotate</Button><Button onClick={() => sceneAction('rotate-right')}><ChevronRight size={16} />Rotate</Button><Button onClick={() => sceneAction('toggle-explode')}><ArrowUp size={16} /><ArrowDown size={16} />Move floors</Button><Button onClick={onToggleLowPower} className={lowPower ? 'border-emerald-300 text-emerald-700' : ''}><Leaf size={16} />Low power {lowPower ? 'on' : 'off'}</Button></aside>
    <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur xl:hidden">{arena.name} · Floor {getDisplayFloorNumber(activeFloor?.floorNumber ?? 0, floors.length)} · {claimed} claimed</div>
  </div>;
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: React.ReactNode; label: string }) { return <div className="flex items-center gap-2.5 rounded-full bg-white px-4 py-2.5 text-[13px] text-slate-600 shadow-[0_4px_12px_rgba(15,23,42,0.1)]"><span className="text-slate-500">{icon}</span><b className="text-slate-800">{value}</b><span>{label}</span></div>; }
