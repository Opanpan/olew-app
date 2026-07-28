import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const isIndonesian = params.lang === 'id';

  return {
    title: isIndonesian
      ? 'Pot Premium untuk Setiap Kebutuhan | Olew Group'
      : 'Premium Pots for Every Need | Olew Group',
    description: isIndonesian
      ? 'Jelajahi rangkaian pot dalam dan pot luar berkualitas tinggi untuk krim, balsem, dan perawatan kosmetik.'
      : 'Explore our range of high-quality inner and outer pots designed for creams, balms, and cosmetic treatments.',
    keywords: isIndonesian
      ? 'pot, pot dalam, pot luar, pot kosmetik, kemasan, pot krim, pot premium'
      : 'pot, jar, inner pot, outer pot, cosmetic jar, packaging, cream jar, premium pot',
    openGraph: {
      title: isIndonesian ? 'Pot Premium | Olew Group' : 'Premium Pots | Olew Group',
      description: isIndonesian
        ? 'Rangkaian lengkap pot berkualitas tinggi untuk berbagai kebutuhan'
        : 'Extensive range of high-quality pots for various needs',
      type: 'website',
      locale: isIndonesian ? 'id_ID' : 'en_US',
      siteName: 'Olew Group',
    },
    twitter: {
      card: 'summary_large_image',
      title: isIndonesian ? 'Pot Premium | Olew Group' : 'Premium Pots | Olew Group',
      description: isIndonesian
        ? 'Rangkaian lengkap pot berkualitas tinggi'
        : 'Extensive range of high-quality pots',
    },
    alternates: {
      canonical: `/${params.lang}/products/pot`,
      languages: {
        'en': '/en/products/pot',
        'id': '/id/products/pot',
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

export default function PotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
