'use client';

import React, { useState } from 'react';
import { GiftCard } from '@/types/database';
import { GiftCardService } from '@/services/giftCardService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Gift, CheckCircle, AlertTriangle, Info, Loader2, X } from 'lucide-react';

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
    <Card className="mb-6 border-0 shadow-md">
      <CardContent className="p-6">
        <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
          <Gift className="w-5 h-5 text-[#AD6269]" />
          Gift Card
        </h3>

        {appliedGiftCard ? (
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-bold text-green-600">Gift Card Applied: {appliedGiftCard.code}</span>
              </div>
              <p className="text-green-600 text-sm mt-1">
                Credit Applied: ${appliedAmount.toFixed(2)}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Remaining Balance: ${((appliedGiftCard.remainingAmount - (appliedAmount * 100)) / 100).toFixed(2)}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveGiftCard}
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
                placeholder="Enter gift card code"
                value={giftCardCode}
                onChange={(e) => {
                  setGiftCardCode(e.target.value.toUpperCase());
                  setError('');
                  setSuccess('');
                }}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="h-11"
              />
              <Button
                variant="outline"
                onClick={handleApplyGiftCard}
                disabled={loading || !giftCardCode.trim()}
                className="h-11 px-6 border-[#AD6269] text-[#AD6269] hover:bg-[#AD6269]/10"
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
              <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4" />
                {success}
              </div>
            )}
          </>
        )}

        <p className="text-gray-500 text-sm mt-3 flex items-center gap-1">
          <Info className="w-4 h-4" />
          Have a gift card? Enter the code above to apply your balance.
        </p>
      </CardContent>
    </Card>
  );
}
