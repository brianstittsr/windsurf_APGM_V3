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

interface PlaceReview {
  authorName: string;
  authorPhotoUrl?: string;
  rating: number;
  text: string;
  relativeTimeDescription: string;
  time: number;
}

interface PlaceDetails {
  placeId: string;
  name: string;
  formattedAddress: string;
  rating: number;
  userRatingsTotal: number;
  reviews: PlaceReview[];
  url?: string;
  website?: string;
  formattedPhoneNumber?: string;
}

interface SearchResult {
  placeId: string;
  name: string;
  formattedAddress: string;
  rating?: number;
  userRatingsTotal?: number;
}

// ============================================================================
// Component
// ============================================================================

export default function GooglePlacesReviews() {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'settings'>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConfigured, setIsConfigured] = useState(true);

  // Settings
  const [placeId, setPlaceId] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  // Data
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [reviews, setReviews] = useState<PlaceReview[]>([]);
  const [filterRating, setFilterRating] = useState<number>(0);

  // --------------------------------------------------------------------------
  // Load saved settings
  // --------------------------------------------------------------------------

  useEffect(() => {
    const savedPlaceId = localStorage.getItem('google_places_place_id');
    const savedBusinessName = localStorage.getItem('google_places_business_name');
    
    if (savedPlaceId) {
      setPlaceId(savedPlaceId);
      if (savedBusinessName) setBusinessName(savedBusinessName);
      setIsConnected(true);
      loadPlaceDetails(savedPlaceId);
    }
  }, []);

  // --------------------------------------------------------------------------
  // API Calls
  // --------------------------------------------------------------------------

  const searchPlaces = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setError(null);
    setSearchResults([]);

    try {
      const res = await fetch('/api/reviews/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'search', query: searchQuery })
      });
      const data = await res.json();

      if (!data.success) {
        if (data.configured === false) {
          setIsConfigured(false);
          throw new Error('Google Places API not configured');
        }
        throw new Error(data.error || 'Search failed');
      }

      setSearchResults(data.results);
      if (data.results.length === 0) {
        setError('No places found. Try a different search term.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  };

  const loadPlaceDetails = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/reviews/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'details', placeId: id })
      });
      const data = await res.json();

      if (!data.success) {
        if (data.configured === false) {
          setIsConfigured(false);
          throw new Error('Google Places API not configured');
        }
        throw new Error(data.error || 'Failed to load place details');
      }

      setPlaceDetails(data.details);
      setReviews(data.details.reviews || []);
      setBusinessName(data.details.name);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectPlace = (place: SearchResult) => {
    setPlaceId(place.placeId);
    setBusinessName(place.name);
    localStorage.setItem('google_places_place_id', place.placeId);
    localStorage.setItem('google_places_business_name', place.name);
    setIsConnected(true);
    setSearchResults([]);
    setSearchQuery('');
    setSuccessMessage('Business connected! Loading reviews...');
    setTimeout(() => setSuccessMessage(null), 3000);
    loadPlaceDetails(place.placeId);
  };

  const disconnect = () => {
    localStorage.removeItem('google_places_place_id');
    localStorage.removeItem('google_places_business_name');
    setPlaceId('');
    setBusinessName('');
    setIsConnected(false);
    setPlaceDetails(null);
    setReviews([]);
  };

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------

  const getFilteredReviews = (): PlaceReview[] => {
    return reviews.filter(review => {
      if (filterRating > 0 && review.rating !== filterRating) return false;
      return true;
    });
  };

  const getRatingColor = (rating: number): string => {
    if (rating >= 4) return 'text-green-500';
    if (rating >= 3) return 'text-yellow-500';
    return 'text-red-500';
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#4285F4] flex items-center justify-center">
          <span className="text-white text-2xl font-bold">G</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Google Reviews</h2>
          <p className="text-gray-500">
            {isConnected && businessName ? businessName : 'Manage your Google Business Profile reviews'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-[#AD6269] text-[#AD6269]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Overview
            </span>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'reviews'
                ? 'border-[#AD6269] text-[#AD6269]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Reviews
            </span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'settings'
                ? 'border-[#AD6269] text-[#AD6269]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </span>
          </button>
        </nav>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">×</button>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {successMessage}
        </div>
      )}

      {/* Not Configured Notice */}
      {!isConfigured && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-yellow-800">API Not Configured</h3>
                <p className="text-yellow-700 text-sm mt-1">
                  Add <code className="bg-yellow-100 px-1 rounded">GOOGLE_PLACES_API_KEY</code> to your .env.local file to enable Google Reviews.
                </p>
                <p className="text-yellow-600 text-xs mt-2">
                  Get an API key from the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a> and enable the Places API.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Not Connected Notice */}
      {isConfigured && !isConnected && activeTab !== 'settings' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <span className="text-yellow-600 text-xl font-bold">G</span>
              </div>
              <div>
                <h3 className="font-semibold text-yellow-800">Not Connected</h3>
                <p className="text-yellow-700 text-sm mt-1">
                  Connect your Google Business Profile to manage reviews
                </p>
                <Button 
                  className="mt-3 bg-[#AD6269] hover:bg-[#9d5860]"
                  onClick={() => setActiveTab('settings')}
                >
                  Go to Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && isConnected && placeDetails && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Reviews</p>
                    <p className="text-3xl font-bold text-gray-900">{placeDetails.userRatingsTotal}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Average Rating</p>
                    <p className="text-3xl font-bold text-gray-900">{placeDetails.rating.toFixed(1)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${star <= Math.round(placeDetails.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Recent Reviews</p>
                    <p className="text-3xl font-bold text-gray-900">{reviews.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">Showing most recent reviews from Google</p>
              </CardContent>
            </Card>
          </div>

          {/* Business Info */}
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{placeDetails.formattedAddress}</span>
              </div>
              {placeDetails.formattedPhoneNumber && (
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{placeDetails.formattedPhoneNumber}</span>
                </div>
              )}
              {placeDetails.website && (
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <a href={placeDetails.website} target="_blank" rel="noopener noreferrer" className="text-[#AD6269] hover:underline">
                    {placeDetails.website}
                  </a>
                </div>
              )}
              {placeDetails.url && (
                <div className="pt-2">
                  <a 
                    href={placeDetails.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-[#AD6269] hover:underline flex items-center gap-1"
                  >
                    View on Google Maps
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Reviews Preview */}
          {reviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
                <CardDescription>Latest reviews from Google</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.slice(0, 3).map((review, index) => (
                    <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-start gap-3">
                        {review.authorPhotoUrl ? (
                          <img src={review.authorPhotoUrl} alt={review.authorName} className="w-10 h-10 rounded-full" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 font-medium">{review.authorName.charAt(0)}</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{review.authorName}</span>
                            <span className="text-xs text-gray-400">{review.relativeTimeDescription}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            ))}
                          </div>
                          {review.text && (
                            <p className="text-gray-600 text-sm mt-2 line-clamp-2">{review.text}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => setActiveTab('reviews')}
                >
                  View All Reviews
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && isConnected && (
        <div className="space-y-4">
          {/* Filter */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-4">
                <Label className="whitespace-nowrap">Filter by Rating:</Label>
                <select
                  className="flex h-10 w-full max-w-xs rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269]"
                  value={filterRating}
                  onChange={(e) => setFilterRating(parseInt(e.target.value))}
                >
                  <option value={0}>All Ratings</option>
                  <option value={5}>5 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={2}>2 Stars</option>
                  <option value={1}>1 Star</option>
                </select>
                <Button 
                  variant="outline" 
                  onClick={() => loadPlaceDetails(placeId)}
                  disabled={loading}
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reviews List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#AD6269]"></div>
            </div>
          ) : getFilteredReviews().length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No reviews found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {getFilteredReviews().map((review, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      {review.authorPhotoUrl ? (
                        <img src={review.authorPhotoUrl} alt={review.authorName} className="w-12 h-12 rounded-full" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 font-medium text-lg">{review.authorName.charAt(0)}</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900">{review.authorName}</span>
                          <span className="text-sm text-gray-400">{review.relativeTimeDescription}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-5 h-5 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          ))}
                          <span className={`ml-2 font-medium ${getRatingColor(review.rating)}`}>
                            {review.rating}/5
                          </span>
                        </div>
                        {review.text && (
                          <p className="text-gray-600 mt-3">{review.text}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <p className="text-center text-sm text-gray-400">
            Note: Google Places API returns up to 5 most recent reviews. For full review management, apply for Google Business Profile API access.
          </p>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle>Connection Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={isConnected ? 'text-green-600 font-medium' : 'text-gray-500'}>
                  {isConnected ? `Connected to ${businessName}` : 'Not connected'}
                </span>
                {isConnected && (
                  <Button variant="outline" size="sm" onClick={disconnect} className="ml-auto">
                    Disconnect
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Search for Business */}
          <Card>
            <CardHeader className="bg-[#AD6269] text-white rounded-t-lg">
              <CardTitle className="text-lg flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Find Your Business
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-500 mb-4">
                Search for your business on Google to connect and display reviews.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter your business name and city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchPlaces()}
                  className="flex-1"
                />
                <Button 
                  onClick={searchPlaces} 
                  disabled={searching || !searchQuery.trim()}
                  className="bg-[#AD6269] hover:bg-[#9d5860]"
                >
                  {searching ? 'Searching...' : 'Search'}
                </Button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  <Label>Select your business:</Label>
                  {searchResults.map((result) => (
                    <div
                      key={result.placeId}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => selectPlace(result)}
                    >
                      <div className="font-medium text-gray-900">{result.name}</div>
                      <div className="text-sm text-gray-500">{result.formattedAddress}</div>
                      {result.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          <span className="text-sm text-gray-600">{result.rating} ({result.userRatingsTotal} reviews)</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* API Configuration Info */}
          <Card>
            <CardHeader className="bg-gray-600 text-white rounded-t-lg">
              <CardTitle className="text-lg flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                API Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-500 mb-4">
                This feature uses the Google Places API. Add the following to your <code className="bg-gray-100 px-1 rounded">.env.local</code> file:
              </p>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                GOOGLE_PLACES_API_KEY=your_api_key_here
              </div>
              <div className="mt-4 space-y-2 text-sm text-gray-500">
                <p><strong>To get an API key:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-[#AD6269] hover:underline">Google Cloud Console</a></li>
                  <li>Create or select a project</li>
                  <li>Enable the <strong>Places API</strong></li>
                  <li>Go to Credentials → Create Credentials → API Key</li>
                  <li>Copy the key and add it to your .env.local</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
