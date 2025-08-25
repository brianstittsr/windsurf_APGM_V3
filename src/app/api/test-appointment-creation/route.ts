import { NextRequest, NextResponse } from 'next/server';
import { AppointmentService } from '@/services/database';
import { Timestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing Firebase appointment creation...');
    
    // Create a test appointment with all required fields
    const testAppointmentData = {
      clientId: 'test-client-id-' + Date.now(),
      clientName: 'Test Client',
      clientEmail: 'test@example.com',
      serviceId: 'blade-shade',
      serviceName: 'Blade & Shade Eyebrows',
      artistId: 'victoria',
      scheduledDate: '2025-08-30',
      scheduledTime: '10:00',
      status: 'pending' as const,
      totalAmount: 680,
      depositAmount: 220,
      remainingAmount: 460,
      paymentStatus: 'pending' as const,
      paymentIntentId: 'test-payment-intent-' + Date.now(),
      specialRequests: 'Test appointment creation',
      rescheduleCount: 0,
      confirmationSent: false,
      reminderSent: false
    };

    console.log('📋 Test appointment data:', JSON.stringify(testAppointmentData, null, 2));

    // Attempt to create the appointment
    const appointmentId = await AppointmentService.createAppointment(testAppointmentData);
    
    console.log('✅ Test appointment created successfully with ID:', appointmentId);

    // Verify the appointment was created by retrieving it
    const createdAppointment = await AppointmentService.getAppointmentById(appointmentId);
    
    if (!createdAppointment) {
      throw new Error('Failed to retrieve created appointment');
    }

    console.log('✅ Test appointment retrieved successfully:', createdAppointment);

    return NextResponse.json({
      success: true,
      message: 'Firebase appointment creation test passed',
      appointmentId,
      appointmentData: createdAppointment,
      testResults: {
        creationSuccessful: true,
        retrievalSuccessful: true,
        dataIntegrity: {
          clientId: createdAppointment.clientId === testAppointmentData.clientId,
          serviceName: createdAppointment.serviceName === testAppointmentData.serviceName,
          scheduledDate: createdAppointment.scheduledDate === testAppointmentData.scheduledDate,
          totalAmount: createdAppointment.totalAmount === testAppointmentData.totalAmount
        }
      }
    });

  } catch (error) {
    console.error('❌ Firebase appointment creation test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : 'No stack trace available',
      testResults: {
        creationSuccessful: false,
        retrievalSuccessful: false,
        errorType: error instanceof Error ? error.constructor.name : 'Unknown'
      }
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Firebase Appointment Creation Test Endpoint',
    usage: 'Send POST request to test appointment creation',
    purpose: 'Verify Firebase appointment creation works without errors'
  });
}
