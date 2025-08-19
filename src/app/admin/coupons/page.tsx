'use client';

import { useState, useEffect } from 'react';
import { CouponCode, Service } from '@/types/database';
import { CouponService } from '@/services/couponService';
import { useServices } from '@/hooks/useFirebase';
import { useAuth } from '@/hooks/useAuth';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<CouponCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { services } = useServices();
  const { user, isAuthenticated } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed_amount',
    discountValue: 0,
    minimumOrderAmount: '',
    maxUses: '',
    validFrom: '',
    validUntil: '',
    applicableServices: [] as string[],
    isActive: true
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const couponList = await CouponService.getAllCoupons();
      setCoupons(couponList);
    } catch (error) {
      console.error('Error loading coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSuccess('');

    // Validation
    const newErrors: string[] = [];
    
    if (!formData.code.trim()) {
      newErrors.push('Coupon code is required');
    }
    
    if (!formData.description.trim()) {
      newErrors.push('Description is required');
    }
    
    if (formData.discountValue <= 0) {
      newErrors.push('Discount value must be greater than 0');
    }
    
    if (formData.discountType === 'percentage' && formData.discountValue > 100) {
      newErrors.push('Percentage discount cannot exceed 100%');
    }
    
    if (!formData.validFrom) {
      newErrors.push('Valid from date is required');
    }
    
    if (!formData.validUntil) {
      newErrors.push('Valid until date is required');
    }
    
    if (formData.validFrom && formData.validUntil && new Date(formData.validFrom) >= new Date(formData.validUntil)) {
      newErrors.push('Valid until date must be after valid from date');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await CouponService.createCoupon({
        code: formData.code.toUpperCase(),
        description: formData.description,
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        minimumOrderAmount: formData.minimumOrderAmount ? parseFloat(formData.minimumOrderAmount) : undefined,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined,
        validFrom: new Date(formData.validFrom),
        validUntil: new Date(formData.validUntil),
        applicableServices: formData.applicableServices.length > 0 ? formData.applicableServices : undefined,
        isActive: formData.isActive,
        createdBy: user?.uid || 'admin'
      });

      setSuccess('Coupon created successfully!');
      setShowCreateForm(false);
      resetForm();
      loadCoupons();
    } catch (error) {
      console.error('Error creating coupon:', error);
      setErrors(['Failed to create coupon. Please try again.']);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      minimumOrderAmount: '',
      maxUses: '',
      validFrom: '',
      validUntil: '',
      applicableServices: [],
      isActive: true
    });
    setErrors([]);
  };

  const handleDeactivate = async (couponId: string) => {
    if (confirm('Are you sure you want to deactivate this coupon?')) {
      try {
        await CouponService.deactivateCoupon(couponId);
        setSuccess('Coupon deactivated successfully!');
        loadCoupons();
      } catch (error) {
        console.error('Error deactivating coupon:', error);
        setErrors(['Failed to deactivate coupon.']);
      }
    }
  };

  const handleServiceToggle = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      applicableServices: prev.applicableServices.includes(serviceId)
        ? prev.applicableServices.filter(id => id !== serviceId)
        : [...prev.applicableServices, serviceId]
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          Please log in to access the coupon management system.
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Coupon Management</h1>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? 'Cancel' : 'Create New Coupon'}
            </button>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              {success}
              <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
            </div>
          )}

          {errors.length > 0 && (
            <div className="alert alert-danger" role="alert">
              <ul className="mb-0">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Create Coupon Form */}
          {showCreateForm && (
            <div className="card mb-4">
              <div className="card-header">
                <h3>Create New Coupon</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Coupon Code *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.code}
                        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        placeholder="e.g., SAVE20"
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Description *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="e.g., 20% off all services"
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Discount Type *</label>
                      <select
                        className="form-select"
                        value={formData.discountType}
                        onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value as 'percentage' | 'fixed_amount' }))}
                      >
                        <option value="percentage">Percentage</option>
                        <option value="fixed_amount">Fixed Amount</option>
                      </select>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">
                        Discount Value * {formData.discountType === 'percentage' ? '(%)' : '($)'}
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.discountValue}
                        onChange={(e) => setFormData(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                        min="0"
                        max={formData.discountType === 'percentage' ? "100" : undefined}
                        step={formData.discountType === 'percentage' ? "1" : "0.01"}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Minimum Order Amount ($)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.minimumOrderAmount}
                        onChange={(e) => setFormData(prev => ({ ...prev, minimumOrderAmount: e.target.value }))}
                        min="0"
                        step="0.01"
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Max Uses</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.maxUses}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxUses: e.target.value }))}
                        min="1"
                        placeholder="Unlimited"
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Valid From *</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={formData.validFrom}
                        onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Valid Until *</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={formData.validUntil}
                        onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Applicable Services (leave empty for all services)</label>
                    <div className="row">
                      {services.map(service => (
                        <div key={service.id} className="col-md-6 col-lg-4 mb-2">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`service-${service.id}`}
                              checked={formData.applicableServices.includes(service.id)}
                              onChange={() => handleServiceToggle(service.id)}
                            />
                            <label className="form-check-label" htmlFor={`service-${service.id}`}>
                              {service.name}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      />
                      <label className="form-check-label" htmlFor="isActive">
                        Active
                      </label>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary">
                      Create Coupon
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowCreateForm(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Coupons List */}
          <div className="card">
            <div className="card-header">
              <h3>Existing Coupons</h3>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : coupons.length === 0 ? (
                <p className="text-muted text-center py-4">No coupons created yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Description</th>
                        <th>Discount</th>
                        <th>Uses</th>
                        <th>Valid Period</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map(coupon => (
                        <tr key={coupon.id}>
                          <td>
                            <code className="text-primary">{coupon.code}</code>
                          </td>
                          <td>{coupon.description}</td>
                          <td>
                            {coupon.discountType === 'percentage'
                              ? `${coupon.discountValue}%`
                              : `$${coupon.discountValue}`
                            }
                          </td>
                          <td>
                            {coupon.currentUses}
                            {coupon.maxUses ? ` / ${coupon.maxUses}` : ' / ∞'}
                          </td>
                          <td>
                            <small>
                              {coupon.validFrom.toLocaleDateString()} - {coupon.validUntil.toLocaleDateString()}
                            </small>
                          </td>
                          <td>
                            <span className={`badge ${coupon.isActive ? 'bg-success' : 'bg-secondary'}`}>
                              {coupon.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            {coupon.isActive && (
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeactivate(coupon.id)}
                              >
                                Deactivate
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
