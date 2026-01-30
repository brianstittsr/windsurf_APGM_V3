'use client';

import { useState } from 'react';
import { CouponCode } from '@/types/database';
import { CouponService } from '@/services/couponService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tag, CheckCircle, AlertTriangle, Gift, Loader2, X } from 'lucide-react';

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
    <Card className="mb-6 border-0 shadow-md overflow-hidden bg-gradient-to-br from-purple-500 to-purple-700">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/25 rounded-full flex items-center justify-center">
            <Tag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white">Have a Coupon Code?</h3>
            <p className="text-white/75 text-sm">Save money on your booking!</p>
          </div>
        </div>

        {appliedCoupon ? (
          <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-bold text-green-600">Coupon Applied: {appliedCoupon.code}</span>
              </div>
              <p className="text-gray-700 text-sm mt-1">{appliedCoupon.description}</p>
              <p className="text-green-600 text-sm mt-1">
                {appliedCoupon.type === 'percentage' 
                  ? `${appliedCoupon.value}% discount`
                  : appliedCoupon.type === 'exact_amount'
                  ? `Service price set to $${appliedCoupon.exactAmount || appliedCoupon.value}`
                  : appliedCoupon.type === 'price_override'
                  ? `Price override: $${appliedCoupon.value}`
                  : appliedCoupon.type === 'free_service'
                  ? 'Free service'
                  : `$${appliedCoupon.value} discount`
                }
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveCoupon}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-1" />
              Remove
            </Button>
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-3">
              <Input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  setError('');
                  setSuccess('');
                }}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="h-12 text-lg font-semibold bg-white"
              />
              <Button
                onClick={handleApplyCoupon}
                disabled={loading || !couponCode.trim()}
                className="h-12 px-6 bg-amber-500 hover:bg-amber-600 text-white font-bold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Applying...
                  </>
                ) : (
                  'Apply'
                )}
              </Button>
            </div>

            {error && (
              <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4" />
                {success}
              </div>
            )}
          </>
        )}

        <div className="mt-4 p-3 bg-white/10 rounded-xl">
          <p className="text-white text-sm flex items-center gap-2">
            <Gift className="w-4 h-4" />
            Enter your coupon code above to unlock special savings and discounts!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
