'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookingPaymentStep } from './BookingPaymentStep';
import { toast } from 'sonner';

type BookingConfirmationProps = {
  booking: {
    id: string;
    service: string;
    artist: string;
    date: string;
    time: string;
    price: number;
  };
  onComplete: () => void;
};

export function BookingConfirmation({ booking, onComplete }: BookingConfirmationProps) {
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Booking Confirmation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-medium">{booking.service}</h3>
          <p className="text-muted-foreground">
            {booking.date} at {booking.time} with {booking.artist}
          </p>
          <p className="font-medium">Total: ${booking.price.toFixed(2)}</p>
        </div>

        {!paymentCompleted ? (
          <BookingPaymentStep 
            amount={booking.price * 100} 
            onSuccess={() => setPaymentCompleted(true)} 
          />
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-md text-green-700">
              Payment successful! Your booking is confirmed.
            </div>
            <Button onClick={onComplete} className="w-full">
              Finish
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
