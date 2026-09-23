'use client';

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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
  /**
   * Overrides the frame. Defaults to a square panel; the hero passes its own
   * height so the exploded stack gets a tall, transparent stage.
   */
  className?: string;
  /** Overrides the default camera placement — pull further back for tall stacks. */
  cameraPosition?: [number, number, number];
  /**
   * What the camera orbits around. Defaults to the assembled product's middle;
   * a separated stack is taller, so its centre of mass sits higher.
   */
  cameraTarget?: [number, number, number];
  /**
   * Fixed pose (radians, XYZ) for the whole assembly. The spin below happens
   * *inside* it, about the stack's own axis, so the pose never changes — the
   * parts turn in place rather than the whole stack swinging around.
   */
  tilt?: [number, number, number];
  /** Radians per second the parts spin about the stack's axis. 0 (default) = still. */
  autoRotateSpeed?: number;
  /** Fired once, when the model(s) have finished loading and are on screen. */
  onReady?: () => void;
  /** 0–100 asset download progress, for a loader rendered outside the canvas. */
  onProgress?: (p: number) => void;
  /**
   * Control-less viewers only: measure the scene and frame it to the canvas so
   * nothing is cropped at any width. `cameraPosition` then supplies only the
   * viewing direction — its distance and `cameraTarget` are both ignored.
   */
  autoFit?: boolean;
}

// ─── 3D Models ───────────────────────────────────────────────────────────────

/**
 * Draco decoder served from our own origin. drei defaults to Google's gstatic
 * CDN, which is a third-party runtime dependency on the critical path of the
 * home page — a blocked or slow CDN means no 3D at all. The decoder is ~750KB
 * of static files and is only fetched when a model actually uses Draco.
 */
