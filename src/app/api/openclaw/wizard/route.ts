import { NextResponse } from 'next/server';
import { collection, addDoc, getDocs, query, where, Timestamp, doc, getDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

interface WizardMessage {
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

interface WizardFlow {
  id: string;
  name: string;
  description: string;
  steps: WizardStep[];
  enabled: boolean;
  useCase: string;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  type: 'selection' | 'input' | 'calendar' | 'confirmation';
  options?: { value: string; label: string; description?: string }[];
  validation?: {
    required: boolean;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

export async function POST(request: Request) {
  try {
    const message: WizardMessage = await request.json();
    
    // Log the conversation
    await addDoc(collection(getDb(), 'openclawWizardLogs'), {
      channel: message.channel,
      customer: message.from,
      message: message.text,
      timestamp: Timestamp.now(),
      sessionId: message.sessionId,
      wizardState: message.wizardState
    });

    // Check if this is starting a wizard flow
    const intent = await parseIntent(message.text);
    
    // Handle wizard flows
    if (message.wizardState?.flowId) {
      return await handleWizardFlow(message, intent);
    } else {
      // Check if user wants to start a wizard
      const wizardFlow = await detectWizardFlow(message.text);
      if (wizardFlow) {
        return await startWizardFlow(message, wizardFlow);
      } else {
        return await handleGeneralWizard(message);
      }
    }
  } catch (error) {
    console.error('OpenClaw wizard webhook error:', error);
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
  
  if (lowerText.includes('consultation') || lowerText.includes('discuss') || lowerText.includes('options')) {
    return { type: 'consultation_request' };
  }
  
  if (lowerText.includes('reschedule') || lowerText.includes('change') || lowerText.includes('move')) {
    return { type: 'reschedule_request' };
  }
  
  if (lowerText.includes('cancel')) {
    return { type: 'cancellation_request' };
  }
  
  if (lowerText.includes('service') || lowerText.includes('pricing') || lowerText.includes('cost')) {
    return { type: 'service_inquiry' };
  }
  
  return { type: 'general' };
}

async function detectWizardFlow(text: string): Promise<WizardFlow | null> {
  const lowerText = text.toLowerCase();
  
  // Load wizard configuration
  const docRef = doc(getDb(), 'integrationSettings', 'openclaw_wizards');
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  const config = docSnap.data();
  const flows = config.flows || [];
  
  // Detect which wizard flow to start based on intent
  if (lowerText.includes('first time') || lowerText.includes('new customer') || lowerText.includes('book')) {
    return flows.find((f: WizardFlow) => f.useCase === 'new_customer' && f.enabled) || null;
  }
  
  if (lowerText.includes('existing') || lowerText.includes('returning') || lowerText.includes('book again')) {
    return flows.find((f: WizardFlow) => f.useCase === 'existing_customer' && f.enabled) || null;
  }
  
  if (lowerText.includes('consultation') || lowerText.includes('discuss') || lowerText.includes('options')) {
    return flows.find((f: WizardFlow) => f.useCase === 'consultation' && f.enabled) || null;
  }
  
  if (lowerText.includes('service') || lowerText.includes('pricing') || lowerText.includes('cost')) {
    return flows.find((f: WizardFlow) => f.useCase === 'service_inquiry' && f.enabled) || null;
  }
  
  if (lowerText.includes('reschedule') || lowerText.includes('change')) {
    return flows.find((f: WizardFlow) => f.useCase === 'reschedule' && f.enabled) || null;
  }
  
  if (lowerText.includes('cancel')) {
    return flows.find((f: WizardFlow) => f.useCase === 'cancellation' && f.enabled) || null;
  }
  
  return null;
}

async function startWizardFlow(message: WizardMessage, wizardFlow: WizardFlow) {
  const firstStep = wizardFlow.steps[0];
  
  const response = {
    text: `🎯 **${wizardFlow.name}**\n\n${wizardFlow.description}\n\n**Step 1: ${firstStep.title}**\n${firstStep.description}`,
    quickReplies: firstStep.options ? firstStep.options.map((opt: any) => opt.label) : ['Continue'],
    wizardState: {
      flowId: wizardFlow.id,
      currentStep: 0,
      data: {},
      startedAt: new Date().toISOString()
    }
  };
  
  return NextResponse.json(response);
}

async function handleWizardFlow(message: WizardMessage, intent: any) {
  const wizardState = message.wizardState!;
  
  if (!wizardState.currentStep) {
    return NextResponse.json({
      text: "I'm sorry, but I can't find the current step in the booking flow. Let's start over.",
      wizardState: null
    });
  }
  
  // Load wizard configuration
  const docRef = doc(getDb(), 'integrationSettings', 'openclaw_wizards');
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return NextResponse.json({
      text: "I'm sorry, but I'm having trouble accessing the booking system right now. Please try again later or call us directly.",
      wizardState: null
    });
  }
  
  const config = docSnap.data();
  const wizardFlow = config.flows.find((f: WizardFlow) => f.id === wizardState.flowId);
  
  if (!wizardFlow) {
    return NextResponse.json({
      text: "I'm sorry, but I can't find the booking flow you're looking for. Let's start over.",
      wizardState: null
    });
  }
  
  const currentStep = wizardFlow.steps[wizardState.currentStep];
  const nextStepIndex = wizardState.currentStep + 1;
  const nextStep = wizardFlow.steps[nextStepIndex];
  
  // Process current step input
  const stepData = { ...wizardState.data };
  
  if (currentStep.type === 'selection') {
    // Find selected option
    const selectedOption = currentStep.options?.find((opt: any) => 
      opt.label.toLowerCase() === message.text.toLowerCase() || 
      opt.value.toLowerCase() === message.text.toLowerCase()
    );
    
    if (selectedOption) {
      stepData[currentStep.id] = selectedOption.value;
    }
  } else if (currentStep.type === 'input') {
    stepData[currentStep.id] = message.text;
  }
  
  // Check if wizard is complete
  if (!nextStep) {
    return await completeWizardFlow(message, wizardFlow, stepData);
  }
  
  // Move to next step
  const response = {
    text: `**Step ${nextStepIndex + 1}: ${nextStep.title}**\n${nextStep.description}`,
    quickReplies: nextStep.options ? nextStep.options.map((opt: any) => opt.label) : ['Continue'],
    wizardState: {
      ...wizardState,
      currentStep: nextStepIndex,
      data: stepData
    }
  };
  
  return NextResponse.json(response);
}

async function completeWizardFlow(message: WizardMessage, wizardFlow: WizardFlow, stepData: any) {
  // Process the completed wizard data
  let responseText = "✅ **Booking Complete!**\n\n";
  
  switch (wizardFlow.useCase) {
    case 'new_customer':
    case 'existing_customer':
      responseText += await processBookingWizard(stepData);
      break;
    case 'consultation':
      responseText += await processConsultationWizard(stepData);
      break;
    case 'service_inquiry':
      responseText += await processServiceInquiryWizard(stepData);
      break;
    case 'reschedule':
      responseText += await processRescheduleWizard(stepData);
      break;
    case 'cancellation':
      responseText += await processCancellationWizard(stepData);
      break;
    default:
      responseText += "Thank you! Your request has been processed.";
  }
  
  return NextResponse.json({
    text: responseText,
    quickReplies: ['Book Another', 'View Services', 'Main Menu'],
    wizardState: null
  });
}

async function processBookingWizard(data: any) {
  // Create booking in Firestore
  const bookingData = {
    clientName: data.contact_info || 'Customer',
    clientEmail: data.email || '',
    clientPhone: data.phone || '',
    artistName: data.artist_selection || 'Any Available',
    serviceName: data.service_selection || 'PMU Service',
    date: data.availability_check || new Date().toISOString().split('T')[0],
    time: data.preferred_time || '10:00',
    status: 'pending',
    price: getServicePrice(data.service_selection),
    depositPaid: false,
    wizardData: data,
    createdAt: Timestamp.now()
  };
  
  try {
    await addDoc(collection(getDb(), 'bookings'), bookingData);
    return `📅 **Appointment Details:**\n\n• Service: ${data.service_selection}\n• Date: ${data.availability_check}\n• Artist: ${data.artist_selection}\n• Price: $${getServicePrice(data.service_selection)}\n\nYou'll receive a confirmation email shortly! 💄`;
  } catch (error) {
    console.error('Booking creation error:', error);
    return "I'm sorry, but I'm having trouble creating your booking right now. Please call us at (555) 123-4567 to book your appointment.";
  }
}

async function processConsultationWizard(data: any) {
  const consultationData = {
    customerName: data.contact_info || 'Customer',
    interest: data.interest_area,
    consultationType: data.consultation_type,
    preferredDate: data.availability,
    email: data.email || '',
    phone: data.phone || '',
    status: 'scheduled',
    wizardData: data,
    createdAt: Timestamp.now()
  };
  
  try {
    await addDoc(collection(getDb(), 'consultations'), consultationData);
    return `📅 **Consultation Scheduled:**\n\n• Interest: ${data.interest_area}\n• Type: ${data.consultation_type}\n• Date: ${data.availability}\n\nWe'll send you confirmation details via email!`;
  } catch (error) {
    console.error('Consultation creation error:', error);
    return "I'm sorry, but I'm having trouble scheduling your consultation right now. Please call us at (555) 123-4567.";
  }
}

async function processServiceInquiryWizard(data: any) {
  let infoText = `📋 **Service Information:**\n\n`;
  
  switch (data.service_category) {
    case 'eyebrows':
      infoText += `🎨 **Eyebrow Services:**\n\n• Microblading: $350 - Natural strokes\n• Powder Brows: $400 - Soft shading\n• Henna Brows: $200 - Temporary color\n\nAll include consultation and aftercare!`;
      break;
    case 'lips':
      infoText += `💋 **Lip Services:**\n\n• Lip Blushing: $400 - Natural enhancement\n• Lip Liner: $350 - Defined shape\n• Lip Tint: $250 - Color enhancement\n\nIncludes free touch-up within 6 weeks!`;
      break;
    case 'eyes':
      infoText += `👁️ **Eye Services:**\n\n• Eyeliner: $300 - Perfect definition\n• Eyebrows: $350 - Natural enhancement\n• Lash Line: $400 - Subtle enhancement\n\nAll services include consultation!`;
      break;
    default:
      infoText += `💄 **All PMU Services:**\n\n• Eyebrows: Microblading, Powder Brows\n• Lips: Lip Blushing, Lip Liner\n• Eyes: Eyeliner, Lash Line\n\nStarting at $200 - Free consultations!`;
  }
  
  infoText += `\n\nReady to book? Type "book" to start your booking journey!`;
  
  return infoText;
}

async function processRescheduleWizard(data: any) {
  return `📅 **Reschedule Request Received:**\n\n• Current booking: ${data.booking_details}\n• New preference: ${data.new_preference}\n• Reason: ${data.reason || 'Not specified'}\n\nWe'll process your reschedule request and confirm the new time within 2 hours. You'll receive a confirmation email!`;
}

async function processCancellationWizard(data: any) {
  return `❌ **Cancellation Processed:**\n\n• Booking: ${data.booking_details}\n• Reason: ${data.feedback || 'Not specified'}\n\nYour cancellation has been processed according to our policy. If you have any questions, please call us at (555) 123-4567.\n\nWe hope to see you again soon!`;
}

function getServicePrice(service: string): number {
  const prices: { [key: string]: number } = {
    'microblading': 350,
    'lip_blushing': 400,
    'eyeliner': 300,
    'touch_up': 150,
    'consultation': 0
  };
  return prices[service] || 300;
}

async function handleGeneralWizard(message: WizardMessage) {
  const response = {
    text: "Hello! 👋 I'm your PMU booking assistant with guided wizards.\n\nI can help you with:\n\n🎯 **New Customer Booking** - Step-by-step first booking\n🔄 **Existing Customer** - Quick return booking\n💬 **Free Consultation** - Discuss your options\n📋 **Service Information** - Learn about our PMU services\n📅 **Reschedule** - Change your appointment\n❌ **Cancellation** - Cancel with policy info\n\nWhat would you like to do?",
    quickReplies: ['New Booking', 'Consultation', 'Service Info', 'Reschedule', 'Cancel']
  };
  
  return NextResponse.json(response);
}
