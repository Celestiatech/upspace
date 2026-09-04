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
        <img src="/spinning-head.gif" alt="Loading UpSpace" className="h-44 w-44 object-contain" />
        <p>Preparing your skyline…</p>
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
