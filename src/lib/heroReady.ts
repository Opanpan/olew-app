/**
 * A one-way "the hero's 3D is on screen" signal.
 *
 * The page itself paints long before the GLBs arrive, which left the hero
 * showing a progress spinner next to finished copy. The intro curtain now waits
 * on this instead of a fixed timer, so the first thing a visitor sees is either
 * the brand panel or the finished hero — never a half-built one.
 *
 * Module-level rather than context: the publisher (the 3D viewer) and the
 * subscriber (the curtain) sit in different branches of the tree, and the value
 * is a single latch, not per-render state.
 */

let ready = false;
/** 0–100 download progress for the hero's GLBs. */
let progress = 0;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((fn) => fn());

export function markHeroReady() {
  if (ready) return;
  ready = true;
  progress = 100;
  emit();
}

export function markHeroProgress(value: number) {
  const next = Math.max(0, Math.min(100, Math.round(value)));
  // Monotonic: drei reports per-asset progress, which dips as each new file
  // starts and would make the bar jump backwards.
  if (next <= progress) return;
  progress = next;
  emit();
}

export function subscribeHeroReady(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

export const getHeroReady = () => ready;
export const getHeroProgress = () => progress;
/** The server never has a loaded model, so it always renders the curtain. */
export const getHeroReadyServer = () => false;
export const getHeroProgressServer = () => 0;
