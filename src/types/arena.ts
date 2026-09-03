export type ArenaType =
  | 'business'
  | 'restaurant'
  | 'hotel'
  | 'shopping'
  | 'gaming'
  | 'creator'
  | 'auto'
  | 'technology';

export interface Arena {
  id: string;
  name: string;
  type: ArenaType;
  tagline: string;
  description: string;
  model: string; // e.g., '/models/business-tower.glb'
  floorHeight: number;
  totalFloors: number;
  themeColor: string;
  accentColor: string;
  groundGlowColor: string;
  baseHeight: number;
  antennaHeight: number;
  buildingWidth: number;
  buildingDepth: number;
}
