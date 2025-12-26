'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HeroSlide } from '@/types/heroSlide';
import { HeroSlideService } from '@/services/heroSlideService';

interface HeroCarouselProps {
  slides?: HeroSlide[];
  autoPlay?: boolean;
  interval?: number;
}

export default function HeroCarousel({ slides: propSlides, autoPlay = true, interval = 5000 }: HeroCarouselProps) {
  const [slides, setSlides] = useState<HeroSlide[]>(propSlides || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loading, setLoading] = useState(!propSlides);

  useEffect(() => {
    if (!propSlides) {
      loadSlides();
    }
  }, [propSlides]);

  const loadSlides = async () => {
    try {
      const activeSlides = await HeroSlideService.getActiveSlides();
      if (activeSlides.length > 0) {
        setSlides(activeSlides);
      } else {
        // Default slide if none configured
        setSlides([{
          id: 'default',
          title: 'WAKE UP FLAWLESS EVERY DAY!',
          subtitle: 'SOFT NATURAL',
          highlightText: 'PERMANENT MAKEUP',
          backgroundImage: '/images/hero/victoria-escobar-hero-main.jpg',
          buttonText: 'Book Now',
          buttonLink: '/book-now-custom',
          buttonStyle: 'primary',
          textAlignment: 'center',
          overlayOpacity: 40,
          isActive: true,
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error loading hero slides:', error);
      // Fallback to default
      setSlides([{
        id: 'default',
        title: 'WAKE UP FLAWLESS EVERY DAY!',
        subtitle: 'SOFT NATURAL',
        highlightText: 'PERMANENT MAKEUP',
        backgroundImage: '/images/hero/victoria-escobar-hero-main.jpg',
        buttonText: 'Book Now',
        buttonLink: '/book-now-custom',
        buttonStyle: 'primary',
        textAlignment: 'center',
        overlayOpacity: 40,
        isActive: true,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [currentIndex, isTransitioning]);

  const nextSlide = useCallback(() => {
    const next = (currentIndex + 1) % slides.length;
    goToSlide(next);
  }, [currentIndex, slides.length, goToSlide]);

  const prevSlide = useCallback(() => {
    const prev = (currentIndex - 1 + slides.length) % slides.length;
    goToSlide(prev);
  }, [currentIndex, slides.length, goToSlide]);

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;
    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, nextSlide, slides.length]);

  if (loading) {
    return (
      <section className="flex items-center justify-center relative overflow-hidden bg-gray-900" style={{ height: '100vh', width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </section>
    );
  }

  if (slides.length === 0) return null;

  const currentSlide = slides[currentIndex];
  const textAlignClass = currentSlide.textAlignment === 'left' ? 'text-left items-start' : currentSlide.textAlignment === 'right' ? 'text-right items-end' : 'text-center items-center';

  return (
    <section id="hero" className="flex items-center relative overflow-hidden" style={{ height: '100vh', width: '100vw', marginTop: '0', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)' }}>
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-500 ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          {/* Background Image/Video */}
          {slide.backgroundVideo ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute top-0 left-0 w-full h-full object-cover"
              style={{ zIndex: -2 }}
            >
              <source src={slide.backgroundVideo} type="video/mp4" />
            </video>
          ) : (
            <div
              className="absolute top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${slide.backgroundImage})`,
                zIndex: -2
              }}
            />
          )}
          
          {/* Overlay */}
          <div 
            className="absolute top-0 left-0 w-full h-full bg-black" 
            style={{ opacity: (slide.overlayOpacity || 40) / 100, zIndex: -1 }}
          />
        </div>
      ))}

      {/* Content */}
      <div className="container mx-auto px-4 py-5 relative z-20">
        <div className={`flex flex-col ${textAlignClass} justify-center min-h-[60vh]`}>
          <div className="w-full lg:w-2/3 mx-auto">
            <div className="mb-4">
              {currentSlide.subtitle && (
                <p className="paragraph-text text-white mb-4 fade-in-1">
                  <span className="text-[#AD6269]">{currentSlide.subtitle}</span>
                  {currentSlide.highlightText && ` ${currentSlide.highlightText}`}
                </p>
              )}
              <h1 className="main-heading font-bold text-white leading-tight">
                {currentSlide.title.split(' ').map((word, i) => (
                  <span key={i} className={`animated-word word-fade-${i + 1}`}>{word} </span>
                ))}
              </h1>
              {currentSlide.description && (
                <p className="text-white/80 text-lg mt-4 max-w-2xl mx-auto fade-in-2">
                  {currentSlide.description}
                </p>
              )}
            </div>

            <div className="flex justify-center gap-4 fade-in-3">
              <Button 
                asChild 
                size="lg" 
                className={`rounded-full px-8 text-base font-semibold ${
                  currentSlide.buttonStyle === 'secondary' 
                    ? 'bg-white text-gray-900 hover:bg-gray-100' 
                    : currentSlide.buttonStyle === 'outline'
                    ? 'bg-transparent border-2 border-white text-white hover:bg-white/10'
                    : 'bg-[#AD6269] hover:bg-[#9d5860]'
                }`}
              >
                <Link href={currentSlide.buttonLink}>
                  {currentSlide.buttonText}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-all"
            aria-label="Previous slide"
          >
            <i className="fas fa-chevron-left text-xl"></i>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-all"
            aria-label="Next slide"
          >
            <i className="fas fa-chevron-right text-xl"></i>
          </button>
        </>
      )}

      {/* Dots Navigation */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-white w-8' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
