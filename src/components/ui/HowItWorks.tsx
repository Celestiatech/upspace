'use client';

import React from 'react';
import { ThemeMode } from '@/types/theme';
import { Compass, Palette, Globe } from 'lucide-react';

interface HowItWorksProps {
  theme: ThemeMode;
}

export function HowItWorks({ theme }: HowItWorksProps) {
  const isDay = theme === 'day';

  const steps = [
    {
      number: '01',
      title: 'CHOOSE YOUR FLOOR',
      description: 'Select an available location inside the virtual tower.',
      icon: Compass,
      color: '#00f0ff',
    },
    {
      number: '02',
      title: 'BUILD YOUR SPACE',
      description: 'Customize your business identity, logo, colors and advertising.',
      icon: Palette,
      color: '#f59e0b',
    },
    {
      number: '03',
      title: 'GET DISCOVERED',
      description: 'Visitors explore the tower and discover your business.',
      icon: Globe,
      color: '#10b981',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold uppercase">
          ONBOARDING ARCHITECTURE
        </div>
        <h2
          className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight ${
            isDay ? 'text-slate-900' : 'text-white'
          }`}
        >
          How It Works
        </h2>
        <p
          className={`text-base sm:text-lg ${
            isDay ? 'text-slate-600' : 'text-slate-400'
          }`}
        >
          Three simple steps to establish your permanent presence on the 3D skyline.
        </p>
      </div>

      {/* Three Step Cards (Requirement #7) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className={`relative rounded-3xl p-8 border transition-all duration-300 flex flex-col justify-between group overflow-hidden ${
                isDay
                  ? 'bg-white/80 border-slate-200 shadow-lg hover:shadow-xl'
                  : 'bg-slate-950/70 border-white/10 hover:border-cyan-500/30 hover:shadow-glow'
              }`}
            >
              {/* Top Step Number */}
              <div>
                <div className="flex items-center justify-between pb-6">
                  <span
                    className="text-4xl font-extrabold font-mono tracking-tight"
                    style={{ color: step.color }}
                  >
                    {step.number}
                  </span>
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center border"
                    style={{
                      backgroundColor: `${step.color}15`,
                      borderColor: `${step.color}35`,
                      color: step.color,
                    }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                <h3
                  className={`text-xl font-extrabold tracking-tight mt-2 ${
                    isDay ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {step.title}
                </h3>
                <p
                  className={`text-sm mt-3 leading-relaxed ${
                    isDay ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  {step.description}
                </p>
              </div>

              {/* Progress Indicator line */}
              <div className="pt-8 mt-8 border-t border-black/5 dark:border-white/5">
                <div
                  className="h-1 rounded-full w-12 transition-all group-hover:w-full"
                  style={{ backgroundColor: step.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
