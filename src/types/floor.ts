export type FloorStatus = 'available' | 'sold';

export type VerifiedBadgeType = 'github' | 'indie' | 'startup' | 'enterprise';

export interface FloorBidHistory {
  bidder: string;
  amount: number;
  timestamp: string;
  isTopBid?: boolean;
}

export interface FloorSocialLinks {
  twitter?: string;
  github?: string;
  website?: string;
  linkedin?: string;
}

export interface FloorData {
  id: string;
  floorNumber: number; // 0-indexed internal (0 = ground floor, 19 = top floor)
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

  // Legitimacy, Verification & Analytics metadata
  verifiedDomain?: boolean;
  verifiedType?: VerifiedBadgeType;
  safetyScanPassed?: boolean;
  impressionsWeekly?: number;
  clicksDelivered?: number;
  floorClicks?: number;
  websiteVisits?: number;
  ctr?: number; // e.g. 12.4%
  daysHeld?: number;
  leaseExpiryDays?: number; // Days remaining in 7-day retention cycle
  socialLinks?: FloorSocialLinks;
  bidHistory?: FloorBidHistory[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Returns human-readable floor number:
 * Floor 0 in internal array = Floor 1 (Lobby / Ground Floor)
 * Floor 19 = Floor 20 (Penthouse / Spire)
 */
export function getDisplayFloorNumber(floorNumber: number, _totalFloors?: number): number {
  return floorNumber + 1;
}

export function isPenthouseFloor(floorNumber: number, totalFloors: number): boolean {
  return floorNumber >= totalFloors - 1;
}
