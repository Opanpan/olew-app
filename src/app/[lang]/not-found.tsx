'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft, PackageX } from 'lucide-react';
import { useLang } from '@/lib/LangContext';

export default function NotFound() {
  const { lang, dict } = useLang();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-primary-950/20 flex items-center justify-center px-4 pt-20">
      <div className="max-w-2xl w-full text-center">
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="mb-8 md:mb-12"
        >
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary-500/20 blur-3xl rounded-full" />
            <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-full p-8 md:p-12">
              <PackageX className="w-20 h-20 md:w-32 md:h-32 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </motion.div>

        {/* 404 Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 md:mb-8"
        >
          <h1 className="font-display text-8xl md:text-9xl font-bold text-gray-900 dark:text-white mb-4">
            404
          </h1>
          <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {lang === 'id' ? 'Apakah Anda Tersesat?' : 'Are You Lost?'}
          </h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {lang === 'id'
              ? 'Halaman yang Anda cari tidak ditemukan. Mungkin sudah dipindahkan atau dihapus.'
              : "The page you're looking for doesn't exist. It might have been moved or deleted."}
          </p>
        </motion.div>

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8 md:mb-12"
        >
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-6">
            {lang === 'id' ? 'Berikut beberapa saran untuk Anda:' : 'Here are some helpful suggestions:'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {/* Home Link */}
            <Link
              href={`/${lang}`}
              className="group p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary-500 dark:hover:border-primary-500 transition-all hover:shadow-lg"
            >
              <Home className="w-8 h-8 text-primary-600 dark:text-primary-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900 dark:text-white mb-1">
                {lang === 'id' ? 'Kembali ke Beranda' : 'Back to Home'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {lang === 'id' ? 'Mulai dari awal' : 'Start from the beginning'}
              </p>
            </Link>

            {/* Bottles */}
            <Link
              href={`/${lang}/bottles`}
              className="group p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary-500 dark:hover:border-primary-500 transition-all hover:shadow-lg"
            >
              <Search className="w-8 h-8 text-primary-600 dark:text-primary-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900 dark:text-white mb-1">
                {dict.nav.bottles}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {lang === 'id' ? 'Jelajahi koleksi botol' : 'Browse bottle collection'}
              </p>
            </Link>

            {/* Caps */}
            <Link
              href={`/${lang}/caps`}
              className="group p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary-500 dark:hover:border-primary-500 transition-all hover:shadow-lg"
            >
              <Search className="w-8 h-8 text-primary-600 dark:text-primary-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900 dark:text-white mb-1">
                {dict.nav.caps}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {lang === 'id' ? 'Jelajahi koleksi tutup' : 'Browse cap collection'}
              </p>
            </Link>
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-sm md:text-base text-primary-600 dark:text-primary-400 hover:gap-3 transition-all group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            {lang === 'id' ? 'Kembali ke Halaman Sebelumnya' : 'Go Back to Previous Page'}
          </button>
        </motion.div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 p-6 rounded-2xl bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900"
        >
          <p className="text-sm md:text-base text-gray-700 dark:text-gray-300">
            {lang === 'id'
              ? 'Butuh bantuan? Hubungi tim kami di '
              : 'Need help? Contact our team at '}
            <a
              href="mailto:info@olewgroup.com"
              className="font-semibold text-primary-600 dark:text-primary-400 hover:underline"
            >
              info@olewgroup.com
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
