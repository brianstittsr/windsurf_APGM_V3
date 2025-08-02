'use client';
import { useState, useEffect } from 'react';

export default function PermanentMakeupForYou() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const images = [
    "/images/hero/jabari-timothy-QoyXM9Jstjs-unsplash.jpg",
    "/images/hero/pexels-theiykeibeh-17791531.jpg",
    "/images/hero/pexels-nicholas-l-2263080-3955875.jpg",
    "/images/hero/pexels-nanipayares-3396244.jpg"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section id="services" className="py-section" style={{ backgroundColor: 'rgba(173, 98, 105, 0.3)' }}>
      <div className="container">
        {/* Header */}
        <div className="text-center mb-5">
          <h2 className="display-2 fw-bold text-dark mb-4">
            <span className="text-rose-600">PERMANENT MAKEUP</span>
            <br />
            DESIGNED JUST FOR YOU
          </h2>
        </div>

        {/* 2-Column Layout */}
        <div className="row g-5 align-items-center">
          {/* Left Side - Image Carousel */}
          <div className="col-lg-6">
            <div className="position-relative" style={{ height: '400px', overflow: 'hidden' }}>
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Beautiful permanent makeup example ${index + 1}`}
                  className="position-absolute top-0 start-0 w-100 h-100 img-fluid rounded-custom-lg shadow-custom-lg"
                  style={{
                    objectFit: 'cover',
                    opacity: index === currentImageIndex ? 1 : 0,
                    transition: 'opacity 1s ease-in-out'
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Right Side - Text Content */}
          <div className="col-lg-6">
            <p className="fs-5 text-secondary mb-3">
              soft or natural to bold and defined...
            </p>
            <h2 className="display-4 fw-bold text-dark mb-4">
              THE CHOICE IS <span className="text-primary">YOURS</span>
            </h2>
            <p className="fs-5 text-secondary lh-base">
              Forget the outdated idea that permanent makeup has to look dark or harsh. At A Pretty Girl Matter, every look is customized to your style and preferences, whether you want a subtle, natural finish or a striking, statement look.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-5">
          <div className="bg-gradient-rose rounded-custom-lg p-5">
            <h3 className="h3 fw-bold text-dark mb-4">
              Not sure which service is right for you?
            </h3>
            <p className="text-secondary mb-4">
              Book a free consultation and let&apos;s discuss the best options for your unique features and lifestyle.
            </p>
            <button className="btn btn-primary rounded-pill px-4 fw-semibold">
              Book Free Consultation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
