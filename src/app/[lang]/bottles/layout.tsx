import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const isIndonesian = params.lang === 'id';

  return {
    title: isIndonesian
      ? 'Botol Premium untuk Setiap Kebutuhan | Olew Group'
      : 'Premium Bottles for Every Need | Olew Group',
    description: isIndonesian
      ? 'Jelajahi rangkaian lengkap botol berkualitas tinggi untuk industri skincare, body care, farmasi, dan parfum. Tersedia berbagai ukuran dan jenis.'
      : 'Explore our extensive range of high-quality bottles designed for skincare, body care, pharmacy, and perfume industries. Various sizes and types available.',
    keywords: isIndonesian
      ? 'botol, botol kaca, botol dropper, botol pump, botol spray, kemasan, botol premium, botol skincare, botol farmasi'
      : 'bottles, glass bottles, dropper bottles, pump bottles, spray bottles, packaging, premium bottles, skincare bottles, pharmacy bottles',
    openGraph: {
      title: isIndonesian ? 'Botol Premium | Olew Group' : 'Premium Bottles | Olew Group',
      description: isIndonesian
        ? 'Rangkaian lengkap botol berkualitas tinggi untuk berbagai industri'
        : 'Extensive range of high-quality bottles for various industries',
      type: 'website',
      locale: isIndonesian ? 'id_ID' : 'en_US',
      siteName: 'Olew Group',
    },
    twitter: {
      card: 'summary_large_image',
      title: isIndonesian ? 'Botol Premium | Olew Group' : 'Premium Bottles | Olew Group',
      description: isIndonesian
        ? 'Rangkaian lengkap botol berkualitas tinggi'
        : 'Extensive range of high-quality bottles',
    },
    alternates: {
      canonical: `/${params.lang}/bottles`,
      languages: {
        'en': '/en/bottles',
        'id': '/id/bottles',
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

export default function BottlesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
