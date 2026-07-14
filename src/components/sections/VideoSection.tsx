'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Video, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLang } from '@/lib/LangContext';
import { getGallery, type GalleryItem } from '@/lib/publicApi';

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

type VideoItem = {
  id: string;
  title: string;
  desc?: string;
  videoUrl: string;
  youtubeId: string | null;
  thumbnail?: string;
};

function buildVideoItems(gallery: GalleryItem[], lang: string): VideoItem[] {
  return gallery
    .filter((g) => g.video_url)
    .map((g) => {
      const youtubeId = getYouTubeId(g.video_url!);
      return {
        id: g.id,
        title: lang === 'id' ? g.title_id : g.title_en,
        desc: lang === 'id' ? g.description_id : g.description_en,
        videoUrl: g.video_url!,
        youtubeId,
        thumbnail: youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : g.image_url,
      };
    });
}

export default function VideoSection() {
  const { lang, dict } = useLang();
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  useEffect(() => {
    getGallery().then(setGallery);
  }, []);

  useEffect(() => {
    if (!activeVideo) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveVideo(null);
    };
    window.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [activeVideo]);

  const items = buildVideoItems(gallery, lang);

  if (items.length === 0) return null;

  return (
    <section id="videos" className="relative py-20 md:py-32 overflow-hidden bg-gray-950">
      {/* Background */}
      <Image
        src="/images/banners/videos-bg.png"
        alt=""
        fill
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gray-950/40" />

      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />

      <div className="relative container-custom mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-6"
          >
            <Video className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-medium text-primary-300">{dict.videos.badge}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
          >
            {dict.videos.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 max-w-2xl mx-auto"
          >
            {dict.videos.subtitle}
          </motion.p>
        </div>

        {/* Video bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-[260px] lg:auto-rows-[200px] gap-6">
          {items.map((item, index) => {
            const isLarge = index === 0;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setActiveVideo(item)}
                className={cn(
                  'group relative rounded-3xl overflow-hidden cursor-pointer border border-white/10',
                  isLarge && 'md:col-span-2 lg:col-span-2 lg:row-span-2'
                )}
              >
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30 transition-opacity duration-500 group-hover:from-black/90" />

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                      className="absolute w-14 h-14 rounded-full bg-white/40"
                    />
                    <div className={cn(
                      'relative flex items-center justify-center rounded-full bg-white/95 shadow-xl transition-transform duration-300 group-hover:scale-110',
                      isLarge ? 'w-20 h-20' : 'w-14 h-14'
                    )}>
                      <Play className={cn('text-gray-900 translate-x-0.5', isLarge ? 'w-8 h-8' : 'w-5 h-5')} fill="currentColor" />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                  <h3 className={cn('font-display font-bold text-white', isLarge ? 'text-2xl md:text-3xl' : 'text-lg')}>
                    {item.title}
                  </h3>
                  {item.desc && (
                    <p className={cn('mt-1 text-white/70 line-clamp-2', isLarge ? 'text-sm md:text-base' : 'text-xs')}>
                      {item.desc}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveVideo(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl"
            >
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute -top-12 right-0 md:-right-12 md:top-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl bg-black">
                {activeVideo.youtubeId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0`}
                    title={activeVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full"
                  />
                ) : (
                  <video src={activeVideo.videoUrl} controls autoPlay className="w-full h-full" />
                )}
              </div>

              <div className="mt-4 text-center">
                <h3 className="font-display text-xl font-bold text-white">{activeVideo.title}</h3>
                {activeVideo.desc && <p className="mt-1 text-white/70 text-sm">{activeVideo.desc}</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
