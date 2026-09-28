'use client';

/**
 * The hero's product stage: the featured pot, standing straight and turning
 * slowly on its own axis, with its five parts pulled apart by `explode`.
 *
 * Display only — no controls, no caption, no legend. It is a moving product
 * photograph, not a configurator; the interactive version lives on the product
 * detail page. Each layer is tinted a different step of the brand blue, darkest
 * at the base, so the stack reads as five distinct parts without any labels.
 */

import Product3DViewer, { type LayerConfig } from '@/components/catalog/detail/Product3DViewer';
import type { HeroAssemblyData } from '@/lib/heroAssembly';
import { markHeroProgress, markHeroReady } from '@/lib/heroReady';
import { FIRST_GAP, GAP_STEP, SPIN_SPEED, CAMERA, TARGET, PART_COLOR, BODY_COLOR } from '@/lib/heroStyle';

interface HeroAssemblyProps {
  data: HeroAssemblyData;
  /**
   * 0 (assembled) to 1 (fully separated) — driven by scroll in `HeroSection`.
   * `Product3DViewer` eases toward whatever position it's given each frame, so
   * feeding it a gradually-changing value already reads as smooth motion.
   */
  explode?: number;
}

export default function HeroAssembly({ data, explode = 1 }: HeroAssemblyProps) {
  // `data.parts` arrives bottom-up, so the index is also how many gaps a layer
  // needs to clear the ones beneath it.
  const layers: LayerConfig[] = data.parts.map((part, i) => ({
    key: part.slot,
    url: part.url,
    color: PART_COLOR[part.slot] ?? PART_COLOR.cap,
    scale: part.scale,
    positionY: part.restY + explode * (FIRST_GAP + i * GAP_STEP),
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
      onReady={markHeroReady}
      onProgress={markHeroProgress}
      className="h-[300px] sm:h-[420px] lg:h-[540px]"
    />
  );
}
