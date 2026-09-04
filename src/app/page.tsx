'use client';

import React, { useState, useEffect } from 'react';
import { CURRENT_ARENA } from '@/data/arenas';
import { FloorData } from '@/types/floor';
import { ArenaCanvas } from '@/components/3d/ArenaCanvas';
import { GameHUD } from '@/components/ui/GameHUD';
import { PurchaseModal } from '@/components/ui/PurchaseModal';
import { CloudReveal } from '@/components/ui/CloudReveal';
import { FloorDetailCard } from '@/components/floors/FloorDetailCard';
import { useAppStore } from '@/store/useAppStore';

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

  const [purchaseFloor, setPurchaseFloor] = useState<FloorData | null>(null);
  const [resetTrigger, setResetTrigger] = useState<number>(0);
  const [inspectorOpen, setInspectorOpen] = useState(false);

  // Set default selected floor on initial load if null
  useEffect(() => {
    if (!selectedFloor && floors.length > 0) {
      selectFloor(floors[0]);
    }
  }, [selectedFloor, floors, selectFloor]);

  // Reset camera view to ground floor.
  const handleResetCamera = () => {
    const groundFloor = floors[0];
    if (groundFloor) {
      selectFloor(groundFloor);
    }
    setResetTrigger((prev) => prev + 1);
  };

  // Purchase flow modal
  // Only the next unbuilt level is purchasable. It is added to the tower after checkout.
  const handleOpenPurchase = (floorToClaim?: FloorData) => {
    if (floorToClaim) {
      setPurchaseFloor(floorToClaim.status === 'sold'
        ? { ...floorToClaim, price: Math.ceil(floorToClaim.price * 1.1) }
        : floorToClaim);
      return;
    }
    const highestFloorNumber = Math.max(...floors.map((floor) => floor.floorNumber), 0);
    const nextFloorNumber = highestFloorNumber + 1;
    const highestPrice = Math.max(...floors.map((floor) => floor.price), 0);

    setPurchaseFloor({
      id: `${arena.id}-floor-${nextFloorNumber}`,
      floorNumber: nextFloorNumber,
      arenaId: arena.id,
      ownerName: currentUser?.name || null,
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

  const handleSelectFloor = (floor: FloorData) => {
    selectFloor(floor);
    setInspectorOpen(true);
  };

  const handleConfirmPurchase = (campaign: { title: string; bannerUrl: string; targetUrl: string; bidAmount: number; claimCode: string }) => {
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
    };

    addFloor(updatedFloor);
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
          lowPower={lowPower}
          onSelectFloor={handleSelectFloor}
          resetCameraTrigger={resetTrigger}
        />
      </div>

      <CloudReveal />

      {/* 2. MINIMALIST GAME HUD OVERLAY */}
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
      />

      {inspectorOpen && selectedFloor && (
        <aside className="pointer-events-auto absolute right-4 top-20 z-40 w-[calc(100%-2rem)] max-w-sm sm:right-6 sm:top-24">
          <FloorDetailCard
            floor={selectedFloor}
            theme={theme}
            allFloors={floors}
            onClose={() => setInspectorOpen(false)}
            onSelectFloor={handleSelectFloor}
            onOpenPurchase={handleOpenPurchase}
          />
        </aside>
      )}

      {/* 3. PROTOTYPE ACQUISITION MODAL */}
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
