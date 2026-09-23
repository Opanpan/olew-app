'use client';

/**
 * The hero's product stage: the featured pot, permanently separated into its
 * five parts, tilted and turning slowly on its own axis.
 *
 * Display only — no controls, no caption, no legend. It is a moving product
 * photograph, not a configurator; the interactive version lives on the product
 * detail page. Each layer is tinted a different step of the brand blue, darkest
 * at the base, so the stack reads as five distinct parts without any labels.
 */

import Product3DViewer, { type LayerConfig } from '@/components/catalog/detail/Product3DViewer';
import type { AssemblySlot } from '@/lib/productAssembly';
import type { HeroAssemblyData } from '@/lib/heroAssembly';
import { markHeroProgress, markHeroReady } from '@/lib/heroReady';

/**
 * Clearance between separated parts, in scene units. The first attached part
 * (the inner pot) is a tall vessel and needs real room to clear the body;
 * everything above it is a flat cap or disc, so those step apart more tightly.
 */
const FIRST_GAP = 1.5;
const GAP_STEP = 0.8;

/**
 * Fixed pose: the stack leans across the frame, top-left to bottom-right.
 * Split evenly across X and Z because the camera sits at 45° — that combination
 * rotates the stack roughly about the view axis, so the lean reads in the
 * screen plane instead of tipping toward or away from the viewer.
 *
 * The pose never changes. The parts spin inside it, about the stack's own axis,
 * so the silhouette is constant and the frame can be drawn tight around it.
 */
const TILT: [number, number, number] = [0.27, 0, 0.27];
/** Radians per second — one turn every ~20s, read off the knurled cap edges. */
const SPIN_SPEED = 0.3;

/**
 * Viewing direction only. `autoFit` measures the stack and works out the
 * distance from the canvas size, so the hero frames itself at any width —
 * desktop column, tablet, or a 320px phone — instead of being cropped by a
 * distance that only suited one window.
 */
const CAMERA: [number, number, number] = [5.03, 1.1, 5.02];
/**
 * Aimed off-axis on purpose. A leaning stack runs diagonally across the frame,
 * so centring on the model's own axis leaves the top cap hanging off one edge.
 * The X/Z offsets push the view along screen-left — the camera sits at 45°, so
 * screen-left is (-1, 0, +1) — which slides the whole diagonal back into frame.
 */
/** Ignored under autoFit; kept as the origin so CAMERA reads as a direction. */
const TARGET: [number, number, number] = [0, 0, 0];

/**
 * Brand blues (tailwind `primary`), lightest at the top of the stack down to
 * the deepest step for the body.
 */
const PART_COLOR: Record<AssemblySlot, string> = {
  outer_cap: '#7cc4ff', // primary-300
  cap: '#7cc4ff',
  inner_cap: '#47a3ff', // primary-400
  plug: '#2b87f5',      // primary-500
  inner_pot: '#1557b8', // primary-700
};
const BODY_COLOR = '#0f4694'; // primary-800

export default function HeroAssembly({ data }: { data: HeroAssemblyData }) {
  // `data.parts` arrives bottom-up, so the index is also how many gaps a layer
  // needs to clear the ones beneath it.
  const layers: LayerConfig[] = data.parts.map((part, i) => ({
    key: part.slot,
    url: part.url,
    color: PART_COLOR[part.slot] ?? PART_COLOR.cap,
    scale: part.scale,
    positionY: part.restY + FIRST_GAP + i * GAP_STEP,
    positionX: part.offsetX,
    positionZ: part.offsetZ,
  }));

  return (
    <Product3DViewer
      bottleModelUrl={data.baseUrl}
      bottleColor={BODY_COLOR}
      layers={layers}
      compact
      orbitEnabled={false}
      tilt={TILT}
      autoRotateSpeed={SPIN_SPEED}
      cameraPosition={CAMERA}
      cameraTarget={TARGET}
      autoFit
      onReady={markHeroReady}
      onProgress={markHeroProgress}
      className="h-[300px] sm:h-[420px] lg:h-[540px]"
    />
  );
}
