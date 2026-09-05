import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { FloorData } from '@/types/floor';
import { ThemeMode } from '@/types/theme';
import { CURRENT_ARENA } from '@/data/arenas';

export interface AuthUser {
  id: string; // Unique Citizen ID e.g. "US-74921"
  username: string; // e.g. "alexvance"
  name: string;
  email: string;
  provider: 'google' | 'email' | 'otp';
  avatarUrl?: string;
  createdAt?: string;
}

interface AppState {
  // Authentication & Session
  user: AuthUser | null;
  login: (user: Partial<AuthUser> & { email: string }) => void;
  updateProfile: (profile: Partial<AuthUser>) => void;
  logout: () => void;

  // Floors & Building State
  floors: FloorData[];
  selectedFloor: FloorData | null;
  addFloor: (floor: FloorData) => void;
  selectFloor: (floor: FloorData | null) => void;
  resetFloors: () => void;
  fetchFloorsFromApi: () => Promise<void>;

  // Scene & UI Settings
  theme: ThemeMode;
  autoRotate: boolean;
  zenMode: boolean;
  lowPower: boolean;
  penthouseMusic: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  toggleAutoRotate: () => void;
  toggleZenMode: () => void;
  toggleLowPower: () => void;
  togglePenthouseMusic: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial Auth
      user: null,
      login: (userData) => {
        const rawUsername = userData.username || userData.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
        const fullUser: AuthUser = {
          id: userData.id || `US-${Math.floor(10000 + Math.random() * 90000)}`,
          username: rawUsername || 'citizen',
          name: userData.name || userData.email.split('@')[0] || 'UpSpace Citizen',
          email: userData.email,
          provider: userData.provider || 'email',
          avatarUrl: userData.avatarUrl || undefined,
          createdAt: userData.createdAt || new Date().toISOString(),
        };
        set({ user: fullUser });
      },
      updateProfile: (profileUpdates) => {
        const current = get().user;
        if (!current) return;
        set({ user: { ...current, ...profileUpdates } });
      },
      logout: () => set({ user: null }),

      // Initial Floors (strictly synced with database)
      floors: [],
      selectedFloor: null,

      addFloor: (newFloor: FloorData) => {
        const currentFloors = get().floors;
        // Avoid duplicate floor ID
        const exists = currentFloors.some((f) => f.id === newFloor.id);
        const updated = exists
          ? currentFloors.map((f) => (f.id === newFloor.id ? newFloor : f))
          : [...currentFloors, newFloor];

        set({
          floors: updated,
          selectedFloor: newFloor,
        });

        // Sync with backend API in background
        try {
          fetch('/api/floors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              floor: newFloor,
              buyerName: newFloor.ownerName || 'Citizen',
              bidAmount: newFloor.price,
              targetUrl: newFloor.targetUrl,
              brandTitle: newFloor.brandTitle,
              bannerUrl: newFloor.adBannerUrl,
              claimCode: newFloor.claimCode,
              category: newFloor.category,
            }),
          }).catch((err) => console.warn('Background floor claim sync notice:', err));
        } catch {}
      },

      selectFloor: (floor: FloorData | null) => set({ selectedFloor: floor }),

      resetFloors: async () => {
        try {
          const res = await fetch(`/api/floors?arenaId=${CURRENT_ARENA.id}`, { method: 'DELETE' });
          if (res.ok) {
            const data = await res.json();
            set({ floors: data.floors || [], selectedFloor: data.floors?.[0] || null });
          }
        } catch {
          set({ floors: [], selectedFloor: null });
        }
      },

      fetchFloorsFromApi: async () => {
        try {
          const res = await fetch(`/api/floors?arenaId=${CURRENT_ARENA.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data?.success && Array.isArray(data.floors)) {
              set((state) => ({
                floors: data.floors,
                selectedFloor: data.floors.some((f: FloorData) => f.id === state.selectedFloor?.id)
                  ? state.selectedFloor
                  : data.floors[0] || null,
              }));
            }
          }
        } catch (err) {
          console.warn('Could not fetch floors from API, using cached state:', err);
        }
      },

      // Theme & Camera UI Settings
      theme: 'day',
      autoRotate: true,
      zenMode: false,
      // Keep the complete scene available while making the default experience
      // comfortable on integrated graphics and lower-spec devices.
      lowPower: true,
      penthouseMusic: false,

      setTheme: (theme: ThemeMode) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'day' ? 'night' : 'day' })),
      toggleAutoRotate: () => set((state) => ({ autoRotate: !state.autoRotate })),
      toggleZenMode: () => set((state) => ({ zenMode: !state.zenMode })),
      toggleLowPower: () => set((state) => ({ lowPower: !state.lowPower })),
      togglePenthouseMusic: () => set((state) => ({ penthouseMusic: !state.penthouseMusic })),
    }),
    {
      name: 'upspace-app-storage', // key in localStorage
      // Bump this when changing graphics defaults so existing visitors also
      // receive the fan-friendly low-power setting once.
      version: 6,
      migrate: (persistedState: unknown) => {
        const saved = persistedState as Partial<AppState>;
        return {
          ...saved,
          floors: Array.isArray(saved?.floors) ? saved.floors : [],
          theme: 'day',
          lowPower: true,
          penthouseMusic: false,
        };
      },
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : ({} as any))),
      partialize: (state) => ({
        user: state.user,
        floors: state.floors,
        theme: state.theme,
        autoRotate: state.autoRotate,
        zenMode: state.zenMode,
        lowPower: state.lowPower,
        penthouseMusic: state.penthouseMusic,
      }),
    }
  )
);
