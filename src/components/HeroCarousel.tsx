'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HeroSlide } from '@/types/heroSlide';
import { HeroSlideService } from '@/services/heroSlideService';
import { useGoogleReviewSlides } from '@/hooks/useGoogleReviewSlides';

// Hook to detect mobile screen size
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

// Soft transition types
type TransitionType = 'fade' | 'fadeUp' | 'fadeDown' | 'fadeScale' | 'crossfade' | 'blur';

const TRANSITIONS: TransitionType[] = ['fade', 'fadeUp', 'fadeDown', 'fadeScale', 'crossfade', 'blur'];

interface HeroCarouselProps {
  slides?: HeroSlide[];
  autoPlay?: boolean;
  interval?: number;
  enableDynamicReviews?: boolean;
  maxReviewSlides?: number;
}

export default function HeroCarousel({ 
  slides: propSlides, 
  autoPlay = true, 
  interval = 5000,
  enableDynamicReviews = true,
  maxReviewSlides = 5
}: HeroCarouselProps) {
  const [regularSlides, setRegularSlides] = useState<HeroSlide[]>([]);
  const [allSlides, setAllSlides] = useState<HeroSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadingRegular, setLoadingRegular] = useState(!propSlides);
  const [currentTransition, setCurrentTransition] = useState<TransitionType>('fade');
  const isMobile = useIsMobile();
  
  // Fetch dynamic Google Review slides
  const { reviewSlides, loading: loadingReviews } = useGoogleReviewSlides({
    maxReviews: maxReviewSlides,
    minRating: 4,
    enabled: enableDynamicReviews && !propSlides, // Only fetch if not using prop slides
  });
  
  // Pick a random transition for each slide change
  const pickRandomTransition = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * TRANSITIONS.length);
    setCurrentTransition(TRANSITIONS[randomIndex]);
  }, []);

  // Load regular slides from Firestore
  useEffect(() => {
    if (propSlides) {
      setRegularSlides(propSlides);
      setLoadingRegular(false);
    } else {
      loadRegularSlides();
    }
  }, [propSlides]);

  // Merge regular slides with review slides
  useEffect(() => {
    // Filter out any hardcoded google-review slides from regular slides
    // (they will be replaced by dynamic ones)
    const filteredRegularSlides = regularSlides.filter(
      slide => slide.styleType !== 'google-review' || slide.id?.startsWith('custom-')
    );
    
    // Combine and sort by order
    const combined = [...filteredRegularSlides, ...reviewSlides].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );
    
    setAllSlides(combined);
  }, [regularSlides, reviewSlides]);

  const loadRegularSlides = async () => {
    try {
      const activeSlides = await HeroSlideService.getActiveSlides();
      if (activeSlides.length > 0) {
        setRegularSlides(activeSlides);
      } else {
        // Default slide if none configured
        setRegularSlides([{
          id: 'default',
          title: 'WAKE UP FLAWLESS EVERY DAY!',
          subtitle: 'SOFT NATURAL',
          highlightText: 'PERMANENT MAKEUP',
          backgroundImage: '/images/hero/victoria-escobar-hero-main.jpg',
          buttonText: 'Book Now',
          buttonLink: '/contact',
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
      setRegularSlides([{
        id: 'default',
        title: 'WAKE UP FLAWLESS EVERY DAY!',
        subtitle: 'SOFT NATURAL',
        highlightText: 'PERMANENT MAKEUP',
        backgroundImage: '/images/hero/victoria-escobar-hero-main.jpg',
        buttonText: 'Book Now',
        buttonLink: '/contact',
        buttonStyle: 'primary',
        textAlignment: 'center',
        overlayOpacity: 40,
        isActive: true,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }]);
    } finally {
      setLoadingRegular(false);
    }
  };
  
  // Combined loading state
  const loading = loadingRegular || loadingReviews;

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    pickRandomTransition();
    setPreviousIndex(currentIndex);
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 800);
  }, [currentIndex, isTransitioning, pickRandomTransition]);

  const nextSlide = useCallback(() => {
    const next = (currentIndex + 1) % allSlides.length;
    goToSlide(next);
  }, [currentIndex, allSlides.length, goToSlide]);

  const prevSlide = useCallback(() => {
    const prev = (currentIndex - 1 + allSlides.length) % allSlides.length;
    goToSlide(prev);
  }, [currentIndex, allSlides.length, goToSlide]);

  useEffect(() => {
    if (!autoPlay || allSlides.length <= 1) return;
    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, nextSlide, allSlides.length]);

  if (loading) {
    return (
      <section className="flex items-center justify-center relative overflow-hidden bg-gray-900" style={{ height: '100vh', width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </section>
    );
  }

  if (allSlides.length === 0) return null;

  const currentSlide = allSlides[currentIndex];
  const textAlignClass = currentSlide.textAlignment === 'left' ? 'text-left items-start' : currentSlide.textAlignment === 'right' ? 'text-right items-end' : 'text-center items-center';

  return (
    <section id="hero" className="flex items-center relative overflow-hidden" style={{ height: '100vh', width: '100vw', marginTop: '0', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)' }}>
      {/* Slides */}
      {allSlides.map((slide: HeroSlide, index: number) => {
        const isActive = index === currentIndex;
        const isPrevious = index === previousIndex && isTransitioning;
        
        // Get transition classes based on current transition type
        const getTransitionClasses = () => {
          if (!isActive && !isPrevious) return 'opacity-0 scale-100 translate-y-0 blur-0';
          
          switch (currentTransition) {
            case 'fade':
              return isActive 
                ? 'opacity-100 transition-opacity duration-700 ease-out' 
                : 'opacity-0 transition-opacity duration-700 ease-out';
            case 'fadeUp':
              return isActive 
                ? 'opacity-100 translate-y-0 transition-all duration-700 ease-out' 
                : 'opacity-0 translate-y-8 transition-all duration-700 ease-out';
            case 'fadeDown':
              return isActive 
                ? 'opacity-100 translate-y-0 transition-all duration-700 ease-out' 
                : 'opacity-0 -translate-y-8 transition-all duration-700 ease-out';
            case 'fadeScale':
              return isActive 
                ? 'opacity-100 scale-100 transition-all duration-700 ease-out' 
                : 'opacity-0 scale-95 transition-all duration-700 ease-out';
            case 'crossfade':
              return isActive 
                ? 'opacity-100 transition-opacity duration-1000 ease-in-out' 
                : 'opacity-0 transition-opacity duration-1000 ease-in-out';
            case 'blur':
              return isActive 
                ? 'opacity-100 blur-0 transition-all duration-700 ease-out' 
                : 'opacity-0 blur-sm transition-all duration-700 ease-out';
            default:
              return isActive ? 'opacity-100' : 'opacity-0';
          }
        };
        
        return (
        <div
          key={slide.id}
          className={`absolute inset-0 ${getTransitionClasses()} ${isActive ? 'z-10' : isPrevious ? 'z-5' : 'z-0'}`}
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
          ) : slide.backgroundImage ? (
            <>
              {/* Mobile Background Image - Only visible below 768px */}
              {slide.mobileBackgroundImage && (
                <div
                  className="hero-mobile-bg absolute top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url(${slide.mobileBackgroundImage})`,
                    zIndex: -3
                  }}
                />
              )}
              {/* Desktop Background Image - Visible above 768px, or always if no mobile image */}
              <div
                className={`hero-desktop-bg absolute top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat ${slide.mobileBackgroundImage ? 'md-only' : ''}`}
                style={{
                  backgroundImage: `url(${slide.backgroundImage})`,
                  zIndex: -2
                }}
              />
              <style jsx>{`
                @media (min-width: 768px) {
                  .hero-mobile-bg {
                    display: none !important;
                  }
                }
                @media (max-width: 767px) {
                  .hero-desktop-bg.md-only {
                    display: none !important;
                  }
                }
              `}</style>
            </>
          ) : (
            /* Fallback gradient for slides without background image (e.g., google-review) */
            <div
              className="absolute top-0 left-0 w-full h-full"
              style={{
                background: slide.styleType === 'google-review' 
                  ? 'linear-gradient(135deg, #AD6269 0%, #8B4D52 50%, #6B3A3E 100%)'
                  : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                zIndex: -2
              }}
            />
          )}
          
          {/* Overlay - reduced for gradient backgrounds */}
          <div 
            className="absolute top-0 left-0 w-full h-full bg-black" 
            style={{ 
              opacity: slide.backgroundImage ? (slide.overlayOpacity || 40) / 100 : 0.1, 
              zIndex: -1 
            }}
          />
        </div>
        );
      })}

      {/* Content */}
      <div className="container mx-auto px-4 py-5 relative z-20">
        <div className={`flex flex-col ${textAlignClass} justify-center min-h-[60vh]`}>
          <div className="w-full lg:w-2/3 mx-auto">
            
            {/* Google Review Style */}
            {currentSlide.styleType === 'google-review' ? (
              <div className="fade-in-1">
                {currentSlide.title && !currentSlide.hideTitle && (
                  <h2 className="text-2xl md:text-3xl font-semibold text-white mb-8 text-center" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                    {currentSlide.title}
                  </h2>
                )}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 md:p-8 max-w-2xl mx-auto shadow-2xl">
                  <div className="flex items-start gap-4 mb-4">
                    {currentSlide.afterPhoto ? (
                      <img 
                        src={currentSlide.afterPhoto} 
                        alt={currentSlide.reviewerName || 'Reviewer'} 
                        className="w-16 h-16 rounded-full object-cover border-2 border-[#AD6269]"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[#AD6269]/20 flex items-center justify-center border-2 border-[#AD6269]">
                        <i className="fas fa-user text-2xl text-[#AD6269]"></i>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{currentSlide.reviewerName}</span>
                        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i 
                            key={star} 
                            className={`fas fa-star text-sm ${star <= (currentSlide.reviewRating || 5) ? 'text-yellow-400' : 'text-gray-300'}`}
                          ></i>
                        ))}
                      </div>
                      {currentSlide.reviewDate && (
                        <span className="text-xs text-gray-500">{currentSlide.reviewDate}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 text-base md:text-lg leading-relaxed italic">
                    "{currentSlide.reviewText}"
                  </p>
                </div>
                <div className="flex justify-center gap-4 mt-8 fade-in-3" />
              </div>
            ) : currentSlide.styleType === 'certification' ? (
              /* Certification Style */
              <div className="fade-in-1 text-center">
                {currentSlide.certificationBadge && (
                  <img 
                    src={currentSlide.certificationBadge} 
                    alt={currentSlide.certificationName || 'Certification'} 
                    className="w-32 h-32 md:w-40 md:h-40 mx-auto mb-6 object-contain"
                  />
                )}
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                  {currentSlide.certificationName}
                </h2>
                {currentSlide.certificationOrg && (
                  <p className="text-xl text-white/90 mb-2" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                    {currentSlide.certificationOrg}
                  </p>
                )}
                {currentSlide.certificationYear && (
                  <p className="text-lg text-[#AD6269] font-semibold mb-4">
                    Certified {currentSlide.certificationYear}
                  </p>
                )}
                {currentSlide.title && !currentSlide.hideTitle && (
                  <h1 className="main-heading font-bold text-white leading-tight mt-6">
                    {currentSlide.title}
                  </h1>
                )}
                {currentSlide.description && (
                  <p className="text-white/80 text-lg mt-4 max-w-2xl mx-auto">
                    {currentSlide.description}
                  </p>
                )}
                <div className="flex justify-center gap-4 mt-8 fade-in-3" />
              </div>
            ) : (
              /* Standard Style */
              <>
                <div className="mb-4">
                  {currentSlide.subtitle && (
                    <p className={`paragraph-text mb-4 fade-in-1 tracking-[0.3em] uppercase font-medium ${currentSlide.textGlow ? 'animate-text-glow' : ''}`}>
                      <span style={{ color: currentSlide.subtitleColor || '#AD6269' }}>{currentSlide.subtitle}</span>
                      {currentSlide.highlightText && (
                        <span style={{ color: currentSlide.highlightColor || '#FFFFFF' }}> {currentSlide.highlightText}</span>
                      )}
                    </p>
                  )}
                  {!currentSlide.hideTitle && (
                    <h1 className={`main-heading font-bold leading-tight ${currentSlide.textGlow ? 'animate-text-glow' : ''}`} style={{ color: currentSlide.titleColor || '#FFFFFF' }}>
                      {currentSlide.title.split(' ').map((word: string, i: number) => (
                        <span key={i} className={`animated-word word-fade-${i + 1}`}>{word} </span>
                      ))}
                    </h1>
                  )}
                  {currentSlide.description && (
                    <p className="text-white/80 text-lg mt-4 max-w-2xl mx-auto fade-in-2">
                      {currentSlide.description}
                    </p>
                  )}
                </div>

                <div className="flex justify-center gap-4 fade-in-3" />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {allSlides.length > 1 && (
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
      {allSlides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {allSlides.map((_: HeroSlide, index: number) => (
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
