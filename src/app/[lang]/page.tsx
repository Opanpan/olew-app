import IntroCurtain from '@/components/shared/IntroCurtain';
import HeroSection from '@/components/sections/HeroSection';
import BannersSection from '@/components/sections/BannersSection';
import ShowcaseSection from '@/components/sections/ShowcaseSection';
import VideoSection from '@/components/sections/VideoSection';
import ProductsSection from '@/components/sections/ProductsSection';
import CertificatesSection from '@/components/sections/CertificatesSection';
import ClientsSection from '@/components/sections/ClientsSection';
import CTASection from '@/components/sections/CTASection';
import { getHeroAssemblies } from '@/lib/heroAssembly';

export default async function HomePage() {
  // Resolved here rather than in the client hero, so the featured assemblies'
  // parts are known before first paint.
  const { pot, bottle } = await getHeroAssemblies();

  return (
    <>
      <IntroCurtain />
      <HeroSection pot={pot} bottle={bottle} />
      <ShowcaseSection />
      <VideoSection />
      <ProductsSection />
      <CertificatesSection />
      <ClientsSection />
      <BannersSection />
      <CTASection />
    </>
  );
}
