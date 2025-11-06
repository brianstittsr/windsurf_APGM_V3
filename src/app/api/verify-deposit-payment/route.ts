import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getDb } from '@/lib/firebase';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { workflowEngine } from '@/services/bmad-workflows';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-08-16' as any, // Using as any to bypass strict version checking
});

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { bookingId, sessionId } = body;

    if (!bookingId || !sessionId) {
      return NextResponse.json(
        { error: 'Booking ID and Session ID are required' },
        { status: 400 }
      );
    }

    // Verify the payment session with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Get the booking details from Firestore
    const db = getDb();
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingDoc = await getDoc(bookingRef);

    if (!bookingDoc.exists()) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const bookingData = bookingDoc.data();

    // Update the booking status in Firestore
    await updateDoc(bookingRef, {
      status: 'deposit_paid',
      depositPaid: true,
      paymentConfirmedAt: Timestamp.now(),
      stripePaymentIntent: session.payment_intent,
    });

    // Prepare data for the workflow
    const workflowData = {
      name: bookingData.clientName,
      email: bookingData.clientEmail,
      phone: bookingData.clientPhone || '',
      serviceName: bookingData.serviceName,
      serviceId: bookingData.serviceId,
      date: 'To be scheduled', // Will be set during full booking
      time: 'To be scheduled', // Will be set during full booking
      price: bookingData.price || 500,
      depositAmount: bookingData.depositAmount || 50,
      bookingId,
    };

    // Trigger the deposit_paid workflow
    try {
      await workflowEngine.executeWorkflow({
        type: 'deposit_paid',
        data: workflowData,
      });
    } catch (workflowError) {
      console.error('Error triggering deposit_paid workflow:', workflowError);
      // Don't fail the request if workflow fails - just log the error
    }

    // Return the updated booking data
    return NextResponse.json({
      success: true,
      booking: {
        ...bookingData,
        id: bookingId,
        status: 'deposit_paid',
      },
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
