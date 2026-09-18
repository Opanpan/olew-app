'use client';

/**
 * Editorial section header: a numbered rule, a small-caps eyebrow, then the
 * title. Replaces the pill-badge-over-centred-title pattern that every section
 * used to repeat.
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Reveal, WordReveal } from './motion';

export default function SectionHeading({
  index,
  eyebrow,
  title,
  lead,
  align = 'left',
  tone = 'default',
  action,
  className,
}: {
  /** Two-digit section number, e.g. "02". Omitted sections just lose the number. */
  index?: string;
  eyebrow: string;
  title: string;
  lead?: string;
  align?: 'left' | 'center';
  /** `invert` for headers sitting on dark or photographic backgrounds. */
  tone?: 'default' | 'invert';
  /** Optional trailing element (a link, a button) pinned to the right on wide screens. */
  action?: ReactNode;
  className?: string;
}) {
  const centered = align === 'center';
  const invert = tone === 'invert';

  return (
    <div
      className={cn(
        'mb-12 md:mb-16',
        centered ? 'text-center' : 'md:flex md:items-end md:justify-between md:gap-8',
        className
      )}
    >
      <div className={cn('max-w-3xl', centered && 'mx-auto')}>
        <Reveal from="up" duration={0.6}>
          <div className={cn('flex items-center gap-3', centered && 'justify-center')}>
            {index && (
              <span
                className={cn(
                  'font-display text-sm tabular-nums',
                  invert ? 'text-white/50' : 'text-primary-600/70 dark:text-primary-400/70'
                )}
              >
                {index}
              </span>
            )}
            <span
              className={cn(
                'h-px w-8',
                invert ? 'bg-white/30' : 'bg-primary-500/40 dark:bg-primary-400/40'
              )}
            />
            <span
              className={cn(
                'text-[0.7rem] font-semibold uppercase tracking-[0.2em]',
                invert ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
              )}
            >
              {eyebrow}
            </span>
          </div>
        </Reveal>

        <WordReveal
          as="h2"
          inView
          text={title}
          delay={0.05}
          className={cn(
            'font-display mt-4 text-3xl font-bold leading-[1.1] md:text-4xl lg:text-[2.75rem]',
            invert ? 'text-white' : 'text-gray-900 dark:text-white'
          )}
        />

        {lead && (
          <Reveal from="up" delay={0.15}>
            <p
              className={cn(
                'mt-4 text-base leading-relaxed md:text-lg',
                invert ? 'text-white/75' : 'text-gray-600 dark:text-gray-300',
                centered && 'mx-auto max-w-2xl'
              )}
            >
              {lead}
            </p>
          </Reveal>
        )}
      </div>

      {action && !centered && (
        <Reveal from="up" delay={0.2} className="mt-6 shrink-0 md:mt-0">
          {action}
        </Reveal>
      )}
    </div>
  );
}
