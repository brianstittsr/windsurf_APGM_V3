'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, query, Timestamp } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Star, Search, RefreshCw, MapPin, AlertCircle, CheckCircle, User, Settings, Globe } from 'lucide-react';

interface Review {
  id: string;
  name: string;
  service: string;
  rating: number;
  text: string;
  image: string;
  beforeAfter?: string;
  isApproved: boolean;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface GooglePlaceResult {
  placeId: string;
  name: string;
  formattedAddress: string;
  rating?: number;
  userRatingsTotal?: number;
}

interface GoogleReview {
  authorName: string;
  profilePhotoUrl?: string;
  rating: number;
  text: string;
  relativeTimeDescription: string;
  time: number;
}

interface GooglePlaceDetails {
  placeId: string;
  name: string;
  formattedAddress: string;
  rating: number;
  userRatingsTotal: number;
  reviews: GoogleReview[];
}

export default function ReviewsManager() {
  const [activeTab, setActiveTab] = useState<'customer' | 'google'>('customer');
  
  // Customer Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    service: '',
    rating: 5,
    text: '',
    image: '',
    beforeAfter: '',
    isApproved: true,
    isVisible: true
  });

  // Google Reviews State
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleSuccess, setGoogleSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('A Pretty Girl Matter');
  const [searchResults, setSearchResults] = useState<GooglePlaceResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [placeDetails, setPlaceDetails] = useState<GooglePlaceDetails | null>(null);
  const [googleReviews, setGoogleReviews] = useState<GoogleReview[]>([]);
  const [isGoogleConfigured, setIsGoogleConfigured] = useState(false);

  const services = [
    'Microblading Eyebrows',
    'Semi-Permanent Eyeliner',
    'Lip Blushing',
    'Full Package',
    'Microblading Touch-up',
    'Consultation'
  ];

  useEffect(() => {
    loadReviews();
    checkGoogleConfiguration();
  }, []);

  const checkGoogleConfiguration = async () => {
    try {
      const response = await fetch('/api/google-reviews');
      const data = await response.json();
      setIsGoogleConfigured(data.success && !data.notConfigured);
      if (data.success && data.data) {
        setPlaceDetails(data.data);
        setGoogleReviews(data.data.reviews || []);
      }
    } catch (err) {
      console.error('Error checking Google configuration:', err);
    }
  };

  const searchGooglePlaces = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setGoogleError(null);
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
        setGoogleError(data.error || 'Search failed');
      }
    } catch (err: any) {
      setGoogleError(err.message || 'Failed to search');
    } finally {
      setSearching(false);
    }
  };

  const loadGoogleReviews = async (placeId: string) => {
    setGoogleLoading(true);
    setGoogleError(null);
    try {
      const response = await fetch('/api/reviews/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'details', placeId })
      });
      const data = await response.json();
      if (data.success) {
        setPlaceDetails(data.details);
        setGoogleReviews(data.details?.reviews || []);
        setIsGoogleConfigured(true);
        setGoogleSuccess(`Loaded ${data.details?.reviews?.length || 0} Google reviews`);
        setTimeout(() => setGoogleSuccess(null), 3000);
      } else {
        setGoogleError(data.error || 'Failed to load reviews');
      }
    } catch (err: any) {
      setGoogleError(err.message || 'Failed to load reviews');
    } finally {
      setGoogleLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const q = query(collection(getDb(), 'reviews'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const reviewsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Review[];
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const reviewData = {
        ...formData,
        createdAt: editingReview ? editingReview.createdAt : Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      if (editingReview) {
        await updateDoc(doc(getDb(), 'reviews', editingReview.id), reviewData);
      } else {
        await addDoc(collection(getDb(), 'reviews'), reviewData);
      }

      setShowModal(false);
      setEditingReview(null);
      resetForm();
      loadReviews();
    } catch (error) {
      console.error('Error saving review:', error);
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setFormData({
      name: review.name,
      service: review.service,
      rating: review.rating,
      text: review.text,
      image: review.image,
      beforeAfter: review.beforeAfter || '',
      isApproved: review.isApproved,
      isVisible: review.isVisible
    });
    setShowModal(true);
  };

  const handleDelete = async (reviewId: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteDoc(doc(getDb(), 'reviews', reviewId));
        loadReviews();
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    }
  };

  const toggleVisibility = async (review: Review) => {
    try {
      await updateDoc(doc(getDb(), 'reviews', review.id), {
        isVisible: !review.isVisible,
        updatedAt: Timestamp.now()
      });
      loadReviews();
    } catch (error) {
      console.error('Error updating review visibility:', error);
    }
  };

  const toggleApproval = async (review: Review) => {
    try {
      await updateDoc(doc(getDb(), 'reviews', review.id), {
        isApproved: !review.isApproved,
        updatedAt: Timestamp.now()
      });
      loadReviews();
    } catch (error) {
      console.error('Error updating review approval:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      service: '',
      rating: 5,
      text: '',
      image: '',
      beforeAfter: '',
      isApproved: true,
      isVisible: true
    });
  };

  const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`${interactive ? 'cursor-pointer' : ''} ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        style={{ width: '1.2rem', height: '1.2rem' }}
        fill="currentColor"
        viewBox="0 0 20 20"
        onClick={interactive && onChange ? () => onChange(i + 1) : undefined}
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const maskLastName = (fullName: string) => {
    const nameParts = fullName.split(' ');
    if (nameParts.length < 2) return fullName;
    
    const firstName = nameParts[0];
    const lastNameInitial = nameParts[nameParts.length - 1].charAt(0);
    
    return `${firstName} ${lastNameInitial}.`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#AD6269]"></div>
      </div>
    );
  }

  const renderGoogleStars = (rating: number) => (
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
      {/* Header with Tabs */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <i className="fas fa-star text-[#AD6269]"></i>Review Management
            </h2>
            <p className="text-gray-500 text-sm mt-1">Manage customer reviews and Google Business Profile integration</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('customer')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'customer'
                ? 'border-[#AD6269] text-[#AD6269]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className="fas fa-users"></i>
            Customer Reviews
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
              {reviews.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('google')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'google'
                ? 'border-[#AD6269] text-[#AD6269]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className="fab fa-google"></i>
            Google Reviews
            {isGoogleConfigured && (
              <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs">
                {googleReviews.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Customer Reviews Tab */}
      {activeTab === 'customer' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">Manage customer testimonials and reviews displayed on your website.</p>
            <Button
              onClick={() => {
                resetForm();
                setEditingReview(null);
                setShowModal(true);
              }}
              className="bg-[#AD6269] hover:bg-[#9d5860]"
            >
              <i className="fas fa-plus mr-2"></i>Add Review
            </Button>
          </div>

          {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
            {/* Status Badges */}
            <div className="absolute top-3 right-3 flex gap-1">
              {!review.isApproved && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>
              )}
              {!review.isVisible && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Hidden</span>
              )}
              {review.isApproved && review.isVisible && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Live</span>
              )}
            </div>

            <div className="p-5">
              {/* Rating */}
              <div className="flex justify-center mb-4">
                {renderStars(review.rating)}
              </div>

              {/* Review Text */}
              <p className="text-gray-600 text-sm mb-4 min-h-[4rem] line-clamp-3">
                &ldquo;{review.text}&rdquo;
              </p>

              {/* Client Info */}
              <div className="flex items-center mb-4">
                <img
                  src={review.image || 'https://via.placeholder.com/48x48?text=👤'}
                  alt={review.name}
                  className="w-12 h-12 rounded-full object-cover mr-3"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48x48?text=👤';
                  }}
                />
                <div>
                  <div className="font-medium text-gray-900 text-sm">{maskLastName(review.name)}</div>
                  <div className="text-[#AD6269] text-sm">{review.service}</div>
                </div>
              </div>

              {/* Before/After Image */}
              {review.beforeAfter && (
                <div className="mb-4">
                  <img
                    src={review.beforeAfter}
                    alt="Before and after results"
                    className="rounded-lg w-full h-28 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                  onClick={() => handleEdit(review)}
                >
                  <i className="fas fa-edit mr-1"></i>Edit
                </button>
                <button
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    review.isVisible 
                      ? 'border-gray-200 text-gray-600 hover:bg-gray-50' 
                      : 'border-green-200 text-green-600 hover:bg-green-50'
                  }`}
                  onClick={() => toggleVisibility(review)}
                >
                  <i className={`fas ${review.isVisible ? 'fa-eye-slash' : 'fa-eye'} mr-1`}></i>
                  {review.isVisible ? 'Hide' : 'Show'}
                </button>
                <button
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    review.isApproved 
                      ? 'border-yellow-200 text-yellow-600 hover:bg-yellow-50' 
                      : 'border-green-200 text-green-600 hover:bg-green-50'
                  }`}
                  onClick={() => toggleApproval(review)}
                >
                  <i className={`fas ${review.isApproved ? 'fa-times' : 'fa-check'} mr-1`}></i>
                  {review.isApproved ? 'Unapprove' : 'Approve'}
                </button>
                <button
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                  onClick={() => handleDelete(review.id)}
                >
                  <i className="fas fa-trash mr-1"></i>Delete
                </button>
              </div>

              {/* Timestamps */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  Created: {review.createdAt.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="text-center py-16">
          <i className="fas fa-star text-5xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-600 mb-2">No reviews yet</h3>
          <p className="text-gray-500">Add your first customer review to get started.</p>
        </div>
      )}
        </div>
      )}

      {/* Google Reviews Tab */}
      {activeTab === 'google' && (
        <div className="space-y-6">
          {/* Status Alert */}
          {isGoogleConfigured ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Google Reviews is configured and active. {googleReviews.length} reviews loaded.
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
                  onKeyDown={(e) => e.key === 'Enter' && searchGooglePlaces()}
                />
                <Button onClick={searchGooglePlaces} disabled={searching}>
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
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => loadGoogleReviews(result.placeId)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-pink-600 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{result.name}</h4>
                            <p className="text-sm text-gray-500">{result.formattedAddress}</p>
                            {result.rating && (
                              <div className="flex items-center gap-2 mt-1">
                                {renderGoogleStars(Math.round(result.rating))}
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
          {googleError && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{googleError}</AlertDescription>
            </Alert>
          )}
          {googleSuccess && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{googleSuccess}</AlertDescription>
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
                      {renderGoogleStars(Math.round(placeDetails.rating))}
                      <span className="text-2xl font-bold">{placeDetails.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-sm text-gray-500">{placeDetails.userRatingsTotal} reviews</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">
                    Latest Reviews ({googleReviews.length} showing)
                  </h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => placeDetails && loadGoogleReviews(placeDetails.placeId)}
                    disabled={googleLoading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${googleLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {googleReviews.map((review, index) => (
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
                              {renderGoogleStars(review.rating)}
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
              <CardTitle className="text-blue-900 text-lg flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Environment Variables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-800 mb-2">
                To permanently configure Google Reviews, add these to your <code>.env.local</code> file:
              </p>
              <pre className="bg-blue-100 p-3 rounded text-sm text-blue-900 overflow-x-auto">
{`GOOGLE_PLACES_API_KEY=your_api_key_here
GOOGLE_PLACE_ID=${placeDetails?.placeId || 'your_place_id_here'}`}
              </pre>
              <div className="flex gap-4 mt-3 text-sm">
                <a 
                  href="https://console.cloud.google.com/apis/credentials" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:underline flex items-center gap-1"
                >
                  <Globe className="w-4 h-4" />
                  Get API Key
                </a>
                <a 
                  href="https://developers.google.com/maps/documentation/places/web-service/overview" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:underline flex items-center gap-1"
                >
                  <i className="fas fa-book w-4"></i>
                  Documentation
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add/Edit Review Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-modal-title"
          aria-describedby="review-modal-description"
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 
                id="review-modal-title"
                className="text-lg font-semibold text-gray-900 flex items-center gap-2"
              >
                <i className="fas fa-star text-[#AD6269]"></i>
                {editingReview ? 'Edit Review' : 'Add New Review'}
              </h3>
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => {
                  setShowModal(false);
                  setEditingReview(null);
                  resetForm();
                }}
                aria-label="Close modal"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <p id="review-modal-description" className="sr-only">
              {editingReview ? 'Update the review details below.' : 'Add a new customer review to display on your website.'}
            </p>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Customer Name</Label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Service</Label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      required
                    >
                      <option value="">Select Service</option>
                      {services.map((service) => (
                        <option key={service} value={service}>{service}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <div className="flex gap-1">
                    {renderStars(formData.rating, true, (rating) => 
                      setFormData({ ...formData, rating })
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Review Text</Label>
                  <textarea
                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent resize-none"
                    rows={4}
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Customer Photo URL</Label>
                    <Input
                      type="url"
                      value={formData.image}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Before/After Photo URL</Label>
                    <Input
                      type="url"
                      value={formData.beforeAfter}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, beforeAfter: e.target.value })}
                      placeholder="https://example.com/results.jpg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-[#AD6269] focus:ring-[#AD6269]"
                      checked={formData.isApproved}
                      onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
                    />
                    <span className="text-sm text-gray-700">Approved</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-[#AD6269] focus:ring-[#AD6269]"
                      checked={formData.isVisible}
                      onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                    />
                    <span className="text-sm text-gray-700">Visible on Website</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    setEditingReview(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#AD6269] hover:bg-[#9d5860]">
                  <i className="fas fa-save mr-2"></i>
                  {editingReview ? 'Update Review' : 'Add Review'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
