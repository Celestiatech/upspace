export type FloorStatus = 'available' | 'sold';

export interface FloorData {
  id: string;
  floorNumber: number;
  arenaId: string;
  ownerName: string | null;
  brandTitle: string | null;
  tagline?: string;
  category: string;
  status: FloorStatus;
  price: number; // in INR ₹
  currency: string;
  dimensions: string; // e.g. "360° Panoramic Digital Billboard"
  impressionsPerDay: string;
  elevationMeters: number;
  logoUrl?: string;
  adBannerUrl?: string;
  targetUrl?: string;
  bannerColor?: string;
  contractExpiry?: string;
  claimCode?: string;
}

export function getDisplayFloorNumber(floorNumber: number, totalFloors: number): number {
  // The top (party) floor is the rooftop deck and is not numbered.
  // The floor directly below it is #1, counting downward to the ground floor.
  return totalFloors - 1 - floorNumber;
}
