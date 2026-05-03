'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { Camera, Sparkles, ArrowRight } from 'lucide-react';

export default function GalleryPage() {
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Actual gallery images from public/images/gallery folder
  const galleryImages = [
    '/images/gallery/0C33214B-3B91-4574-A6BA-C7DF98121702_1_102_o.jpeg',
    '/images/gallery/18FFAF18-637B-41C5-B7DF-B32CA59E9A7F_1_105_c.jpeg',
    '/images/gallery/22667FB6-8A1F-4630-B181-BE2045198FEB_1_102_o.jpeg',
    '/images/gallery/24F722F4-E240-410B-BF86-4FF3479EB0F7_1_105_c.jpeg',
    '/images/gallery/2588E8A8-58BD-4906-A65D-53E8D5890CA7_1_105_c.jpeg',
    '/images/gallery/27256B3F-0857-4070-AD73-939BAD8F609F_1_105_c.jpeg',
    '/images/gallery/29F668EA-399A-4A32-B81D-620E9EA4788F_1_105_c.jpeg',
    '/images/gallery/3EAC1005-39E8-4AA0-95E3-BC4B071B5762_1_105_c.jpeg',
    '/images/gallery/4FEB2DFB-7B7E-4303-ABE7-A135BABBB82B_1_105_c.jpeg',
    '/images/gallery/67FDDF17-8204-426B-83F0-A9BE0E598F57_1_105_c.jpeg',
    '/images/gallery/6E06ACA2-DFC1-4B18-8086-064A35366BFD_1_102_o.jpeg',
    '/images/gallery/6F25D45E-C00F-44FA-AF72-474AC530608F_1_105_c.jpeg',
    '/images/gallery/7151A3CA-9B4E-43C4-B1B6-F84ADAE6296D_1_102_o.jpeg',
    '/images/gallery/9AA12F13-3233-4DB0-94DA-632EAE313DDD_1_105_c.jpeg',
    '/images/gallery/A5BF43BF-8A9F-4C3A-9E03-C938A9E0E67F_1_102_o.jpeg',
    '/images/gallery/AEB29E0F-C582-4264-9FF6-FE2C4CEAEA85_4_5005_c.jpeg',
    '/images/gallery/D06690BA-A746-4AFA-AFBF-8B76BE6A777F_1_102_o.jpeg',
    '/images/gallery/E32A3D73-B56F-4096-97FA-92F88F9A4526_1_102_o.jpeg',
  ];

  useEffect(() => {
    setImages(galleryImages);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-br from-[#AD6269] to-[#8B4A52]">
          <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10" />
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
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#AD6269]" />
              </div>
            ) : images.length === 0 ? (
              /* Empty State */
              <div className="text-center max-w-2xl mx-auto py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-[#AD6269]/10 to-[#8B4A52]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Camera className="w-12 h-12 text-[#AD6269]" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Gallery Coming Soon
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  We&apos;re currently curating our best transformation photos to share with you. 
                  Our portfolio showcases stunning microblading, lip blushing, and permanent eyeliner results.
                </p>
                <p className="text-gray-500 italic">
                  Check back soon to see Victoria&apos;s exceptional artistry!
                </p>
              </div>
            ) : (
              /* Image Gallery */
              <div className="max-w-3xl mx-auto">
                {/* Main Image Display */}
                <div className="relative aspect-[3/4] md:aspect-[4/5] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-2xl mb-8 max-h-[70vh]">
                  {images.map((src, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        index === currentIndex ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <Image
                        src={src}
                        alt={`Permanent makeup transformation ${index + 1}`}
                        fill
                        className="object-contain object-center"
                        sizes="(max-width: 768px) 100vw, 80vw"
                        priority={index === 0}
                        onError={(e) => {
                          // Fallback for missing images
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      {/* Fallback for missing images */}
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#AD6269]/5 to-[#8B4A52]/5">
                        <div className="text-center p-8">
                          <Sparkles className="w-16 h-16 text-[#AD6269]/40 mx-auto mb-4" />
                          <p className="text-gray-400 text-lg">Image {index + 1}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                  {/* Image Counter */}
                  <div className="absolute bottom-6 right-6 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="text-white font-medium">
                      {currentIndex + 1} / {images.length}
                    </span>
                  </div>
                </div>

                {/* Thumbnail Strip */}
                <div className="flex justify-center gap-3 flex-wrap">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentIndex
                          ? 'bg-[#AD6269] w-8'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Gallery Description */}
                <div className="mt-12 text-center max-w-3xl mx-auto">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    See the Difference Quality Makes
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Every image in our gallery showcases Victoria&apos;s attention to detail and artistry. 
                    From natural microblading to vibrant lip blushing, each client receives personalized 
                    treatment tailored to their unique features and beauty goals.
                  </p>
                  <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#AD6269] rounded-full" />
                      Microblading & Ombre Brows
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
            )}
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
