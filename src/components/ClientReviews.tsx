'use client';

import { useState, useEffect } from 'react';

export default function ClientReviews() {
  const [currentReview, setCurrentReview] = useState(0);

  const reviews = [
    {
      name: "Sarah Johnson",
      service: "Microblading Eyebrows",
      rating: 5,
      text: "Victoria is absolutely amazing! My eyebrows look so natural and perfect. I wake up every morning feeling confident and beautiful. The whole process was comfortable and professional. I couldn't be happier with the results!",
      image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop",
      beforeAfter: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop"
    },
    {
      name: "Emily Chen",
      service: "Permanent Eyeliner",
      rating: 5,
      text: "I was nervous about getting permanent eyeliner, but Victoria made me feel so comfortable. The results are exactly what I wanted - subtle but defined. I save so much time in the morning now!",
      image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop",
      beforeAfter: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop"
    },
    {
      name: "Maria Rodriguez",
      service: "Lip Blushing",
      rating: 5,
      text: "My lips have never looked better! The color is perfect for my skin tone and looks so natural. Victoria is a true artist. I get compliments every day and people can't believe it's permanent makeup.",
      image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop",
      beforeAfter: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop"
    },
    {
      name: "Jessica Williams",
      service: "Full Package",
      rating: 5,
      text: "I got eyebrows, eyeliner, and lips done by Victoria. The transformation is incredible! I feel like the best version of myself. Victoria's attention to detail and artistry is unmatched.",
      image: "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop",
      beforeAfter: "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop"
    },
    {
      name: "Amanda Davis",
      service: "Microblading Touch-up",
      rating: 5,
      text: "Victoria did my touch-up perfectly. She's so professional and really cares about getting the best results. My eyebrows still look amazing after 2 years. Highly recommend!",
      image: "https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop",
      beforeAfter: "https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop"
    }
  ];

  // Auto-rotate reviews every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [reviews.length]);

  const nextReview = () => {
    setCurrentReview((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-2 h-2 ${i < rating ? 'text-gray-300' : 'text-gray-300'}`}
        style={i < rating ? { color: '#AD6269' } : {}}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <section id="reviews" className="py-section bg-white">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-5">
          <h2 className="display-2 fw-bold text-dark mb-4">
            Client
            <span className="text-rose-600"> Reviews</span>
          </h2>
          <p className="fs-5 text-secondary mx-auto" style={{maxWidth: '48rem'}}>
            Don&apos;t just take our word for it. Here&apos;s what our amazing clients have to say about their 
            permanent makeup experience with Victoria.
          </p>
        </div>

        {/* Stats */}
        <div className="row g-4 mb-5">
          <div className="col-6 col-md-3 text-center">
            <div className="display-4 fw-bold text-primary mb-2">500+</div>
            <div className="text-muted">Happy Clients</div>
          </div>
          <div className="col-6 col-md-3 text-center">
            <div className="display-4 fw-bold text-primary mb-2">5.0</div>
            <div className="text-muted">Average Rating</div>
          </div>
          <div className="col-6 col-md-3 text-center">
            <div className="display-4 fw-bold text-primary mb-2">98%</div>
            <div className="text-muted">Satisfaction Rate</div>
          </div>

        </div>

        {/* Main Review Carousel - HIDDEN */}
        {/*
        <div className="position-relative rounded-3 p-4 p-md-5 mb-5" style={{ backgroundColor: 'rgba(173, 98, 105, 0.3)' }}>
          <div className="position-relative" style={{ minHeight: '20rem' }}>
            {reviews.map((review, index) => (
              <div
                key={index}
                className="position-absolute top-0 start-0 w-100"
                style={{
                  opacity: index === currentReview ? 1 : 0,
                  transition: 'opacity 0.8s ease-in-out',
                  pointerEvents: index === currentReview ? 'auto' : 'none'
                }}
              >
                <div className="row g-4 align-items-center">
                  <div className="col-lg-6">
                    <div className="d-flex align-items-center mb-3">
                      {renderStars(review.rating)}
                    </div>
                    
                    <blockquote className="fs-5 text-muted mb-4 lh-base">
                      &quot;{review.text}&quot;
                    </blockquote>
                    
                    <div className="d-flex align-items-center">
                      <img
                        src={review.image}
                        alt={review.name}
                        className="rounded-circle me-3"
                        style={{width: '4rem', height: '4rem', objectFit: 'cover'}}
                      />
                      <div>
                        <div className="fw-semibold text-dark">{review.name}</div>
                        <div className="text-primary">{review.service}</div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="position-relative">
                      <img
                        src={review.beforeAfter}
                        alt="Before and after results"
                        className="rounded-3 shadow w-100"
                        style={{height: '16rem', objectFit: 'cover'}}
                      />
                      <div className="position-absolute top-0 start-0 m-3 bg-white px-3 py-1 rounded-pill small fw-semibold text-muted">
                        Results
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={prevReview}
            className="position-absolute start-0 top-50 translate-middle-y ms-3 btn btn-light rounded-circle p-2 shadow"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={nextReview}
            className="position-absolute end-0 top-50 translate-middle-y me-3 btn btn-light rounded-circle p-2 shadow"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="d-flex justify-content-center gap-2 mt-4">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentReview(index)}
                className={`btn rounded-circle p-0 ${
                  index === currentReview ? 'bg-primary' : 'bg-secondary'
                }`}
                style={{width: '0.75rem', height: '0.75rem'}}
              />
            ))}
          </div>
        </div>
        */}

        {/* Review Grid */}
        <div className="row g-4">
          {reviews.slice(0, 3).map((review, index) => (
            <div key={index} className="col-md-4">
              <div className="card h-100 border-light rounded-3 p-4 shadow-sm">
                <div className="d-flex justify-content-center mb-3">
                  {renderStars(review.rating)}
                </div>
              
                <p className="text-muted mb-3">
                  &quot;{review.text}&quot;
                </p>
                
                <div className="d-flex align-items-center">
                  <img
                    src={review.image}
                    alt={review.name}
                    className="rounded-circle me-3"
                    style={{width: '3rem', height: '3rem', objectFit: 'cover'}}
                  />
                  <div>
                    <div className="fw-semibold text-dark small">{review.name}</div>
                    <div className="text-primary small">{review.service}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-5">
          <div className="bg-primary rounded-3 p-5 text-white">
            <h3 className="h2 fw-bold mb-3">
              Ready to Join Our Happy Clients?
            </h3>
            <p className="text-white-50 mb-4 mx-auto" style={{maxWidth: '32rem'}}>
              Experience the confidence and convenience of permanent makeup. 
              Book your free consultation today and start your transformation journey.
            </p>
            <button className="btn btn-light text-primary px-4 py-2 rounded-pill fw-semibold">
              Book Your Consultation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
