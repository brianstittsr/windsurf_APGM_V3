'use client';

import { useState, useEffect } from 'react';
import { GoogleReviewsService, GoogleReview, PlaceDetails } from '@/services/googleReviewsService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  onSelectReview?: (review: GoogleReview) => void;
}

export default function GoogleReviewsManager({ onSelectReview }: Props) {
  const [loading, setLoading] = useState(false);
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [setupInfo, setSetupInfo] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [filterRating, setFilterRating] = useState(4);
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    setSetupInfo(null);

    const result = await GoogleReviewsService.getReviews();
    
    if (result.success && result.data) {
      setPlaceDetails(result.data);
    } else {
      setError(result.error || 'Failed to fetch reviews');
      if (result.setup) {
        setSetupInfo(result.setup);
      }
    }
    
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    const result = await GoogleReviewsService.searchPlace(searchQuery);
    
    if (result.success && result.candidates) {
      setSearchResults(result.candidates);
    } else {
      setError(result.error || 'Search failed');
    }
    
    setSearching(false);
  };

  const getFilteredReviews = () => {
    if (!placeDetails?.reviews) return [];
    let reviews = GoogleReviewsService.filterByRating(placeDetails.reviews, filterRating);
    return GoogleReviewsService.sortReviews(reviews, sortBy);
  };

  const renderStars = (rating: number) => {
    const stars = GoogleReviewsService.getStarArray(rating);
    return (
      <div className="flex gap-0.5">
        {stars.map((star, i) => (
          <i 
            key={i} 
            className={`fas fa-star text-sm ${
              star === 'full' ? 'text-yellow-400' : 
              star === 'half' ? 'text-yellow-400 opacity-50' : 
              'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // Setup instructions when API is not configured
  if (setupInfo) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-key text-2xl text-yellow-600"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Google Reviews Setup Required</h3>
          <p className="text-gray-500">{setupInfo.message}</p>
        </div>

        {setupInfo.variables && (
          <div className="bg-gray-900 rounded-lg p-4 mb-6">
            <p className="text-gray-400 text-sm mb-2"># Add to .env.local</p>
            {setupInfo.variables.map((v: string, i: number) => (
              <code key={i} className="block text-green-400 text-sm">{v}</code>
            ))}
          </div>
        )}

        {setupInfo.instructions && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Setup Instructions:</h4>
            <ol className="space-y-2">
              {setupInfo.instructions.map((instruction: string, i: number) => (
                <li key={i} className="flex gap-3 text-sm text-gray-600">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#AD6269]/10 rounded-full flex items-center justify-center text-[#AD6269] font-medium text-xs">
                    {i + 1}
                  </span>
                  {instruction}
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Find Your Place ID</h4>
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for your business name..."
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button 
              onClick={handleSearch} 
              disabled={searching}
              className="bg-[#AD6269] hover:bg-[#9d5860]"
            >
              {searching ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search"></i>}
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {searchResults.map((place, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{place.name}</p>
                      <p className="text-sm text-gray-500">{place.formatted_address}</p>
                      {place.rating && (
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(place.rating)}
                          <span className="text-sm text-gray-500">({place.user_ratings_total} reviews)</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(place.place_id)}
                      className="px-3 py-1 text-xs bg-[#AD6269] text-white rounded-lg hover:bg-[#9d5860] transition-colors"
                    >
                      Copy ID
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-400 font-mono bg-gray-100 p-2 rounded">
                    Place ID: {place.place_id}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6">
          <Button onClick={fetchReviews} variant="outline" className="w-full">
            <i className="fas fa-sync mr-2"></i>Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#AD6269] mb-4"></div>
          <p className="text-gray-500">Loading Google Reviews...</p>
        </div>
      </div>
    );
  }

  if (error && !setupInfo) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-2xl text-red-600"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Reviews</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={fetchReviews} className="bg-[#AD6269] hover:bg-[#9d5860]">
            <i className="fas fa-sync mr-2"></i>Try Again
          </Button>
        </div>
      </div>
    );
  }

  const filteredReviews = getFilteredReviews();

  return (
    <div className="space-y-6">
      {/* Place Overview */}
      {placeDetails && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
                <h3 className="text-xl font-semibold text-gray-900">{placeDetails.name}</h3>
              </div>
              <div className="flex items-center gap-3 mb-2">
                {renderStars(placeDetails.rating)}
                <span className="text-lg font-medium text-gray-900">{placeDetails.rating}</span>
                <span className="text-gray-500">({placeDetails.user_ratings_total} reviews)</span>
              </div>
              {placeDetails.formatted_address && (
                <p className="text-sm text-gray-500">
                  <i className="fas fa-map-marker-alt mr-2"></i>{placeDetails.formatted_address}
                </p>
              )}
            </div>
            <Button onClick={fetchReviews} variant="outline" size="sm">
              <i className="fas fa-sync mr-2"></i>Refresh
            </Button>
          </div>

          {placeDetails.url && (
            <a 
              href={placeDetails.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-sm text-blue-600 hover:text-blue-800"
            >
              <i className="fas fa-external-link-alt"></i>View on Google Maps
            </a>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-sm text-gray-600">Min Rating:</Label>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269]"
            >
              <option value={5}>5 Stars Only</option>
              <option value={4}>4+ Stars</option>
              <option value={3}>3+ Stars</option>
              <option value={1}>All Reviews</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm text-gray-600">Sort By:</Label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'rating')}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269]"
            >
              <option value="date">Most Recent</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
          <span className="text-sm text-gray-500">
            Showing {filteredReviews.length} of {placeDetails?.reviews?.length || 0} reviews
          </span>
        </div>
      </div>

      {/* Reviews List */}
      <div className="grid gap-4">
        {filteredReviews.map((review, index) => (
          <div 
            key={index} 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              {review.profile_photo_url ? (
                <img 
                  src={review.profile_photo_url} 
                  alt={review.author_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <i className="fas fa-user text-gray-400"></i>
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{review.author_name}</span>
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-gray-500">{review.relative_time_description}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(review.rating)}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{review.text}</p>
                
                {onSelectReview && (
                  <button
                    onClick={() => onSelectReview(review)}
                    className="mt-3 px-4 py-2 text-sm font-medium text-[#AD6269] border border-[#AD6269] rounded-lg hover:bg-[#AD6269]/5 transition-colors"
                  >
                    <i className="fas fa-plus mr-2"></i>Use in Hero Carousel
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredReviews.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <i className="fas fa-star text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">No reviews match your filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