const DRACO_DECODER_PATH = '/draco/';

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
  const { scene: gltfScene } = useGLTF(url, DRACO_DECODER_PATH);
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
  const { scene: gltfScene } = useGLTF(url, DRACO_DECODER_PATH);
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
function ModelLoadingOverlay({ transparent = false }: { transparent?: boolean }) {
  const { dict } = useLang();
  const { active, progress } = useProgress();
  if (!active) return null;
  return (
    // A framed viewer sits on its own panel, so the overlay matches it. A
    // transparent one (the hero) would otherwise flash an opaque grey slab over
    // the page background on every cold load.
    <div className={cn(
      'absolute inset-0 z-20 flex items-center justify-center',
      transparent ? 'bg-transparent' : 'bg-gray-100/90 dark:bg-gray-900/90'
    )}>
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

/** Turns its children about their own Y axis. Held still for reduced motion. */
function SpinGroup({ speed, children }: { speed: number; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const reduceMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );
  useFrame((_, delta) => {
    if (speed === 0 || reduceMotion) return;
    if (ref.current) ref.current.rotation.y += speed * delta;
  });
  return <group ref={ref}>{children}</group>;
}

/** Reports asset progress, and the moment the scene's assets are in. */
function ReadyProbe({ onReady, onProgress }: { onReady?: () => void; onProgress?: (p: number) => void }) {
  const { active, progress } = useProgress();
  const fired = useRef(false);
  useEffect(() => {
    onProgress?.(progress);
    if (fired.current || !onReady) return;
    if (!active && progress > 0) {
      fired.current = true;
      onReady();
    }
  }, [active, progress, onReady, onProgress]);
  return null;
}

const WORLD_UP = new THREE.Vector3(0, 1, 0);

/**
 * Aims the camera when no controls are mounted, and optionally frames whatever
 * is actually in the scene.
 *
 * `fit` measures the real bounding box of `objectRef` and backs the camera off
 * until every corner of it sits inside the frustum. Every hand-picked distance before
 * this cropped somewhere: the viewer's height is fixed in CSS while its width
 * follows the layout, so one distance only ever suits one window, and a guessed
 * centre leaves the subject lopsided. Measuring removes both guesses.
 */
function StaticCamera({ target, from, fit, objectRef, margin = 1.06 }: {
  target: [number, number, number];
  from: [number, number, number];
  fit?: boolean;
  objectRef: React.RefObject<THREE.Group | null>;
  margin?: number;
}) {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const size = useThree((state) => state.size);
  const { active } = useProgress();
  // GLBs mount a few frames after loading reports done, and each one nudges the
  // bounds, so re-measure over a short window rather than once.
  const settle = useRef(0);

  useLayoutEffect(() => {
    settle.current = fit ? 90 : 0;
  }, [fit, active, size.width, size.height]);

  useLayoutEffect(() => {
    if (fit) return;
    camera.lookAt(target[0], target[1], target[2]);
    camera.updateProjectionMatrix();
  }, [camera, target, fit]);

  useFrame(() => {
    if (!fit || settle.current <= 0) return;
    settle.current -= 1;
    const obj = objectRef.current;
    if (!obj) return;
    const box = new THREE.Box3().setFromObject(obj);
    if (box.isEmpty()) return;
    const center = box.getCenter(new THREE.Vector3());

    // View basis for the fixed direction.
    const forward = new THREE.Vector3(from[0], from[1], from[2])
      .sub(new THREE.Vector3(target[0], target[1], target[2]))
      .normalize();
    const right = new THREE.Vector3().crossVectors(forward, WORLD_UP).normalize();
    const up = new THREE.Vector3().crossVectors(right, forward).normalize();

    const halfV = THREE.MathUtils.degToRad(camera.fov) / 2;
    const aspect = size.width / Math.max(size.height, 1);
    const tanV = Math.tan(halfV);
    const tanH = tanV * aspect;

    // Fit the box itself rather than its bounding sphere: for a stack leaning
    // across the frame the sphere's radius is half the *diagonal*, which wastes
    // a lot of height. Each corner must sit inside the frustum, so solve the
    // smallest distance that satisfies every one of them.
    const v = new THREE.Vector3();
    let distance = 0;
    for (let i = 0; i < 8; i++) {
      v.set(
        i & 1 ? box.max.x : box.min.x,
        i & 2 ? box.max.y : box.min.y,
        i & 4 ? box.max.z : box.min.z
      ).sub(center);
      const x = Math.abs(v.dot(right));
      const y = Math.abs(v.dot(up));
      const z = v.dot(forward); // toward the camera
      distance = Math.max(distance, z + (x / tanH) * margin, z + (y / tanV) * margin);
    }
    if (!(distance > 0)) return;

    const depth = box.getSize(v).length();
    camera.position.copy(center).addScaledVector(forward, distance);
    camera.near = Math.max(0.1, distance - depth);
    camera.far = distance + depth * 2;
    camera.lookAt(center);
    camera.updateProjectionMatrix();
  });

  return null;
}

// Default camera for the standalone viewer, pulled back far enough that a fully
// exploded pot (four layers spaced by EXPLODE_STEP) fits in frame without the
// customer having to scroll-zoom out first. Compact viewers keep the tighter
// framing — they only ever show an assembled product in a small card.
const DEFAULT_CAMERA_POS: [number, number, number] = [4.3, 2.9, 4.3];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Product3DViewer({
  bottleModelUrl,
  bottleColor,
  bottleScale = 1,
  layers = [],
  compact = false,
  orbitEnabled = true,
  className,
  cameraPosition,
  cameraTarget = [0, 0.5, 0],
  tilt,
  autoRotateSpeed = 0,
  autoFit = false,
  onReady,
  onProgress,
}: Product3DViewerProps) {
  const contentRef = useRef<THREE.Group>(null);
  const { dict } = useLang();
  const [resetKey, setResetKey] = useState(0);
  const recoveryAttempts = useRef(0);
  // Dynamically computed from BottleModel bounding box — ensures CapModel sits on top
  const [computedBottleHeight, setComputedBottleHeight] = useState(1);

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden',
        !className && 'aspect-square',
        // compact viewers (compare page) stay transparent so they blend into the
        // card; the standalone viewer sits on a flat studio-grey backdrop
        !compact && 'rounded-md bg-gray-100 dark:bg-gray-900',
        className
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
            camera={{ position: cameraPosition ?? (compact ? [3, 2, 3] : DEFAULT_CAMERA_POS), fov: 50 }}
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
              <ReadyProbe onReady={onReady} onProgress={onProgress} />
              <ambientLight intensity={1.1} />
              <directionalLight position={[5, 5, 5]} intensity={0.3} />
              <directionalLight position={[-5, 3, -5]} intensity={0.3} />
              <directionalLight position={[0, 5, -5]} intensity={0.25} />
              <Environment preset="studio" blur={1} />
              <group ref={contentRef} rotation={tilt ?? [0, 0, 0]}>
                <SpinGroup speed={autoRotateSpeed}>
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
                </SpinGroup>
              </group>
              {/* Trackball = free arcball rotation on all axes (X/Y and Z roll),
                  like Meshy's model preview — no fixed up-vector or polar limits.
                  A display-only viewer mounts no controls at all, so nothing
                  listens for drags and the camera is aimed once instead. */}
              {orbitEnabled ? (
                <TrackballControls
                  makeDefault
                  noPan
                  minDistance={2}
                  maxDistance={9}
                  rotateSpeed={3.5}
                  zoomSpeed={1.2}
                  dynamicDampingFactor={0.15}
                  target={cameraTarget}
                />
              ) : (
                <StaticCamera
                  target={cameraTarget}
                  from={cameraPosition ?? (compact ? [3, 2, 3] : DEFAULT_CAMERA_POS)}
                  fit={autoFit}
                  objectRef={contentRef}
                />
              )}
            </Suspense>
          </Canvas>
          <ModelLoadingOverlay transparent={compact} />
        </>
      ) : (
        <ModelUnavailable />
      )}
    </div>
  );
}
