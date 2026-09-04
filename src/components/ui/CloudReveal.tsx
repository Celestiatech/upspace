'use client';

import { useEffect, useState } from 'react';

export function CloudReveal() {
  const [clearing, setClearing] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const beginReveal = window.setTimeout(() => setClearing(true), 850);
    const finishReveal = window.setTimeout(() => setVisible(false), 2100);

    return () => {
      window.clearTimeout(beginReveal);
      window.clearTimeout(finishReveal);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`cloud-reveal ${clearing ? 'cloud-reveal--clearing' : ''}`} aria-label="Loading UpSpace">
      <div className="cloud-reveal__base" />
      <div className="cloud-reveal__center">
        <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-cyan-50 border border-cyan-400/40 text-cyan-600 shadow-xl shadow-cyan-100/50">
          <div className="absolute inset-0 rounded-2xl border-2 border-cyan-500 border-t-transparent animate-spin" />
          <svg className="w-8 h-8 text-cyan-600 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/>
            <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/>
            <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>
          </svg>
        </div>
        <p className="text-slate-800 font-bold tracking-wider text-sm">LOADING UPSPACE</p>
      </div>
      <div className="cloud-bank cloud-bank--left" />
      <div className="cloud-bank cloud-bank--right" />
      <div className="cloud-puff cloud-puff--one" />
      <div className="cloud-puff cloud-puff--two" />
      <div className="cloud-puff cloud-puff--three" />

      <style jsx>{`
        .cloud-reveal {
          position: absolute;
          z-index: 60;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .cloud-reveal__base {
          position: absolute;
          inset: 0;
          background: #fff;
          transition: opacity 360ms ease 280ms;
        }
        .cloud-reveal--clearing .cloud-reveal__base { opacity: 0; }
        .cloud-reveal__center {
          display: flex;
          position: absolute;
          z-index: 10;
          inset: 0;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #0f172a;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: .02em;
          transition: opacity 350ms ease;
          pointer-events: none;
        }
        .cloud-reveal--clearing .cloud-reveal__center { opacity: 0; }
        .cloud-bank, .cloud-puff {
          position: absolute;
          background: #fff;
          box-shadow: 0 0 60px 28px rgba(255, 255, 255, .96);
          will-change: transform;
          backface-visibility: hidden;
          transition: transform 1.15s cubic-bezier(.55, .04, .25, 1);
        }
        .cloud-bank { top: -15%; height: 130%; width: 65%; }
        .cloud-bank--left { left: -18%; border-radius: 0 48% 48% 0; }
        .cloud-bank--right { right: -18%; border-radius: 48% 0 0 48%; }
        .cloud-puff { width: 42vw; height: 42vw; max-width: 590px; max-height: 590px; border-radius: 50%; }
        .cloud-puff--one { top: -20%; left: 19%; }
        .cloud-puff--two { bottom: -30%; right: 18%; }
        .cloud-puff--three { top: 34%; left: 39%; width: 30vw; height: 30vw; }
        .cloud-reveal--clearing .cloud-bank--left { transform: translateX(-105%); }
        .cloud-reveal--clearing .cloud-bank--right { transform: translateX(105%); }
        .cloud-reveal--clearing .cloud-puff--one { transform: translate(-45%, -75%); }
        .cloud-reveal--clearing .cloud-puff--two { transform: translate(50%, 75%); }
        .cloud-reveal--clearing .cloud-puff--three { transform: scale(.2); }
      `}</style>
    </div>
  );
}
