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

export const RECENT_ACTIVITY_LOG: ActivityEvent[] = [];
