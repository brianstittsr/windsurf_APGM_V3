'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Star, Search, RefreshCw, MapPin, AlertCircle, CheckCircle, User } from 'lucide-react';

interface PlaceResult {
  placeId: string;
  name: string;
  formattedAddress: string;
  rating?: number;
  userRatingsTotal?: number;
}

interface Review {
  authorName: string;
  profilePhotoUrl?: string;
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
  reviews: Review[];
  website?: string;
  formattedPhoneNumber?: string;
}

export default function GooglePlacesReviewsManager() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Configuration
  const [apiKey, setApiKey] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  
  // Search
  const [searchQuery, setSearchQuery] = useState('A Pretty Girl Matter');
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
  const [searching, setSearching] = useState(false);
  
  // Reviews
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Load saved configuration on mount
  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    try {
      const response = await fetch('/api/google-reviews');
      const data = await response.json();
      
      if (!data.notConfigured && data.success) {
        setIsConfigured(true);
        setPlaceDetails(data.data);
        setReviews(data.data?.reviews || []);
      }
    } catch (err) {
      console.error('Error checking configuration:', err);
    }
  };

  const searchPlaces = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    setError(null);
    
    try {
      const response = await fetch('/api/reviews/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'search', query: searchQuery })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.results || []);
      } else {
        setError(data.error || 'Search failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search');
    } finally {
      setSearching(false);
    }
  };

  const selectPlace = async (selectedPlaceId: string) => {
    setPlaceId(selectedPlaceId);
    await loadReviews(selectedPlaceId);
  };

  const loadReviews = async (pid?: string) => {
    const targetPlaceId = pid || placeId;
    if (!targetPlaceId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/reviews/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'details', placeId: targetPlaceId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPlaceDetails(data.details);
        setReviews(data.details?.reviews || []);
        setIsConfigured(true);
        setSuccess(`Loaded ${data.details?.reviews?.length || 0} reviews`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to load reviews');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Google Reviews Management</h2>
        <p className="text-gray-500 mt-1">
          Manage Google Places API integration for displaying reviews on your website.
        </p>
      </div>

      {/* Status Alert */}
      {isConfigured ? (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Google Reviews is configured and active. {reviews.length} reviews loaded.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Google Reviews not configured. Search for your business below to get started.
          </AlertDescription>
        </Alert>
      )}

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search for Your Business
          </CardTitle>
          <CardDescription>
            Find your business on Google to get the Place ID and reviews.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter business name (e.g., A Pretty Girl Matter)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchPlaces()}
            />
            <Button onClick={searchPlaces} disabled={searching}>
              {searching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Select your business:</p>
              {searchResults.map((result) => (
                <Card 
                  key={result.placeId} 
                  className={`cursor-pointer hover:bg-gray-50 transition-colors ${placeId === result.placeId ? 'ring-2 ring-pink-500' : ''}`}
                  onClick={() => selectPlace(result.placeId)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-pink-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{result.name}</h4>
                        <p className="text-sm text-gray-500">{result.formattedAddress}</p>
                        {result.rating && (
                          <div className="flex items-center gap-2 mt-1">
                            {renderStars(Math.round(result.rating))}
                            <span className="text-sm text-gray-600">
                              {result.rating} ({result.userRatingsTotal} reviews)
                            </span>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-1">Place ID: {result.placeId}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error/Success Messages */}
      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Reviews Section */}
      {placeDetails && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{placeDetails.name}</CardTitle>
                <CardDescription>{placeDetails.formattedAddress}</CardDescription>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  {renderStars(Math.round(placeDetails.rating))}
                  <span className="text-2xl font-bold">{placeDetails.rating.toFixed(1)}</span>
                </div>
                <p className="text-sm text-gray-500">{placeDetails.userRatingsTotal} reviews</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                Latest Reviews ({reviews.length} showing)
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => loadReviews()}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {reviews.map((review, index) => (
                <Card key={index} className="bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {review.profilePhotoUrl ? (
                        <img 
                          src={review.profilePhotoUrl} 
                          alt={review.authorName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-pink-600" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{review.authorName}</span>
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-sm text-gray-500">{review.relativeTimeDescription}</p>
                        <p className="text-gray-700 mt-2">{review.text}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Environment Variables Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 text-lg">Environment Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-800 mb-2">
            To permanently configure Google Reviews, add these to your <code>.env.local</code> file:
          </p>
          <pre className="bg-blue-100 p-3 rounded text-sm text-blue-900 overflow-x-auto">
{`GOOGLE_PLACES_API_KEY=your_api_key_here
GOOGLE_PLACE_ID=${placeId || 'your_place_id_here'}`}
          </pre>
          <p className="text-blue-700 text-sm mt-2">
            Get your API key from{' '}
            <a 
              href="https://console.cloud.google.com/apis/credentials" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline"
            >
              Google Cloud Console
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
