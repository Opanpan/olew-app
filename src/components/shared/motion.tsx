'use client';

/**
 * Shared motion primitives for the marketing pages.
 *
 * Everything here degrades to "no movement, full opacity" when the visitor asks
 * for reduced motion, so a single `prefers-reduced-motion` check lives in one
 * place instead of being re-derived in every section.
 */

import { motion, useReducedMotion, type Variants, type HTMLMotionProps } from 'framer-motion';
import { Fragment, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Soft, slightly overshooting ease — movement settles instead of stopping dead. */
export const EASE = [0.22, 1, 0.36, 1] as const;

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

const OFFSET: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 28 },
  down: { x: 0, y: -28 },
  left: { x: 28, y: 0 },
  right: { x: -28, y: 0 },
  none: { x: 0, y: 0 },
};

interface RevealProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  /** Where the element travels in from. */
  from?: Direction;
  delay?: number;
  duration?: number;
  /** Start the animation this far before the element reaches the viewport edge. */
  margin?: string;
  className?: string;
}

/** Fade + travel in once, the first time the element scrolls into view. */
export function Reveal({
  children,
  from = 'up',
  delay = 0,
  duration = 0.7,
  margin = '-80px',
  className,
  ...rest
}: RevealProps) {
  const reduced = useReducedMotion();
  const offset = reduced ? OFFSET.none : OFFSET[from];

  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin }}
      transition={{ duration: reduced ? 0 : duration, delay: reduced ? 0 : delay, ease: EASE }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/**
 * Parent for a list of `<Stagger.Item>`s — children arrive one after another
 * rather than all at once, which reads as deliberate instead of mechanical.
 */
export function Stagger({
  children,
  className,
  delay = 0,
  step = 0.08,
  margin = '-80px',
  ...rest
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  step?: number;
  margin?: string;
} & Omit<HTMLMotionProps<'div'>, 'children'>) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: reduced ? 0 : step, delayChildren: reduced ? 0 : delay } },
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const staticVariants: Variants = { hidden: { opacity: 1 }, visible: { opacity: 1 } };

Stagger.Item = function StaggerItem({
  children,
  className,
  ...rest
}: { children: ReactNode; className?: string } & Omit<HTMLMotionProps<'div'>, 'children'>) {
  const reduced = useReducedMotion();
  return (
    <motion.div variants={reduced ? staticVariants : itemVariants} className={className} {...rest}>
      {children}
    </motion.div>
  );
};

/**
 * Headline that reveals word by word from behind a mask, so the line assembles
 * itself instead of sliding in as one block.
 */
export function WordReveal({
  text,
  className,
  wordClassName,
  delay = 0,
  step = 0.06,
  /** Words from this index on get the accent treatment. */
  accentFrom,
  accentClassName = 'text-primary-600 dark:text-primary-400',
  as: Tag = 'h1',
  inView = false,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  step?: number;
  accentFrom?: number;
  accentClassName?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p';
  /** Trigger on scroll instead of on mount. */
  inView?: boolean;
}) {
  const reduced = useReducedMotion();
  const words = text.split(' ');
  const MotionTag = motion[Tag];

  const animateProps = inView
    ? { whileInView: 'visible' as const, viewport: { once: true, margin: '-80px' } }
    : { animate: 'visible' as const };

  return (
    <MotionTag
      initial="hidden"
      {...animateProps}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: reduced ? 0 : step, delayChildren: reduced ? 0 : delay } },
      }}
      className={className}
    >
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          {/* The clip wrapper is what makes the word rise out of nothing;
              without it the text would just fade while overlapping the line
              above. */}
          <span className="inline-block overflow-hidden align-bottom pb-[0.12em]">
            <motion.span
              variants={
                reduced
                  ? staticVariants
                  : {
                      hidden: { y: '110%' },
                      visible: { y: '0%', transition: { duration: 0.75, ease: EASE } },
                    }
              }
              className={cn(
                'inline-block',
                wordClassName,
                accentFrom !== undefined && i >= accentFrom && accentClassName
              )}
            >
              {word}
            </motion.span>
          </span>
          {/* The separating space must live BETWEEN the inline-block wrappers,
              never inside them. Inline-blocks with no whitespace between them
              give the browser no break opportunity, so the heading becomes one
              unbreakable line — which sets a min-content width wider than a
              phone and drags every sibling in the layout off-screen with it. */}
          {i < words.length - 1 && ' '}
        </Fragment>
      ))}
    </MotionTag>
  );
}
