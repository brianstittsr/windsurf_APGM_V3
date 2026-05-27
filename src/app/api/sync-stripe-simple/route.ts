import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16'
});

// Sample client data for testing - in production this would come from Firebase
const sampleClients = [
  {
    id: 'client1',
    email: 'client1@example.com',
    firstName: 'Jane',
    lastName: 'Doe',
    phone: '+1234567890',
    address: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zipCode: '12345'
  },
  {
    id: 'client2', 
    email: 'client2@example.com',
    firstName: 'John',
    lastName: 'Smith',
    phone: '+0987654321',
    address: '456 Oak Ave',
    city: 'Sometown',
    state: 'NY',
    zipCode: '67890'
  }
];

export async function POST(request: Request) {
  try {
    const { test = false } = await request.json();

    if (test) {
      // Test mode - create 1-2 sample customers
      const results = [];
      
      for (const client of sampleClients.slice(0, 2)) {
        try {
          const customer = await stripe.customers.create({
            email: client.email,
            name: `${client.firstName} ${client.lastName}`,
            phone: client.phone,
            address: {
              line1: client.address,
              city: client.city,
              state: client.state,
              postal_code: client.zipCode
            },
            metadata: {
              firebaseUserId: client.id,
              role: 'client',
              test: 'true',
              timestamp: new Date().toISOString()
            }
          });

          console.log(`✅ Created test Stripe customer: ${customer.id} for ${client.email}`);
          
          results.push({
            clientId: client.id,
            email: client.email,
            stripeCustomerId: customer.id,
            status: 'success'
          });

        } catch (error) {
          console.error(`❌ Error creating customer for ${client.email}:`, error);
          results.push({
            clientId: client.id,
            email: client.email,
            error: error instanceof Error ? error.message : 'Unknown error',
            status: 'error'
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: `Test sync completed: ${results.filter(r => r.status === 'success').length} successful, ${results.filter(r => r.status === 'error').length} errors`,
        results
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Please set test=true to run the test sync'
    });

  } catch (error) {
    console.error('❌ Simple Stripe sync failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
