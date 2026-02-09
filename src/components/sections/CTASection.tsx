'use client';

import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle, Phone, Mail } from 'lucide-react';
import { useLang } from '@/lib/LangContext';

export default function CTASection() {
  const { dict } = useLang();

  return (
    <section id="contact" className="section-padding overflow-hidden">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-emerald-500 mx-4 md:mx-8">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="relative container-custom mx-auto px-6 md:px-12 py-16 md:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6"
            >
              <MessageCircle className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">Let&apos;s Talk</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
            >
              {dict.cta.title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-white/80 text-lg mb-8"
            >
              {dict.cta.subtitle}
            </motion.p>

            <motion.a
              href="mailto:info@welogroup.com"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 font-semibold rounded-full shadow-xl hover:bg-gray-50 transition-colors group"
            >
              {dict.cta.button}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.a>

            {/* Contact Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="grid md:grid-cols-2 gap-4 mt-12"
            >
              <a href="tel:+622112345678" className="flex items-center gap-4 p-5 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-colors group">
                <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-white/60 text-sm">Call us</div>
                  <div className="text-white font-semibold">+62 21 1234 5678</div>
                </div>
              </a>

              <a href="mailto:info@welogroup.com" className="flex items-center gap-4 p-5 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-colors group">
                <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-white/60 text-sm">Email us</div>
                  <div className="text-white font-semibold">info@welogroup.com</div>
                </div>
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
