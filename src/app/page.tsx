import Header from '@/components/Header';
import HeroCarousel from '@/components/HeroCarousel';
import PermanentMakeupForYou from '@/components/PermanentMakeupForYou';
import TheProcess from '@/components/TheProcess';
import ClientReviews from '@/components/ClientReviews';
import AboutVictoria from '@/components/AboutVictoria';
import Footer from '../components/Footer';
import ChatbotLoader from '@/components/ChatbotLoader';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroCarousel />
      <PermanentMakeupForYou />
      <TheProcess />
      <ClientReviews />
      <AboutVictoria />
      <Footer />
      <ChatbotLoader />
    </div>
  );
}
