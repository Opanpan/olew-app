'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TypeFilterProps {
  types: string[];
  selectedTypes: string[];
  onChange: (types: string[]) => void;
}

export default function TypeFilter({
  types,
  selectedTypes,
  onChange,
}: TypeFilterProps) {
  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      onChange(selectedTypes.filter((t) => t !== type));
    } else {
      onChange([...selectedTypes, type]);
    }
  };

  return (
    <div className="space-y-2">
      {types.map((type, index) => (
        <motion.label
          key={type}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className={cn(
            'flex items-center gap-3 p-3 rounded-xl cursor-pointer',
            'hover:bg-gray-50 dark:hover:bg-gray-800',
            'transition-all group'
          )}
        >
          <input
            type="checkbox"
            checked={selectedTypes.includes(type)}
            onChange={() => toggleType(type)}
            className={cn(
              'w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600',
              'text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0',
              'transition-all cursor-pointer'
            )}
          />
          <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
            {type}
          </span>
        </motion.label>
      ))}
    </div>
  );
}
