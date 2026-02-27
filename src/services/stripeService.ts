import Stripe from 'stripe';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '@/lib/firebase-config';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

type PaymentIntentParams = {
  amount: number;
  currency?: string;
  customerId?: string;
  metadata?: Record<string, string>;
  description?: string;
};

export class StripeService {
  private stripe: Stripe;
  
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-08-27.basil'
    });
  }

  async createPaymentIntent(params: PaymentIntentParams) {
    const { amount, currency = 'usd', ...rest } = params;
    
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency,
      ...rest
    });

    await setDoc(doc(db, 'payments', paymentIntent.id), {
      status: 'created',
      amount,
      currency,
      createdAt: new Date(),
      ...rest
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentId: paymentIntent.id
    };
  }

  async handleWebhookEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await setDoc(doc(db, 'payments', paymentIntent.id), {
          status: 'succeeded',
          updatedAt: new Date()
        }, { merge: true });
        break;
      
      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object as Stripe.PaymentIntent;
        await setDoc(doc(db, 'payments', failedIntent.id), {
          status: 'failed',
          error: failedIntent.last_payment_error,
          updatedAt: new Date()
        }, { merge: true });
        break;
    }
  }
}
