'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAlertDialog } from '@/components/ui/alert-dialog';
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

interface Review {
  id: string;
  platform: 'google' | 'yelp' | 'facebook' | 'manual';
  authorName: string;
  authorPhoto?: string;
  rating: number;
  text: string;
  date: string;
  response?: string;
  respondedAt?: string;
  status: 'pending' | 'responded' | 'ignored';
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  pendingResponses: number;
  thisMonthReviews: number;
  ratingDistribution: { [key: number]: number };
}

export default function ReputationDashboard() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reviews' | 'requests' | 'templates'>('dashboard');
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: 0,
    averageRating: 0,
    pendingResponses: 0,
    thisMonthReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState('');
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const { showAlert, showConfirm, AlertDialogComponent } = useAlertDialog();

  // Review request form
  const [requestForm, setRequestForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    sendEmail: true,
    sendSMS: false
  });

  // Response templates
  const [templates, setTemplates] = useState([
    { id: '1', name: 'Thank You - 5 Star', text: 'Thank you so much for your wonderful review, {name}! We\'re thrilled that you had a great experience with us. Your kind words mean the world to our team. We look forward to seeing you again soon! 💕' },
    { id: '2', name: 'Thank You - 4 Star', text: 'Thank you for your feedback, {name}! We\'re glad you had a positive experience. We\'re always striving to provide 5-star service, so please let us know if there\'s anything we can do better next time!' },
    { id: '3', name: 'Apologetic - Low Rating', text: 'We\'re sorry to hear about your experience, {name}. This isn\'t the level of service we aim to provide. Please reach out to us directly so we can make things right. Your satisfaction is our top priority.' },
    { id: '4', name: 'Follow-up Invitation', text: 'Thank you for choosing us, {name}! We hope you\'re loving your results. We\'d love to see you again for a touch-up or to try our other services. Book your next appointment today!' }
  ]);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const db = getDb();
      
      // Load from Firestore reviews collection
      const reviewsRef = collection(db, 'reviews');
      const snapshot = await getDocs(query(reviewsRef, orderBy('date', 'desc')));
      
      const loadedReviews: Review[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        loadedReviews.push({
          id: doc.id,
          platform: data.platform || 'manual',
          authorName: data.authorName || data.author_name || 'Anonymous',
          authorPhoto: data.authorPhoto || data.profile_photo_url,
          rating: data.rating || 5,
          text: data.text || data.reviewText || '',
          date: data.date || new Date().toISOString(),
          response: data.response,
          respondedAt: data.respondedAt,
          status: data.status || 'pending'
        });
      });

      // Also try to load Google Reviews from API
      try {
        const googleRes = await fetch('/api/reviews/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'list_reviews', pageSize: 50 })
        });
        const googleData = await googleRes.json();
        
        if (googleData.success && googleData.reviews) {
          googleData.reviews.forEach((review: any) => {
            const ratingMap: { [key: string]: number } = {
              'ONE': 1, 'TWO': 2, 'THREE': 3, 'FOUR': 4, 'FIVE': 5
            };
            const existingIndex = loadedReviews.findIndex(r => 
              r.authorName === review.reviewer?.displayName && 
              r.platform === 'google'
            );
            
            if (existingIndex === -1) {
              loadedReviews.push({
                id: `google-${review.name || Date.now()}`,
                platform: 'google',
                authorName: review.reviewer?.displayName || 'Anonymous',
                authorPhoto: review.reviewer?.profilePhotoUrl,
                rating: ratingMap[review.starRating] || 5,
                text: review.comment || '',
                date: review.createTime || new Date().toISOString(),
                response: review.reviewReply?.comment,
                respondedAt: review.reviewReply?.updateTime,
                status: review.reviewReply ? 'responded' : 'pending'
              });
            }
          });
        }
      } catch (e) {
        console.log('Could not load Google Reviews:', e);
      }

      setReviews(loadedReviews);
      calculateStats(loadedReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewList: Review[]) => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;
    let pendingCount = 0;
    let thisMonthCount = 0;

    reviewList.forEach(review => {
      distribution[review.rating] = (distribution[review.rating] || 0) + 1;
      totalRating += review.rating;
      if (review.status === 'pending') pendingCount++;
      if (new Date(review.date) >= thisMonth) thisMonthCount++;
    });

    setStats({
      totalReviews: reviewList.length,
      averageRating: reviewList.length > 0 ? totalRating / reviewList.length : 0,
      pendingResponses: pendingCount,
      thisMonthReviews: thisMonthCount,
      ratingDistribution: distribution
    });
  };

  const generateAIResponse = async (review: Review) => {
    setGeneratingResponse(true);
    try {
      // Simple AI response generation based on rating
      let response = '';
      const name = review.authorName.split(' ')[0];
      
      if (review.rating >= 4) {
        response = `Thank you so much for your wonderful ${review.rating}-star review, ${name}! We're absolutely thrilled that you had such a great experience with us. Your kind words truly mean the world to our team and motivate us to continue providing exceptional service. We can't wait to see you again soon! 💕`;
      } else if (review.rating === 3) {
        response = `Thank you for taking the time to share your feedback, ${name}. We appreciate your honest review and are always looking for ways to improve. We'd love the opportunity to exceed your expectations on your next visit. Please don't hesitate to reach out if there's anything specific we can do better!`;
      } else {
        response = `We're truly sorry to hear about your experience, ${name}. This is not the level of service we strive to provide, and we take your feedback very seriously. We would love the opportunity to make things right. Please reach out to us directly at your earliest convenience so we can address your concerns personally.`;
      }

      setResponseText(response);
      await showAlert({
        title: 'Response Generated',
        description: 'AI has generated a response suggestion. Feel free to edit it before sending.',
        variant: 'success'
      });
    } catch (error) {
      console.error('Error generating response:', error);
      await showAlert({
        title: 'Error',
        description: 'Failed to generate AI response',
        variant: 'destructive'
      });
    } finally {
      setGeneratingResponse(false);
    }
  };

  const saveResponse = async () => {
    if (!selectedReview || !responseText.trim()) return;

    try {
      const db = getDb();
      
      // If it's a Firestore review, update it
      if (!selectedReview.id.startsWith('google-')) {
        await updateDoc(doc(db, 'reviews', selectedReview.id), {
          response: responseText,
          respondedAt: new Date().toISOString(),
          status: 'responded'
        });
      }

      // Update local state
      setReviews(prev => prev.map(r => 
        r.id === selectedReview.id 
          ? { ...r, response: responseText, respondedAt: new Date().toISOString(), status: 'responded' as const }
          : r
      ));

      await showAlert({
        title: 'Response Saved',
        description: 'Your response has been saved successfully.',
        variant: 'success'
      });

      setSelectedReview(null);
      setResponseText('');
    } catch (error) {
      console.error('Error saving response:', error);
      await showAlert({
        title: 'Error',
        description: 'Failed to save response',
        variant: 'destructive'
      });
    }
  };

  const sendReviewRequest = async () => {
    if (!requestForm.clientEmail && !requestForm.clientPhone) {
      await showAlert({
        title: 'Missing Information',
        description: 'Please provide either an email or phone number',
        variant: 'warning'
      });
      return;
    }

    setSendingRequest(true);
    try {
      const db = getDb();
      
      // Save the review request
      await addDoc(collection(db, 'reviewRequests'), {
        clientName: requestForm.clientName,
        clientEmail: requestForm.clientEmail,
        clientPhone: requestForm.clientPhone,
        sentEmail: requestForm.sendEmail,
        sentSMS: requestForm.sendSMS,
        status: 'sent',
        createdAt: Timestamp.now()
      });

      // TODO: Actually send email/SMS via API
      // For now, just log and show success

      await showAlert({
        title: 'Request Sent',
        description: `Review request sent to ${requestForm.clientName}`,
        variant: 'success'
      });

      setRequestForm({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        sendEmail: true,
        sendSMS: false
      });
    } catch (error) {
      console.error('Error sending review request:', error);
      await showAlert({
        title: 'Error',
        description: 'Failed to send review request',
        variant: 'destructive'
      });
    } finally {
      setSendingRequest(false);
    }
  };

  const applyTemplate = (template: typeof templates[0]) => {
    if (!selectedReview) return;
    const name = selectedReview.authorName.split(' ')[0];
    setResponseText(template.text.replace('{name}', name));
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`fas fa-star text-sm ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'google': return 'fab fa-google text-red-500';
      case 'yelp': return 'fab fa-yelp text-red-600';
      case 'facebook': return 'fab fa-facebook text-blue-600';
      default: return 'fas fa-comment text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#AD6269]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <i className="fas fa-star text-[#AD6269]"></i>
            Reputation Management
          </h2>
          <p className="text-gray-500 text-sm mt-1">Monitor and respond to reviews across all platforms</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadReviews}
          >
            <i className="fas fa-sync-alt mr-2"></i>
            Refresh
          </Button>
          <Button
            className="bg-[#AD6269] hover:bg-[#9d5860]"
            onClick={() => setActiveTab('requests')}
          >
            <i className="fas fa-paper-plane mr-2"></i>
            Request Review
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-pie' },
          { id: 'reviews', label: 'All Reviews', icon: 'fas fa-comments' },
          { id: 'requests', label: 'Request Reviews', icon: 'fas fa-paper-plane' },
          { id: 'templates', label: 'Response Templates', icon: 'fas fa-file-alt' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-[#AD6269] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <i className={`${tab.icon} mr-2`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Reviews</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalReviews}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-comments text-blue-600 text-xl"></i>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Average Rating</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-star text-yellow-500 text-xl"></i>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending Responses</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pendingResponses}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-clock text-orange-500 text-xl"></i>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">This Month</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.thisMonthReviews}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-calendar text-green-600 text-xl"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Rating Distribution</h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratingDistribution[rating] || 0;
                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-20">
                      <span className="text-sm font-medium">{rating}</span>
                      <i className="fas fa-star text-yellow-400 text-sm"></i>
                    </div>
                    <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-12 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Reviews</h3>
              <Button variant="outline" size="sm" onClick={() => setActiveTab('reviews')}>
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {reviews.slice(0, 5).map((review) => (
                <div key={review.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    {review.authorPhoto ? (
                      <img src={review.authorPhoto} alt="" className="w-10 h-10 rounded-full" />
                    ) : (
                      <i className="fas fa-user text-gray-400"></i>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{review.authorName}</span>
                      <i className={getPlatformIcon(review.platform)}></i>
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{review.text}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(review.date).toLocaleDateString()}
                    </p>
                  </div>
                  {review.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedReview(review);
                        setActiveTab('reviews');
                      }}
                    >
                      Respond
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reviews List */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">All Reviews ({reviews.length})</h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  onClick={() => {
                    setSelectedReview(review);
                    setResponseText(review.response || '');
                  }}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedReview?.id === review.id
                      ? 'border-[#AD6269] bg-[#AD6269]/5'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      {review.authorPhoto ? (
                        <img src={review.authorPhoto} alt="" className="w-10 h-10 rounded-full" />
                      ) : (
                        <i className="fas fa-user text-gray-400"></i>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{review.authorName}</span>
                        <i className={getPlatformIcon(review.platform)}></i>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        {renderStars(review.rating)}
                        <span className="text-xs text-gray-400">
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-3">{review.text}</p>
                      {review.response && (
                        <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
                          <i className="fas fa-check-circle mr-1"></i>
                          Responded
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Response Panel */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-4">
            {selectedReview ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Respond to Review</h3>
                  <button
                    onClick={() => setSelectedReview(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                {/* Original Review */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{selectedReview.authorName}</span>
                    {renderStars(selectedReview.rating)}
                  </div>
                  <p className="text-sm text-gray-600">{selectedReview.text}</p>
                </div>

                {/* Quick Templates */}
                <div>
                  <Label className="text-sm text-gray-500 mb-2 block">Quick Templates</Label>
                  <div className="flex flex-wrap gap-2">
                    {templates.slice(0, 3).map((template) => (
                      <button
                        key={template.id}
                        onClick={() => applyTemplate(template)}
                        className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        {template.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Response Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Your Response</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateAIResponse(selectedReview)}
                      disabled={generatingResponse}
                    >
                      {generatingResponse ? (
                        <><i className="fas fa-spinner fa-spin mr-2"></i>Generating...</>
                      ) : (
                        <><i className="fas fa-magic mr-2"></i>AI Suggest</>
                      )}
                    </Button>
                  </div>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent resize-none"
                    placeholder="Write your response..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-[#AD6269] hover:bg-[#9d5860]"
                    onClick={saveResponse}
                    disabled={!responseText.trim()}
                  >
                    <i className="fas fa-save mr-2"></i>
                    Save Response
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedReview(null);
                      setResponseText('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <i className="fas fa-mouse-pointer text-4xl mb-4 text-gray-300"></i>
                <p>Select a review to respond</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Request Reviews Tab */}
      {activeTab === 'requests' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              <i className="fas fa-paper-plane text-[#AD6269] mr-2"></i>
              Send Review Request
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  value={requestForm.clientName}
                  onChange={(e) => setRequestForm({ ...requestForm, clientName: e.target.value })}
                  placeholder="Enter client name"
                />
              </div>
              <div>
                <Label htmlFor="clientEmail">Email Address</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={requestForm.clientEmail}
                  onChange={(e) => setRequestForm({ ...requestForm, clientEmail: e.target.value })}
                  placeholder="client@example.com"
                />
              </div>
              <div>
                <Label htmlFor="clientPhone">Phone Number</Label>
                <Input
                  id="clientPhone"
                  type="tel"
                  value={requestForm.clientPhone}
                  onChange={(e) => setRequestForm({ ...requestForm, clientPhone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requestForm.sendEmail}
                    onChange={(e) => setRequestForm({ ...requestForm, sendEmail: e.target.checked })}
                    className="w-4 h-4 text-[#AD6269] rounded"
                  />
                  <span className="text-sm">Send Email</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requestForm.sendSMS}
                    onChange={(e) => setRequestForm({ ...requestForm, sendSMS: e.target.checked })}
                    className="w-4 h-4 text-[#AD6269] rounded"
                  />
                  <span className="text-sm">Send SMS</span>
                </label>
              </div>
              <Button
                className="w-full bg-[#AD6269] hover:bg-[#9d5860]"
                onClick={sendReviewRequest}
                disabled={sendingRequest}
              >
                {sendingRequest ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i>Sending...</>
                ) : (
                  <><i className="fas fa-paper-plane mr-2"></i>Send Review Request</>
                )}
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              <i className="fas fa-qrcode text-[#AD6269] mr-2"></i>
              QR Code for Reviews
            </h3>
            <div className="text-center py-8">
              <div className="w-48 h-48 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-qrcode text-6xl text-gray-400"></i>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Print this QR code and display it in your studio for easy review requests
              </p>
              <Button variant="outline">
                <i className="fas fa-download mr-2"></i>
                Download QR Code
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">Response Templates</h3>
            <Button className="bg-[#AD6269] hover:bg-[#9d5860]">
              <i className="fas fa-plus mr-2"></i>
              Add Template
            </Button>
          </div>
          <div className="space-y-4">
            {templates.map((template) => (
              <div key={template.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                  <div className="flex gap-2">
                    <button className="text-gray-400 hover:text-blue-600">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="text-gray-400 hover:text-red-600">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{template.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {AlertDialogComponent}
    </div>
  );
}
