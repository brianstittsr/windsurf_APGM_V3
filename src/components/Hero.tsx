'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

export default function Hero() {
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video1 = video1Ref.current;
    const video2 = video2Ref.current;

    if (video1 && video2) {
      // Ensure both videos start playing
      const playVideos = async () => {
        try {
          await Promise.all([
            video1.play(),
            video2.play()
          ]);
        } catch (error) {
          console.log('Video autoplay failed:', error);
        }
      };
      
      playVideos();
    }
  }, []);
  return (
    <section id="hero" className="pt-header min-vh-100 d-flex align-items-center position-relative overflow-hidden">
      {/* Video Background 1 */}
      <video 
        ref={video1Ref}
        className="position-absolute top-0 start-0 w-100 h-100 video-bg-1" 
        style={{
          objectFit: 'cover',
          zIndex: -2
        }}
        autoPlay 
        muted 
        loop 
        playsInline
        preload="auto"
      >
        <source src="/images/hero/3181593-uhd_3840_2160_25fps.mp4" type="video/mp4" />
      </video>
      
      {/* Video Background 2 */}
      <video 
        ref={video2Ref}
        className="position-absolute top-0 start-0 w-100 h-100 video-bg-2" 
        style={{
          objectFit: 'cover',
          zIndex: -2
        }}
        autoPlay 
        muted 
        loop 
        playsInline
        preload="auto"
      >
        <source src="/images/hero/3181513-uhd_3840_2160_25fps.mp4" type="video/mp4" />
      </video>
      
      {/* Dark overlay for text readability */}
      <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark" style={{opacity: 0.4, zIndex: -1}}></div>
      
      <div className="container py-5 position-relative">
        <div className="row justify-content-center">
          <div className="col-lg-8 text-center">
            <div className="mb-4">
              <p className="fs-5 text-white lh-base mb-4 fade-in-1">
                <span className="text-rose-600">SOFT NATURAL</span> PERMANENT MAKEUP
              </p>
              <h1 className="display-1 fw-bold text-white lh-1">
                <span className="animated-word word-fade-1">WAKE</span>
                <span className="animated-word word-fade-2">UP</span>
                <span className="animated-word word-fade-3">FLAWLESS</span>
                <span className="animated-word word-fade-4">EVERY</span>
                <span className="animated-word word-fade-5">DAY!</span>
              </h1>
            </div>

            <div className="d-flex justify-content-center fade-in-3">
              <Link
                href="/book-now"
                className="btn btn-primary btn-lg rounded-pill px-4 text-decoration-none"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
        
        {/* Online Consultation Button at bottom */}
        <div className="position-absolute bottom-0 start-50 translate-middle-x mb-4">
          <Link
            href="/contact"
            className="btn btn-outline-light btn-lg rounded-pill px-4 text-decoration-none fade-in-4"
          >
            Online Consultation
          </Link>
        </div>
      </div>
    </section>
  );
}
