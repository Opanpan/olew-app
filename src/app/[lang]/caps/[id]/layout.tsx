import { Metadata } from 'next';
import { capsData } from '@/data/products';

export async function generateMetadata({ params }: { params: { lang: string; id: string } }): Promise<Metadata> {
  const product = capsData.find((c) => c.id === params.id);
  const isIndonesian = params.lang === 'id';

  if (!product) {
    return {
      title: 'Product Not Found | Welo Group',
    };
  }

  const title = `${product.name} - ${product.type} | Welo Group`;
  const description = isIndonesian
    ? `${product.name} - ${product.type}. Berat: ${product.dimensions.weight}g, Ukuran: ${product.dimensions.width}×${product.dimensions.height}mm. Harga mulai dari $${product.price.toFixed(2)}. Pesanan minimum: ${product.minOrder} pcs.`
    : `${product.name} - ${product.type}. Weight: ${product.dimensions.weight}g, Dimensions: ${product.dimensions.width}×${product.dimensions.height}mm. Starting at $${product.price.toFixed(2)}. Minimum order: ${product.minOrder} pcs.`;

  return {
    title,
    description,
    keywords: isIndonesian
      ? `${product.name}, ${product.type}, tutup, tutup botol, kemasan, ${product.colors.join(', ')}, welo group`
      : `${product.name}, ${product.type}, cap, bottle cap, packaging, ${product.colors.join(', ')}, welo group`,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: isIndonesian ? 'id_ID' : 'en_US',
      siteName: 'Welo Group',
      url: `https://welogroup.com/${params.lang}/caps/${params.id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `/${params.lang}/caps/${params.id}`,
      languages: {
        'en': `/en/caps/${params.id}`,
        'id': `/id/caps/${params.id}`,
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

export default function CapDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
