'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GoogleReviewsService, GoogleReview } from '@/services/googleReviewsService';

interface Review {
  id: string;
  name: string;
  service: string;
  rating: number;
  text: string;
  image: string;
  isApproved: boolean;
  isVisible: boolean;
}

export default function ClientReviews() {
  const [currentReview, setCurrentReview] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to mask last name
  const maskLastName = (fullName: string) => {
    const nameParts = fullName.split(' ');
    if (nameParts.length < 2) return fullName;
    
    const firstName = nameParts[0];
    const lastNameInitial = nameParts[nameParts.length - 1].charAt(0);
    
    return `${firstName} ${lastNameInitial}.`;
  };

  // Fallback reviews if Google Reviews API is unavailable
  const fallbackReviews: Review[] = [
    {
      id: 'fallback-1',
      name: "Sarah Johnson",
      service: "Microblading Eyebrows",
      rating: 5,
      text: "Victoria is absolutely amazing! My eyebrows look so natural and perfect. I wake up every morning feeling confident and beautiful. The whole process was comfortable and professional. I couldn't be happier with the results!",
      image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop",
      isApproved: true,
      isVisible: true
    },
    {
      id: 'fallback-2',
      name: "Emily Chen",
      service: "Permanent Eyeliner",
      rating: 5,
      text: "I was nervous about getting permanent eyeliner, but Victoria made me feel so comfortable. The results are exactly what I wanted - subtle but defined. I save so much time in the morning now!",
      image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop",
      isApproved: true,
      isVisible: true
    },
    {
      id: 'fallback-3',
      name: "Maria Rodriguez",
      service: "Lip Blushing",
      rating: 5,
      text: "My lips have never looked better! The color is perfect for my skin tone and looks so natural. Victoria is a true artist. I get compliments every day and people can't believe it's permanent makeup.",
      image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop",
      isApproved: true,
      isVisible: true
    }
  ];

  // Load reviews from Google Reviews Service (same as admin section)
  useEffect(() => {
    const loadGoogleReviews = async () => {
      try {
        // Use the same service as the admin section
        const result = await GoogleReviewsService.getReviews();
        
        if (result.success && result.data && result.data.reviews && result.data.reviews.length > 0) {
          // Filter to 4+ star reviews and sort by date
          const filteredReviews = GoogleReviewsService.filterByRating(result.data.reviews, 4);
          const sortedReviews = GoogleReviewsService.sortReviews(filteredReviews, 'date');
          
          // Transform Google Reviews to our Review format
          const googleReviews: Review[] = sortedReviews
            .slice(0, 6) // Limit to 6 reviews
            .map((review: GoogleReview, index: number) => ({
              id: `google-${index}`,
              name: review.author_name || 'Anonymous',
              service: 'Google Review',
              rating: review.rating,
              text: review.text || '',
              image: review.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.author_name || 'A')}&background=AD6269&color=fff&size=80`,
              isApproved: true,
              isVisible: true
            }));
          
          if (googleReviews.length > 0) {
            console.log(`Loaded ${googleReviews.length} Google Reviews from service`);
            setReviews(googleReviews);
          } else {
            console.log('No qualifying Google Reviews, using fallback');
            setReviews(fallbackReviews);
          }
        } else {
          console.log('Google Reviews not available, using fallback');
          setReviews(fallbackReviews);
        }
      } catch (error) {
        console.error('Error loading Google Reviews:', error);
        setReviews(fallbackReviews);
      } finally {
        setLoading(false);
      }
    };

    loadGoogleReviews();
  }, []);

  // Auto-rotate reviews every 5 seconds
  useEffect(() => {
    if (reviews.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
    }, 5000);

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

  if (loading) {
    return (
      <section id="reviews" className="py-section bg-white">
        <div className="container">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading reviews...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="reviews" className="py-section bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="main-heading font-bold text-gray-900 mb-4">
            Client
            <span className="text-rose-600"> Reviews</span>
          </h2>
          <p className="paragraph-text text-gray-600 mx-auto max-w-3xl">
            Don&apos;t just take our word for it. Here&apos;s what our amazing clients have to say about their 
            permanent makeup experience with Victoria.
          </p>
        </div>



        {/* Review Carousel with Navigation Dots */}
        <div className="flex gap-8 max-w-4xl mx-auto">
          {/* Navigation Dots */}
          <div className="flex flex-col gap-3 pt-4">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentReview(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentReview ? 'bg-gray-800 scale-125' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`View review ${index + 1}`}
              />
            ))}
          </div>

          {/* Review Carousel */}
          <div className="flex-1 relative overflow-hidden" style={{ minHeight: '180px' }}>
            {reviews.map((review, index) => (
              <div
                key={review.id}
                className={`absolute top-0 left-0 w-full transition-all duration-700 ease-in-out ${
                  index === currentReview ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
                }`}
              >
                <div className="flex gap-6 items-start">
                  {/* Profile Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={review.image}
                      alt={review.name}
                      className="rounded-full w-24 h-24 object-cover border-2 border-gray-100 shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.name)}&background=AD6269&color=fff&size=96`;
                      }}
                    />
                    <div className="text-center mt-3">
                      <div className="font-semibold text-gray-900 text-base">{maskLastName(review.name)}</div>
                      <div className="text-rose-600 text-sm">{review.service}</div>
                      {/* Star Rating */}
                      <div className="flex justify-center mt-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                  </div>

                  {/* Review Text */}
                  <div className="flex-1">
                    <p className="text-gray-700 leading-relaxed text-lg">
                      &quot;{review.text}&quot;
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-[#AD6269] rounded-xl p-8 text-white mx-auto max-w-4xl">
            <h3 className="main-heading font-bold text-white mb-4">
              Book Now
            </h3>
            <p className="paragraph-text mb-6" style={{ color: 'white' }}>
              Experience the confidence and convenience of permanent makeup. 
              Book your free consultation today and start your transformation journey.
            </p>
            <div className="flex justify-center">
              <Link href="/book-now-custom" className="inline-block bg-white text-[#AD6269] rounded-full px-8 py-3 font-semibold hover:bg-gray-100 transition-colors">
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
