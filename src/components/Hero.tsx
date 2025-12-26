'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Hero() {
  return (
    <section id="hero" className="flex items-center relative overflow-hidden" style={{ height: '100vh', width: '100vw', marginTop: '0', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)' }}>
      {/* Full-screen Background Image */}
      <div
        className="absolute top-0 left-0 w-screen h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/hero/victoria-escobar-hero-main.jpg)',
          zIndex: -2
        }}
      />
      
      {/* Dark overlay for text readability */}
      <div className="absolute top-0 left-0 w-screen h-screen bg-black opacity-40" style={{zIndex: -1}}></div>
      
      <div className="container mx-auto px-4 py-5 relative">
        <div className="flex justify-center">
          <div className="w-full lg:w-2/3 text-center">
            <div className="mb-4">
              <p className="paragraph-text text-white mb-4 fade-in-1">
                <span className="text-rose-600">SOFT NATURAL</span> PERMANENT MAKEUP
              </p>
              <h1 className="main-heading font-bold text-white leading-tight">
                <span className="animated-word word-fade-1">WAKE</span>
                <span className="animated-word word-fade-2">UP</span>
                <span className="animated-word word-fade-3">FLAWLESS</span>
                <span className="animated-word word-fade-4">EVERY</span>
                <span className="animated-word word-fade-5">DAY!</span>
              </h1>
            </div>

            <div className="flex justify-center fade-in-3">
              <Button asChild size="lg" className="rounded-full px-8 bg-[#AD6269] hover:bg-[#9d5860] text-base font-semibold">
                <Link href="/book-now-custom">
                  Book Now
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
      </div>
      
      {/* Online Consultation Button with Black Ribbon - Anchored to Bottom Center */}
      <div className="absolute bottom-0 left-0 w-full" style={{ zIndex: 1 }}>
        <div 
          className="flex justify-center items-center py-3"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(5px)'
          }}
        >
          <Button asChild size="lg" className="rounded-full px-8 bg-white text-gray-900 hover:bg-gray-100 shadow-sm font-semibold tracking-wide">
            <Link href="/contact">
              Online Consultation
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
