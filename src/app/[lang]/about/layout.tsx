import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const isIndonesian = params.lang === 'id';

  return {
    title: isIndonesian
      ? 'Tentang PT Olew Group - Memimpin Inovasi Kemasan | Welo Group'
      : 'About PT Olew Group - Leading Packaging Innovation | Welo Group',
    description: isIndonesian
      ? 'Didirikan pada tahun 2018, PT Olew Group telah berkembang menjadi perusahaan kosmetik terkemuka di Asia dengan fasilitas produksi canggih, bersertifikat CPKB dan SJH.'
      : 'Founded in 2018, PT Olew Group has grown into a leading cosmetics company in Asia with state-of-the-art production facilities, CPKB and SJH certified.',
    keywords: isIndonesian
      ? 'PT Olew Group, tentang kami, perusahaan kosmetik, kemasan premium, CPKB, SJH, halal, manufaktur kosmetik, solusi kemasan'
      : 'PT Olew Group, about us, cosmetics company, premium packaging, CPKB, SJH, halal, cosmetics manufacturing, packaging solutions',
    openGraph: {
      title: isIndonesian ? 'Tentang PT Olew Group | Welo Group' : 'About PT Olew Group | Welo Group',
      description: isIndonesian
        ? 'Perusahaan kosmetik terkemuka di Asia dengan teknologi canggih dan sertifikasi internasional'
        : 'Leading cosmetics company in Asia with advanced technology and international certifications',
      type: 'website',
      locale: isIndonesian ? 'id_ID' : 'en_US',
      siteName: 'Welo Group',
    },
    twitter: {
      card: 'summary_large_image',
      title: isIndonesian ? 'Tentang PT Olew Group | Welo Group' : 'About PT Olew Group | Welo Group',
      description: isIndonesian
        ? 'Memimpin inovasi dalam solusi kemasan'
        : 'Leading innovation in packaging solutions',
    },
    alternates: {
      canonical: `/${params.lang}/about`,
      languages: {
        'en': '/en/about',
        'id': '/id/about',
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
