'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { StripeService } from '@/services/stripeService';
import { ClientPackage } from '@/types/package';
import { toast } from 'sonner';

type PaymentMethod = 'card' | 'paypal' | null;

export function PackageCheckoutWithPayment() {
  const { user } = useAuth();
  const [packageData, setPackageData] = useState<ClientPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  
  const stripeService = new StripeService();

  const handleCheckout = async () => {
    if (!packageData || !paymentMethod) return;
    
    setProcessingPayment(true);
    try {
      // Create payment intent
      const { clientSecret } = await stripeService.createPaymentIntent({
        amount: packageData.price * 100, // in cents
        description: `Payment for ${packageData.name}`,
        metadata: {
          userId: user?.uid || '',
          packageId: packageData.id
        }
      });
      
      // TODO: Implement Stripe Elements payment form
      toast.success('Payment initialized');
    } catch (error) {
      console.error(error);
      toast.error('Payment processing failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Package Checkout</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {packageData && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">{packageData.name}</h3>
              <p className="text-muted-foreground">${packageData.price}</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Payment Method</h4>
              <div className="flex gap-4">
                <Button 
                  variant={paymentMethod === 'card' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('card')}
                >
                  Credit Card
                </Button>
                <Button 
                  variant={paymentMethod === 'paypal' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('paypal')}
                >
                  PayPal
                </Button>
              </div>
            </div>
            
            <Button 
              onClick={handleCheckout} 
              className="w-full"
              disabled={!paymentMethod || processingPayment}
            >
              {processingPayment ? 'Processing...' : 'Complete Payment'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
