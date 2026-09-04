import { Arena } from '../types/arena';

export interface ArenaInfo {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  status: 'active' | 'coming-soon';
  themeColor: string;
  badge: string;
}

export const ARENA_LIST: ArenaInfo[] = [
  {
    id: 'business-tower',
    name: 'BUSINESS TOWER',
    category: 'Corporate & Technology',
    tagline: 'Companies & startups',
    description: 'The central commercial skyscraper of the metaverse skyline. Premium advertising for venture funds, tech enterprises, and global brands.',
    status: 'active',
    themeColor: '#00f0ff',
    badge: 'LIVE IN 3D',
  },
  {
    id: 'restaurant-district',
    name: 'RESTAURANT DISTRICT',
    category: 'Dining & Hospitality',
    tagline: 'Restaurants & food brands',
    description: 'Showcase Michelin-tier dining, trending food chains, and gourmet culinary destinations to virtual city explorers.',
    status: 'coming-soon',
    themeColor: '#f59e0b',
    badge: 'COMING SOON',
  },
  {
    id: 'shopping-mall',
    name: 'SHOPPING MALL',
    category: 'Retail & E-Commerce',
    tagline: 'Stores & brands',
    description: 'Direct metaverse foot traffic to digital flagships with 360-degree retail wrapped storefronts and product drops.',
    status: 'coming-soon',
    themeColor: '#10b981',
    badge: 'COMING SOON',
  },
  {
    id: 'gaming-arena',
    name: 'GAMING ARENA',
    category: 'Esports & Gaming',
    tagline: 'Gaming & creators',
    description: 'Neon-infused esports battlegrounds, dynamic stream stages, and guild headquarters for studios and hardware giants.',
    status: 'coming-soon',
    themeColor: '#a855f7',
    badge: 'COMING SOON',
  },
  {
    id: 'hotel-district',
    name: 'HOTEL DISTRICT',
    category: 'Luxury Resorts',
    tagline: 'Hotels & hospitality',
    description: 'Elevated luxury suites and digital skyline billboards for prestigious 5-star hotels and luxury travel networks.',
    status: 'coming-soon',
    themeColor: '#ec4899',
    badge: 'COMING SOON',
  },
  {
    id: 'creator-tower',
    name: 'CREATOR TOWER',
    category: 'Media & Influencers',
    tagline: 'Creators & personal brands',
    description: 'Empowering digital creators, podcast studios, and Web3 artists to claim dedicated virtual skyline floors.',
    status: 'coming-soon',
    themeColor: '#f43f5e',
    badge: 'COMING SOON',
  },
];

export const CURRENT_ARENA: Arena = {
  id: 'business-tower',
  name: 'Business Tower',
  type: 'business',
  tagline: 'Global Enterprise & Financial Headquarters',
  description: 'The pinnacle of corporate presence in UpSpace. Prime digital advertising for venture funds, tech firms, and global brands.',
  model: '/models/business-tower.glb',
  floorHeight: 2.45,
  totalFloors: 20,
  themeColor: '#00f0ff',
  accentColor: '#38bdf8',
  groundGlowColor: '#00f0ff',
  baseHeight: 2.2,
  antennaHeight: 5.0,
  buildingWidth: 5.2,
  buildingDepth: 5.2,
};

export const ARENAS: Arena[] = [CURRENT_ARENA];
