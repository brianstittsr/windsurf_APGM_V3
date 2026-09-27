import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import HeroCarousel from '@/components/HeroCarousel';
import TrustBadges from '@/components/TrustBadges';
import Footer from '../components/Footer';
import { db } from '@/lib/firebase-admin';
import { HeroSlide } from '@/types/heroSlide';

const PermanentMakeupForYou = dynamic(() => import('@/components/PermanentMakeupForYou'), {
  ssr: true,
  loading: () => <section className="py-24 bg-white" />
});

const TheProcess = dynamic(() => import('@/components/TheProcess'), {
  ssr: true,
  loading: () => <section className="py-24 bg-[#AD6269]/5" />
});

const AboutVictoria = dynamic(() => import('@/components/AboutVictoria'), {
  ssr: true,
  loading: () => <section className="py-24 bg-white" />
});

const FAQ = dynamic(() => import('@/components/FAQ'), {
  ssr: true,
  loading: () => <section className="py-24 bg-[#AD6269]/5" />
});

const CTABanner = dynamic(() => import('@/components/CTABanner'), {
  ssr: true,
  loading: () => <section className="py-16 bg-[#AD6269]" />
});

async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    // Fetch all slides and filter/sort in memory to avoid needing a
    // Firestore composite index for isActive + order.
    const snapshot = await db.collection('heroSlides').get();

    if (snapshot.empty) return [];

    const slides = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
        } as HeroSlide;
      })
      .filter((slide) => slide.isActive)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    return slides;
  } catch (error) {
    console.error('Failed to load hero slides:', error);
    return [];
  }
}

export default async function Home() {
  const heroSlides = await getHeroSlides();

  return (
    <div className="min-h-screen">
      <Header />
      <HeroCarousel slides={heroSlides} />
      <TrustBadges />
      <Suspense fallback={<section className="py-24 bg-white" />}>
        <PermanentMakeupForYou />
      </Suspense>
      <Suspense fallback={<section className="py-24 bg-[#AD6269]/5" />}>
        <TheProcess />
      </Suspense>
      <Suspense fallback={<section className="py-24 bg-white" />}>
        <AboutVictoria />
      </Suspense>
      <Suspense fallback={<section className="py-24 bg-[#AD6269]/5" />}>
        <FAQ />
      </Suspense>
      <Suspense fallback={<section className="py-16 bg-[#AD6269]" />}>
        <CTABanner />
      </Suspense>
      <Footer />
    </div>
  );
}
