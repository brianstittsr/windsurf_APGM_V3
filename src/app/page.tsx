import Header from '@/components/Header';
import HeroCarousel from '@/components/HeroCarousel';
import TrustBadges from '@/components/TrustBadges';
import PermanentMakeupForYou from '@/components/PermanentMakeupForYou';
import TheProcess from '@/components/TheProcess';
import AboutVictoria from '@/components/AboutVictoria';
import FAQ from '@/components/FAQ';
import CTABanner from '@/components/CTABanner';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroCarousel />
      <TrustBadges />
      <PermanentMakeupForYou />
      <TheProcess />
      <AboutVictoria />
      <FAQ />
      <CTABanner />
      <Footer />
    </div>
  );
}
