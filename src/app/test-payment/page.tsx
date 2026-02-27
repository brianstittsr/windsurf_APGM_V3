'use client';

import MultiPaymentForm from '@/components/MultiPaymentForm';
import { Card } from '@/components/ui/card';

export default function TestPaymentPage() {
  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Test Payment Flow</h1>
          <MultiPaymentForm />
        </div>
      </Card>
    </div>
  );
}
