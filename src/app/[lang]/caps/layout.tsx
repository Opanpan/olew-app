import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const isIndonesian = params.lang === 'id';

  return {
    title: isIndonesian
      ? 'Solusi Tutup Inovatif | Welo Group'
      : 'Innovative Cap Solutions | Welo Group',
    description: isIndonesian
      ? 'Temukan pilihan lengkap tutup fungsional dan estetis untuk semua kebutuhan kemasan Anda. Tersedia berbagai jenis dan ukuran.'
      : 'Discover our comprehensive selection of functional and aesthetic caps for all your packaging needs. Various types and sizes available.',
    keywords: isIndonesian
      ? 'tutup, tutup botol, tutup dropper, tutup pump, tutup spray, tutup magnetik, kemasan, tutup premium'
      : 'caps, bottle caps, dropper caps, pump caps, spray caps, magnetic caps, packaging, premium caps',
    openGraph: {
      title: isIndonesian ? 'Tutup Inovatif | Welo Group' : 'Innovative Caps | Welo Group',
      description: isIndonesian
        ? 'Pilihan lengkap tutup fungsional dan estetis'
        : 'Comprehensive selection of functional and aesthetic caps',
      type: 'website',
      locale: isIndonesian ? 'id_ID' : 'en_US',
      siteName: 'Welo Group',
    },
    twitter: {
      card: 'summary_large_image',
      title: isIndonesian ? 'Tutup Inovatif | Welo Group' : 'Innovative Caps | Welo Group',
      description: isIndonesian
        ? 'Pilihan lengkap tutup fungsional dan estetis'
        : 'Comprehensive selection of functional and aesthetic caps',
    },
    alternates: {
      canonical: `/${params.lang}/caps`,
      languages: {
        'en': '/en/caps',
        'id': '/id/caps',
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

export default function CapsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
