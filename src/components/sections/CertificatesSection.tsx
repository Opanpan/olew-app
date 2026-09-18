'use client';

import { motion } from 'framer-motion';
import { BadgeCheck } from 'lucide-react';
import { useLang } from '@/lib/LangContext';
import SectionHeading from '@/components/shared/SectionHeading';

export default function CertificatesSection() {
  const { dict } = useLang();

  return (
    <section id="certificates" className="section-padding bg-gray-50 dark:bg-gray-950">
      <div className="container-custom mx-auto">
        <SectionHeading
          index="04"
          eyebrow={dict.certificates.badge}
          title={dict.certificates.title}
          lead={dict.certificates.subtitle}
        />
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
