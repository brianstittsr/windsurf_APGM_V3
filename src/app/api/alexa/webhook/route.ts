import { NextResponse } from 'next/server';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Alexa request validation
    if (!body.request || !body.request.type) {
      return NextResponse.json(
        { error: 'Invalid Alexa request' },
        { status: 400 }
      );
    }

    const requestType = body.request.type;
    const intent = body.request.intent?.name;

    // Handle different request types
    switch (requestType) {
      case 'LaunchRequest':
        return handleLaunchRequest();
      
      case 'IntentRequest':
        return handleIntentRequest(intent, body.request.intent);
      
      case 'SessionEndedRequest':
        return handleSessionEnd();
      
      default:
        return NextResponse.json({
          version: '1.0',
          response: {
            outputSpeech: {
              type: 'PlainText',
              text: 'Sorry, I didn\'t understand that request.'
            },
            shouldEndSession: true
          }
        });
    }
  } catch (error) {
    console.error('Alexa webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function handleLaunchRequest() {
  return NextResponse.json({
    version: '1.0',
    response: {
      outputSpeech: {
        type: 'PlainText',
        text: 'Welcome to the permanent makeup booking assistant. You can ask about our services, check availability, or book an appointment. How can I help you today?'
      },
      shouldEndSession: false
    }
  });
}

async function handleIntentRequest(intentName: string, intent: any) {
  switch (intentName) {
    case 'BookAppointment':
      return handleBookAppointment(intent);
    
    case 'CheckAvailability':
      return handleCheckAvailability(intent);
    
    case 'ServiceInfo':
      return handleServiceInfo(intent);
    
    case 'BusinessHours':
      return handleBusinessHours();
    
    case 'CancelAppointment':
      return handleCancelAppointment(intent);
    
    case 'AMAZON.HelpIntent':
      return handleHelp();
    
    case 'AMAZON.StopIntent':
    case 'AMAZON.CancelIntent':
      return handleStop();
    
    default:
      return NextResponse.json({
        version: '1.0',
        response: {
          outputSpeech: {
            type: 'PlainText',
            text: 'I\'m not sure how to help with that. You can ask about our services, check availability, or book an appointment.'
          },
          shouldEndSession: false
        }
      });
  }
}

async function handleBookAppointment(intent: any) {
  // Extract slots (service, date, time)
  const service = intent.slots?.service?.value;
  
  if (!service) {
    return NextResponse.json({
      version: '1.0',
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: 'I can help you book an appointment. What service are you interested in? We offer microblading, lip blushing, and eyeliner tattooing.'
        },
        shouldEndSession: false
      }
    });
  }

  return NextResponse.json({
    version: '1.0',
    response: {
      outputSpeech: {
        type: 'PlainText',
        text: `Great! I can help you book ${service}. To complete your booking, please visit our website or call us at your convenience. Our team will be happy to schedule your appointment.`
      },
      card: {
        type: 'Simple',
        title: 'Book Your Appointment',
        content: 'Visit our website to complete your booking or call us to schedule.'
      },
      shouldEndSession: true
    }
  });
}

async function handleCheckAvailability(intent: any) {
  try {
    const db = getDb();
    const bookingsRef = collection(db, 'bookings');
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Query for upcoming bookings
    const q = query(
      bookingsRef,
      where('date', '>=', today),
      where('status', '==', 'confirmed')
    );
    
    const snapshot = await getDocs(q);
    const bookingCount = snapshot.size;

    return NextResponse.json({
      version: '1.0',
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: `We currently have ${bookingCount} confirmed appointments scheduled. For specific availability, please visit our website or call us to check real-time openings.`
        },
        shouldEndSession: false
      }
    });
  } catch (error) {
    return NextResponse.json({
      version: '1.0',
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: 'I\'m having trouble checking availability right now. Please visit our website or call us for the most up-to-date information.'
        },
        shouldEndSession: false
      }
    });
  }
}

async function handleServiceInfo(intent: any) {
  const service = intent.slots?.service?.value;

  const services = {
    microblading: 'Microblading creates natural-looking eyebrows using semi-permanent pigment. The procedure takes about 2 hours and lasts 1 to 3 years.',
    'lip blushing': 'Lip blushing enhances your natural lip color with semi-permanent pigment. It takes about 2 hours and lasts 2 to 3 years.',
    eyeliner: 'Permanent eyeliner defines your eyes with long-lasting pigment. The procedure takes 1 to 2 hours and lasts 3 to 5 years.'
  };

  const serviceInfo = service ? services[service.toLowerCase()] : null;

  if (serviceInfo) {
    return NextResponse.json({
      version: '1.0',
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: serviceInfo
        },
        shouldEndSession: false
      }
    });
  }

  return NextResponse.json({
    version: '1.0',
    response: {
      outputSpeech: {
        type: 'PlainText',
        text: 'We offer microblading for eyebrows, lip blushing for lips, and permanent eyeliner. Which service would you like to know more about?'
      },
      shouldEndSession: false
    }
  });
}

function handleBusinessHours() {
  return NextResponse.json({
    version: '1.0',
    response: {
      outputSpeech: {
        type: 'PlainText',
        text: 'We are open Monday through Friday from 9 AM to 6 PM, and Saturday from 10 AM to 4 PM. We are closed on Sundays.'
      },
      card: {
        type: 'Simple',
        title: 'Business Hours',
        content: 'Mon-Fri: 9 AM - 6 PM\nSat: 10 AM - 4 PM\nSun: Closed'
      },
      shouldEndSession: false
    }
  });
}

async function handleCancelAppointment(intent: any) {
  return NextResponse.json({
    version: '1.0',
    response: {
      outputSpeech: {
        type: 'PlainText',
        text: 'To cancel your appointment, please call us or visit our website. We\'ll need your booking confirmation number to process the cancellation.'
      },
      shouldEndSession: true
    }
  });
}

function handleHelp() {
  return NextResponse.json({
    version: '1.0',
    response: {
      outputSpeech: {
        type: 'PlainText',
        text: 'I can help you with booking appointments, checking availability, learning about our services, or finding our business hours. What would you like to know?'
      },
      shouldEndSession: false
    }
  });
}

function handleStop() {
  return NextResponse.json({
    version: '1.0',
    response: {
      outputSpeech: {
        type: 'PlainText',
        text: 'Thank you for using our booking assistant. Have a great day!'
      },
      shouldEndSession: true
    }
  });
}

function handleSessionEnd() {
  return NextResponse.json({
    version: '1.0',
    response: {
      shouldEndSession: true
    }
  });
}
