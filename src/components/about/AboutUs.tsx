'use client';

import Link from 'next/link';
import { UtensilsCrossed, Sparkles, FlaskConical, Heart, Building2, BadgeCheck, ArrowRight, MessageCircle } from 'lucide-react';
import { useLang } from '@/lib/LangContext';
import { WHATSAPP_NUMBER } from '@/lib/contact';
import Breadcrumb from '@/components/catalog/Breadcrumb';

const INDUSTRY_ICONS = {
  utensils: UtensilsCrossed,
  sparkles: Sparkles,
  flask: FlaskConical,
  heart: Heart,
} as const;

// Small section label above a heading — plain text, not a pill.
function Eyebrow({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'inverse' }) {
  return (
    <p className={tone === 'inverse' ? 'text-sm font-medium text-primary-300' : 'text-sm font-medium text-primary-700 dark:text-primary-300'}>
      {children}
    </p>
  );
}

export default function AboutUs() {
  const { lang, dict } = useLang();
  const a = dict.about;

  const figures = [
    { value: a.stats.founded_value, label: a.stats.founded },
    { value: a.stats.industries_value, label: a.stats.industries },
    { value: a.stats.certifications_value, label: a.stats.certifications },
    { value: a.stats.clients_value, label: a.stats.clients },
  ];

  const capabilities = [
    { title: a.company_overview_title, body: a.company_overview_description },
    { title: a.innovation_title, body: a.innovation_description },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-950">
      {/* ── Opening ── */}
      <section className="container-custom mx-auto px-4 pb-14 pt-28 md:px-8 md:pb-20 md:pt-32">
        <Breadcrumb items={[{ label: dict.nav.home, href: `/${lang}` }, { label: dict.nav.about }]} />

        <div className="mt-10 max-w-4xl">
          <Eyebrow>{a.badge}</Eyebrow>
          <h1 className="mt-3 font-display text-4xl font-bold leading-[1.1] text-gray-900 dark:text-white md:text-6xl">
            {a.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">{a.subtitle}</p>
        </div>

        <h2 className="sr-only">{a.at_a_glance}</h2>
        {/* 1px gaps over a grey backdrop draw the hairlines at any column count. */}
        <dl className="mt-12 grid grid-cols-2 gap-px border-y border-gray-200 bg-gray-200 dark:border-gray-800 dark:bg-gray-800 md:mt-16 lg:grid-cols-4">
          {figures.map((f) => (
            <div key={f.label} className="flex flex-col-reverse gap-1 bg-gray-50 px-4 py-6 dark:bg-gray-950 md:px-6">
              <dt className="text-sm text-gray-600 dark:text-gray-400">{f.label}</dt>
              <dd className="font-display text-4xl font-bold tabular-nums text-gray-900 dark:text-white md:text-5xl">{f.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── Story ── */}
      <section className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="container-custom mx-auto grid gap-8 px-4 py-16 md:px-8 md:py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div>
            <Eyebrow>{a.story_label}</Eyebrow>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-gray-900 dark:text-white md:text-4xl">
              {a.hero_title}
            </h2>
          </div>
          <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 lg:pt-8">{a.hero_description}</p>
        </div>
      </section>

      {/* ── Capabilities ── */}
      <section className="container-custom mx-auto px-4 py-16 md:px-8 md:py-24">
        <Eyebrow>{a.capabilities_label}</Eyebrow>
        <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-12">
          {capabilities.map((c, i) => (
            <article key={c.title} className="border-t-2 border-gray-900 pt-6 dark:border-white">
              <p className="text-sm tabular-nums text-gray-500 dark:text-gray-400">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{c.title}</h3>
              <p className="mt-4 leading-relaxed text-gray-600 dark:text-gray-400">{c.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Mission & vision: one dark band for rhythm ── */}
      <section className="bg-gray-900 text-white dark:border-y dark:border-gray-800 dark:bg-black">
        <div className="container-custom mx-auto grid gap-14 px-4 py-16 md:px-8 md:py-24 lg:grid-cols-2 lg:gap-20">
          <div>
            <Eyebrow tone="inverse">{a.mission_badge}</Eyebrow>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">{a.mission_title}</h2>
            <ol className="mt-8 divide-y divide-white/15 border-y border-white/15">
              {a.mission_items.map((item, i) => (
                <li key={item.title} className="grid grid-cols-[2.5rem_1fr] gap-2 py-6">
                  <span className="text-sm tabular-nums text-white/50">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-2 leading-relaxed text-white/70">{item.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <Eyebrow tone="inverse">{a.vision_badge}</Eyebrow>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">{a.vision_title}</h2>
            <p className="mt-8 text-lg leading-relaxed text-white/80">{a.vision_description}</p>
            <p className="mt-8 inline-flex items-center gap-2 border-t border-white/15 pt-6 text-sm text-white/80">
              <BadgeCheck className="h-5 w-5 text-primary-300" aria-hidden />
              {dict.certificates.items[0].title}
            </p>
          </div>
        </div>
      </section>

      {/* ── Industries ── */}
      <section className="container-custom mx-auto px-4 py-16 md:px-8 md:py-24">
        <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">{a.industries_title}</h2>
        <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
          {a.industries_items.map((industry) => {
            const Icon = INDUSTRY_ICONS[industry.icon as keyof typeof INDUSTRY_ICONS] ?? Building2;
            return (
              <li key={industry.name} className="border-t border-gray-300 pt-4 dark:border-gray-700">
                <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400" aria-hidden />
                <p className="mt-3 font-medium text-gray-900 dark:text-white">{industry.name}</p>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── Next step ── */}
      <section className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="container-custom mx-auto flex flex-col gap-6 px-4 py-14 md:flex-row md:items-end md:justify-between md:px-8 md:py-16">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">{a.cta_title}</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400">{a.cta_desc}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/${lang}/products`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-gray-300 px-5 text-sm font-medium text-gray-900 hover:border-gray-500 dark:border-gray-700 dark:text-white"
            >
              {dict.nav.all_products}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary-600 px-5 text-sm font-medium text-white hover:bg-primary-700"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              {dict.nav.request_quote}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
