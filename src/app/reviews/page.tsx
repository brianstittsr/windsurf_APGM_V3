'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Star, Calendar, User, ExternalLink, Shield, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GoogleReview {
  authorName: string;
  authorUrl?: string;
  profilePhotoUrl?: string;
  rating: number;
  text: string;
  relativeTimeDescription: string;
  time: number;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  fiveStarCount: number;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reviews/google-integrated');
      const result = await response.json();

      if (!result.success) {
        if (result.notConfigured) {
          setError('Google Reviews not yet configured');
          return;
        }
        throw new Error(result.error || 'Failed to fetch reviews');
      }

      const reviewData: GoogleReview[] = result.data?.reviews || [];
      
      // Sort by date (newest first) and filter 4+ stars
      const filteredReviews = reviewData
        .filter((review: GoogleReview) => review.rating >= 4)
        .sort((a: GoogleReview, b: GoogleReview) => b.time - a.time);

      setReviews(filteredReviews);
      
      // Calculate stats
      const totalReviews = result.data?.reviews?.length || 0;
      const avgRating = result.data?.rating || 0;
      const fiveStarCount = reviewData.filter((r: GoogleReview) => r.rating === 5).length;
      
      setStats({
        totalReviews,
        averageRating: avgRating,
        fiveStarCount
      });
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-12 md:py-20 bg-gradient-to-br from-[#AD6269] to-[#8B4A52] animate-gradient relative overflow-hidden">
          {/* Floating Particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="floating-particle" />
            ))}
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="text-white font-medium">Client Reviews</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                What Our Clients Say
              </h1>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                Real reviews from real clients. See why A Pretty Girl Matter is Raleigh&apos;s trusted choice for permanent makeup.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        {stats && (
          <section className="py-8 bg-white border-b">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                  {/* Overall Rating */}
                  <div className="text-center">
                    <div className="text-5xl font-bold text-[#AD6269]">
                      {stats.averageRating.toFixed(1)}
                    </div>
                    <div className="flex justify-center gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < Math.round(stats.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-500 text-sm mt-1">Average Rating</p>
                  </div>

                  {/* Divider */}
                  <div className="hidden md:block w-px h-20 bg-gray-200" />

                  {/* Total Reviews */}
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900">
                      {stats.totalReviews}
                    </div>
                    <p className="text-gray-500 mt-1">Total Reviews</p>
                  </div>

                  {/* Divider */}
                  <div className="hidden md:block w-px h-20 bg-gray-200" />

                  {/* 5 Star Reviews */}
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900">
                      {stats.fiveStarCount}
                    </div>
                    <div className="flex justify-center gap-0.5 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-500 text-sm mt-1">5-Star Reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Reviews Grid */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#AD6269] border-t-transparent" />
                  <p className="text-gray-500 mt-4">Loading reviews...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">{error}</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No reviews available at this time.</p>
                </div>
              ) : (
                <>
                  {/* Google Verified Badge */}
                  <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
                      <Shield className="w-5 h-5 text-green-600" />
                      <span className="text-green-700 font-medium text-sm">Verified Google Reviews</span>
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reviews.map((review, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100"
                      >
                        {/* Review Header */}
                        <div className="flex items-start gap-3 mb-4">
                          {review.profilePhotoUrl ? (
                            <img
                              src={review.profilePhotoUrl}
                              alt={review.authorName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#AD6269] to-[#8B4A52] flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {review.authorName}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                        </div>

                        {/* Review Text */}
                        <p className="text-gray-600 leading-relaxed mb-4 line-clamp-4">
                          &ldquo;{review.text}&rdquo;
                        </p>

                        {/* Review Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatDate(review.time)}</span>
                          </div>
                          {review.authorUrl && (
                            <a
                              href={review.authorUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-[#AD6269] transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Google Attribution */}
                  <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span>Reviews powered by Google</span>
                      <span className="mx-1">•</span>
                      <a
                        href="https://www.google.com/search?q=a+pretty+girl+matter+llc+reviews"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#AD6269] hover:underline"
                      >
                        View on Google
                      </a>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-[#AD6269]/5 to-[#8B4A52]/5">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Join Our Happy Clients
              </h2>
              <p className="text-gray-600 mb-8">
                Ready to experience the same exceptional service? Book your free consultation today.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-[#AD6269] to-[#8B4A52] text-white px-8 py-6 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Link href="/contact">
                  Book Your Free Consultation
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
