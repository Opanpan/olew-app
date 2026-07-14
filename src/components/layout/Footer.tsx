'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Phone, Mail, Instagram, Facebook, Linkedin, Twitter } from 'lucide-react';
import { useLang } from '@/lib/LangContext';

const socialLinks = [
  { name: 'Instagram', icon: Instagram, href: '#' },
  { name: 'Facebook', icon: Facebook, href: '#' },
  { name: 'LinkedIn', icon: Linkedin, href: '#' },
  { name: 'Twitter', icon: Twitter, href: '#' },
];

export default function Footer() {
  const { lang, dict } = useLang();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom mx-auto px-4 md:px-8 pt-16 pb-8">
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
              <li className="flex items-start gap-3 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                <span>{dict.footer.address}</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Phone className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span>{dict.footer.phone}</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Mail className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span>{dict.footer.email}</span>
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
          {dict.footer.copyright}
        </div>
      </div>
    </footer>
  );
}
