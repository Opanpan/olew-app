'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, ChevronDown, MessageCircle, Phone, Mail, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLang } from '@/lib/LangContext';
import { WHATSAPP_NUMBER, MOBILE_PHONE, MOBILE_PHONE_TEL, EMAIL } from '@/lib/contact';

const navItems = ['home', 'about', 'products', 'certificates', 'clients', 'contact'] as const;
type NavItem = typeof navItems[number];
const productFamilies = ['bottles', 'caps', 'pot'] as const;

// Flag shown for each locale in the language switcher (English → UK, Indonesian → Indonesia).
const LANG_FLAG: Record<'en' | 'id', string> = { en: '🇬🇧', id: '🇮🇩' };

export default function Navigation() {
  const { lang, dict } = useLang();
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname() ?? '';
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  // Desktop families dropdown. State-driven rather than pure CSS :hover/:focus-within
  // so it can be dismissed on navigation — a clicked link keeps DOM focus, which
  // would otherwise hold the menu open after the route changes.
  const [famOpen, setFamOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus on navigation.
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsLangMenuOpen(false);
    setFamOpen(false);
  }, [pathname]);

  // Mobile sheet: lock page scroll and close on Escape.
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsMobileMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [isMobileMenuOpen]);

  // Language menu: close on outside click.
  useEffect(() => {
    if (!isLangMenuOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!langMenuRef.current?.contains(e.target as Node)) setIsLangMenuOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [isLangMenuOpen]);

  const getHref = (key: NavItem) => {
    if (key === 'home') return `/${lang}`;
    if (key === 'about') return `/${lang}/about`;
    if (key === 'products') return `/${lang}/products`;
    return `/${lang}#${key}`;
  };

  // Section anchors (certificates/clients/contact) live on the home page, so
  // only real routes can be "current".
  const isActive = (key: NavItem) => {
    if (key === 'home') return pathname === `/${lang}` || pathname === `/${lang}/`;
    if (key === 'about') return pathname.startsWith(`/${lang}/about`);
    if (key === 'products') return pathname.startsWith(`/${lang}/products`) || pathname.startsWith(`/${lang}/compare`);
    return false;
  };

  const switchLangPath = (newLang: string) => `/${newLang}${pathname.replace(/^\/(en|id)/, '')}`;
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}`;
  const isDark = resolvedTheme === 'dark';
  const n = dict.nav;

  const iconButton = 'flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 bg-white/80 text-gray-700 hover:border-gray-400 dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-200 dark:hover:border-gray-500';

  return (
    <header
      className={cn(
        'fixed left-0 right-0 top-0 z-50 border-b transition-[padding,background-color,border-color] duration-300',
        isScrolled
          ? 'border-gray-200 bg-white/95 py-2.5 dark:border-gray-800 dark:bg-gray-950/95'
          : 'border-transparent py-4 md:py-5'
      )}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Image src="/images/banners/header-bg-light.jpg" alt="" fill priority className="object-cover dark:hidden" />
        <Image src="/images/banners/header-bg-dark.jpg" alt="" fill priority className="hidden object-cover dark:block" />
      </div>

      <nav className="container-custom relative mx-auto flex items-center justify-between gap-4 px-4 md:px-8">
        {/* Logo */}
        <Link href={`/${lang}`} className="flex min-w-0 items-center gap-2.5">
          <Image src="/images/logos/olew-logo.png" alt="" width={48} height={48} className="h-10 w-10 shrink-0 md:h-12 md:w-12" priority />
          <span className="min-w-0">
            <span className="block font-display text-lg font-bold leading-tight text-gray-900 dark:text-white md:text-xl">Olew Group</span>
            <span className="block truncate text-[11px] tracking-wide text-gray-500 dark:text-gray-400">PT. Olew Plasindo Jaya</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center lg:flex">
          {navItems.map((item) => {
            const active = isActive(item);
            const link = (
              <a
                href={getHref(item)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex h-10 items-center gap-1 px-3.5 text-sm font-medium transition-colors xl:px-4',
                  active ? 'text-gray-900 dark:text-white' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
                  // Current-page marker: a short bar under the label.
                  'after:absolute after:inset-x-3.5 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-primary-600 after:transition-transform after:duration-200 xl:after:inset-x-4 dark:after:bg-primary-400',
                  active ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-50'
                )}
              >
                {n[item]}
                {item === 'products' && (
                  <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', famOpen && 'rotate-180')} aria-hidden />
                )}
              </a>
            );
            if (item !== 'products') return <li key={item}>{link}</li>;
            return (
              <li
                key={item}
                className="group relative"
                onMouseEnter={() => setFamOpen(true)}
                onMouseLeave={() => setFamOpen(false)}
                onFocus={() => setFamOpen(true)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFamOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setFamOpen(false);
                }}
              >
                {link}
                {/* Families dropdown — opens on hover or keyboard focus. */}
                <div
                  className={cn(
                    'absolute left-1/2 top-full z-10 w-56 -translate-x-1/2 pt-2 transition-[opacity,visibility] duration-150',
                    famOpen ? 'visible opacity-100' : 'invisible opacity-0'
                  )}
                >
                  <ul className="rounded-md border border-gray-200 bg-white py-1.5 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.18)] dark:border-gray-800 dark:bg-gray-900">
                    {productFamilies.map((fam) => (
                      <li key={fam}>
                        <Link
                          href={`/${lang}/products/${fam}`}
                          onClick={() => setFamOpen(false)}
                          className={cn(
                            'flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800',
                            pathname.startsWith(`/${lang}/products/${fam}`) ? 'font-medium text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'
                          )}
                        >
                          {n[fam]}
                        </Link>
                      </li>
                    ))}
                    <li className="mt-1.5 border-t border-gray-100 pt-1.5 dark:border-gray-800">
                      <Link
                        href={`/${lang}/products`}
                        onClick={() => setFamOpen(false)}
                        className="flex items-center justify-between px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                      >
                        {n.all_products}
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    </li>
                  </ul>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          {mounted && (
            <button
              type="button"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              aria-label={n.toggle_theme}
              title={n.toggle_theme}
              className={cn(iconButton, 'hidden sm:flex')}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}

          <div ref={langMenuRef} className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setIsLangMenuOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={isLangMenuOpen}
              aria-label={n.language}
              className="flex h-10 items-center gap-1.5 rounded-md border border-gray-200 bg-white/80 px-3 text-sm font-medium text-gray-700 hover:border-gray-400 dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-200 dark:hover:border-gray-500"
            >
              <span aria-hidden>{LANG_FLAG[lang]}</span>
              {lang.toUpperCase()}
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', isLangMenuOpen && 'rotate-180')} aria-hidden />
            </button>
            {isLangMenuOpen && (
              <div role="menu" className="absolute right-0 mt-1 w-44 rounded-md border border-gray-200 bg-white py-1 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.18)] dark:border-gray-800 dark:bg-gray-900">
                {(['en', 'id'] as const).map((l) => (
                  <Link
                    key={l}
                    role="menuitem"
                    href={switchLangPath(l)}
                    className={cn(
                      'flex items-center gap-2.5 px-3.5 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800',
                      lang === l ? 'font-medium text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'
                    )}
                  >
                    <span aria-hidden>{LANG_FLAG[l]}</span>
                    {l === 'en' ? 'English' : 'Bahasa Indonesia'}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-10 items-center gap-2 rounded-md bg-primary-600 px-4 text-sm font-medium text-white hover:bg-primary-700 lg:flex"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            {n.request_quote}
          </a>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label={n.menu}
            aria-expanded={isMobileMenuOpen}
            className={cn(iconButton, 'lg:hidden')}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* ── Mobile menu: full-screen sheet ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={n.menu}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[60] flex flex-col bg-white dark:bg-gray-950 lg:hidden"
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">
              <Link href={`/${lang}`} className="flex items-center gap-2.5" onClick={() => setIsMobileMenuOpen(false)}>
                <Image src="/images/logos/olew-logo.png" alt="" width={36} height={36} className="h-9 w-9" />
                <span className="font-display text-lg font-bold text-gray-900 dark:text-white">Olew Group</span>
              </Link>
              <button type="button" onClick={() => setIsMobileMenuOpen(false)} aria-label={n.close_menu} className={iconButton}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-6">
              <ol className="divide-y divide-gray-200 dark:divide-gray-800">
                {navItems.map((item, i) => {
                  const active = isActive(item);
                  const label = (
                    <span className="flex items-baseline gap-4">
                      <span className={cn('w-6 text-xs tabular-nums', active ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400')}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className={cn('font-display text-2xl font-semibold', active ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-white')}>
                        {n[item]}
                      </span>
                    </span>
                  );
                  return (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.04 + i * 0.035, duration: 0.2 }}
                    >
                      {item === 'products' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setProductsOpen((o) => !o)}
                            aria-expanded={productsOpen}
                            className="flex w-full items-center justify-between py-4 text-left"
                          >
                            {label}
                            <ChevronDown className={cn('h-5 w-5 text-gray-500 transition-transform', productsOpen && 'rotate-180')} aria-hidden />
                          </button>
                          {productsOpen && (
                            <ul className="-mt-1 mb-4 ml-10 space-y-0.5 border-l border-gray-200 pl-4 dark:border-gray-800">
                              {[...productFamilies.map((fam) => ({ href: `/${lang}/products/${fam}`, label: n[fam] })), { href: `/${lang}/products`, label: n.all_products }].map((l) => (
                                <li key={l.href}>
                                  <Link
                                    href={l.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={cn(
                                      'flex min-h-[44px] items-center text-base',
                                      pathname === l.href ? 'font-medium text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'
                                    )}
                                  >
                                    {l.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </>
                      ) : (
                        <a
                          href={getHref(item)}
                          aria-current={active ? 'page' : undefined}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center justify-between py-4"
                        >
                          {label}
                          {active && <span className="h-2 w-2 rounded-full bg-primary-600 dark:bg-primary-400" aria-hidden />}
                        </a>
                      )}
                    </motion.li>
                  );
                })}
              </ol>
            </div>

            <div className="shrink-0 space-y-4 border-t border-gray-200 px-4 pt-4 dark:border-gray-800" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary-600 text-sm font-semibold text-white hover:bg-primary-700"
              >
                <MessageCircle className="h-5 w-5" aria-hidden />
                {n.chat_whatsapp}
              </a>
              <div className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-400">
                <a href={`tel:${MOBILE_PHONE_TEL}`} className="flex items-center gap-2 py-1"><Phone className="h-4 w-4" aria-hidden />{MOBILE_PHONE}</a>
                <a href={`mailto:${EMAIL}`} className="flex items-center gap-2 py-1"><Mail className="h-4 w-4" aria-hidden />{EMAIL}</a>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div role="group" aria-label={n.language} className="inline-flex rounded-md border border-gray-300 p-0.5 dark:border-gray-700">
                  {(['en', 'id'] as const).map((l) => (
                    <Link
                      key={l}
                      href={switchLangPath(l)}
                      aria-current={lang === l ? 'true' : undefined}
                      className={cn(
                        'flex h-9 items-center gap-1.5 rounded px-3 text-sm font-medium',
                        lang === l ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-600 dark:text-gray-400'
                      )}
                    >
                      <span aria-hidden>{LANG_FLAG[l]}</span>
                      {l.toUpperCase()}
                    </Link>
                  ))}
                </div>
                {mounted && (
                  <button type="button" onClick={() => setTheme(isDark ? 'light' : 'dark')} aria-label={n.toggle_theme} className={iconButton}>
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
