'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

export default function ReviewsManager() {
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
  }, []);

  const loadReviews = async () => {
    try {
      const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
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
        await updateDoc(doc(db, 'reviews', editingReview.id), reviewData);
      } else {
        await addDoc(collection(db, 'reviews'), reviewData);
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
        await deleteDoc(doc(db, 'reviews', reviewId));
        loadReviews();
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    }
  };

  const toggleVisibility = async (review: Review) => {
    try {
      await updateDoc(doc(db, 'reviews', review.id), {
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
      await updateDoc(doc(db, 'reviews', review.id), {
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
        className={`${interactive ? 'cursor-pointer' : ''} ${i < rating ? 'text-warning' : 'text-muted'}`}
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
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="text-primary fw-bold mb-1">
            <i className="fas fa-star me-2"></i>Customer Reviews
          </h4>
          <p className="text-muted mb-0">Manage customer reviews and testimonials</p>
        </div>
        <button
          className="btn btn-primary rounded-pill px-4"
          onClick={() => {
            resetForm();
            setEditingReview(null);
            setShowModal(true);
          }}
        >
          <i className="fas fa-plus me-2"></i>Add Review
        </button>
      </div>

      {/* Reviews Grid */}
      <div className="row g-4">
        {reviews.map((review) => (
          <div key={review.id} className="col-lg-4 col-md-6">
            <div className="card h-100 border-light rounded-3 shadow-sm position-relative">
              {/* Status Badges */}
              <div className="position-absolute top-0 end-0 m-2 d-flex gap-1">
                {!review.isApproved && (
                  <span className="badge bg-warning">Pending</span>
                )}
                {!review.isVisible && (
                  <span className="badge bg-secondary">Hidden</span>
                )}
                {review.isApproved && review.isVisible && (
                  <span className="badge bg-success">Live</span>
                )}
              </div>

              <div className="card-body p-4">
                {/* Rating */}
                <div className="d-flex justify-content-center mb-3">
                  {renderStars(review.rating)}
                </div>

                {/* Review Text */}
                <p className="text-muted mb-3 small" style={{ minHeight: '4rem' }}>
                  "{review.text}"
                </p>

                {/* Client Info */}
                <div className="d-flex align-items-center mb-3">
                  <img
                    src={review.image || 'https://via.placeholder.com/48x48?text=👤'}
                    alt={review.name}
                    className="rounded-circle me-3"
                    style={{ width: '3rem', height: '3rem', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48x48?text=👤';
                    }}
                  />
                  <div>
                    <div className="fw-semibold text-dark small">{maskLastName(review.name)}</div>
                    <div className="text-primary small">{review.service}</div>
                  </div>
                </div>

                {/* Before/After Image */}
                {review.beforeAfter && (
                  <div className="mb-3">
                    <img
                      src={review.beforeAfter}
                      alt="Before and after results"
                      className="rounded w-100"
                      style={{ height: '120px', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="d-flex gap-2 flex-wrap">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => handleEdit(review)}
                  >
                    <i className="fas fa-edit me-1"></i>Edit
                  </button>
                  <button
                    className={`btn btn-sm ${review.isVisible ? 'btn-outline-secondary' : 'btn-outline-success'}`}
                    onClick={() => toggleVisibility(review)}
                  >
                    <i className={`fas ${review.isVisible ? 'fa-eye-slash' : 'fa-eye'} me-1`}></i>
                    {review.isVisible ? 'Hide' : 'Show'}
                  </button>
                  <button
                    className={`btn btn-sm ${review.isApproved ? 'btn-outline-warning' : 'btn-outline-success'}`}
                    onClick={() => toggleApproval(review)}
                  >
                    <i className={`fas ${review.isApproved ? 'fa-times' : 'fa-check'} me-1`}></i>
                    {review.isApproved ? 'Unapprove' : 'Approve'}
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDelete(review.id)}
                  >
                    <i className="fas fa-trash me-1"></i>Delete
                  </button>
                </div>

                {/* Timestamps */}
                <div className="mt-2 pt-2 border-top">
                  <small className="text-muted">
                    Created: {review.createdAt.toLocaleDateString()}
                  </small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="text-center py-5">
          <i className="fas fa-star fa-3x text-muted mb-3"></i>
          <h5 className="text-muted">No reviews yet</h5>
          <p className="text-muted">Add your first customer review to get started.</p>
        </div>
      )}

      {/* Add/Edit Review Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-star me-2 text-primary"></i>
                  {editingReview ? 'Edit Review' : 'Add New Review'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowModal(false);
                    setEditingReview(null);
                    resetForm();
                  }}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Customer Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Service</label>
                      <select
                        className="form-select"
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
                    <div className="col-12">
                      <label className="form-label">Rating</label>
                      <div className="d-flex gap-1 mb-2">
                        {renderStars(formData.rating, true, (rating) => 
                          setFormData({ ...formData, rating })
                        )}
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Review Text</label>
                      <textarea
                        className="form-control"
                        rows={4}
                        value={formData.text}
                        onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Customer Photo URL</label>
                      <input
                        type="url"
                        className="form-control"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="https://example.com/photo.jpg"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Before/After Photo URL</label>
                      <input
                        type="url"
                        className="form-control"
                        value={formData.beforeAfter}
                        onChange={(e) => setFormData({ ...formData, beforeAfter: e.target.value })}
                        placeholder="https://example.com/results.jpg"
                      />
                    </div>
                    <div className="col-md-6">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={formData.isApproved}
                          onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
                        />
                        <label className="form-check-label">Approved</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={formData.isVisible}
                          onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                        />
                        <label className="form-check-label">Visible on Website</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowModal(false);
                      setEditingReview(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-save me-2"></i>
                    {editingReview ? 'Update Review' : 'Add Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
