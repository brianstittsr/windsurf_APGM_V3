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
                  className="hero-mobile-bg absolute top-0 left-0 w-full h-full bg-cover bg-top bg-no-repeat"
                  style={{
                    backgroundImage: `url(${slide.mobileBackgroundImage})`,
                    zIndex: -3
                  }}
                />
              )}
              {/* Desktop Background Image - Visible above 768px, or always if no mobile image */}
              <div
                className={`hero-desktop-bg absolute top-0 left-0 w-full h-full bg-cover bg-top bg-no-repeat ${slide.mobileBackgroundImage ? 'md-only' : ''}`}
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
            
            {/* Google Review Style - Redesigned */}
            {currentSlide.styleType === 'google-review' ? (
              <div className="fade-in-1 flex flex-col items-center justify-center min-h-[50vh]">
                {/* Section Header with Overall Rating */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 mb-4 border border-white/20">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span className="text-white font-semibold">Google Reviews</span>
                  </div>

                  {currentSlide.title && !currentSlide.hideTitle && (
                    <h2
                      className={`text-3xl md:text-4xl font-bold text-white mb-2 ${currentSlide.textGlow ? 'animate-text-glow' : ''}`}
                      style={{
                        color: currentSlide.titleColor || '#FFFFFF',
                        textShadow: currentSlide.textGlow ? '0 0 30px rgba(255,255,255,0.5)' : '2px 2px 4px rgba(0,0,0,0.5)'
                      }}
                    >
                      {currentSlide.title}
                    </h2>
                  )}
                </div>

                {/* Review Card - Modern Design */}
                <div className="bg-white rounded-2xl p-6 md:p-8 max-w-xl w-full mx-auto shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
                  {/* Review Header with Avatar and Info */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="relative">
                      {currentSlide.afterPhoto ? (
                        <img
                          src={currentSlide.afterPhoto}
                          alt={currentSlide.reviewerName || 'Reviewer'}
                          className="w-14 h-14 rounded-full object-cover border-3 border-[#AD6269] shadow-lg"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#AD6269] to-[#8B4D52] flex items-center justify-center shadow-lg">
                          <i className="fas fa-user text-xl text-white"></i>
                        </div>
                      )}
                      {/* Verified Badge */}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                        <i className="fas fa-check text-xs text-white"></i>
                      </div>
                    </div>

                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-lg">{currentSlide.reviewerName}</h4>
                      <div className="flex items-center gap-2">
                        {/* Star Rating */}
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <i
                              key={star}
                              className={`fas fa-star text-sm ${star <= (currentSlide.reviewRating || 5) ? 'text-yellow-400' : 'text-gray-200'}`}
                            ></i>
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{currentSlide.reviewRating}.0</span>
                      </div>
                    </div>

                    {/* Google Logo */}
                    <div className="hidden sm:flex items-center gap-1 text-gray-400">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span className="text-xs">Verified</span>
                    </div>
                  </div>

                  {/* Review Text */}
                  <div className="relative">
                    <i className="fas fa-quote-left text-3xl text-[#AD6269]/20 absolute -top-2 -left-2"></i>
                    <p className="text-gray-700 text-base md:text-lg leading-relaxed pl-6">
                      {currentSlide.reviewText}
                    </p>
                  </div>

                  {/* Review Footer */}
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">{currentSlide.reviewDate}</span>

                    {/* Service Tag (if available) */}
                    {currentSlide.subtitle && (
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${currentSlide.textGlow ? 'animate-text-glow' : ''}`}
                        style={{
                          backgroundColor: currentSlide.subtitleColor || '#AD6269',
                          color: '#FFFFFF',
                          textShadow: currentSlide.textGlow ? '0 0 10px rgba(255,255,255,0.8)' : undefined
                        }}
                      >
                        <i className="fas fa-spa mr-1.5"></i>
                        {currentSlide.subtitle}
                      </span>
                    )}
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8 fade-in-3">
                  <a
                    href="https://www.google.com/search?q=a+pretty+girl+matter+llc+reviews"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Read More Reviews
                  </a>
                  <a
                    href={currentSlide.buttonLink || '/contact'}
                    className="inline-flex items-center justify-center px-6 py-3 bg-[#AD6269] text-white font-semibold rounded-full hover:bg-[#9d5860] transition-colors shadow-lg"
                  >
                    {currentSlide.buttonText || 'Book Now'}
                    <i className="fas fa-arrow-right ml-2"></i>
                  </a>
                </div>
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
                    <p className="paragraph-text text-white mb-4 fade-in-1">
                      <span
                        className={currentSlide.subtitleGlow ? 'animate-text-glow' : ''}
                        style={{
                          color: currentSlide.subtitleColor || '#AD6269',
                          textShadow: currentSlide.subtitleGlow ? '0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3)' : undefined
                        }}
                      >
                        {currentSlide.subtitle}
                      </span>
                      {currentSlide.highlightText && (
                        <span
                          className={currentSlide.highlightGlow ? 'animate-text-glow' : ''}
                          style={{
                            color: currentSlide.highlightColor || '#FFFFFF',
                            textShadow: currentSlide.highlightGlow ? '0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3)' : undefined
                          }}
                        > {currentSlide.highlightText}
                        </span>
                      )}
                    </p>
                  )}
                  {!currentSlide.hideTitle && (
                    <h1 className="main-heading font-bold leading-tight" style={{ color: currentSlide.titleColor || '#FFFFFF' }}>
                      {currentSlide.title.split(' ').map((word: string, i: number) => (
                        <span key={i} className={`animated-word word-fade-${(i % 5) + 1}`}>{word} </span>
                      ))}
                    </h1>
                  )}
                  {currentSlide.description && (
                    <p className="text-white/80 text-lg mt-4 max-w-2xl mx-auto fade-in-2">
                      {currentSlide.description}
                    </p>
                  )}
                </div>

                <div className="flex justify-center gap-4 fade-in-3 mt-8">
                  <a
                    href={currentSlide.buttonLink || '/contact'}
                    className={`inline-flex items-center justify-center px-8 py-4 rounded-full font-semibold transition-all shadow-lg ${
                      currentSlide.buttonStyle === 'secondary'
                        ? 'bg-white text-gray-900 hover:bg-gray-100'
                        : currentSlide.buttonStyle === 'outline'
                        ? 'bg-transparent border-2 border-white text-white hover:bg-white/10'
                        : 'bg-[#AD6269] text-white hover:bg-[#9d5860]'
                    }`}
                  >
                    {currentSlide.buttonText || 'Book Now'}
                  </a>
                </div>
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
