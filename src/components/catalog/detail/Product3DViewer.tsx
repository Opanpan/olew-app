'use client';

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { TrackballControls, Environment, useGLTF, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import { RotateCcw, Loader2 } from 'lucide-react';
import { useLang } from '@/lib/LangContext';
import { cn } from '@/lib/utils';

// A single attached part (cap, outer pot, inner pot, ...) stacked on top of the
// base model. Every layer anchors off the same base bottleHeight independently
// (parallel stacking) — none of them stack on top of each other.
export interface LayerConfig {
  key: string;
  url?: string;
  color: string;
  scale?: number;
  positionY?: number;
  positionX?: number;
  positionZ?: number;
}

interface Product3DViewerProps {
  bottleModelUrl?: string | null;
  bottleColor: string;
  bottleScale?: number;
  /** Attached layers, ordered bottom-of-the-stack first — draw order follows array position. */
  layers?: LayerConfig[];
  compact?: boolean;
  /** Controlled by the parent so an externally-rendered color picker can suspend orbit drag. */
  orbitEnabled?: boolean;
}

// ─── 3D Models ───────────────────────────────────────────────────────────────

// Dispose the materials we created on a cloned scene when it's replaced/unmounted.
// (Geometries are shared with the cached GLTF, so we never dispose those.)
function useDisposeOnUnmount(scene: THREE.Object3D) {
  useEffect(() => {
    return () => {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
          child.material.dispose();
        }
      });
    };
  }, [scene]);
}

function BottleModel({ url, color, scale = 1, onHeightReady }: {
  url: string; color: string; scale?: number;
  onHeightReady?: (h: number) => void;
}) {
  const { scene: gltfScene } = useGLTF(url);
  const scene = useMemo(() => {
    const s = gltfScene.clone(true);
    s.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({ roughness: 0.65, metalness: 0, envMapIntensity: 0.3 });
      }
    });
    return s;
  }, [gltfScene]);
  useDisposeOnUnmount(scene);

  // Compute the actual world-space top of the bottle (box.max.y × scale).
  // Using max.y rather than (max.y - min.y) accounts for models whose local origin
  // is not at y=0 — so the cap always lands above the real top of the mesh.
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const topY = box.max.y * (scale ?? 1);
    onHeightReady?.(topY > 0 ? topY : 1);
  }, [scene, scale, onHeightReady]);



  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
      child.material.color.set(color);
    }
  });
  return <primitive object={scene} scale={scale} />;
}

function AttachedLayerModel({ url, color, bottleHeight = 1, scale = 1, positionY = 0, positionX = 0, positionZ = 0, renderOrder = 0 }: {
  url: string; color: string; bottleHeight?: number; scale?: number; positionY?: number; positionX?: number; positionZ?: number; renderOrder?: number;
}) {
  const { scene: gltfScene } = useGLTF(url);
  const scene = useMemo(() => {
    const s = gltfScene.clone(true);
    s.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.15, envMapIntensity: 0.3 });
      }
    });
    return s;
  }, [gltfScene]);
  useDisposeOnUnmount(scene);
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
      child.material.color.set(color);
    }
    // Pot layers interpenetrate (a plug sits inside a cap), so give each an
    // explicit draw order from its position in the stack — otherwise three.js
    // sorts by camera distance and coincident surfaces flicker while orbiting.
    child.renderOrder = renderOrder;
  });

  // Ease toward the target height instead of jumping, so separating/reassembling
  // parts (and dragging the height slider) reads as motion. `damp` is frame-rate
  // independent. Position is deliberately NOT a JSX prop: React would re-apply it
  // on every render and snap the part to the target, cancelling the animation.
  const groupRef = useRef<THREE.Group>(null);
  const targetY = bottleHeight + positionY;
  // A newly mounted part starts in place rather than flying in from the origin.
  useLayoutEffect(() => {
    groupRef.current?.position.set(positionX, targetY, positionZ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const reduceMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );
  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;
    g.position.x = positionX;
    g.position.z = positionZ;
    if (reduceMotion) {
      g.position.y = targetY;
      return;
    }
    const y = THREE.MathUtils.damp(g.position.y, targetY, 7, delta);
    g.position.y = Math.abs(y - targetY) < 0.0005 ? targetY : y;
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={scale} />
    </group>
  );
}

function PlaceholderModel({ color, type }: { color: string; type: 'bottle' | 'cap' }) {
  if (type === 'bottle') {
    return (
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 1, 32]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>
    );
  }
  return (
    <mesh position={[0, 1.1, 0]}>
      <cylinderGeometry args={[0.32, 0.28, 0.2, 32]} />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
    </mesh>
  );
}

