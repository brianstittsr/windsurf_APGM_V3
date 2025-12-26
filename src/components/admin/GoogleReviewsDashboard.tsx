'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
  const [isConnected, setIsConnected] = useState(false);

  // Settings
  const [accountId, setAccountId] = useState('');
  const [locationId, setLocationId] = useState('');

  // Data
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [templates, setTemplates] = useState<ReviewTemplate[]>([]);

  // Reply modal
  const [selectedReview, setSelectedReview] = useState<GoogleReview | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  // --------------------------------------------------------------------------
  // Load saved settings
  // --------------------------------------------------------------------------

  useEffect(() => {
    const savedAccountId = localStorage.getItem('google_reviews_account_id');
    const savedLocationId = localStorage.getItem('google_reviews_location_id');
    
    if (savedAccountId && savedLocationId) {
      setAccountId(savedAccountId);
      setLocationId(savedLocationId);
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
    setIsConnected(true);
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

  const renderStars = (rating: string) => {
    const num = starRatingToNumber(rating);
    return (
      <span className="text-warning">
        {[1, 2, 3, 4, 5].map(i => (
          <i key={i} className={`fas fa-star${i <= num ? '' : '-o text-muted'}`}></i>
        ))}
      </span>
    );
  };

  const getRatingColor = (rating: number): string => {
    if (rating >= 4.5) return 'success';
    if (rating >= 3.5) return 'warning';
    return 'danger';
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <div className="google-reviews-dashboard">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="fab fa-google me-2"></i>
          Google Reviews
        </h2>
        {isConnected && (
          <button 
            className="btn btn-outline-primary"
            onClick={() => { loadStats(); loadReviews(); }}
            disabled={loading}
          >
            <i className="fas fa-sync-alt me-2"></i>
            Refresh
          </button>
        )}
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="fas fa-chart-pie me-2"></i>
            Overview
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => { setActiveTab('reviews'); if (isConnected) loadReviews(); }}
          >
            <i className="fas fa-comments me-2"></i>
            Reviews
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <i className="fas fa-cog me-2"></i>
            Settings
          </button>
        </li>
      </ul>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Not Connected Notice */}
      {!isConnected && activeTab !== 'settings' && (
        <div className="alert alert-info">
          <i className="fas fa-info-circle me-2"></i>
          Please configure your Google Business Profile connection in the Settings tab.
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && isConnected && (
        <div>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="mt-3">Loading review stats...</p>
            </div>
          ) : stats ? (
            <>
              {/* Stats Cards */}
              <div className="row mb-4">
                <div className="col-md-3">
                  <div className="card h-100">
                    <div className="card-body text-center">
                      <div className={`display-4 text-${getRatingColor(stats.averageRating)}`}>
                        {stats.averageRating.toFixed(1)}
                      </div>
                      <div className="text-warning mb-2">
                        {[1, 2, 3, 4, 5].map(i => (
                          <i key={i} className={`fas fa-star${i <= Math.round(stats.averageRating) ? '' : '-half-alt'}`}></i>
                        ))}
                      </div>
                      <p className="mb-0 text-muted">Average Rating</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card h-100">
                    <div className="card-body text-center">
                      <div className="display-4 text-primary">{stats.totalReviews}</div>
                      <p className="mb-0 text-muted">Total Reviews</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card h-100">
                    <div className="card-body text-center">
                      <div className="display-4 text-success">{stats.responseRate.toFixed(0)}%</div>
                      <p className="mb-0 text-muted">Response Rate</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card h-100">
                    <div className="card-body text-center">
                      <div className="display-4 text-info">{stats.ratingDistribution.five}</div>
                      <p className="mb-0 text-muted">5-Star Reviews</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">Rating Distribution</h5>
                </div>
                <div className="card-body">
                  {[5, 4, 3, 2, 1].map(rating => {
                    const count = stats.ratingDistribution[['one', 'two', 'three', 'four', 'five'][rating - 1] as keyof typeof stats.ratingDistribution];
                    const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                    return (
                      <div key={rating} className="d-flex align-items-center mb-2">
                        <span className="me-2" style={{ width: '60px' }}>
                          {rating} <i className="fas fa-star text-warning"></i>
                        </span>
                        <div className="progress flex-grow-1" style={{ height: '20px' }}>
                          <div
                            className={`progress-bar bg-${rating >= 4 ? 'success' : rating === 3 ? 'warning' : 'danger'}`}
                            style={{ width: `${percentage}%` }}
                          >
                            {count > 0 && count}
                          </div>
                        </div>
                        <span className="ms-2 text-muted" style={{ width: '50px' }}>
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Reviews */}
              {stats.recentReviews.length > 0 && (
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Recent Reviews</h5>
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setActiveTab('reviews')}
                    >
                      View All
                    </button>
                  </div>
                  <div className="card-body p-0">
                    <div className="list-group list-group-flush">
                      {stats.recentReviews.map(review => (
                        <div key={review.reviewId} className="list-group-item">
                          <div className="d-flex justify-content-between">
                            <div>
                              <strong>{review.reviewer.displayName}</strong>
                              <span className="ms-2">{renderStars(review.starRating)}</span>
                            </div>
                            <small className="text-muted">
                              {new Date(review.createTime).toLocaleDateString()}
                            </small>
                          </div>
                          {review.comment && (
                            <p className="mb-1 mt-2">{review.comment}</p>
                          )}
                          {review.reviewReply ? (
                            <div className="bg-light p-2 rounded mt-2">
                              <small className="text-muted">
                                <i className="fas fa-reply me-1"></i>
                                Your reply: {review.reviewReply.comment}
                              </small>
                            </div>
                          ) : (
                            <button 
                              className="btn btn-sm btn-outline-primary mt-2"
                              onClick={() => { setSelectedReview(review); generateAutoReply(review); }}
                            >
                              <i className="fas fa-reply me-1"></i>
                              Reply
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-5">
              <button className="btn btn-primary" onClick={loadStats}>
                <i className="fas fa-chart-pie me-2"></i>
                Load Review Stats
              </button>
            </div>
          )}
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && isConnected && (
        <div>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : reviews.length > 0 ? (
            <div className="card">
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  {reviews.map(review => (
                    <div key={review.reviewId} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="d-flex">
                          <div 
                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                            style={{ width: '50px', height: '50px' }}
                          >
                            {review.reviewer.displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h6 className="mb-1">{review.reviewer.displayName}</h6>
                            <div>{renderStars(review.starRating)}</div>
                            <small className="text-muted">
                              {new Date(review.createTime).toLocaleDateString()}
                            </small>
                          </div>
                        </div>
                        {!review.reviewReply && (
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => { setSelectedReview(review); generateAutoReply(review); }}
                          >
                            <i className="fas fa-reply me-1"></i>
                            Reply
                          </button>
                        )}
                      </div>
                      
                      {review.comment && (
                        <p className="mt-3 mb-2">{review.comment}</p>
                      )}
                      
                      {review.reviewReply && (
                        <div className="bg-light p-3 rounded mt-3">
                          <div className="d-flex justify-content-between">
                            <strong>
                              <i className="fas fa-reply me-1"></i>
                              Your Reply
                            </strong>
                            <small className="text-muted">
                              {new Date(review.reviewReply.updateTime).toLocaleDateString()}
                            </small>
                          </div>
                          <p className="mb-0 mt-2">{review.reviewReply.comment}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-comments fa-3x text-muted mb-3"></i>
              <p>No reviews found</p>
              <button className="btn btn-primary" onClick={loadReviews}>
                Load Reviews
              </button>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Google Business Profile Connection</h5>
          </div>
          <div className="card-body">
            <div className="mb-4">
              <button className="btn btn-outline-primary" onClick={startOAuth}>
                <i className="fab fa-google me-2"></i>
                Connect Google Account
              </button>
              <small className="d-block text-muted mt-2">
                Authorize access to your Google Business Profile to manage reviews.
              </small>
            </div>

            <hr />

            <div className="mb-3">
              <label className="form-label">Account ID</label>
              <input
                type="text"
                className="form-control"
                placeholder="accounts/123456789"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
              />
              <small className="text-muted">
                Format: accounts/YOUR_ACCOUNT_ID
              </small>
            </div>

            <div className="mb-3">
              <label className="form-label">Location ID</label>
              <input
                type="text"
                className="form-control"
                placeholder="locations/123456789"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
              />
              <small className="text-muted">
                Format: locations/YOUR_LOCATION_ID
              </small>
            </div>

            <button 
              className="btn btn-primary"
              onClick={saveSettings}
              disabled={!accountId || !locationId}
            >
              <i className="fas fa-save me-2"></i>
              Save & Connect
            </button>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {selectedReview && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reply to Review</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => { setSelectedReview(null); setReplyText(''); }}
                ></button>
              </div>
              <div className="modal-body">
                {/* Original Review */}
                <div className="bg-light p-3 rounded mb-3">
                  <div className="d-flex justify-content-between">
                    <strong>{selectedReview.reviewer.displayName}</strong>
                    {renderStars(selectedReview.starRating)}
                  </div>
                  {selectedReview.comment && (
                    <p className="mb-0 mt-2">{selectedReview.comment}</p>
                  )}
                </div>

                {/* Reply Templates */}
                <div className="mb-3">
                  <label className="form-label">Quick Templates</label>
                  <div className="btn-group w-100">
                    {templates.map(template => (
                      <button
                        key={template.type}
                        className={`btn btn-outline-${template.type === 'positive' ? 'success' : template.type === 'neutral' ? 'warning' : 'danger'}`}
                        onClick={() => setReplyText(template.templates[0].replace(/{name}/g, selectedReview.reviewer.displayName))}
                      >
                        {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reply Text */}
                <div className="mb-3">
                  <label className="form-label">Your Reply</label>
                  <textarea
                    className="form-control"
                    rows={5}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your reply..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => { setSelectedReview(null); setReplyText(''); }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={submitReply}
                  disabled={replying || !replyText.trim()}
                >
                  {replying ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Posting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane me-2"></i>
                      Post Reply
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Notice */}
      <div className="alert alert-info mt-4">
        <i className="fas fa-info-circle me-2"></i>
        <strong>Configuration Required:</strong> This feature requires Google Business Profile API access.
        Set <code>GOOGLE_CLIENT_ID</code>, <code>GOOGLE_CLIENT_SECRET</code>, and <code>GOOGLE_REFRESH_TOKEN</code> environment variables.
      </div>
    </div>
  );
}
