'use client';

import { useFrame, useThree } from '@react-three/fiber';

export type AnimationUpdater = (time: number, delta: number) => void;

export const cityAnimationUpdaters = new Set<AnimationUpdater>();
export const plazaAnimationUpdaters = new Set<AnimationUpdater>();
export const floorAnimationUpdaters = new Set<AnimationUpdater>();

export function registerAnimation(set: Set<AnimationUpdater>, updater: AnimationUpdater) {
  set.add(updater);
  return () => { set.delete(updater); };
}

function SharedAnimationSystem({ updaters }: { updaters: Set<AnimationUpdater> }) {
  const invalidate = useThree((state) => state.invalidate);

  useFrame((state, delta) => {
    if (updaters.size === 0) return;
    const time = state.clock.getElapsedTime();
    updaters.forEach((update) => update(time, delta));

    // Demand rendering normally settles after interaction. These systems own
    // visible looping animations, so keep the next frame scheduled while the
    // document is visible; hidden tabs naturally stop receiving frames.
    if (typeof document === 'undefined' || document.visibilityState === 'visible') {
      invalidate();
    }
  });
  return null;
}

export function CityAnimationSystem() {
  return <SharedAnimationSystem updaters={cityAnimationUpdaters} />;
}

export function PlazaAnimationSystem() {
  return <SharedAnimationSystem updaters={plazaAnimationUpdaters} />;
}

export function FloorAnimationSystem() {
  return <SharedAnimationSystem updaters={floorAnimationUpdaters} />;
}
