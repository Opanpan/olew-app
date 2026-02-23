'use client';

import { Suspense, useRef, useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useGLTF } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { RotateCcw, Loader2 } from 'lucide-react';
import { useLang } from '@/lib/LangContext';

interface Product3DViewerProps {
  bottleModelUrl?: string;
  capModelUrl?: string;
  bottleColor: string;
  capColor: string;
  productCategory: 'bottle' | 'cap';
  bottleScale?: number;
  capScale?: number;
  capPositionY?: number;
}

// Component to load and display the bottle model
function BottleModel({ url, color, scale = 1 }: { url: string; color: string; scale?: number }) {
  const gltf = useLoader(GLTFLoader, url);
  const meshRef = useRef<THREE.Group>(null);

  // Clone the scene to avoid modifying the original
  const scene = gltf.scene.clone();

  // Apply color to all meshes
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.3,
        metalness: 0.1,
      });
    }
  });

  return (
    <group ref={meshRef} position={[0, 0, 0]}>
      <primitive object={scene} scale={scale} />
    </group>
  );
}

// Component to load and display the cap model
function CapModel({ url, color, bottleHeight = 1, scale = 1, positionY = 0 }: { url: string; color: string; bottleHeight?: number; scale?: number; positionY?: number }) {
  const gltf = useLoader(GLTFLoader, url);
  const meshRef = useRef<THREE.Group>(null);

  // Clone the scene
  const scene = gltf.scene.clone();

  // Apply color to all meshes
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.4,
        metalness: 0.3,
      });
    }
  });

  // Position cap on top of bottle with adjustable Y offset
  return (
    <group ref={meshRef} position={[0, bottleHeight + positionY, 0]}>
      <primitive object={scene} scale={scale} />
    </group>
  );
}

// Fallback placeholder when models are loading or unavailable
function PlaceholderModel({ color, type }: { color: string; type: 'bottle' | 'cap' }) {
  if (type === 'bottle') {
    return (
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 1, 32]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>
    );
  }

  // Cap placeholder
  return (
    <mesh position={[0, 1.1, 0]}>
      <cylinderGeometry args={[0.32, 0.28, 0.2, 32]} />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
    </mesh>
  );
}

// Loading spinner component
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

export default function Product3DViewer({
  bottleModelUrl = '/images/3d/base.glb',
  capModelUrl,
  bottleColor,
  capColor,
  productCategory,
  bottleScale = 1,
  capScale = 1,
  capPositionY = 0,
}: Product3DViewerProps) {
  const { dict } = useLang();
  const [resetKey, setResetKey] = useState(0);

  const handleReset = () => {
    setResetKey((prev) => prev + 1);
  };

  return (
    <div className="relative w-full aspect-square rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900" style={{ touchAction: 'none' }}>
      {/* Reset Camera Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleReset}
        className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all"
        title={dict.catalog.product_detail.reset_camera}
      >
        <RotateCcw className="w-5 h-5 text-gray-900 dark:text-white" />
      </motion.button>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm">
        <p className="text-xs text-white font-medium">{dict.catalog.product_detail.drag_to_rotate}</p>
      </div>

      {/* 3D Canvas */}
      <Canvas
        key={resetKey}
        camera={{ position: [3, 2, 3], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
          <directionalLight position={[-5, 3, -5]} intensity={0.3} />
          <pointLight position={[0, 3, 0]} intensity={0.3} />

          {/* Environment for reflections */}
          <Environment preset="studio" />

          {/* Models - Try to load GLB files, fallback to placeholders if loading fails */}
          <>
            {/* Bottle Model - Suspense shows placeholder while loading */}
            <Suspense fallback={<PlaceholderModel color={bottleColor} type="bottle" />}>
              <BottleModel url={bottleModelUrl} color={bottleColor} scale={bottleScale} />
            </Suspense>

            {/* Cap Model (positioned on top) - only if capModelUrl is provided */}
            {productCategory === 'bottle' && capModelUrl && (
              <Suspense fallback={<PlaceholderModel color={capColor} type="cap" />}>
                <CapModel url={capModelUrl} color={capColor} bottleHeight={1} scale={capScale} positionY={capPositionY} />
              </Suspense>
            )}
          </>

          {/* Ground shadow */}
          <ContactShadows
            position={[0, -0.01, 0]}
            opacity={0.4}
            scale={3}
            blur={2}
            far={2}
          />

          {/* Camera controls */}
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

      {/* Loading overlay */}
      <Suspense fallback={<LoadingSpinner />}>
        <div className="sr-only">3D model loaded</div>
      </Suspense>
    </div>
  );
}

// Preload models for better performance
useGLTF.preload('/images/3d/base.glb');
useGLTF.preload('/images/3d/cap.glb');
