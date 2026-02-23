'use client';

import { motion } from 'framer-motion';
import { Award, BadgeCheck, Shield, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLang } from '@/lib/LangContext';

const certIcons = [BadgeCheck, Shield, CheckCircle2];
const certGradients = ['from-blue-500 to-indigo-600', 'from-blue-500 to-indigo-600', 'from-amber-500 to-orange-600'];

export default function CertificatesSection() {
  const { dict } = useLang();

  return (
    <section id="certificates" className="section-padding bg-gray-50 dark:bg-gray-950">
      <div className="container-custom mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6"
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">{dict.certificates.badge}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          >
            {dict.certificates.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          >
            {dict.certificates.subtitle}
          </motion.p>
        </div>

        {/* Certificates Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {dict.certificates.items.map((cert, index) => {
            const Icon = certIcons[index];

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="h-full bg-white dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700/50 shadow-xl p-8 text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={cn('w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-gradient-to-br shadow-lg', certGradients[index])}
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </motion.div>

                  <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {cert.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {cert.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Halal Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-600 p-8 md:p-12">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 right-10 w-40 h-40 border-2 border-white rounded-full" />
              <div className="absolute bottom-10 left-10 w-32 h-32 border-2 border-white rounded-full" />
            </div>

            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                  <BadgeCheck className="w-5 h-5 text-white" />
                  <span className="text-white font-medium">Halal Certified</span>
                </div>

                <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
                  Trusted by Muslim Communities Worldwide
                </h3>

                <p className="text-white/80 leading-relaxed">
                  Our commitment to Halal compliance ensures that every product meets the strictest Islamic standards, from raw materials to final packaging.
                </p>
              </div>

              <div className="flex justify-center">
                <div className="relative w-40 h-40 md:w-52 md:h-52">
                  <div className="absolute inset-0 border-4 border-white/30 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
                  <div className="absolute inset-4 border-2 border-white/20 rounded-full" />
                  <div className="absolute inset-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <BadgeCheck className="w-12 h-12 text-white mx-auto mb-1" />
                      <span className="text-white font-display font-bold text-lg">HALAL</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
