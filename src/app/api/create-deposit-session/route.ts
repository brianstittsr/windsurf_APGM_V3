import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid'; // Using uuid package without type declarations
import { getDb } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-08-16' as any, // Using as any to bypass strict version checking
});

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { email, name, phone, serviceName, servicePrice, serviceId } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Create a unique booking ID
    const bookingId = `QD-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Calculate the deposit amount (fixed at $50)
    const depositAmount = 5000; // In cents

    // Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Deposit for ${serviceName || 'Permanent Makeup Service'}`,
              description: 'Secure your appointment and receive the GRANDOPEN250 coupon code',
              images: ['https://example.com/pmu-service.jpg'], // Replace with your service image
            },
            unit_amount: depositAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId,
        email,
        name,
        phone,
        serviceName,
        serviceId,
        type: 'quick-deposit',
      },
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/quick-deposit/success?bookingId=${bookingId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/quick-deposit?canceled=true`,
    });

    // Store the booking details in Firestore
    try {
      const db = getDb();
      await setDoc(doc(db, 'bookings', bookingId), {
        clientName: name,
        clientEmail: email,
        clientPhone: phone || '',
        serviceName: serviceName || 'Permanent Makeup Service',
        serviceId: serviceId || 'quick-deposit',
        status: 'pending_deposit',
        price: servicePrice || 500,
        depositAmount: depositAmount / 100, // Convert from cents to dollars
        depositPaid: false, // Will be updated after payment confirmation
        stripeSessionId: session.id,
        createdAt: serverTimestamp(),
      });
    } catch (dbError) {
      console.error('Error storing booking details:', dbError);
      // Continue with the session creation even if database storage fails
    }

    return NextResponse.json({
      sessionId: session.id,
      bookingId,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
