'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Phone, Smartphone, Mail, Instagram, Youtube } from 'lucide-react';
import { useLang } from '@/lib/LangContext';
import {
  OFFICE_ADDRESS, OFFICE_MAPS_URL, OFFICE_PHONE, OFFICE_PHONE_TEL,
  MOBILE_PHONE, WHATSAPP_NUMBER, EMAIL, SOCIAL_URLS,
} from '@/lib/contact';

// lucide-react has no TikTok glyph, so draw the brand mark inline.
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

const socialLinks = [
  { name: 'Instagram', icon: Instagram, href: SOCIAL_URLS.instagram },
  { name: 'YouTube', icon: Youtube, href: SOCIAL_URLS.youtube },
  { name: 'TikTok', icon: TikTokIcon, href: SOCIAL_URLS.tiktok },
];

export default function Footer() {
  const { lang, dict } = useLang();

  return (
    <footer className="relative bg-gray-900 text-white overflow-hidden">
      <Image
        src="/images/banners/footer-bg.png"
        alt=""
        fill
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gray-950/40" />
      <div className="relative container-custom mx-auto px-4 md:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image src="/images/logos/olew-logo.png" alt="Olew Group" width={40} height={40} className="w-10 h-10 shrink-0" />
              <div>
                <h3 className="font-display text-lg font-bold">Olew Group</h3>
                <p className="text-xs text-gray-400 tracking-wider uppercase whitespace-nowrap">PT. Olew Plasindo Jaya</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              {dict.footer.description}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-primary-500 transition-colors"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">{dict.footer.quick_links}</h4>
            <ul className="space-y-2">
              {['home', 'products', 'certificates', 'clients'].map((key) => (
                <li key={key}>
                  <a href={key === 'home' ? `/${lang}` : `#${key}`} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {dict.nav[key as keyof typeof dict.nav]}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">{dict.footer.contact_info}</h4>
            <ul className="space-y-3">
              <li>
                <a href={OFFICE_MAPS_URL} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-gray-400 hover:text-white text-sm transition-colors">
                  <MapPin className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                  <span>{OFFICE_ADDRESS}</span>
                </a>
              </li>
              <li>
                <a href={`tel:${OFFICE_PHONE_TEL}`} className="flex items-center gap-3 text-gray-400 hover:text-white text-sm transition-colors">
                  <Phone className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  <span>{OFFICE_PHONE}</span>
                </a>
              </li>
              <li>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-400 hover:text-white text-sm transition-colors">
                  <Smartphone className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  <span>{MOBILE_PHONE}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${EMAIL}`} className="flex items-center gap-3 text-gray-400 hover:text-white text-sm transition-colors">
                  <Mail className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  <span>{EMAIL}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Follow */}
          <div>
            <h4 className="font-semibold mb-4">{dict.footer.follow_us}</h4>
            <p className="text-gray-400 text-sm mb-4">
              {dict.footer.newsletter_desc}
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder={dict.footer.email_placeholder}
                className="flex-1 px-4 py-2 rounded-lg text-sm bg-white/10 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
              <button type="submit" className="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 transition-colors text-sm font-medium">
                →
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center text-gray-500 text-sm">
          {dict.footer.copyright.replace('{year}', String(new Date().getFullYear()))}
        </div>
      </div>
    </footer>
  );
}
