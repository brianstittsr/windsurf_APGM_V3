'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PaymentForm } from '@/components/ui/PaymentForm';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);

  useEffect(() => {
    const secret = searchParams.get('client_secret');
    if (secret) {
      setClientSecret(secret);
      // In production, you would fetch amount from API based on payment intent
      setAmount(5000); // Mock amount (in cents)
    } else {
      toast.error('Invalid payment link');
    }
  }, [searchParams]);

  const handlePaymentSuccess = (paymentId: string) => {
    toast.success('Payment completed!');
    // Redirect to success page or clear form
  };

  const handlePaymentError = (error: string) => {
    toast.error(`Payment failed: ${error}`);
  };

  if (!clientSecret || !amount) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading payment details...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Complete Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <PaymentForm 
          amount={amount} 
          clientSecret={clientSecret}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      </CardContent>
    </Card>
  );
}
