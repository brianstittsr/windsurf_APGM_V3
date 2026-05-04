'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Camera, Sparkles, ArrowRight } from 'lucide-react';

// Each entry is a [before, after] pair using pre-cropped images from /images/edited/
const galleryPairs: [string, string][] = [
  ['/images/edited/0C33214B-3B91-4574-A6BA-C7DF98121702_1_102_o_before.jpg',  '/images/edited/0C33214B-3B91-4574-A6BA-C7DF98121702_1_102_o_after.jpg'],
  ['/images/edited/18FFAF18-637B-41C5-B7DF-B32CA59E9A7F_1_105_c_before.jpg',  '/images/edited/18FFAF18-637B-41C5-B7DF-B32CA59E9A7F_1_105_c_after.jpg'],
  ['/images/edited/27256B3F-0857-4070-AD73-939BAD8F609F_1_105_c_before.jpg',  '/images/edited/27256B3F-0857-4070-AD73-939BAD8F609F_1_105_c_after.jpg'],
  ['/images/edited/29F668EA-399A-4A32-B81D-620E9EA4788F_1_105_c_before.jpg',  '/images/edited/29F668EA-399A-4A32-B81D-620E9EA4788F_1_105_c_after.jpg'],
  ['/images/edited/6E06ACA2-DFC1-4B18-8086-064A35366BFD_1_102_o_before.jpg',  '/images/edited/6E06ACA2-DFC1-4B18-8086-064A35366BFD_1_102_o_after.jpg'],
  ['/images/edited/7151A3CA-9B4E-43C4-B1B6-F84ADAE6296D_1_102_o_before.jpg',  '/images/edited/7151A3CA-9B4E-43C4-B1B6-F84ADAE6296D_1_102_o_after.jpg'],
  ['/images/edited/A5BF43BF-8A9F-4C3A-9E03-C938A9E0E67F_1_102_o_before.jpg',  '/images/edited/A5BF43BF-8A9F-4C3A-9E03-C938A9E0E67F_1_102_o_after.jpg'],
  ['/images/edited/AEB29E0F-C582-4264-9FF6-FE2C4CEAEA85_4_5005_c_before.jpg', '/images/edited/AEB29E0F-C582-4264-9FF6-FE2C4CEAEA85_4_5005_c_after.jpg'],
  ['/images/edited/D06690BA-A746-4AFA-AFBF-8B76BE6A777F_1_102_o_before.jpg',  '/images/edited/D06690BA-A746-4AFA-AFBF-8B76BE6A777F_1_102_o_after.jpg'],
];

// Pre-cropped images already have the correct half + label baked in.
// Each panel just displays its image with cover sizing — no stretching, no CSS tricks.

interface PanelProps {
  src: string;
  side: 'before' | 'after';
  visible: boolean;
  delay: number;
}

function HalfPanel({ src, side, visible, delay }: PanelProps) {
  return (
    <div
      style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        opacity: visible ? 1 : 0,
        transition: `opacity 800ms ease-in-out ${delay}ms`,
        minHeight: '100%',
      }}
    >
      {/* Pre-cropped image fills panel without stretching */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
        }}
      />
    </div>
  );
}

export default function GalleryPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<'entering' | 'holding' | 'exiting'>('entering');

  // Cycle: entering (0ms) → holding (2000ms) → exiting (5000ms) → next (6000ms)
  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase('holding'), 2000);
    const exitTimer = setTimeout(() => setPhase('exiting'), 5000);
    const nextTimer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % galleryPairs.length);
      setPhase('entering');
    }, 6000);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(nextTimer);
    };
  }, [currentIndex]);

  // Both panels visible during entering + holding; hidden during exiting
  const pairVisible = phase !== 'exiting';
  // Before fades in at 0ms delay, After at 1200ms delay (only on enter)
  const beforeDelay = phase === 'entering' ? 0 : 0;
  const afterDelay = phase === 'entering' ? 1200 : 0;

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    setPhase('entering');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-br from-[#AD6269] to-[#8B4A52]">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Camera className="w-5 h-5 text-white" />
                <span className="text-white font-medium">Our Work</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Transformations That <span className="italic">Speak</span>
              </h1>
              <p className="text-xl text-white/90 leading-relaxed">
                Browse through our gallery of stunning permanent makeup results.
                Each image represents a client&apos;s journey to enhanced natural beauty.
              </p>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">

              {/* Before / After Pair */}
              <div
                style={{
                  display: 'flex',
                  gap: 16,
                  width: '100%',
                  height: 'clamp(320px, 55vw, 560px)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <HalfPanel
                  src={galleryPairs[currentIndex][0]}
                  side="before"
                  visible={pairVisible}
                  delay={beforeDelay}
                />
                <HalfPanel
                  src={galleryPairs[currentIndex][1]}
                  side="after"
                  visible={pairVisible}
                  delay={afterDelay}
                />
              </div>

              {/* Dot Navigation */}
              <div className="flex justify-center gap-3 flex-wrap mt-8">
                {galleryPairs.map((_: [string, string], index: number) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className={`h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'bg-[#AD6269] w-8'
                        : 'bg-gray-300 hover:bg-gray-400 w-3'
                    }`}
                    aria-label={`Go to transformation ${index + 1}`}
                  />
                ))}
              </div>

              {/* Gallery Description */}
              <div className="mt-12 text-center max-w-3xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  See the Difference Quality Makes
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Every transformation in our gallery showcases Victoria&apos;s attention to detail and artistry.
                  From natural microblading to vibrant lip blushing, each client receives personalized
                  treatment tailored to their unique features and beauty goals.
                </p>
                <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#AD6269] rounded-full" />
                    Microblading &amp; Ombre Brows
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#AD6269] rounded-full" />
                    Lip Blushing
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#AD6269] rounded-full" />
                    Permanent Eyeliner
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20 bg-gradient-to-br from-[#AD6269]/5 to-[#8B4A52]/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-6">
                <Sparkles className="w-5 h-5 text-[#AD6269]" />
                <span className="text-gray-700 font-medium">Ready for Your Transformation?</span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Book Your <span className="text-[#AD6269]">Free</span> Consultation
              </h2>

              <p className="text-xl text-gray-600 leading-relaxed mb-8 max-w-2xl mx-auto">
                Take the first step toward effortless beauty. During your complimentary consultation,
                Victoria will discuss your goals, assess your features, and create a personalized
                plan just for you.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/book-now-custom"
                  className="group inline-flex items-center gap-3 bg-gradient-to-r from-[#AD6269] to-[#8B4A52] text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  Schedule Consultation
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="tel:919-441-0932"
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-[#AD6269] transition-colors font-medium"
                >
                  <span className="text-sm">Or call</span>
                  <span className="text-lg">(919) 441-0932</span>
                </a>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Consultations include brow mapping, color selection, and personalized recommendations.
                  No obligation required.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
