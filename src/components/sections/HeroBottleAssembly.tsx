'use client';

/**
 * The hero's companion product: a bottle standing straight with its single cap
 * lifted off the neck by `explode`, turning slowly beside the featured pot —
 * same palette, same spin, but its own (much smaller) explode gap: the pot's
 * is sized for a tall inner-pot layer and floats a bottle's cap disconnected
 * above the neck.
 *
 * Purely decorative — it doesn't wire into `heroReady`, so a slow-loading
 * bottle GLB never holds up the intro curtain, which still waits on the pot.
 */

import Product3DViewer, { type LayerConfig } from '@/components/catalog/detail/Product3DViewer';
import type { HeroAssemblyData } from '@/lib/heroAssembly';
import { BOTTLE_CAP_GAP, SPIN_SPEED, CAMERA, TARGET, PART_COLOR, BODY_COLOR } from '@/lib/heroStyle';

interface HeroBottleAssemblyProps {
  data: HeroAssemblyData;
  /**
   * 0 (assembled) to 1 (cap lifted off) — driven by scroll in `HeroSection`,
   * kept in lockstep with the pot's own `explode` value.
   */
  explode?: number;
  className?: string;
}

export default function HeroBottleAssembly({ data, explode = 1, className }: HeroBottleAssemblyProps) {
  // Always at most one part (the hero data resolves a single cap for the
  // bottle), so it's just lifted by the flat bottle gap — no stacking index.
  const layers: LayerConfig[] = data.parts.map((part) => ({
    key: part.slot,
    url: part.url,
    color: PART_COLOR[part.slot] ?? PART_COLOR.cap,
    scale: part.scale,
    positionY: part.restY + explode * BOTTLE_CAP_GAP,
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
      autoRotateSpeed={SPIN_SPEED}
      cameraPosition={CAMERA}
      cameraTarget={TARGET}
      autoFit
      className={className}
    />
  );
}
