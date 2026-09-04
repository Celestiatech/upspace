export interface ActivityEvent {
  id: string;
  type: 'claim' | 'outbid' | 'renewal' | 'milestone';
  brand: string;
  domain: string;
  floorDisplayNumber: number;
  amount: number;
  timeAgo: string;
  verifiedType: 'github' | 'indie' | 'startup' | 'enterprise';
}

export const RECENT_ACTIVITY_LOG: ActivityEvent[] = [
  {
    id: 'act-1',
    type: 'outbid',
    brand: 'Arcade Studio',
    domain: 'arcadestudio.in',
    floorDisplayNumber: 20,
    amount: 8999,
    timeAgo: '2m ago',
    verifiedType: 'enterprise',
  },
  {
    id: 'act-2',
    type: 'claim',
    brand: 'Zenith Vector',
    domain: 'zenithvector.dev',
    floorDisplayNumber: 19,
    amount: 6499,
    timeAgo: '14m ago',
    verifiedType: 'startup',
  },
  {
    id: 'act-3',
    type: 'outbid',
    brand: 'Mango Labs',
    domain: 'mangolabs.co',
    floorDisplayNumber: 18,
    amount: 5299,
    timeAgo: '32m ago',
    verifiedType: 'indie',
  },
  {
    id: 'act-4',
    type: 'renewal',
    brand: 'Kite Cloud',
    domain: 'kitecloud.io',
    floorDisplayNumber: 15,
    amount: 4199,
    timeAgo: '1h ago',
    verifiedType: 'startup',
  },
  {
    id: 'act-5',
    type: 'claim',
    brand: 'Verve Commerce',
    domain: 'vervecommerce.in',
    floorDisplayNumber: 5,
    amount: 1899,
    timeAgo: '2h ago',
    verifiedType: 'enterprise',
  },
  {
    id: 'act-6',
    type: 'outbid',
    brand: 'Bright Labs',
    domain: 'brightlabs.in',
    floorDisplayNumber: 3,
    amount: 1299,
    timeAgo: '3h ago',
    verifiedType: 'github',
  },
  {
    id: 'act-7',
    type: 'claim',
    brand: 'Yash Nix AI',
    domain: 'yashnixai.tech',
    floorDisplayNumber: 1,
    amount: 799,
    timeAgo: '5h ago',
    verifiedType: 'indie',
  },
];