// Real download progress (via three's DefaultLoadingManager, tracked by drei) for
// whichever GLB(s) are currently in flight — shown while the real model streams in.
function ModelLoadingOverlay() {
  const { dict } = useLang();
  const { active, progress } = useProgress();
  if (!active) return null;
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-100/90 dark:bg-gray-900/90">
      <div className="w-40 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 dark:text-primary-400 mx-auto mb-3" />
        <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mb-2">
          <div
            className="h-full bg-primary-600 dark:bg-primary-400 transition-all duration-150"
            style={{ width: `${Math.round(progress)}%` }}
          />
        </div>
        <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
          {dict.catalog.product_detail.loading_3d_model} {Math.round(progress)}%
        </p>
      </div>
    </div>
  );
}

function ModelUnavailable() {
  const { dict } = useLang();
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <p className="text-xs text-gray-400 dark:text-gray-500">{dict.catalog.product_detail.model_unavailable}</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Product3DViewer({
  bottleModelUrl,
  bottleColor,
  bottleScale = 1,
  layers = [],
  compact = false,
  orbitEnabled = true,
}: Product3DViewerProps) {
  const { dict } = useLang();
  const [resetKey, setResetKey] = useState(0);
  const recoveryAttempts = useRef(0);
  // Dynamically computed from BottleModel bounding box — ensures CapModel sits on top
  const [computedBottleHeight, setComputedBottleHeight] = useState(1);

  return (
    <div
      className={cn(
        'relative w-full aspect-square overflow-hidden',
        // compact viewers (compare page) stay transparent so they blend into the
        // card; the standalone viewer sits on a flat studio-grey backdrop
        !compact && 'rounded-md bg-gray-100 dark:bg-gray-900'
      )}
      style={{ touchAction: 'none' }}
    >
      {!compact && (
        <button
          type="button"
          onClick={() => setResetKey((p) => p + 1)}
          aria-label={dict.catalog.product_detail.reset_camera}
          title={dict.catalog.product_detail.reset_camera}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      )}
      {!compact && (
        <p className="pointer-events-none absolute bottom-3 right-3 z-10 text-xs text-gray-500 dark:text-gray-400">
          {dict.catalog.product_detail.drag_to_rotate}
        </p>
      )}

      {/* 3D Canvas */}
      {bottleModelUrl ? (
        <>
          <Canvas
            key={resetKey}
            dpr={[1, 1.5]}
            camera={{ position: [3, 2, 3], fov: 50 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            onCreated={({ gl }) => {
              const canvas = gl.domElement;
              // Prevent the browser from permanently dropping the context; recover by remounting,
              // but cap attempts so a GPU that simply can't handle the model doesn't loop forever.
              canvas.addEventListener('webglcontextlost', (e) => {
                e.preventDefault();
                if (recoveryAttempts.current < 3) {
                  recoveryAttempts.current += 1;
                  setTimeout(() => setResetKey((p) => p + 1), 100);
                }
              }, { passive: false });
            }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={1.1} />
              <directionalLight position={[5, 5, 5]} intensity={0.3} />
              <directionalLight position={[-5, 3, -5]} intensity={0.3} />
              <directionalLight position={[0, 5, -5]} intensity={0.25} />
              <Environment preset="studio" blur={1} />
              <>
                <Suspense key={bottleModelUrl} fallback={<PlaceholderModel color={bottleColor} type="bottle" />}>
                  <BottleModel
                    url={bottleModelUrl}
                    color={bottleColor}
                    scale={bottleScale}
                    onHeightReady={setComputedBottleHeight}
                  />
                </Suspense>
                {layers.map((layer, i) => layer.url && (
                  <Suspense key={layer.key + layer.url} fallback={<PlaceholderModel color={layer.color} type="cap" />}>
                    <AttachedLayerModel
                      url={layer.url}
                      color={layer.color}
                      bottleHeight={computedBottleHeight}
                      scale={layer.scale}
                      positionY={layer.positionY}
                      positionX={layer.positionX}
                      positionZ={layer.positionZ}
                      renderOrder={i + 1}
                    />
                  </Suspense>
                ))}
              </>
              {/* Trackball = free arcball rotation on all axes (X/Y and Z roll),
                  like Meshy's model preview — no fixed up-vector or polar limits. */}
              <TrackballControls
                makeDefault
                enabled={orbitEnabled}
                noPan
                minDistance={2}
                maxDistance={6}
                rotateSpeed={3.5}
                zoomSpeed={1.2}
                dynamicDampingFactor={0.15}
                target={[0, 0.5, 0]}
              />
            </Suspense>
          </Canvas>
          <ModelLoadingOverlay />
        </>
      ) : (
        <ModelUnavailable />
      )}
    </div>
  );
}
