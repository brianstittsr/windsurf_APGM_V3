'use client';

import React, { useState } from 'react';
import { GiftCard } from '@/types/database';
import { GiftCardService } from '@/services/giftCardService';

interface GiftCardInputProps {
  orderAmount: number;
  onGiftCardApplied: (giftCard: GiftCard | null, appliedAmount: number) => void;
  appliedGiftCard?: GiftCard | null;
  appliedAmount?: number;
}

export default function GiftCardInput({ 
  orderAmount, 
  onGiftCardApplied, 
  appliedGiftCard,
  appliedAmount = 0
}: GiftCardInputProps) {
  const [giftCardCode, setGiftCardCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleApplyGiftCard = async () => {
    if (!giftCardCode.trim()) {
      setError('Please enter a gift card code');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const validation = await GiftCardService.validateGiftCard(
        giftCardCode.trim(),
        orderAmount
      );

      if (!validation.isValid) {
        setError(validation.error || 'Invalid gift card code');
        setLoading(false);
        return;
      }

      if (validation.giftCard) {
        // remainingAmount is in cents, orderAmount is in dollars
        const availableAmountInDollars = validation.giftCard.remainingAmount / 100;
        const appliedAmount = Math.min(availableAmountInDollars, orderAmount);
        onGiftCardApplied(validation.giftCard, appliedAmount);
        setSuccess(`Gift card applied! $${appliedAmount.toFixed(2)} credit applied.`);
        setGiftCardCode('');
      }
    } catch (error) {
      console.error('Error applying gift card:', error);
      setError('Failed to apply gift card. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveGiftCard = () => {
    onGiftCardApplied(null, 0);
    setSuccess('');
    setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApplyGiftCard();
    }
  };

  return (
    <div className="card mb-3">
      <div className="card-body">
        <h6 className="card-title mb-3">
          <i className="fas fa-gift me-2"></i>
          Gift Card
        </h6>

        {appliedGiftCard ? (
          <div className="d-flex align-items-center justify-content-between p-3 bg-success bg-opacity-10 rounded">
            <div>
              <div className="d-flex align-items-center">
                <i className="fas fa-check-circle text-success me-2"></i>
                <strong className="text-success">Gift Card Applied: {appliedGiftCard.code}</strong>
              </div>
              <div className="mt-1">
                <small className="text-success">
                  Credit Applied: ${appliedAmount.toFixed(2)}
                </small>
              </div>
              <div className="mt-1">
                <small className="text-muted">
                  Remaining Balance: ${((appliedGiftCard.remainingAmount - (appliedAmount * 100)) / 100).toFixed(2)}
                </small>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={handleRemoveGiftCard}
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
                placeholder="Enter gift card code"
                value={giftCardCode}
                onChange={(e) => {
                  setGiftCardCode(e.target.value.toUpperCase());
                  setError('');
                  setSuccess('');
                }}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={handleApplyGiftCard}
                disabled={loading || !giftCardCode.trim()}
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
            Have a gift card? Enter the code above to apply your balance.
          </small>
        </div>
      </div>
    </div>
  );
}
