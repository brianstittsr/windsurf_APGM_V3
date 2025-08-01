import Header from '@/components/Header';
import Hero from '@/components/Hero';
import PermanentMakeupForYou from '@/components/PermanentMakeupForYou';
import TheProcess from '@/components/TheProcess';
import ClientReviews from '@/components/ClientReviews';
import AboutVictoria from '@/components/AboutVictoria';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <PermanentMakeupForYou />
      <TheProcess />
      <ClientReviews />
      <AboutVictoria />
      <Footer />
    </div>
  );
}
