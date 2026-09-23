'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle, Phone, Mail } from 'lucide-react';
import { OFFICE_PHONE, OFFICE_PHONE_TEL, MOBILE_PHONE, WHATSAPP_NUMBER, EMAIL } from '@/lib/contact';
import { useLang } from '@/lib/LangContext';
import SectionHeading from '@/components/shared/SectionHeading';

export default function CTASection() {
  const { dict } = useLang();

  return (
    <section id="contact" className="section-padding overflow-hidden">
      <div className="relative rounded-3xl overflow-hidden bg-primary-600 mx-3 sm:mx-4 md:mx-8">
        {/* Background */}
        <Image
          src="/images/banners/cta-bg.png"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/50 via-primary-900/10 to-primary-900/20" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="relative container-custom mx-auto px-4 sm:px-6 md:px-12 py-14 md:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <SectionHeading
              index="07"
              eyebrow={dict.cta.badge}
              title={dict.cta.title}
              lead={dict.cta.subtitle}
              align="center"
              tone="invert"
              className="mb-8 md:mb-10"
            />

            <motion.a
              href={`mailto:${EMAIL}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 whitespace-nowrap px-6 sm:px-8 py-4 bg-white text-primary-600 font-semibold rounded-full shadow-xl hover:bg-gray-50 transition-colors group"
            >
              {dict.cta.button}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.a>

          </div>

          {/* Contact cards — outside the 3xl text column so three cards get real
              width on desktop. Phones stack the icon above the text so values like
              "+62 812-8320-2512" and the email get the card's full width. */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mx-auto mt-10 grid max-w-md gap-3 sm:gap-4 md:mt-12 xl:max-w-5xl xl:grid-cols-3"
          >
            {[
              { href: `tel:${OFFICE_PHONE_TEL}`, Icon: Phone, label: dict.cta.call_us, value: OFFICE_PHONE, external: false },
              { href: `https://wa.me/${WHATSAPP_NUMBER}`, Icon: MessageCircle, label: 'WhatsApp', value: MOBILE_PHONE, external: true },
              { href: `mailto:${EMAIL}`, Icon: Mail, label: dict.cta.email_us, value: EMAIL, external: false },
            ].map(({ href, Icon, label, value, external }) => (
              <a
                key={href}
                href={href}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="group flex min-w-0 flex-col items-center gap-2 rounded-2xl border border-white/20 bg-white/10 p-4 text-center backdrop-blur-sm transition-colors hover:bg-white/20 min-[380px]:flex-row min-[380px]:gap-4 min-[380px]:p-5 min-[380px]:text-left"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 transition-transform group-hover:scale-110">
                  <Icon className="h-5 w-5 text-white" aria-hidden />
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-white/60">{label}</div>
                  <div className="whitespace-nowrap font-semibold text-white">{value}</div>
                </div>
              </a>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
