'use client';

import React, { useState, useEffect } from 'react';
import { CURRENT_ARENA } from '@/data/arenas';
import { FloorData, getDisplayFloorNumber } from '@/types/floor';
import { ArenaCanvas } from '@/components/3d/ArenaCanvas';
import { GameHUD } from '@/components/ui/GameHUD';
import { Header } from '@/components/ui/Header';
import { PurchaseModal } from '@/components/ui/PurchaseModal';
import { CloudReveal } from '@/components/ui/CloudReveal';
import { FloorDetailDrawer } from '@/components/floors/FloorDetailDrawer';
import { FloorDirectory } from '@/components/floors/FloorDirectory';
import { ActivityFeedModal } from '@/components/ui/ActivityFeedModal';
import { useAppStore } from '@/store/useAppStore';
import { X, HelpCircle } from 'lucide-react';

export default function AppScreen() {
  const arena = CURRENT_ARENA;

  // Zustand persistent state
  const floors = useAppStore((state) => state.floors);
  const selectedFloor = useAppStore((state) => state.selectedFloor);
  const theme = useAppStore((state) => state.theme);
  const autoRotate = useAppStore((state) => state.autoRotate);
  const lowPower = useAppStore((state) => state.lowPower);
  const addFloor = useAppStore((state) => state.addFloor);
  const selectFloor = useAppStore((state) => state.selectFloor);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const toggleAutoRotate = useAppStore((state) => state.toggleAutoRotate);
  const toggleLowPower = useAppStore((state) => state.toggleLowPower);
  const currentUser = useAppStore((state) => state.user);

  // View mode: '3d' spatial canvas or 'directory' 2D table
  const [viewMode, setViewMode] = useState<'3d' | 'directory'>('3d');

  // Modals & drawers
  const [purchaseFloor, setPurchaseFloor] = useState<FloorData | null>(null);
  const [resetTrigger, setResetTrigger] = useState<number>(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);

  // Set default selected floor on initial load if null
  useEffect(() => {
    if (!selectedFloor && floors.length > 0) {
      selectFloor(floors[0]);
    }
  }, [selectedFloor, floors, selectFloor]);

  // Reset camera view to ground floor
  const handleResetCamera = () => {
    const groundFloor = floors[0];
    if (groundFloor) {
      selectFloor(groundFloor);
    }
    setResetTrigger((prev) => prev + 1);
  };

  // Purchase flow modal
  const handleOpenPurchase = (floorToClaim?: FloorData) => {
    if (floorToClaim) {
      setPurchaseFloor(
        floorToClaim.status === 'sold'
          ? { ...floorToClaim, price: Math.ceil(floorToClaim.price * 1.1) }
          : floorToClaim
      );
      return;
    }
    const highestFloorNumber = Math.max(...floors.map((floor) => floor.floorNumber), 0);
    const nextFloorNumber = highestFloorNumber + 1;
    const highestPrice = Math.max(...floors.map((floor) => floor.price), 0);
    const nextDisplayNum = nextFloorNumber + 1;

    setPurchaseFloor({
      id: `${arena.id}-floor-${nextFloorNumber}`,
      floorNumber: nextFloorNumber,
      arenaId: arena.id,
      ownerName: currentUser?.name || null,
      brandTitle: null,
      tagline: `Pinnacle Level ${nextDisplayNum} — Elevated skyline billboard`,
      category: 'Pinnacle Build Opportunity',
      status: 'available',
      price: Math.ceil(highestPrice * 1.15),
      currency: 'INR',
      dimensions: '360° Panoramic Digital Wrap & Spire Halo',
      impressionsPerDay: 'Launching soon',
      elevationMeters: arena.baseHeight + floors.length * arena.floorHeight + arena.floorHeight / 2,
    });
  };

  const handleSelectFloor = (floor: FloorData) => {
    selectFloor(floor);
    setDrawerOpen(true);
  };

  const handleConfirmPurchase = (campaign: {
    title: string;
    bannerUrl: string;
    targetUrl: string;
    bidAmount: number;
    claimCode: string;
  }) => {
    if (!purchaseFloor) return;

    const updatedFloor: FloorData = {
      ...purchaseFloor,
      status: 'sold',
      ownerName: currentUser?.name || currentUser?.email || 'Unclaimed purchase',
      price: campaign.bidAmount,
      brandTitle: campaign.title,
      tagline: campaign.targetUrl ? 'Interactive campaign live on UpSpace' : 'New campaign now live',
      category: 'Custom Campaign',
      adBannerUrl: campaign.bannerUrl || undefined,
      targetUrl: campaign.targetUrl || undefined,
      claimCode: campaign.claimCode,
      verifiedDomain: true,
      verifiedType: 'indie',
      safetyScanPassed: true,
      impressionsWeekly: 120000,
      clicksDelivered: 1650,
      ctr: 14.8,
      daysHeld: 1,
      leaseExpiryDays: 7,
      bidHistory: [
        {
          bidder: campaign.title || 'Anonymous Brand',
          amount: campaign.bidAmount,
          timestamp: 'Just now',
          isTopBid: true,
        },
      ],
    };

    addFloor(updatedFloor);
    setPurchaseFloor(null);
  };

  const isDay = theme === 'day';

  return (
    <main
      className={`relative w-screen h-screen overflow-hidden select-none transition-colors duration-500 font-sans ${
        isDay ? 'bg-[#38bdf8] text-slate-900' : 'bg-[#0f172a] text-slate-100'
      }`}
    >
      {/* 1. PERSISTENT TOP NAVIGATION HEADER */}
      <Header
        currentArena={arena}
        floors={floors}
        theme={theme}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(viewMode === '3d' ? 'directory' : '3d')}
        onToggleTheme={toggleTheme}
        onOpenHowItWorks={() => setRulesOpen(true)}
        onOpenActivityFeed={() => setActivityModalOpen(true)}
        onOpenGetFloor={() => handleOpenPurchase()}
      />

      {/* 2. FULL-SCREEN 3D WORLD CANVAS (Active in 3D Mode) */}
      <div
        id="scene-container"
        className={`absolute inset-0 w-full h-full z-0 transition-opacity duration-300 ${
          viewMode === '3d' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <ArenaCanvas
          arena={arena}
          floors={floors}
          selectedFloor={selectedFloor}
          autoRotate={autoRotate}
          theme={theme}
          lowPower={lowPower}
          onSelectFloor={handleSelectFloor}
          resetCameraTrigger={resetTrigger}
        />
      </div>

      <CloudReveal />

      {/* 3. 3D GAME HUD OVERLAY (Only visible in 3D mode) */}
      {viewMode === '3d' && (
        <GameHUD
          arena={arena}
          floors={floors}
          selectedFloor={selectedFloor}
          theme={theme}
          autoRotate={autoRotate}
          lowPower={lowPower}
          onToggleTheme={toggleTheme}
          onToggleAutoRotate={toggleAutoRotate}
          onToggleLowPower={toggleLowPower}
          onResetCamera={handleResetCamera}
          onOpenPurchase={handleOpenPurchase}
          onOpenHowItWorks={() => setRulesOpen(true)}
        />
      )}

      {/* 4. 2D DIRECTORY & LEADERBOARD VIEW (Active in Directory Mode) */}
      {viewMode === 'directory' && (
        <div className="relative z-10 w-full h-full overflow-y-auto custom-scrollbar">
          <FloorDirectory
            floors={floors}
            theme={theme}
            onSelectFloor={handleSelectFloor}
            onOpenPurchase={handleOpenPurchase}
            onSwitchTo3D={() => setViewMode('3d')}
          />
        </div>
      )}

      {/* 5. COLLAPSIBLE RIGHT SIDE-DRAWER */}
      <FloorDetailDrawer
        floor={selectedFloor}
        theme={theme}
        allFloors={floors}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSelectFloor={handleSelectFloor}
        onOpenPurchase={handleOpenPurchase}
      />

      {/* 6. LIVE ACTIVITY & AUDIT TRAIL MODAL */}
      {activityModalOpen && (
        <ActivityFeedModal
          theme={theme}
          onClose={() => setActivityModalOpen(false)}
        />
      )}

      {/* 7. RULES & HOW IT WORKS MODAL */}
      {rulesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <section className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl ${
            isDay ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-950 border-white/15 text-white'
          }`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  Transparency & Rules
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight">How UpSpace Works</h2>
              </div>
              <button
                onClick={() => setRulesOpen(false)}
                className="p-1.5 rounded-full border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 transition"
                aria-label="Close rules"
              >
                <X size={18} />
              </button>
            </div>
            <ol className="mt-5 space-y-3.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              <li>
                <b className="text-slate-900 dark:text-white">1. Select a Level.</b> Click any floor in 3D orbit or the 2D directory to inspect live impressions, clicks, domain verification, and lease time.
              </li>
              <li>
                <b className="text-slate-900 dark:text-white">2. Place Your Campaign.</b> Provide your destination URL, brand title, and custom billboard banner. All URLs undergo automated SSL & malware screening.
              </li>
              <li>
                <b className="text-slate-900 dark:text-white">3. 7-Day Protected Lease.</b> Your level is protected for 7 days. Higher bids bump elevation and unlock exclusive high-altitude billboards.
              </li>
            </ol>
            <div className="mt-5 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-700 dark:text-orange-300">
              All impressions and clicks are verified telemetry—never fabricated metrics.
            </div>
          </section>
        </div>
      )}

      {/* 9. CAMPAIGN CHECKOUT & ACQUISITION MODAL */}
      <PurchaseModal
        floor={purchaseFloor}
        floors={floors}
        theme={theme}
        onClose={() => setPurchaseFloor(null)}
        onConfirm={handleConfirmPurchase}
      />
    </main>
  );
}
