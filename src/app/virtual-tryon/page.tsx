'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { VirtualTryOn } from '@/components/virtual-tryon/VirtualTryOn';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Virtual Try-On - Permanent Makeup Raleigh NC',
  description: 'Try on different permanent makeup eyebrow styles virtually. Upload your photo and see microblading, ombré, combo, and powder styles.',
  keywords: [
    'virtual try-on permanent makeup Raleigh NC',
    'eyebrow style try-on Raleigh',
    'microblading virtual try-on',
    'permanent makeup style preview',
    'eyebrow virtual consultation Raleigh'
  ],
  alternates: {
    canonical: '/virtual-tryon'
  },
  openGraph: {
    title: 'Virtual Try-On - A Pretty Girl Matter',
    description: 'Try on different permanent makeup eyebrow styles virtually. See how microblading, ombré, and combo brows look on you.',
    url: '/virtual-tryon',
    type: 'website'
  }
};

export default function VirtualTryOnPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-vh-100 d-flex flex-column">
        <Header />
        <main className="flex-grow-1 pt-header">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-secondary">Loading virtual try-on...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header />
      
      <main className="flex-grow-1 pt-header">
        <VirtualTryOn />
      </main>

      <Footer />
    </div>
  );
}
