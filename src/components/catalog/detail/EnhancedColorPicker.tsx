'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Palette, X } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { cn } from '@/lib/utils';

interface EnhancedColorPickerProps {
  colors: string[];
  selectedColor: string;
  onColorChange: (color: string) => void;
  onCustomColorChange?: (hexColor: string) => void;
  onIsCustomChange?: (isCustom: boolean) => void;
  customColor?: string;
  label?: string;
  showCustomPicker?: boolean;
}

// Map color names to actual hex values for 3D rendering
export const colorToHex: Record<string, string> = {
  'Amber': '#d97706',
  'Clear': '#f3f4f6',
  'Cobalt Blue': '#2563eb',
  'Green': '#16a34a',
  'Frosted Clear': '#e5e7eb',
  'White': '#ffffff',
  'Black': '#000000',
  'Gold': '#eab308',
  'Silver': '#9ca3af',
  'Rose Gold': '#f472b6',
  'Matte Black': '#111827',
  'Chrome': '#d1d5db',
  'Natural Bamboo': '#d97706',
  'Black Bamboo': '#78350f',
  'Transparent': '#f9fafb',
  'Frosted': '#f3f4f6',
  'Blue': '#3b82f6',
  'Natural': '#fde68a',
  'Brushed Gold': '#ca8a04',
  'Black Chrome': '#374151',
  '24K Gold': '#facc15',
  'Platinum': '#d1d5db',
};

// Tailwind classes for UI display
export const colorClassMap: Record<string, string> = {
  'Amber': 'bg-amber-600',
  'Clear': 'bg-gray-100 border-2 border-gray-300',
  'Cobalt Blue': 'bg-blue-600',
  'Green': 'bg-green-600',
  'Frosted Clear': 'bg-gray-200 border-2 border-gray-400',
  'White': 'bg-white border-2 border-gray-300',
  'Black': 'bg-black',
  'Gold': 'bg-gradient-to-br from-yellow-400 to-yellow-600',
  'Silver': 'bg-gradient-to-br from-gray-300 to-gray-500',
  'Rose Gold': 'bg-gradient-to-br from-pink-300 to-yellow-500',
  'Matte Black': 'bg-gray-900',
  'Chrome': 'bg-gradient-to-br from-gray-400 to-gray-200',
  'Natural Bamboo': 'bg-gradient-to-br from-amber-700 to-amber-500',
  'Black Bamboo': 'bg-gradient-to-br from-gray-800 to-amber-900',
  'Transparent': 'bg-gray-50 border-2 border-gray-300',
  'Frosted': 'bg-gray-100 border-2 border-gray-300',
  'Blue': 'bg-blue-500',
  'Natural': 'bg-amber-200 border-2 border-amber-300',
  'Brushed Gold': 'bg-gradient-to-br from-yellow-600 to-yellow-400',
  'Black Chrome': 'bg-gradient-to-br from-gray-900 to-gray-600',
  '24K Gold': 'bg-gradient-to-br from-yellow-500 to-yellow-700',
  'Platinum': 'bg-gradient-to-br from-gray-400 to-gray-300',
};

export default function EnhancedColorPicker({
  colors,
  selectedColor,
  onColorChange,
  onCustomColorChange,
  onIsCustomChange,
  customColor = '#22c55e',
  label = 'Select Color',
  showCustomPicker = true,
}: EnhancedColorPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [hexInput, setHexInput] = useState(customColor);
  const [isCustom, setIsCustom] = useState(false);

  const handleCustomColorChange = (color: string) => {
    setHexInput(color);
    onCustomColorChange?.(color);
    setIsCustom(true);
    onIsCustomChange?.(true);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Ensure hex format
    if (!value.startsWith('#')) {
      value = '#' + value;
    }
    setHexInput(value);

    // Only update if valid hex color (3 or 6 digits)
    if (/^#([0-9A-F]{3}){1,2}$/i.test(value)) {
      onCustomColorChange?.(value);
      setIsCustom(true);
      onIsCustomChange?.(true);
    }
  };

  const handlePredefinedColorSelect = (color: string) => {
    onColorChange(color);
    setIsCustom(false);
    onIsCustomChange?.(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white">
          {label}
        </h3>
        {showCustomPicker && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowPicker(!showPicker)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all',
              showPicker
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            <Palette className="w-4 h-4" />
            Custom Color
            {showPicker && <X className="w-3 h-3" />}
          </motion.button>
        )}
      </div>

      {/* Custom Color Picker Modal */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-4">
              {/* Color Picker */}
              <div className="flex justify-center">
                <HexColorPicker
                  color={hexInput}
                  onChange={handleCustomColorChange}
                  className="!w-full max-w-[200px]"
                />
              </div>

              {/* Hex Input */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Hex Color Code
                </label>
                <div className="flex gap-2 items-center">
                  <div
                    className="w-10 h-10 rounded-lg border-2 border-gray-300 dark:border-gray-700 flex-shrink-0"
                    style={{ backgroundColor: hexInput }}
                  />
                  <input
                    type="text"
                    value={hexInput}
                    onChange={handleHexInputChange}
                    placeholder="#22c55e"
                    className={cn(
                      'flex-1 px-3 py-2 rounded-lg',
                      'bg-gray-50 dark:bg-gray-800',
                      'border border-gray-300 dark:border-gray-700',
                      'text-sm font-mono text-gray-900 dark:text-white',
                      'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                      'transition-all'
                    )}
                    maxLength={7}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enter a hex color code (e.g., #22c55e)
                </p>
              </div>

              {/* Apply Button */}
              <button
                onClick={() => setShowPicker(false)}
                className="w-full btn-primary py-2.5 text-sm"
              >
                Apply Custom Color
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Predefined Colors */}
      <div className="flex flex-wrap gap-2 md:gap-3">
        {colors.map((color) => {
          const isSelected = !isCustom && selectedColor === color;
          const colorClass = colorClassMap[color] || 'bg-gray-400';

          return (
            <motion.button
              key={color}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePredefinedColorSelect(color)}
              className="group relative flex flex-col items-center gap-1.5 md:gap-2"
              aria-label={`Select ${color} color`}
            >
              {/* Color Circle */}
              <div
                className={cn(
                  'relative w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full transition-all',
                  colorClass,
                  isSelected
                    ? 'ring-3 md:ring-4 ring-primary-500 ring-offset-2 md:ring-offset-3 ring-offset-white dark:ring-offset-gray-900 shadow-lg'
                    : 'ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-primary-300 dark:hover:ring-primary-700 shadow-md'
                )}
              >
                {/* Checkmark for selected color */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary-500 flex items-center justify-center">
                      <Check className="w-3 h-3 md:w-4 md:h-4 text-white" />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Color Name */}
              <span
                className={cn(
                  'text-[10px] md:text-xs text-center max-w-[60px] md:max-w-[80px] leading-tight transition-colors',
                  isSelected
                    ? 'text-primary-600 dark:text-primary-400 font-semibold'
                    : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
                )}
              >
                {color}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Selected Color Display */}
      <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
            Selected:
          </span>
          <span className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white">
            {isCustom ? 'Custom' : selectedColor}
          </span>
        </div>
        {isCustom && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
            <div
              className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600"
              style={{ backgroundColor: hexInput }}
            />
            <span className="text-xs font-mono text-gray-700 dark:text-gray-300">
              {hexInput.toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
