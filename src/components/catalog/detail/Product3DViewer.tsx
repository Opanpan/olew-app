'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Loader2, Palette, Check, X, Droplets } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { useLang } from '@/lib/LangContext';
import { cn } from '@/lib/utils';
import { colorClassMap } from './EnhancedColorPicker';

export interface ColorConfig {
  colors: string[];
  selectedColor: string;
  onColorChange: (color: string) => void;
  customColor: string;
  onCustomColorChange: (hex: string) => void;
  isCustom: boolean;
  onIsCustomChange: (isCustom: boolean) => void;
  label: string;
}

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

function AttachedLayerModel({ url, color, bottleHeight = 1, scale = 1, positionY = 0, positionX = 0, positionZ = 0 }: {
  url: string; color: string; bottleHeight?: number; scale?: number; positionY?: number; positionX?: number; positionZ?: number;
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
  });
  return (
    <group position={[positionX, bottleHeight + positionY, positionZ]}>
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
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl md:rounded-3xl">
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
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-2xl md:rounded-3xl">
      <p className="text-xs text-gray-400 dark:text-gray-500">{dict.catalog.product_detail.model_unavailable}</p>
    </div>
  );
}

// ─── Color Picker Portal (modal on desktop, drawer on mobile) ─────────────────

interface ColorPickerPortalProps {
  isOpen: boolean;
  onApply: () => void;
  onCancel: () => void;
  config: ColorConfig;
}

