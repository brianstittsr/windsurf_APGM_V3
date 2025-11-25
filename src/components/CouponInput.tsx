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
    <div className="card border-0 shadow-lg mb-4" style={{borderRadius: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      <div className="card-body p-4">
        <div className="d-flex align-items-center mb-3">
          <div className="bg-white bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '48px', height: '48px'}}>
            <i className="fas fa-tags text-white" style={{fontSize: '1.25rem'}}></i>
          </div>
          <div>
            <h5 className="card-title mb-0 fw-bold text-white">
              Have a Coupon Code?
            </h5>
            <p className="text-white text-opacity-75 mb-0 small">Save money on your booking!</p>
          </div>
        </div>

        {appliedCoupon ? (
          <div className="d-flex align-items-center justify-content-between p-3 bg-white rounded-3 shadow-sm">
            <div>
              <div className="d-flex align-items-center">
                <i className="fas fa-check-circle text-success me-2" style={{fontSize: '1.25rem'}}></i>
                <strong className="text-success" style={{fontSize: '1.1rem'}}>Coupon Applied: {appliedCoupon.code}</strong>
              </div>
              <small className="text-dark">{appliedCoupon.description}</small>
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
                className={`form-control form-control-lg ${error ? 'is-invalid' : success ? 'is-valid' : ''}`}
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  setError('');
                  setSuccess('');
                }}
                onKeyPress={handleKeyPress}
                disabled={loading}
                style={{borderRadius: '12px 0 0 12px', fontSize: '1.1rem', fontWeight: '600'}}
              />
              <button
                type="button"
                className="btn btn-warning btn-lg fw-bold"
                onClick={handleApplyCoupon}
                disabled={loading || !couponCode.trim()}
                style={{borderRadius: '0 12px 12px 0', minWidth: '120px'}}
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

        <div className="mt-3 p-3 bg-white bg-opacity-10 rounded-3">
          <small className="text-white d-flex align-items-center">
            <i className="fas fa-gift me-2" style={{fontSize: '1rem'}}></i>
            <span>Enter your coupon code above to unlock special savings and discounts!</span>
          </small>
        </div>
      </div>
    </div>
  );
}
