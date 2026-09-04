import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { FloorData } from '@/types/floor';
import { ThemeMode } from '@/types/theme';
import { getFloorsForArena } from '@/data/floors';
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

  // Scene & UI Settings
  theme: ThemeMode;
  autoRotate: boolean;
  zenMode: boolean;
  lowPower: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  toggleAutoRotate: () => void;
  toggleZenMode: () => void;
  toggleLowPower: () => void;
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

      // Initial Floors (starts with default arena floor)
      floors: getFloorsForArena(CURRENT_ARENA.id),
      selectedFloor: getFloorsForArena(CURRENT_ARENA.id)[0] || null,

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
      },

      selectFloor: (floor: FloorData | null) => set({ selectedFloor: floor }),

      resetFloors: () => {
        const initial = getFloorsForArena(CURRENT_ARENA.id);
        set({ floors: initial, selectedFloor: initial[0] || null });
      },

      // Theme & Camera UI Settings
      theme: 'day',
      autoRotate: true,
      zenMode: false,
      // Keep the complete scene available while making the default experience
      // comfortable on integrated graphics and lower-spec devices.
      lowPower: true,

      setTheme: (theme: ThemeMode) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'day' ? 'night' : 'day' })),
      toggleAutoRotate: () => set((state) => ({ autoRotate: !state.autoRotate })),
      toggleZenMode: () => set((state) => ({ zenMode: !state.zenMode })),
      toggleLowPower: () => set((state) => ({ lowPower: !state.lowPower })),
    }),
    {
      name: 'upspace-app-storage', // key in localStorage
      version: 4,
      migrate: (persistedState: unknown) => {
        const saved = persistedState as Partial<AppState>;
        const showcaseFloors = getFloorsForArena(CURRENT_ARENA.id);

        // Upgrade older sessions that were initialized with the single-floor prototype.
        return {
          ...saved,
          floors: saved.floors && saved.floors.length >= 8 ? saved.floors : showcaseFloors,
          theme: 'day',
          lowPower: true,
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
      }),
    }
  )
);
