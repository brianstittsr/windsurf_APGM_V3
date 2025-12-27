'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

// ============================================================================
// Types
// ============================================================================

interface GoogleReview {
  reviewId: string;
  reviewer: {
    displayName: string;
    profilePhotoUrl?: string;
    isAnonymous: boolean;
  };
  starRating: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE';
  comment?: string;
  createTime: string;
  updateTime: string;
  reviewReply?: {
    comment: string;
    updateTime: string;
  };
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    one: number;
    two: number;
    three: number;
    four: number;
    five: number;
  };
  responseRate: number;
  recentReviews: GoogleReview[];
}

interface ReviewTemplate {
  type: 'positive' | 'neutral' | 'negative';
  templates: string[];
}

// ============================================================================
// Component
// ============================================================================

export default function GoogleReviewsDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'settings'>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Settings
  const [accountId, setAccountId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [businessName, setBusinessName] = useState('');

  // Data
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [templates, setTemplates] = useState<ReviewTemplate[]>([]);
  const [filterRating, setFilterRating] = useState<number>(0);
  const [filterReplied, setFilterReplied] = useState<'all' | 'replied' | 'unreplied'>('all');

  // Reply modal
  const [selectedReview, setSelectedReview] = useState<GoogleReview | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [generatingReply, setGeneratingReply] = useState(false);

  // --------------------------------------------------------------------------
  // Load saved settings
  // --------------------------------------------------------------------------

  useEffect(() => {
    const savedAccountId = localStorage.getItem('google_reviews_account_id');
    const savedLocationId = localStorage.getItem('google_reviews_location_id');
    const savedBusinessName = localStorage.getItem('google_reviews_business_name');
    
    if (savedAccountId && savedLocationId) {
      setAccountId(savedAccountId);
      setLocationId(savedLocationId);
      if (savedBusinessName) setBusinessName(savedBusinessName);
      setIsConnected(true);
    }

    loadTemplates();
  }, []);

  // --------------------------------------------------------------------------
  // API Calls
  // --------------------------------------------------------------------------

  const loadTemplates = async () => {
    try {
      const res = await fetch('/api/reviews/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_templates' })
      });
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (err) {
      console.error('Error loading templates:', err);
    }
  };

  const loadStats = async () => {
    if (!accountId || !locationId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/reviews/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'stats',
          accountId,
          locationId
        })
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to load stats');
      }

      setStats(data.stats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    if (!accountId || !locationId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/reviews/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'list_reviews',
          accountId,
          locationId,
          pageSize: 50
        })
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to load reviews');
      }

      setReviews(data.reviews);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateAutoReply = async (review: GoogleReview) => {
    setGeneratingReply(true);
    try {
      const res = await fetch('/api/reviews/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'generate_reply',
          review,
          businessPhone: '(404) 555-1234',
          businessEmail: 'info@atlantaglamourpmu.com'
        })
      });
      const data = await res.json();

      if (data.success) {
        setReplyText(data.suggestedReply);
      }
    } catch (err) {
      console.error('Error generating reply:', err);
    } finally {
      setGeneratingReply(false);
    }
  };

  const submitReply = async () => {
    if (!selectedReview || !replyText.trim()) return;

    setReplying(true);

    try {
      const res = await fetch('/api/reviews/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'reply',
          accountId,
          locationId,
          reviewId: selectedReview.reviewId,
          replyText: replyText.trim()
        })
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to post reply');
      }

      // Refresh reviews
      await loadReviews();
      setSelectedReview(null);
      setReplyText('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setReplying(false);
    }
  };

  const saveSettings = () => {
    localStorage.setItem('google_reviews_account_id', accountId);
    localStorage.setItem('google_reviews_location_id', locationId);
    if (businessName) {
      localStorage.setItem('google_reviews_business_name', businessName);
    }
    setIsConnected(true);
    setSuccessMessage('Settings saved successfully! Loading your reviews...');
    setTimeout(() => setSuccessMessage(null), 3000);
    loadStats();
    loadReviews();
  };

  const startOAuth = async () => {
    try {
      const res = await fetch('/api/reviews/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_auth_url' })
      });
      const data = await res.json();

      if (data.success && data.authUrl) {
        window.open(data.authUrl, '_blank', 'width=600,height=700');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------

  const starRatingToNumber = (rating: string): number => {
    const map: Record<string, number> = {
      'ONE': 1, 'TWO': 2, 'THREE': 3, 'FOUR': 4, 'FIVE': 5
    };
    return map[rating] || 0;
  };


  const getFilteredReviews = (): GoogleReview[] => {
    return reviews.filter(review => {
      // Filter by rating
      if (filterRating > 0) {
        const reviewRating = starRatingToNumber(review.starRating);
        if (reviewRating < filterRating) return false;
      }
      
      // Filter by reply status
      if (filterReplied === 'replied' && !review.reviewReply) return false;
      if (filterReplied === 'unreplied' && review.reviewReply) return false;
      
      return true;
    });
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Google Reviews</h1>
            <p className="text-sm text-gray-500">Manage your Google Business Profile reviews</p>
          </div>
        </div>
        {isConnected && (
          <Button 
            variant="outline"
            onClick={() => { loadStats(); loadReviews(); }}
            disabled={loading}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-[#AD6269] text-[#AD6269]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Overview
          </button>
          <button
            onClick={() => { setActiveTab('reviews'); if (isConnected) loadReviews(); }}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'reviews'
                ? 'border-[#AD6269] text-[#AD6269]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Reviews
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'settings'
                ? 'border-[#AD6269] text-[#AD6269]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
        </nav>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {successMessage}
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-green-600 hover:text-green-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Not Connected Notice */}
      {!isConnected && activeTab !== 'settings' && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Please configure your Google Business Profile connection in the Settings tab.
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && isConnected && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#AD6269]"></div>
              <p className="mt-4 text-gray-500">Loading review stats...</p>
            </div>
          ) : stats ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${stats.averageRating >= 4.5 ? 'text-green-500' : stats.averageRating >= 3.5 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {stats.averageRating.toFixed(1)}
                      </div>
                      <div className="flex justify-center gap-0.5 my-2">
                        {[1, 2, 3, 4, 5].map(i => (
                          <svg key={i} className={`w-5 h-5 ${i <= Math.round(stats.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">Average Rating</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-500">{stats.totalReviews}</div>
                      <p className="text-sm text-gray-500 mt-2">Total Reviews</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-500">{stats.responseRate.toFixed(0)}%</div>
                      <p className="text-sm text-gray-500 mt-2">Response Rate</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-[#AD6269]">{stats.ratingDistribution.five}</div>
                      <p className="text-sm text-gray-500 mt-2">5-Star Reviews</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Rating Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Rating Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[5, 4, 3, 2, 1].map(rating => {
                    const count = stats.ratingDistribution[['one', 'two', 'three', 'four', 'five'][rating - 1] as keyof typeof stats.ratingDistribution];
                    const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <span className="w-12 flex items-center gap-1 text-sm font-medium">
                          {rating}
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </span>
                        <div className="flex-1">
                          <Progress value={percentage} className={`h-3 ${rating >= 4 ? '[&>div]:bg-green-500' : rating === 3 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'}`} />
                        </div>
                        <span className="w-16 text-right text-sm text-gray-500">
                          {count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Recent Reviews */}
              {stats.recentReviews.length > 0 && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Recent Reviews</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('reviews')}>
                      View All
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-100">
                      {stats.recentReviews.map(review => (
                        <div key={review.reviewId} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{review.reviewer.displayName}</span>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(i => (
                                  <svg key={i} className={`w-4 h-4 ${i <= starRatingToNumber(review.starRating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.createTime).toLocaleDateString()}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="mt-2 text-gray-600 text-sm">{review.comment}</p>
                          )}
                          {review.reviewReply ? (
                            <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-500">
                                <span className="font-medium text-gray-700">Your reply:</span> {review.reviewReply.comment}
                              </p>
                            </div>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-3"
                              onClick={() => { setSelectedReview(review); generateAutoReply(review); }}
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                              </svg>
                              Reply
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Button onClick={loadStats}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Load Review Stats
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && isConnected && (
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Filter by Rating</Label>
                  <select 
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={filterRating}
                    onChange={(e) => setFilterRating(Number(e.target.value))}
                  >
                    <option value={0}>All Ratings</option>
                    <option value={5}>5 Stars Only</option>
                    <option value={4}>4+ Stars</option>
                    <option value={3}>3+ Stars</option>
                    <option value={2}>2+ Stars</option>
                    <option value={1}>1+ Stars</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Reply Status</Label>
                  <select 
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={filterReplied}
                    onChange={(e) => setFilterReplied(e.target.value as 'all' | 'replied' | 'unreplied')}
                  >
                    <option value="all">All Reviews</option>
                    <option value="replied">Replied</option>
                    <option value="unreplied">Needs Reply</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => { setFilterRating(0); setFilterReplied('all'); }}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#AD6269]"></div>
              <p className="mt-4 text-gray-500">Loading reviews...</p>
            </div>
          ) : getFilteredReviews().length > 0 ? (
            <>
              <p className="text-sm text-gray-500">
                Showing {getFilteredReviews().length} of {reviews.length} reviews
              </p>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100">
                    {getFilteredReviews().map((review: GoogleReview) => (
                      <div key={review.reviewId} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex gap-4">
                            {review.reviewer.profilePhotoUrl ? (
                              <img 
                                src={review.reviewer.profilePhotoUrl} 
                                alt={review.reviewer.displayName}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-[#AD6269] text-white flex items-center justify-center text-lg font-medium">
                                {review.reviewer.displayName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{review.reviewer.displayName}</span>
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                              </div>
                              <div className="flex gap-0.5 my-1">
                                {[1, 2, 3, 4, 5].map(i => (
                                  <svg key={i} className={`w-4 h-4 ${i <= starRatingToNumber(review.starRating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.createTime).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                          <div>
                            {review.reviewReply ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Replied
                              </span>
                            ) : (
                              <Button 
                                size="sm"
                                onClick={() => { setSelectedReview(review); generateAutoReply(review); }}
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                </svg>
                                Reply
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {review.comment && (
                          <div className="mt-4 ml-16">
                            <p className="text-gray-700 whitespace-pre-wrap">{review.comment}</p>
                          </div>
                        )}
                        
                        {review.reviewReply && (
                          <div className="mt-4 ml-16 bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-[#AD6269] flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                </svg>
                                Your Response
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(review.reviewReply.updateTime).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-600">{review.reviewReply.comment}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : reviews.length > 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <p className="text-gray-500 mb-4">No reviews match your filters</p>
              <Button 
                variant="outline"
                onClick={() => { setFilterRating(0); setFilterReplied('all'); }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-500 mb-4">No reviews found</p>
              <Button onClick={loadReviews}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Load Reviews
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Connection Status Card */}
          <Card className={`border-2 ${isConnected ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}>
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${isConnected ? 'text-green-800' : 'text-yellow-800'}`}>
                    {isConnected ? 'Connected to Google Business Profile' : 'Not Connected'}
                  </h3>
                  <p className={`text-sm ${isConnected ? 'text-green-600' : 'text-yellow-600'}`}>
                    {isConnected 
                      ? `Account: ${accountId} | Location: ${locationId}`
                      : 'Connect your Google Business Profile to manage reviews'
                    }
                  </p>
                </div>
                {isConnected && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Active
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* OAuth Connection */}
            <Card>
              <CardHeader className="bg-[#AD6269] text-white rounded-t-lg">
                <CardTitle className="text-lg flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Connect via OAuth
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-500 mb-6">
                  The recommended way to connect. This will securely authorize access to your Google Business Profile.
                </p>
                <Button className="w-full bg-[#AD6269] hover:bg-[#9d5860]" size="lg" onClick={startOAuth}>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff"/>
                  </svg>
                  Connect Google Account
                </Button>
                <p className="text-sm text-gray-400 mt-4 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Secure OAuth 2.0 authentication
                </p>
              </CardContent>
            </Card>

            {/* Manual Configuration */}
            <Card>
              <CardHeader className="bg-gray-600 text-white rounded-t-lg">
                <CardTitle className="text-lg flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Manual Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label className="font-medium">Business Name</Label>
                  <Input
                    placeholder="Your Business Name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-medium">Account ID</Label>
                  <Input
                    placeholder="accounts/123456789"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">Format: accounts/YOUR_ACCOUNT_ID</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-medium">Location ID</Label>
                  <Input
                    placeholder="locations/123456789"
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">Format: locations/YOUR_LOCATION_ID</p>
                </div>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={saveSettings}
                  disabled={!accountId || !locationId}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save & Connect
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Environment Variables Info */}
          <Card className="border-blue-200">
            <CardHeader className="bg-blue-500 text-white rounded-t-lg">
              <CardTitle className="text-lg flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
                Server Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-600 mb-4">
                The following environment variables must be set on your server for the Google Business Profile API to work:
              </p>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm space-y-1">
                <div><span className="text-blue-400">GOOGLE_CLIENT_ID</span>=<span className="text-yellow-400">your_client_id</span></div>
                <div><span className="text-blue-400">GOOGLE_CLIENT_SECRET</span>=<span className="text-yellow-400">your_client_secret</span></div>
                <div><span className="text-blue-400">GOOGLE_REFRESH_TOKEN</span>=<span className="text-yellow-400">your_refresh_token</span></div>
              </div>
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">How to get these credentials:</h4>
                <ol className="space-y-2 text-sm text-gray-600">
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#AD6269]/10 text-[#AD6269] flex items-center justify-center text-xs font-medium">1</span>
                    <span>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#AD6269]/10 text-[#AD6269] flex items-center justify-center text-xs font-medium">2</span>
                    <span>Create a new project or select an existing one</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#AD6269]/10 text-[#AD6269] flex items-center justify-center text-xs font-medium">3</span>
                    <span>Enable the <strong>Google My Business API</strong></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#AD6269]/10 text-[#AD6269] flex items-center justify-center text-xs font-medium">4</span>
                    <span>Create OAuth 2.0 credentials (Web application type)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#AD6269]/10 text-[#AD6269] flex items-center justify-center text-xs font-medium">5</span>
                    <span>Add your redirect URI: <code className="bg-gray-100 px-1 rounded text-xs">{typeof window !== 'undefined' ? window.location.origin : ''}/api/auth/google/callback</code></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#AD6269]/10 text-[#AD6269] flex items-center justify-center text-xs font-medium">6</span>
                    <span>Use the OAuth flow to get a refresh token</span>
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reply Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-[#AD6269] text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Reply to Review
              </h3>
              <button 
                onClick={() => { setSelectedReview(null); setReplyText(''); }}
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Original Review Card */}
              <Card>
                <CardHeader className="bg-gray-50 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#AD6269] text-white flex items-center justify-center font-medium">
                      {selectedReview.reviewer.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{selectedReview.reviewer.displayName}</p>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(i => (
                          <svg key={i} className={`w-4 h-4 ${i <= starRatingToNumber(selectedReview.starRating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(selectedReview.createTime).toLocaleDateString()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {selectedReview.comment ? (
                    <p className="text-gray-700">{selectedReview.comment}</p>
                  ) : (
                    <p className="text-gray-400 italic">No comment provided</p>
                  )}
                </CardContent>
              </Card>

              {/* AI Generate Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => generateAutoReply(selectedReview)}
                disabled={generatingReply}
              >
                {generatingReply ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#AD6269] mr-2"></div>
                    Generating AI Reply...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Generate AI Reply
                  </>
                )}
              </Button>

              {/* Quick Templates */}
              <div className="space-y-2">
                <Label className="font-medium">Quick Templates</Label>
                <div className="grid grid-cols-3 gap-2">
                  {templates.map(template => (
                    <Button
                      key={template.type}
                      variant="outline"
                      size="sm"
                      className={`${
                        template.type === 'positive' 
                          ? 'border-green-300 text-green-700 hover:bg-green-50' 
                          : template.type === 'neutral' 
                            ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-50' 
                            : 'border-red-300 text-red-700 hover:bg-red-50'
                      }`}
                      onClick={() => setReplyText(template.templates[0].replace(/{name}/g, selectedReview.reviewer.displayName))}
                    >
                      {template.type === 'positive' ? '😊' : template.type === 'neutral' ? '😐' : '😟'} {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Reply Text */}
              <div className="space-y-2">
                <Label className="font-medium">Your Reply</Label>
                <textarea
                  className="w-full min-h-[150px] p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent resize-y text-sm"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your personalized reply to this review..."
                />
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Be professional and thank the customer for their feedback
                  </span>
                  <span className={replyText.length > 4000 ? 'text-red-500' : 'text-gray-500'}>
                    {replyText.length}/4000
                  </span>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-800 flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Tips for Great Replies
                </h4>
                <ul className="text-sm text-amber-700 space-y-1 ml-7">
                  <li>Always thank the reviewer for their feedback</li>
                  <li>Address specific points mentioned in their review</li>
                  <li>Keep it professional and friendly</li>
                  <li>For negative reviews, offer to resolve issues offline</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end gap-3">
              <Button 
                variant="outline"
                onClick={() => { setSelectedReview(null); setReplyText(''); }}
              >
                Cancel
              </Button>
              <Button 
                className="bg-[#AD6269] hover:bg-[#9d5860]"
                onClick={submitReply}
                disabled={replying || !replyText.trim() || replyText.length > 4000}
              >
                {replying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Posting Reply...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Post Reply to Google
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="text-sm text-blue-800">
          <span className="font-semibold">Configuration Required:</span> This feature requires Google Business Profile API access.
          Set <code className="bg-blue-100 px-1 rounded">GOOGLE_CLIENT_ID</code>, <code className="bg-blue-100 px-1 rounded">GOOGLE_CLIENT_SECRET</code>, and <code className="bg-blue-100 px-1 rounded">GOOGLE_REFRESH_TOKEN</code> environment variables.
        </div>
      </div>
    </div>
  );
}
