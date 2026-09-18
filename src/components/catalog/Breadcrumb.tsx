'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

// Always a single line: ancestor links keep their width, and the current page
// (usually a long product name, repeated in the h1 right below) truncates with
// an ellipsis instead of wrapping into a tall block on phones.
export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className={isLast ? 'flex min-w-0 items-center gap-1.5' : 'flex shrink-0 items-center gap-1.5'}>
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />}
              {item.href && !isLast ? (
                <Link href={item.href} className="whitespace-nowrap hover:text-primary-600 dark:hover:text-primary-400">
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" title={item.label} className="truncate font-medium text-gray-900 dark:text-white">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
