import { Metadata } from 'next';
import { bottlesData } from '@/data/products';

export async function generateMetadata({ params }: { params: { lang: string; id: string } }): Promise<Metadata> {
  const product = bottlesData.find((b) => b.id === params.id);
  const isIndonesian = params.lang === 'id';

  if (!product) {
    return {
      title: 'Product Not Found | Welo Group',
    };
  }

  const title = `${product.name} - ${product.type} | Welo Group`;
  const description = isIndonesian
    ? `${product.name} - ${product.type}. Berat: ${product.dimensions.weight}g, Ukuran: ${product.dimensions.width}×${product.dimensions.height}mm${product.dimensions.capacity ? `, Kapasitas: ${product.dimensions.capacity}ml` : ''}. Harga mulai dari $${product.price.toFixed(2)}. Pesanan minimum: ${product.minOrder} pcs.`
    : `${product.name} - ${product.type}. Weight: ${product.dimensions.weight}g, Dimensions: ${product.dimensions.width}×${product.dimensions.height}mm${product.dimensions.capacity ? `, Capacity: ${product.dimensions.capacity}ml` : ''}. Starting at $${product.price.toFixed(2)}. Minimum order: ${product.minOrder} pcs.`;

  return {
    title,
    description,
    keywords: isIndonesian
      ? `${product.name}, ${product.type}, botol, kemasan, ${product.colors.join(', ')}, welo group`
      : `${product.name}, ${product.type}, bottle, packaging, ${product.colors.join(', ')}, welo group`,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: isIndonesian ? 'id_ID' : 'en_US',
      siteName: 'Welo Group',
      url: `https://welogroup.com/${params.lang}/bottles/${params.id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `/${params.lang}/bottles/${params.id}`,
      languages: {
        'en': `/en/bottles/${params.id}`,
        'id': `/id/bottles/${params.id}`,
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

export default function BottleDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
