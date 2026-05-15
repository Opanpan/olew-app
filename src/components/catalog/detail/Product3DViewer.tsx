'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useGLTF } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
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

interface Product3DViewerProps {
  bottleModelUrl?: string;
  capModelUrl?: string;
  bottleColor: string;
  capColor: string;
  productCategory: 'bottle' | 'cap';
  bottleScale?: number;
  capScale?: number;
  capPositionY?: number;
  productColorConfig?: ColorConfig;
  capColorConfig?: ColorConfig;
}

// ─── 3D Models ───────────────────────────────────────────────────────────────

function BottleModel({ url, color, scale = 1 }: { url: string; color: string; scale?: number }) {
  const gltf = useLoader(GLTFLoader, url);
  const meshRef = useRef<THREE.Group>(null);
  const scene = gltf.scene.clone();
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 0.3, metalness: 0.1 });
    }
  });
  return <group ref={meshRef}><primitive object={scene} scale={scale} /></group>;
}

function CapModel({ url, color, bottleHeight = 1, scale = 1, positionY = 0 }: { url: string; color: string; bottleHeight?: number; scale?: number; positionY?: number }) {
  const gltf = useLoader(GLTFLoader, url);
  const meshRef = useRef<THREE.Group>(null);
  const scene = gltf.scene.clone();
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 0.4, metalness: 0.3 });
    }
  });
  return <group ref={meshRef} position={[0, bottleHeight + positionY, 0]}><primitive object={scene} scale={scale} /></group>;
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

function LoadingSpinner() {
  const { dict } = useLang();
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-2xl">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600 dark:text-primary-400 mx-auto mb-3" />
        <p className="text-sm text-gray-600 dark:text-gray-400">{dict.catalog.product_detail.loading_3d_model}</p>
      </div>
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
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Quick pick</p>
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
        Apply Color
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
            className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* ── Desktop modal ── */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.94, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -10 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="fixed inset-0 m-auto z-[201] w-[340px] h-fit rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl p-5 hidden md:block"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center">
                  <Droplets className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-none">
                    Custom Color
                  </h3>
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
            {pickerContent}
          </motion.div>

          {/* ── Mobile drawer ── */}
          <motion.div
            key="drawer"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.3 }}
            onDragEnd={(_, info) => { if (info.offset.y > 80) onCancel(); }}
            className="fixed bottom-0 left-0 right-0 z-[201] rounded-t-3xl bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-2xl pb-safe md:hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 20px)' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
            </div>

            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center">
                  <Droplets className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-none">
                    Custom Color
                  </h3>
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

            {/* Drawer body */}
            <div className="px-5 py-4">
              {pickerContent}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

// ─── Color Swatch Panel (overlay inside viewer) ───────────────────────────────

function ColorSwatchPanel({ config }: { config: ColorConfig }) {
  const [showPicker, setShowPicker] = useState(false);
  const snapshot = useRef<{ selectedColor: string; customColor: string; isCustom: boolean } | null>(null);

  const handleOpen = () => {
    snapshot.current = {
      selectedColor: config.selectedColor,
      customColor: config.customColor,
      isCustom: config.isCustom,
    };
    setShowPicker(true);
  };

  const handleApply = () => {
    snapshot.current = null;
    setShowPicker(false);
  };

  const handleCancel = () => {
    if (snapshot.current) {
      config.onColorChange(snapshot.current.selectedColor);
      config.onCustomColorChange(snapshot.current.customColor);
      config.onIsCustomChange(snapshot.current.isCustom);
      snapshot.current = null;
    }
    setShowPicker(false);
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
            {!config.isCustom && <Palette className="w-3 h-3 text-white" />}
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
  bottleModelUrl = '/images/3d/base.glb',
  capModelUrl,
  bottleColor,
  capColor,
  productCategory,
  bottleScale = 1,
  capScale = 1,
  capPositionY = 0,
  productColorConfig,
  capColorConfig,
}: Product3DViewerProps) {
  const { dict } = useLang();
  const [resetKey, setResetKey] = useState(0);

  const hasColors = productColorConfig || capColorConfig;

  return (
    <div
      className="relative w-full aspect-square rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
      style={{ touchAction: 'none' }}
    >
      {/* Reset Camera Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setResetKey((p) => p + 1)}
        className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all"
        title={dict.catalog.product_detail.reset_camera}
      >
        <RotateCcw className="w-5 h-5 text-gray-900 dark:text-white" />
      </motion.button>

      {/* Instructions */}
      <div className={cn(
        'absolute left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm transition-all',
        hasColors ? 'bottom-[100px]' : 'bottom-4'
      )}>
        <p className="text-xs text-white font-medium whitespace-nowrap">
          {dict.catalog.product_detail.drag_to_rotate}
        </p>
      </div>

      {/* 3D Canvas */}
      <Canvas
        key={resetKey}
        camera={{ position: [3, 2, 3], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
          <directionalLight position={[-5, 3, -5]} intensity={0.3} />
          <pointLight position={[0, 3, 0]} intensity={0.3} />
          <Environment preset="studio" />
          <>
            <Suspense fallback={<PlaceholderModel color={bottleColor} type="bottle" />}>
              <BottleModel url={bottleModelUrl} color={bottleColor} scale={bottleScale} />
            </Suspense>
            {productCategory === 'bottle' && capModelUrl && (
              <Suspense fallback={<PlaceholderModel color={capColor} type="cap" />}>
                <CapModel url={capModelUrl} color={capColor} bottleHeight={1} scale={capScale} positionY={capPositionY} />
              </Suspense>
            )}
          </>
          <ContactShadows position={[0, -0.01, 0]} opacity={0.4} scale={3} blur={2} far={2} />
          <OrbitControls
            makeDefault
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

      <Suspense fallback={<LoadingSpinner />}>
        <div className="sr-only">3D model loaded</div>
      </Suspense>

      {/* Color Picker Overlay — swatches pinned to bottom of viewer */}
      {hasColors && (
        <div className="absolute bottom-4 left-3 right-3 z-20">
          <div className={cn(
            'flex gap-2',
            productColorConfig && capColorConfig ? 'justify-between' : 'justify-start'
          )}>
            {productColorConfig && <ColorSwatchPanel config={productColorConfig} />}
            {capColorConfig && <ColorSwatchPanel config={capColorConfig} />}
          </div>
        </div>
      )}
    </div>
  );
}

useGLTF.preload('/images/3d/base.glb');
useGLTF.preload('/images/3d/cap.glb');
