'use client';

import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/stripe-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

type PaymentFormProps = {
  amount: number;
  clientSecret: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
};

export function PaymentForm({ 
  amount, 
  clientSecret,
  onSuccess, 
  onError 
}: PaymentFormProps) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    
    if (!stripe || !elements) {
      setError('Payment system not ready');
      return;
    }

    setProcessing(true);
    
    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
          }
        }
      );

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        onError(stripeError.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed';
      setError(message);
      onError(message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="border rounded-md p-4">
        <CardElement options={{ hidePostalCode: true }} />
      </div>
      
      <div className="flex justify-between items-center">
        <span className="font-medium">Total: ${(amount / 100).toFixed(2)}</span>
        <Button type="submit" disabled={!stripe || processing}>
          {processing ? 'Processing...' : 'Pay Now'}
        </Button>
      </div>
    </form>
  );
}
