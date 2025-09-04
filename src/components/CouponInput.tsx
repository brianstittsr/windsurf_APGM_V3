'use client';

import { useState } from 'react';
import { CouponCode } from '@/types/database';
import { CouponService } from '@/services/couponService';

interface CouponInputProps {
  serviceId?: string;
  orderAmount: number;
  onCouponApplied: (coupon: CouponCode | null, discount: number) => void;
  appliedCoupon?: CouponCode | null;
}

export default function CouponInput({ serviceId, orderAmount, onCouponApplied, appliedCoupon }: CouponInputProps) {
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const validation = await CouponService.validateCoupon(
        couponCode.trim(),
        serviceId,
        orderAmount
      );

      if (!validation.isValid) {
        setError(validation.error || 'Invalid coupon code');
        setLoading(false);
        return;
      }

      if (validation.coupon) {
        const discount = CouponService.calculateDiscount(validation.coupon, orderAmount);
        onCouponApplied(validation.coupon, discount);
        setSuccess(`Coupon applied! You saved $${discount.toFixed(2)}`);
        setCouponCode('');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setError('Failed to apply coupon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    onCouponApplied(null, 0);
    setSuccess('');
    setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApplyCoupon();
    }
  };

  return (
    <div className="card mb-3">
      <div className="card-body">
        <h6 className="card-title mb-3">
          <i className="fas fa-tag me-2"></i>
          Coupon Code
        </h6>

        {appliedCoupon ? (
          <div className="d-flex align-items-center justify-content-between p-3 bg-success bg-opacity-10 rounded">
            <div>
              <div className="d-flex align-items-center">
                <i className="fas fa-check-circle text-success me-2"></i>
                <strong className="text-success">Coupon Applied: {appliedCoupon.code}</strong>
              </div>
              <small className="text-muted">{appliedCoupon.description}</small>
              <div className="mt-1">
                <small className="text-success">
                  {appliedCoupon.type === 'percentage' 
                    ? `${appliedCoupon.value}% discount`
                    : appliedCoupon.type === 'exact_amount' && appliedCoupon.exactAmount
                    ? `Service price set to $${appliedCoupon.exactAmount}`
                    : appliedCoupon.type === 'free_service'
                    ? 'Free service'
                    : `$${appliedCoupon.value} discount`
                  }
                </small>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={handleRemoveCoupon}
            >
              Remove
            </button>
          </div>
        ) : (
          <>
            <div className="input-group mb-2">
              <input
                type="text"
                className={`form-control ${error ? 'is-invalid' : success ? 'is-valid' : ''}`}
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  setError('');
                  setSuccess('');
                }}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={handleApplyCoupon}
                disabled={loading || !couponCode.trim()}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Applying...
                  </>
                ) : (
                  'Apply'
                )}
              </button>
            </div>

            {error && (
              <div className="alert alert-danger alert-sm mb-0" role="alert">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success alert-sm mb-0" role="alert">
                <i className="fas fa-check-circle me-2"></i>
                {success}
              </div>
            )}
          </>
        )}

        <div className="mt-2">
          <small className="text-muted">
            <i className="fas fa-info-circle me-1"></i>
            Have a coupon code? Enter it above to apply your discount.
          </small>
        </div>
      </div>
    </div>
  );
}