function ColorPickerPortal({ isOpen, onApply, onCancel, config }: ColorPickerPortalProps) {
  const { dict } = useLang();
  const d = dict.catalog.product_detail;
  const [mounted, setMounted] = useState(false);
  const [hexInput, setHexInput] = useState(config.customColor || '#ffffff');

  useEffect(() => { setMounted(true); }, []);

  // Sync local hex input when modal opens (not on every customColor change)
  useEffect(() => {
    if (isOpen) setHexInput(config.customColor || '#ffffff');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleHexChange = (hex: string) => {
    setHexInput(hex);
    // Live preview on the 3D model — will be reverted on cancel
    config.onCustomColorChange(hex);
    config.onIsCustomChange(true);
  };

  const handleTextInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value;
    if (!v.startsWith('#')) v = '#' + v;
    setHexInput(v);
    if (/^#([0-9A-F]{3}){1,2}$/i.test(v)) {
      config.onCustomColorChange(v);
      config.onIsCustomChange(true);
    }
  };

  const pickerContent = (
    <div className="space-y-4">
      {/* Color wheel */}
      <HexColorPicker
        color={hexInput}
        onChange={handleHexChange}
        style={{ width: '100%', height: '180px' }}
      />

      {/* Hex input row */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl border-2 border-gray-200 dark:border-gray-700 flex-shrink-0 shadow-inner"
          style={{ backgroundColor: hexInput }}
        />
        <input
          type="text"
          value={hexInput}
          onChange={handleTextInput}
          maxLength={7}
          placeholder="#ffffff"
          className="flex-1 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Preset swatches for quick pick */}
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">{d.quick_pick}</p>
        <div className="flex flex-wrap gap-2">
          {config.colors.map((color) => {
            const isSelected = !config.isCustom && config.selectedColor === color;
            return (
              <motion.button
                key={color}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  config.onColorChange(color);
                  config.onIsCustomChange(false);
                }}
                title={color}
                className={cn(
                  'w-8 h-8 rounded-full shadow-md transition-all flex items-center justify-center',
                  colorClassMap[color] || 'bg-gray-400',
                  isSelected
                    ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 scale-110'
                    : 'hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600'
                )}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow" strokeWidth={3} />}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Apply */}
      <button
        onClick={onApply}
        className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
      >
        {d.apply_color}
      </button>
    </div>
  );

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-black/50"
            onClick={onCancel}
          />

          {/* Single responsive modal — bottom sheet on mobile, centered on desktop */}
          <div className="fixed inset-0 z-[201] flex items-end md:items-center justify-center pointer-events-none">
            <motion.div
              key="modal"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="pointer-events-auto w-full md:w-[340px] rounded-t-3xl md:rounded-2xl bg-white dark:bg-gray-900 border-t md:border border-gray-200 dark:border-gray-800 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Mobile drag handle */}
              <div className="flex justify-center pt-3 pb-1 md:hidden">
                <div className="w-10 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center">
                    <Droplets className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-none">{d.custom_color}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{config.label}</p>
                  </div>
                </div>
                <button
                  onClick={onCancel}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Body — single picker instance */}
              <div className="p-5" style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}>
                {pickerContent}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

// ─── Color Swatch Panel (overlay inside viewer) ───────────────────────────────

export function ColorSwatchPanel({ config, onOpenChange }: { config: ColorConfig; onOpenChange?: (open: boolean) => void }) {
  const [showPicker, setShowPicker] = useState(false);
  const snapshot = useRef<{ selectedColor: string; customColor: string; isCustom: boolean } | null>(null);

  const openPicker = () => { setShowPicker(true); onOpenChange?.(true); };
  const closePicker = () => { setShowPicker(false); onOpenChange?.(false); };

  const handleOpen = () => {
    snapshot.current = {
      selectedColor: config.selectedColor,
      customColor: config.customColor,
      isCustom: config.isCustom,
    };
    openPicker();
  };

  const handleApply = () => {
    snapshot.current = null;
    closePicker();
  };

  const handleCancel = () => {
    if (snapshot.current) {
      config.onColorChange(snapshot.current.selectedColor);
      config.onCustomColorChange(snapshot.current.customColor);
      config.onIsCustomChange(snapshot.current.isCustom);
      snapshot.current = null;
    }
    closePicker();
  };

  return (
    <>
      <ColorPickerPortal
        isOpen={showPicker}
        onApply={handleApply}
        onCancel={handleCancel}
        config={config}
      />

      {/* Frosted pill */}
      <div className="backdrop-blur-md bg-black/55 border border-white/10 rounded-2xl px-3 py-2.5 shadow-xl">
        <p className="text-[9px] uppercase tracking-widest text-white/45 mb-2 font-semibold select-none">
          {config.label}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {config.colors.map((color) => {
            const isSelected = !config.isCustom && config.selectedColor === color;
            return (
              <motion.button
                key={color}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.88 }}
                onClick={() => {
                  config.onColorChange(color);
                  config.onIsCustomChange(false);
                }}
                title={color}
                className={cn(
                  'w-6 h-6 rounded-full flex-shrink-0 shadow-md transition-shadow flex items-center justify-center',
                  colorClassMap[color] || 'bg-gray-400',
                  isSelected
                    ? 'ring-2 ring-white ring-offset-[1.5px] ring-offset-black/40 shadow-lg'
                    : 'hover:ring-1 hover:ring-white/60 hover:shadow-lg'
                )}
              >
                {isSelected && (
                  <Check className="w-2.5 h-2.5 text-white drop-shadow-md" strokeWidth={3} />
                )}
              </motion.button>
            );
          })}

          {/* Custom color button */}
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.88 }}
            onClick={handleOpen}
            title="Custom color"
            className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 shadow-md transition-all',
              config.isCustom
                ? 'ring-2 ring-white ring-offset-[1.5px] ring-offset-black/40 shadow-lg'
                : 'bg-white/20 hover:bg-white/35'
            )}
            style={config.isCustom ? { backgroundColor: config.customColor } : {}}
          >
            <Palette className="w-3 h-3 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]" />
          </motion.button>
        </div>

        {config.isCustom && (
          <p className="text-[9px] font-mono text-white/50 mt-1.5 tracking-wider">
            {config.customColor.toUpperCase()}
          </p>
        )}
      </div>
    </>
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
      className="relative w-full aspect-square rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
      style={{ touchAction: 'none' }}
    >
      {/* Reset Camera Button */}
      {!compact && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setResetKey((p) => p + 1)}
          className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all"
          title={dict.catalog.product_detail.reset_camera}
        >
          <RotateCcw className="w-5 h-5 text-gray-900 dark:text-white" />
        </motion.button>
      )}

      {/* Instructions */}
      {!compact && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm transition-all">
          <p className="text-xs text-white font-medium whitespace-nowrap">
            {dict.catalog.product_detail.drag_to_rotate}
          </p>
        </div>
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
                {layers.map((layer) => layer.url && (
                  <Suspense key={layer.key + layer.url} fallback={<PlaceholderModel color={layer.color} type="cap" />}>
                    <AttachedLayerModel
                      url={layer.url}
                      color={layer.color}
                      bottleHeight={computedBottleHeight}
                      scale={layer.scale}
                      positionY={layer.positionY}
                      positionX={layer.positionX}
                      positionZ={layer.positionZ}
                    />
                  </Suspense>
                ))}
              </>
              <OrbitControls
                makeDefault
                enabled={orbitEnabled}
                enablePan={false}
                enableZoom={true}
                enableRotate={true}
                minDistance={2}
                maxDistance={6}
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI / 2}
                enableDamping={true}
                dampingFactor={0.05}
                rotateSpeed={1}
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
