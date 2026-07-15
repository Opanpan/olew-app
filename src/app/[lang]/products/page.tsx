import { redirect } from 'next/navigation';
import ProductsLanding from '@/components/catalog/ProductsLanding';

interface ProductsPageProps {
  params: { lang: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function ProductsPage({ params, searchParams }: ProductsPageProps) {
  const { lang } = params;
  const cat = typeof searchParams.cat === 'string' ? searchParams.cat : null;
  const sCat = typeof searchParams.s_cat === 'string' ? searchParams.s_cat : null;

  // Redirect to the typed catalog page with optional category filter
  if (cat === 'bottles') {
    const dest = sCat ? `/${lang}/bottles?category_id=${sCat}` : `/${lang}/bottles`;
    redirect(dest);
  }
  if (cat === 'caps') {
    const dest = sCat ? `/${lang}/caps?category_id=${sCat}` : `/${lang}/caps`;
    redirect(dest);
  }
  if (cat === 'pot') {
    const dest = sCat ? `/${lang}/pot?category_id=${sCat}` : `/${lang}/pot`;
    redirect(dest);
  }

  return <ProductsLanding />;
}
