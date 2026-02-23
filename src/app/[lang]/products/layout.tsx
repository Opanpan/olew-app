import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const isIndonesian = params.lang === 'id';

  return {
    title: isIndonesian
      ? 'Pilih Solusi Kemasan Anda | Olew Group'
      : 'Choose Your Packaging Solution | Olew Group',
    description: isIndonesian
      ? 'Pilih dari botol premium dan tutup inovatif kami untuk menciptakan kemasan sempurna untuk brand Anda. Dipercaya oleh brand terkemuka di seluruh dunia.'
      : 'Select from our premium bottles and innovative caps to create the perfect packaging for your brand. Trusted by leading brands worldwide.',
    keywords: isIndonesian
      ? 'produk kemasan, botol, tutup, botol premium, tutup inovatif, kemasan skincare, kemasan farmasi, kemasan parfum'
      : 'packaging products, bottles, caps, premium bottles, innovative caps, skincare packaging, pharmacy packaging, perfume packaging',
    openGraph: {
      title: isIndonesian ? 'Produk Kemasan | Olew Group' : 'Packaging Products | Olew Group',
      description: isIndonesian
        ? 'Pilih dari botol premium dan tutup inovatif untuk brand Anda'
        : 'Select from premium bottles and innovative caps for your brand',
      type: 'website',
      locale: isIndonesian ? 'id_ID' : 'en_US',
      siteName: 'Olew Group',
    },
    twitter: {
      card: 'summary_large_image',
      title: isIndonesian ? 'Produk Kemasan | Olew Group' : 'Packaging Products | Olew Group',
      description: isIndonesian
        ? 'Pilih dari botol premium dan tutup inovatif'
        : 'Select from premium bottles and innovative caps',
    },
    alternates: {
      canonical: `/${params.lang}/products`,
      languages: {
        'en': '/en/products',
        'id': '/id/products',
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

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
