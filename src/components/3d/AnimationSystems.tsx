'use client';

import { useFrame } from '@react-three/fiber';

export type AnimationUpdater = (time: number, delta: number) => void;

export const cityAnimationUpdaters = new Set<AnimationUpdater>();
export const plazaAnimationUpdaters = new Set<AnimationUpdater>();
export const floorAnimationUpdaters = new Set<AnimationUpdater>();

export function registerAnimation(set: Set<AnimationUpdater>, updater: AnimationUpdater) {
  set.add(updater);
  return () => { set.delete(updater); };
}

function SharedAnimationSystem({ updaters }: { updaters: Set<AnimationUpdater> }) {
  useFrame((state, delta) => {
    if (updaters.size === 0) return;
    const time = state.clock.getElapsedTime();
    updaters.forEach((update) => update(time, delta));
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
