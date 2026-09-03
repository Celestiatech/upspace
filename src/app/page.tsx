'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { CURRENT_ARENA } from '@/data/arenas';
import { getFloorsForArena } from '@/data/floors';
import { FloorData } from '@/types/floor';
import { ThemeMode } from '@/types/theme';
import { ArenaCanvas } from '@/components/3d/ArenaCanvas';
import { GameHUD } from '@/components/ui/GameHUD';
import { PurchaseModal } from '@/components/ui/PurchaseModal';

// Helper to determine theme from user device time (6 AM to 6 PM = Day, 6 PM to 6 AM = Night)
const getThemeFromDeviceTime = (): ThemeMode => {
  if (typeof window === 'undefined') return 'night';
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? 'day' : 'night';
};

export default function AppScreen() {
  const arena = CURRENT_ARENA;
  const initialFloors = useMemo(() => getFloorsForArena(arena.id), [arena.id]);
  const [floors, setFloors] = useState<FloorData[]>(initialFloors);

  // Start the experience at ground floor (Floor 0).
  const [selectedFloor, setSelectedFloor] = useState<FloorData | null>(() => {
    const list = getFloorsForArena(CURRENT_ARENA.id);
    return list[0] || null;
  });

  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [theme, setTheme] = useState<ThemeMode>('day');
  const [purchaseFloor, setPurchaseFloor] = useState<FloorData | null>(null);
  const [resetTrigger, setResetTrigger] = useState<number>(0);

  // Theme toggle (Day / Night)
  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'day' ? 'night' : 'day'));
  };

  // Auto-rotate toggle
  const handleToggleAutoRotate = () => {
    setAutoRotate((prev) => !prev);
  };

  // Reset camera view to ground floor.
  const handleResetCamera = () => {
    const groundFloor = floors[0];
    setSelectedFloor(groundFloor);
    setResetTrigger((prev) => prev + 1);
  };

  // Floor selection (smooth fly-to camera focus)
  const handleSelectFloor = (floor: FloorData) => {
    setSelectedFloor(floor);
  };

  // Purchase flow modal
  // Only the next unbuilt level is purchasable. It is added to the tower after checkout.
  const handleOpenPurchase = () => {
    const highestFloorNumber = Math.max(...floors.map((floor) => floor.floorNumber), 0);
    const nextFloorNumber = highestFloorNumber + 1;
    const highestPrice = Math.max(...floors.map((floor) => floor.price), 0);

    setPurchaseFloor({
      id: `${arena.id}-floor-${nextFloorNumber}`,
      floorNumber: nextFloorNumber,
      arenaId: arena.id,
      ownerName: null,
      brandTitle: null,
      tagline: 'New upper level — created after purchase',
      category: 'New Build Opportunity',
      status: 'available',
      price: highestPrice + 1,
      currency: 'INR',
      dimensions: '360° Panoramic Digital Billboard',
      impressionsPerDay: 'Launching soon',
      elevationMeters: arena.baseHeight + floors.length * arena.floorHeight + arena.floorHeight / 2,
    });
  };

  const handleConfirmPurchase = (campaign: { title: string; bannerUrl: string; targetUrl: string }) => {
    if (!purchaseFloor) return;

    const updatedFloor: FloorData = {
      ...purchaseFloor,
      status: 'sold',
      ownerName: 'UpSpace Member',
      brandTitle: campaign.title,
      tagline: campaign.targetUrl ? 'Interactive campaign live on UpSpace' : 'New campaign now live',
      category: 'Custom Campaign',
      adBannerUrl: campaign.bannerUrl || undefined,
      targetUrl: campaign.targetUrl || undefined,
    };

    setFloors((current) => [...current, updatedFloor]);
    setSelectedFloor(updatedFloor);
  };

  const isDay = theme === 'day';

  return (
    <main
      className={`relative w-screen h-screen overflow-hidden select-none transition-colors duration-500 ${
        isDay ? 'bg-[#38bdf8] text-slate-900' : 'bg-[#0f172a] text-slate-100'
      }`}
    >
      {/* 1. FULL-SCREEN 3D WORLD: TOWER + URBAN ENVIRONMENT */}
      <div id="scene-container" className="absolute inset-0 w-full h-full z-0">
        <ArenaCanvas
          arena={arena}
          floors={floors}
          selectedFloor={selectedFloor}
          autoRotate={autoRotate}
          theme={theme}
          onSelectFloor={handleSelectFloor}
          resetCameraTrigger={resetTrigger}
        />
      </div>

      {/* 2. MINIMALIST GAME HUD OVERLAY */}
      <GameHUD
        arena={arena}
        floors={floors}
        selectedFloor={selectedFloor}
        theme={theme}
        autoRotate={autoRotate}
        onToggleTheme={handleToggleTheme}
        onToggleAutoRotate={handleToggleAutoRotate}
        onResetCamera={handleResetCamera}
        onSelectFloor={handleSelectFloor}
        onOpenPurchase={handleOpenPurchase}
      />

      {/* 3. PROTOTYPE ACQUISITION MODAL */}
      <PurchaseModal
        floor={purchaseFloor}
        theme={theme}
        onClose={() => setPurchaseFloor(null)}
        onConfirm={handleConfirmPurchase}
      />
    </main>
  );
}
