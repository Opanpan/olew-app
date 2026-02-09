'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  colors: string[];
  selectedColor: string;
  onColorChange: (color: string) => void;
  label?: string;
}

// Map color names to actual color values
const colorMap: Record<string, string> = {
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

export default function ColorPicker({
  colors,
  selectedColor,
  onColorChange,
  label = 'Select Color',
}: ColorPickerProps) {
  return (
    <div className="space-y-3 md:space-y-4">
      <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white">
        {label}
      </h3>
      <div className="flex flex-wrap gap-2 md:gap-3">
        {colors.map((color) => {
          const isSelected = selectedColor === color;
          const colorClass = colorMap[color] || 'bg-gray-400';

          return (
            <motion.button
              key={color}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onColorChange(color)}
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
      <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
        <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
          Selected:
        </span>
        <span className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white">
          {selectedColor}
        </span>
      </div>
    </div>
  );
}
