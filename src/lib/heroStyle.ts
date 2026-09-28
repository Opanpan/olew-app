/**
 * Shared display constants for the hero's two 3D stages — `HeroAssembly` (the
 * pot) and `HeroBottleAssembly` (the bottle beside it). Both stand straight,
 * separated into their parts, turning at the same pace under the same brand
 * palette — one matched "product family," not two independently-styled props.
 */

import type { AssemblySlot } from './productAssembly';

/**
 * Clearance between the pot's separated parts, in scene units. The first
 * attached part (the inner pot) is a tall vessel and needs real room to clear
 * the body; everything above it is a flat cap or disc, so those step apart
 * more tightly.
 */
export const FIRST_GAP = 1.5;
export const GAP_STEP = 0.8;

/**
 * Clearance for the bottle's single cap — much smaller than the pot's
 * `FIRST_GAP`. That value was sized for a tall inner-pot layer; reused as-is
 * it lifted the bottle's cap far above the neck, disconnected from the body.
 * A bottle's cap only needs to float a little to read as "separated."
 */
export const BOTTLE_CAP_GAP = 0.35;

/**
 * Radians per second — one turn every ~20s, read off the knurled cap edges.
 * Shared so the pot and bottle turn at the same unhurried pace — two
 * independently-spinning objects at matching speed read as one calm scene
 * instead of competing for attention.
 */
export const SPIN_SPEED = 0.3;

/**
 * Viewing direction only. `autoFit` measures each stack and works out the
 * distance from the canvas size, so the hero frames itself at any width —
 * desktop column, tablet, or a 320px phone — instead of being cropped by a
 * distance that only suited one window.
 */
export const CAMERA: [number, number, number] = [5.03, 1.1, 5.02];
/** Ignored under autoFit; kept as the origin so CAMERA reads as a direction. */
export const TARGET: [number, number, number] = [0, 0, 0];

/**
 * Brand blues (tailwind `primary`), lightest at the top of the stack down to
 * the deepest step for the body.
 */
export const PART_COLOR: Record<AssemblySlot, string> = {
  outer_cap: '#7cc4ff', // primary-300
  cap: '#7cc4ff',
  inner_cap: '#47a3ff', // primary-400
  plug: '#2b87f5',      // primary-500
  inner_pot: '#1557b8', // primary-700
};
export const BODY_COLOR = '#0f4694'; // primary-800
