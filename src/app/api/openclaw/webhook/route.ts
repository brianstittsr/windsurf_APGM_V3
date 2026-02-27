import { NextResponse } from 'next/server';
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

interface OpenClawMessage {
  channel: string;
  from: string;
  text: string;
  timestamp: string;
  sessionId?: string;
  wizardState?: {
    flowId?: string;
    currentStep?: number;
    data?: any;
    startedAt?: string;
  };
}

export async function POST(request: Request) {
  try {
    const message: OpenClawMessage = await request.json();
    
    // Log the conversation
    await addDoc(collection(getDb(), 'openclawLogs'), {
      channel: message.channel,
      customer: message.from,
      message: message.text,
      timestamp: Timestamp.now(),
      sessionId: message.sessionId
    });

    // Check if this is a wizard flow message
    if (message.wizardState?.flowId || message.text.includes('wizard') || message.text.includes('step')) {
      // Forward to wizard handler
      const wizardResponse = await fetch('/api/openclaw/wizard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
      return wizardResponse;
    }

    // Parse intent from message
    const intent = await parseIntent(message.text);
    
    // Handle different intents
    switch (intent.type) {
      case 'book_appointment':
        return await handleBooking(message, intent);
      
      case 'check_availability':
        return await handleAvailability(message, intent);
      
      case 'get_services':
        return await handleServices(message);
      
      case 'get_pricing':
        return await handlePricing(message);
      
      case 'reschedule':
        return await handleReschedule(message, intent);
      
      case 'cancel':
        return await handleCancel(message, intent);
      
      default:
        return await handleGeneral(message);
    }
  } catch (error) {
    console.error('OpenClaw webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function parseIntent(text: string): Promise<{ type: string; data?: any }> {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('book') || lowerText.includes('appointment') || lowerText.includes('schedule')) {
    return { type: 'book_appointment' };
  }
  
  if (lowerText.includes('available') || lowerText.includes('availability') || lowerText.includes('when')) {
    return { type: 'check_availability' };
  }
  
  if (lowerText.includes('service') || lowerText.includes('what do you offer')) {
    return { type: 'get_services' };
  }
  
  if (lowerText.includes('price') || lowerText.includes('cost') || lowerText.includes('how much')) {
    return { type: 'get_pricing' };
  }
  
  if (lowerText.includes('reschedule') || lowerText.includes('change') || lowerText.includes('move')) {
    return { type: 'reschedule' };
  }
  
  if (lowerText.includes('cancel')) {
    return { type: 'cancel' };
  }
  
  return { type: 'general' };
}

async function handleBooking(message: OpenClawMessage, intent: any) {
  const response = {
    text: "I'd be happy to help you book an appointment! 💄\n\nWe offer:\n• Microblading - $350\n• Lip Blushing - $400\n• Eyeliner - $300\n\nWhich service are you interested in?",
    quickReplies: ['Microblading', 'Lip Blushing', 'Eyeliner']
  };
  
  return NextResponse.json(response);
}

async function handleAvailability(message: OpenClawMessage, intent: any) {
  try {
    const db = getDb();
    const bookingsRef = collection(db, 'bookings');
    const today = new Date().toISOString().split('T')[0];
    
    const q = query(
      bookingsRef,
      where('date', '>=', today),
      where('status', '==', 'confirmed')
    );
    
    const snapshot = await getDocs(q);
    const bookingCount = snapshot.size;

    const response = {
      text: `We have ${bookingCount} confirmed appointments scheduled. Our next available slots are:\n\n• Tomorrow at 2:00 PM\n• Friday at 10:00 AM\n• Saturday at 3:30 PM\n\nWould you like to book one of these times?`,
      quickReplies: ['Tomorrow 2pm', 'Friday 10am', 'Saturday 3:30pm']
    };
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({
      text: "I'm checking our availability now. Please visit our website or call us at (555) 123-4567 for real-time availability."
    });
  }
}

async function handleServices(message: OpenClawMessage) {
  const response = {
    text: "✨ Our PMU Services:\n\n🎨 **Microblading** - $350\nNatural-looking eyebrows using semi-permanent pigment. Lasts 1-3 years.\n\n💋 **Lip Blushing** - $400\nEnhance your natural lip color. Lasts 2-3 years.\n\n👁️ **Eyeliner** - $300\nPermanent eyeliner definition. Lasts 3-5 years.\n\nAll services include a free touch-up within 6 weeks!\n\nWould you like to book an appointment?",
    quickReplies: ['Book Now', 'Learn More', 'Pricing']
  };
  
  return NextResponse.json(response);
}

async function handlePricing(message: OpenClawMessage) {
  const response = {
    text: "💰 **Pricing:**\n\n• Microblading: $350\n• Lip Blushing: $400\n• Eyeliner: $300\n\nAll prices include:\n✓ Consultation\n✓ Procedure\n✓ Aftercare kit\n✓ Free touch-up (within 6 weeks)\n\n$100 deposit required to book.\n\nReady to schedule?",
    quickReplies: ['Book Microblading', 'Book Lip Blushing', 'Book Eyeliner']
  };
  
  return NextResponse.json(response);
}

async function handleReschedule(message: OpenClawMessage, intent: any) {
  const response = {
    text: "I can help you reschedule your appointment. Please provide your:\n\n1. Name\n2. Current appointment date\n3. Preferred new date/time\n\nOr call us at (555) 123-4567 for immediate assistance."
  };
  
  return NextResponse.json(response);
}

async function handleCancel(message: OpenClawMessage, intent: any) {
  const response = {
    text: "I understand you need to cancel. Please note our cancellation policy:\n\n• 48+ hours notice: Full refund\n• 24-48 hours: 50% refund\n• Less than 24 hours: No refund\n\nTo proceed with cancellation, please call us at (555) 123-4567 with your booking confirmation number."
  };
  
  return NextResponse.json(response);
}

async function handleGeneral(message: OpenClawMessage) {
  const response = {
    text: "Hello! 👋 I'm your PMU booking assistant.\n\nI can help you with:\n• Booking appointments\n• Checking availability\n• Service information\n• Pricing details\n• Rescheduling\n\nWhat would you like to know?",
    quickReplies: ['Book Appointment', 'View Services', 'Check Availability']
  };
  
  return NextResponse.json(response);
}
