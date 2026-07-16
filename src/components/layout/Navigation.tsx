'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, Globe, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLang } from '@/lib/LangContext';

const navItems = ['home', 'about', 'products', 'certificates', 'clients', 'contact'] as const;

export default function Navigation() {
  const { lang, dict } = useLang();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [scrollY, setScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isScrolled = scrollY > 50;

  const getHref = (key: string) => {
    if (key === 'home') return `/${lang}`;
    if (key === 'about') return `/${lang}/about`;
    if (key === 'products') return `/${lang}/products`;
    return `/${lang}#${key}`;
  };

  // Helper function to switch language while preserving the current path
  const getLanguageSwitchPath = (newLang: string) => {
    if (!pathname) return `/${newLang}`;
    // Replace the current language segment with the new one
    const pathWithoutLang = pathname.replace(/^\/(en|id)/, '');
    return `/${newLang}${pathWithoutLang}`;
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled
          ? 'py-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-lg'
          : 'py-5 bg-transparent'
      )}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Image
          src="/images/banners/header-bg.png"
          alt=""
          fill
          priority
          className="object-cover dark:hidden"
        />
      </div>
      <nav className="relative container-custom mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={`/${lang}`} className="flex items-center gap-3">
            <Image src="/images/logos/olew-logo.png" alt="Olew Group" width={48} height={48} className="w-12 h-12" priority />
            <div className="hidden sm:block">
              <h1 className="font-display text-xl font-bold text-gray-900 dark:text-white">
                Olew Group
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 tracking-wider uppercase whitespace-nowrap">
                PT. Olew Plasindo Jaya
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item}
                href={getHref(item)}
                className="px-5 py-2.5 text-sm font-medium rounded-full text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/50 transition-all"
              >
                {dict.nav[item as keyof typeof dict.nav]}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-2 px-4 py-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              >
                <Globe className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">{lang.toUpperCase()}</span>
                <ChevronDown className={cn('w-4 h-4 transition-transform', isLangMenuOpen && 'rotate-180')} />
              </button>

              <AnimatePresence>
                {isLangMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-40 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700"
                  >
                    <Link
                      href={getLanguageSwitchPath('en')}
                      onClick={() => setIsLangMenuOpen(false)}
                      className={cn(
                        'block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700',
                        lang === 'en' ? 'text-primary-600 font-medium' : 'text-gray-700 dark:text-gray-300'
                      )}
                    >
                      English
                    </Link>
                    <Link
                      href={getLanguageSwitchPath('id')}
                      onClick={() => setIsLangMenuOpen(false)}
                      className={cn(
                        'block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700',
                        lang === 'id' ? 'text-primary-600 font-medium' : 'text-gray-700 dark:text-gray-300'
                      )}
                    >
                      Bahasa Indonesia
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mt-4 overflow-hidden"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl border border-gray-100 dark:border-gray-700">
                {navItems.map((item) => (
                  <a
                    key={item}
                    href={getHref(item)}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-base font-medium rounded-xl text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
                  >
                    {dict.nav[item as keyof typeof dict.nav]}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
