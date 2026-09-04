export interface Landmark {
  id: string;
  name: string;
  location: string;
  heightMeters: number;
  icon: string;
  imageUrl: string;
  category: string;
  description: string;
  floorsRequired: number;
}

export const WORLD_LANDMARKS: Landmark[] = [
  {
    id: 'leaning-tower',
    name: 'Leaning Tower of Pisa',
    location: 'Pisa, Italy',
    heightMeters: 57,
    icon: '🏛️',
    imageUrl: 'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?auto=format&fit=crop&w=300&q=80',
    category: 'Historic Wonder',
    description: 'World-famous freestanding bell tower of Pisa Cathedral.',
    floorsRequired: 6,
  },
  {
    id: 'taj-mahal',
    name: 'Taj Mahal',
    location: 'Agra, India',
    heightMeters: 73,
    icon: '🕌',
    imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=300&q=80',
    category: 'UNESCO World Heritage',
    description: 'The crown jewel of Mughal architecture with pristine white marble domes and minarets.',
    floorsRequired: 10,
  },
  {
    id: 'statue-of-liberty',
    name: 'Statue of Liberty',
    location: 'New York, USA',
    heightMeters: 93,
    icon: '🗽',
    imageUrl: 'https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?auto=format&fit=crop&w=300&q=80',
    category: 'National Monument',
    description: 'Iconic copper colossus welcoming skyline explorers from across the globe.',
    floorsRequired: 14,
  },
  {
    id: 'pyramid-giza',
    name: 'Great Pyramid of Giza',
    location: 'Giza, Egypt',
    heightMeters: 138.5,
    icon: '🔺',
    imageUrl: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=300&q=80',
    category: 'Ancient Wonder',
    description: 'The oldest and largest of the Giza pyramid complex, standing for millennia.',
    floorsRequired: 25,
  },
  {
    id: 'statue-of-unity',
    name: 'Statue of Unity',
    location: 'Gujarat, India',
    heightMeters: 182,
    icon: '🗿',
    imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=300&q=80',
    category: 'Colossus',
    description: 'The world’s tallest colossal statue standing proudly on the Narmada River.',
    floorsRequired: 34,
  },
  {
    id: 'eiffel-tower',
    name: 'Eiffel Tower',
    location: 'Paris, France',
    heightMeters: 330,
    icon: '🗼',
    imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=300&q=80',
    category: 'Global Landmark',
    description: 'The wrought-iron lattice spire dominating the Parisian romantic skyline.',
    floorsRequired: 67,
  },
  {
    id: 'empire-state',
    name: 'Empire State Building',
    location: 'New York, USA',
    heightMeters: 381,
    icon: '🏙️',
    imageUrl: 'https://images.unsplash.com/photo-1555109307-f7d9da25c244?auto=format&fit=crop&w=300&q=80',
    category: 'Art Deco Skyscraper',
    description: 'Legendary 102-story Art Deco skyscraper in Midtown Manhattan.',
    floorsRequired: 78,
  },
  {
    id: 'petronas-towers',
    name: 'Petronas Twin Towers',
    location: 'Kuala Lumpur, Malaysia',
    heightMeters: 452,
    icon: '🏢',
    imageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=300&q=80',
    category: 'Twin Megastructure',
    description: 'Postmodern Islamic-inspired twin skyscrapers with skybridge.',
    floorsRequired: 94,
  },
  {
    id: 'burj-khalifa',
    name: 'Burj Khalifa',
    location: 'Dubai, UAE',
    heightMeters: 828,
    icon: '✨',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=300&q=80',
    category: 'World Record Skyscraper',
    description: 'The world’s highest architectural pinnacle piercing the clouds.',
    floorsRequired: 178,
  },
];

/**
 * Calculates current building height in meters based on floor count
 */
export function calculateBuildingHeight(floorCount: number): number {
  const basePodiumMeters = 18;
  const floorHeightMeters = 4.5;
  const crownMeters = 12;
  return basePodiumMeters + floorCount * floorHeightMeters + crownMeters;
}

/**
 * Returns landmark comparison statistics for the given floor count
 */
export function getLandmarkComparison(floorCount: number) {
  const currentHeight = calculateBuildingHeight(floorCount);

  const surpassed = WORLD_LANDMARKS.filter((l) => currentHeight >= l.heightMeters);
  const upcoming = WORLD_LANDMARKS.filter((l) => currentHeight < l.heightMeters);

  const highestSurpassed = surpassed.length > 0 ? surpassed[surpassed.length - 1] : null;
  const nextMilestone = upcoming.length > 0 ? upcoming[0] : null;

  const floorsToNext = nextMilestone
    ? Math.max(1, Math.ceil((nextMilestone.heightMeters - currentHeight) / 4.5))
    : 0;

  return {
    currentHeight,
    highestSurpassed,
    nextMilestone,
    surpassedList: surpassed,
    upcomingList: upcoming,
    floorsToNext,
  };
}
