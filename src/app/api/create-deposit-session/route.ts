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
    const { email, name, phone, serviceName, servicePrice, serviceId, paymentMethodType = 'card' } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Create a unique booking ID
    const bookingId = `QD-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Calculate the payment amount
    // The servicePrice parameter now contains the actual payment amount
    // For BNPL methods: full service price
    // For card payments: could be deposit, full, or custom amount
    const paymentAmount = (servicePrice || 500) * 100; // Convert to cents

    // Determine if this is a full payment or deposit for product naming
    const isBNPL = ['klarna', 'afterpay', 'affirm'].includes(paymentMethodType);
    const isFullPayment = isBNPL || paymentAmount > 5000; // Assume full payment if amount > $50

    // Determine payment method types based on selection
    let paymentMethodTypes: string[] = [];
    let billingAddressRequired = false;
    let shippingAddressRequired = false;

    switch (paymentMethodType) {
      case 'klarna':
        paymentMethodTypes = ['klarna'];
        billingAddressRequired = true;
        shippingAddressRequired = true;
        break;
      case 'afterpay':
        paymentMethodTypes = ['afterpay_clearpay'];
        billingAddressRequired = true;
        shippingAddressRequired = true;
        break;
      case 'affirm':
        paymentMethodTypes = ['affirm'];
        billingAddressRequired = true;
        shippingAddressRequired = true;
        break;
      case 'card':
      default:
        paymentMethodTypes = ['card'];
        billingAddressRequired = false;
        shippingAddressRequired = false;
        break;
    }

    // Create the Stripe Checkout Session with specific payment method
    let session;
    try {
      const sessionConfig: any = {
        payment_method_types: paymentMethodTypes,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: isFullPayment 
                  ? `Payment for ${serviceName || 'Permanent Makeup Service'}`
                  : `Deposit for ${serviceName || 'Permanent Makeup Service'}`,
                description: isFullPayment 
                  ? 'Full payment for service'
                  : 'Secure your appointment',
              },
              unit_amount: paymentAmount,
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
          paymentMethodType,
        },
        customer_email: email,
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/quick-deposit/success?bookingId=${bookingId}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/quick-deposit?canceled=true`,
      };

      // Add address collection for BNPL methods
      if (billingAddressRequired) {
        sessionConfig.billing_address_collection = 'required';
      }
      if (shippingAddressRequired) {
        sessionConfig.shipping_address_collection = {
          allowed_countries: ['US'],
        };
      }

      session = await stripe.checkout.sessions.create(sessionConfig);
    } catch (stripeError: any) {
      console.error('Stripe error:', stripeError.message);
      return NextResponse.json(
        { 
          error: 'Failed to create checkout session', 
          details: stripeError.message,
          paymentMethodType,
        },
        { status: 500 }
      );
    }

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
        depositAmount: paymentAmount / 100, // Convert from cents to dollars
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
      url: session.url,
      bookingId,
      paymentMethodType,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
