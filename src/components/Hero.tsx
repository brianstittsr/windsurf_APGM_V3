'use client';

import Link from 'next/link';

export default function Hero() {
  return (
    <section id="hero" className="min-vh-100 d-flex align-items-center position-relative overflow-hidden" style={{ paddingTop: '140px' }}>
      {/* Optimized Image Background */}
      <div 
        className="position-absolute top-0 start-0 w-100 h-100" 
        style={{
          backgroundImage: 'url(/images/hero/hero-main.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: -2
        }}
      ></div>
      
      {/* Dark overlay for text readability */}
      <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark" style={{opacity: 0.4, zIndex: -1}}></div>
      
      <div className="container py-5 position-relative">
        <div className="row justify-content-center">
          <div className="col-lg-8 text-center">
            <div className="mb-4">
              <p className="paragraph-text text-white lh-base mb-4 fade-in-1">
                <span className="text-rose-600">SOFT NATURAL</span> SEMI-PERMANENT MAKEUP
              </p>
              <h1 className="main-heading fw-bold text-white lh-1">
                <span className="animated-word word-fade-1">WAKE</span>
                <span className="animated-word word-fade-2">UP</span>
                <span className="animated-word word-fade-3">FLAWLESS</span>
                <span className="animated-word word-fade-4">EVERY</span>
                <span className="animated-word word-fade-5">DAY!</span>
              </h1>
            </div>

            <div className="d-flex justify-content-center fade-in-3">
              <Link
                href="/book-now-custom"
                className="btn btn-primary btn-lg rounded-pill px-4 text-decoration-none book-now-text"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
        
      </div>
      
      {/* Online Consultation Button with Black Ribbon - Anchored to Bottom Center */}
      <div className="position-absolute bottom-0 start-0 w-100" style={{ zIndex: 1 }}>
        <div 
          className="d-flex justify-content-center align-items-center py-3"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(5px)'
          }}
        >
          <Link
            href="/contact"
            className="btn btn-light btn-lg rounded-pill px-5 text-decoration-none shadow-sm"
            style={{
              fontWeight: '600',
              letterSpacing: '0.5px'
            }}
          >
            Online Consultation
          </Link>
        </div>
      </div>
    </section>
  );
}
