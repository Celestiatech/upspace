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
}
