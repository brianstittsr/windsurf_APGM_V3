'use client';

import { useState } from 'react';
import { useStripe } from '@stripe/stripe-react';
import { Button } from '@/components/ui/button';
import { PaymentForm } from '@/components/ui/PaymentForm';
import { toast } from 'sonner';

type BookingPaymentStepProps = {
  amount: number;
  onSuccess: () => void;
};

export function BookingPaymentStep({ amount, onSuccess }: BookingPaymentStepProps) {
  const stripe = useStripe();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const initializePayment = async () => {
    setLoading(true);
    try {
      // In production, replace with actual API call
      const mockSecret = 'pi_mock_secret_' + Math.random().toString(36).substring(2);
      setClientSecret(mockSecret);
      toast.success('Payment initialized - Enter card details');
    } catch (error) {
      toast.error('Failed to initialize payment', {
        description: 'Please try again or contact support'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentId: string) => {
    toast.success('Payment successful!', {
      description: `Transaction ID: ${paymentId.slice(-8)}`,
      action: {
        label: 'View Receipt',
        onClick: () => console.log('Receipt viewed')
      }
    });
    onSuccess();
  };

  const handlePaymentError = (error: string) => {
    toast.error('Payment failed', {
      description: error
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Payment</h3>
      
      {!clientSecret ? (
        <Button 
          onClick={initializePayment} 
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Initializing...' : 'Initialize Payment'}
        </Button>
      ) : (
        <PaymentForm 
          amount={amount} 
          clientSecret={clientSecret}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      )}
    </div>
  );
}
