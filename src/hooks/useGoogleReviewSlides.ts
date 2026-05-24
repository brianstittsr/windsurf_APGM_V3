'use client';

import { useState, useEffect, useCallback } from 'react';
import { HeroSlide } from '@/types/heroSlide';
import { GoogleReview } from '@/types/googleReviews';

interface UseGoogleReviewSlidesOptions {
  maxReviews?: number;
  minRating?: number;
  enabled?: boolean;
}

interface UseGoogleReviewSlidesReturn {
  reviewSlides: HeroSlide[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch Google Reviews and convert them to HeroSlide format
 * for dynamic display in the carousel
 */
export function useGoogleReviewSlides(
  options: UseGoogleReviewSlidesOptions = {}
): UseGoogleReviewSlidesReturn {
  const { maxReviews = 5, minRating = 4, enabled = true } = options;
  
  const [reviewSlides, setReviewSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAndConvertReviews = useCallback(async () => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch reviews from the integrated API
      const response = await fetch('/api/reviews/google-integrated');
      const result = await response.json();
      
      if (!result.success) {
        if (result.notConfigured) {
          setError('Google Reviews not configured');
          return;
        }
        throw new Error(result.error || 'Failed to fetch reviews');
      }
      
      const reviews: GoogleReview[] = result.data?.reviews || [];
      
      if (reviews.length === 0) {
        setReviewSlides([]);
        return;
      }
      
      // Filter by minimum rating and sort by date (newest first)
      const filteredReviews = reviews
        .filter((review: GoogleReview) => review.rating >= minRating)
        .sort((a: GoogleReview, b: GoogleReview) => b.time - a.time)
        .slice(0, maxReviews);
      
      // Convert reviews to HeroSlide format
      const slides: HeroSlide[] = filteredReviews.map((review: GoogleReview, index: number) => {
        // Format the date from the review
        const reviewDate = new Date(review.time * 1000);
        const formattedDate = reviewDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        // Calculate relative time description
        const now = new Date();
        const diffInDays = Math.floor((now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24));
        let relativeTime = '';
        if (diffInDays === 0) relativeTime = 'Today';
        else if (diffInDays === 1) relativeTime = 'Yesterday';
        else if (diffInDays < 7) relativeTime = `${diffInDays} days ago`;
        else if (diffInDays < 30) relativeTime = `${Math.floor(diffInDays / 7)} weeks ago`;
        else if (diffInDays < 365) relativeTime = `${Math.floor(diffInDays / 30)} months ago`;
        else relativeTime = `${Math.floor(diffInDays / 365)} years ago`;
        
        return {
          id: `google-review-${review.time}-${index}`,
          title: 'What Our Clients Say',
          hideTitle: false,
          backgroundImage: '', // No background image for review slides - uses gradient
          buttonText: 'Book Now',
          buttonLink: '/contact',
          buttonStyle: 'primary',
          textAlignment: 'center',
          overlayOpacity: 10,
          isActive: true,
          order: 100 + index, // Place after regular slides
          createdAt: reviewDate,
          updatedAt: new Date(),
          styleType: 'google-review',
          reviewerName: review.authorName,
          reviewRating: review.rating,
          reviewDate: `${formattedDate} • ${relativeTime}`,
          reviewText: review.text,
          afterPhoto: review.profilePhotoUrl || '',
        };
      });
      
      setReviewSlides(slides);
    } catch (err: any) {
      console.error('Error fetching Google Reviews for carousel:', err);
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [enabled, maxReviews, minRating]);

  useEffect(() => {
    fetchAndConvertReviews();
  }, [fetchAndConvertReviews]);

  return {
    reviewSlides,
    loading,
    error,
    refetch: fetchAndConvertReviews,
  };
}

export default useGoogleReviewSlides;
