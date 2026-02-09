'use client';

import { ReactNode } from 'react';

interface FilterSectionProps {
  title: string;
  children: ReactNode;
}

export default function FilterSection({ title, children }: FilterSectionProps) {
  return (
    <div className="py-6 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}
