import { notFound } from 'next/navigation';
import { Providers } from '@/components/Providers';
import { LangProvider } from '@/lib/LangContext';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import type { Lang } from '@/lib/dictionary';

const validLangs = ['en', 'id'];

export function generateStaticParams() {
  return validLangs.map((lang) => ({ lang }));
}

export const dynamicParams = true;

export default function LangLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  if (!validLangs.includes(lang)) {
    notFound();
  }

  return (
    <LangProvider lang={lang as Lang}>
      <Providers>
        <div className="flex flex-col min-h-screen">
          <Navigation />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </Providers>
    </LangProvider>
  );
}
