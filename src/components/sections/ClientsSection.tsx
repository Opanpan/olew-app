'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { useLang } from '@/lib/LangContext';
import CountUp from '../shared/CountUp';
import { getClients, type Client } from '@/lib/publicApi';
import ImgWithFallback from '@/components/shared/ImgWithFallback';

const fallbackClients = [
  'Brand Alpha', 'Luxe Beauty', 'Pure Essence', 'Natural Care', 'Glow Labs', 'Skin Radiance',
  'Aroma Plus', 'Bio Pharma', 'Wellness Co', 'Fresh Start', 'Elite Scents', 'Care Zone',
];

function ClientLogo({ name, logo_url }: { name: string; logo_url?: string }) {
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="flex-shrink-0 mx-4 md:mx-6 w-28 h-16 md:w-36 md:h-20 flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:scale-105 transition-all">
      {logo_url ? (
        <ImgWithFallback
          src={logo_url}
          alt={name}
          className="w-full h-full object-contain p-3"
        />
      ) : (
        <div className="text-center">
          <div className="font-display text-lg md:text-xl font-bold text-gray-400 dark:text-gray-500">{initials}</div>
          <div className="text-[10px] text-gray-400 dark:text-gray-500 truncate max-w-[80px]">{name}</div>
        </div>
      )}
    </div>
  );
}

export default function ClientsSection() {
  const { dict } = useLang();
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    getClients().then(setClients);
  }, []);

  const useApi = clients.length > 0;

  const apiFirstRow: Client[] = useApi ? clients.slice(0, Math.ceil(clients.length / 2)) : [];
  const apiSecondRow: Client[] = useApi ? (clients.slice(Math.ceil(clients.length / 2)).length > 0 ? clients.slice(Math.ceil(clients.length / 2)) : clients) : [];

  const fbFirstRow = fallbackClients.slice(0, 6);
  const fbSecondRow = fallbackClients.slice(6, 12);

  return (
    <section id="clients" className="section-padding bg-white dark:bg-gray-900 overflow-hidden">
      <div className="container-custom mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-6"
          >
            <Users className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">{dict.clients.badge}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          >
            {dict.clients.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          >
            {dict.clients.subtitle}
          </motion.p>
        </div>

        {/* Marquee */}
        <div className="space-y-6">
          {/* Row 1 — left to right */}
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-white dark:from-gray-900 to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-white dark:from-gray-900 to-transparent z-10" />
            <div className="flex overflow-hidden">
              <motion.div
                className="flex"
                animate={{ x: ['0%', '-50%'] }}
                transition={{ x: { duration: 30, repeat: Infinity, ease: 'linear' } }}
              >
                {useApi
                  ? [...apiFirstRow, ...apiFirstRow].map((c, idx) => (
                      <ClientLogo key={`${c.id}-${idx}`} name={c.name} logo_url={c.logo_url} />
                    ))
                  : [...fbFirstRow, ...fbFirstRow].map((name, idx) => (
                      <ClientLogo key={`${name}-${idx}`} name={name} />
                    ))}
              </motion.div>
            </div>
          </div>

          {/* Row 2 — right to left */}
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-white dark:from-gray-900 to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-white dark:from-gray-900 to-transparent z-10" />
            <div className="flex overflow-hidden">
              <motion.div
                className="flex"
                animate={{ x: ['-50%', '0%'] }}
                transition={{ x: { duration: 25, repeat: Infinity, ease: 'linear' } }}
              >
                {useApi
                  ? [...apiSecondRow, ...apiSecondRow].map((c, idx) => (
                      <ClientLogo key={`${c.id}-r2-${idx}`} name={c.name} logo_url={c.logo_url} />
                    ))
                  : [...fbSecondRow, ...fbSecondRow].map((name, idx) => (
                      <ClientLogo key={`${name}-r2-${idx}`} name={name} />
                    ))}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="rounded-3xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 p-8 md:p-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '100+', label: 'Trusted Clients' },
                { value: '15+', label: 'Years Experience' },
                { value: '500+', label: 'Products Made' },
                { value: '50M+', label: 'Bottles Produced' },
              ].map((stat) => {
                const match = stat.value.match(/^(\d+)([A-Z]?\+?)$/);
                return (
                  <div key={stat.label} className="text-center">
                    <div className="font-display text-2xl md:text-4xl font-bold text-white mb-1">
                      {match ? (
                        <CountUp end={parseInt(match[1], 10)} suffix={match[2] || ''} duration={2500} />
                      ) : (
                        stat.value
                      )}
                    </div>
                    <div className="text-gray-400 text-sm">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
