import HeroSection from '@/components/sections/HeroSection';
import ShowcaseSection from '@/components/sections/ShowcaseSection';
import VideoSection from '@/components/sections/VideoSection';
import ProductsSection from '@/components/sections/ProductsSection';
import CertificatesSection from '@/components/sections/CertificatesSection';
import ClientsSection from '@/components/sections/ClientsSection';
import CTASection from '@/components/sections/CTASection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ShowcaseSection />
      <VideoSection />
      <ProductsSection />
      <CertificatesSection />
      <ClientsSection />
      <CTASection />
    </>
  );
}
