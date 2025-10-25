import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/services/database';
import { GHLOrchestrator } from '@/services/ghl-orchestrator';

/**
 * PMU Chatbot API - Intelligent assistant for permanent makeup inquiries
 * Handles bookings, payments, and customer journey automation
 */

interface ChatRequest {
  message: string;
  conversationHistory: any[];
  customerData?: any;
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, customerData }: ChatRequest = await request.json();

    console.log('💬 PMU Chatbot received:', message);

    // Analyze intent
    const intent = analyzeIntent(message, customerData);
    console.log('🎯 Intent:', intent);

    // Generate response based on intent
    const response = await generateResponse(intent, message, customerData);

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Chatbot error:', error);
    return NextResponse.json(
      {
        response: 'I apologize, but I encountered an error. Could you please rephrase that?',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function analyzeIntent(message: string, customerData: any) {
  const lowerMessage = message.toLowerCase();

  // Booking intent
  if (lowerMessage.includes('book') || lowerMessage.includes('appointment') || 
      lowerMessage.includes('schedule') || lowerMessage.includes('reserve')) {
    return {
      type: 'booking',
      stage: customerData?.bookingStage || 'initial',
      data: extractBookingData(message, customerData)
    };
  }

  // Service information
  if (lowerMessage.includes('microblading') || lowerMessage.includes('powder brow') ||
      lowerMessage.includes('lip blush') || lowerMessage.includes('eyeliner') ||
      lowerMessage.includes('service') || lowerMessage.includes('procedure')) {
    return {
      type: 'service_info',
      service: extractServiceType(message)
    };
  }

  // Pricing
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || 
      lowerMessage.includes('how much')) {
    return {
      type: 'pricing',
      service: extractServiceType(message)
    };
  }

  // Pre-care / Post-care
  if (lowerMessage.includes('prepare') || lowerMessage.includes('before') ||
      lowerMessage.includes('pre-care') || lowerMessage.includes('aftercare') ||
      lowerMessage.includes('post-care')) {
    return {
      type: 'care_instructions',
      timing: lowerMessage.includes('after') ? 'post' : 'pre'
    };
  }

  // Pain / Healing
  if (lowerMessage.includes('hurt') || lowerMessage.includes('pain') ||
      lowerMessage.includes('heal') || lowerMessage.includes('recovery')) {
    return {
      type: 'pain_healing'
    };
  }

  // Duration / Time
  if (lowerMessage.includes('long') || lowerMessage.includes('last') ||
      lowerMessage.includes('duration') || lowerMessage.includes('time')) {
    return {
      type: 'duration'
    };
  }

  // Portfolio / Results
  if (lowerMessage.includes('photo') || lowerMessage.includes('portfolio') ||
      lowerMessage.includes('before') || lowerMessage.includes('result')) {
    return {
      type: 'portfolio'
    };
  }

  // General greeting
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') ||
      lowerMessage.includes('hey')) {
    return {
      type: 'greeting'
    };
  }

  // Default: general inquiry
  return {
    type: 'general',
    data: { message }
  };
}

async function generateResponse(intent: any, message: string, customerData: any) {
  switch (intent.type) {
    case 'booking':
      return await handleBooking(intent, message, customerData);

    case 'service_info':
      return handleServiceInfo(intent);

    case 'pricing':
      return handlePricing(intent);

    case 'care_instructions':
      return handleCareInstructions(intent);

    case 'pain_healing':
      return handlePainHealing();

    case 'duration':
      return handleDuration();

    case 'portfolio':
      return handlePortfolio();

    case 'greeting':
      return handleGreeting();

    default:
      return handleGeneral(message);
  }
}

async function handleBooking(intent: any, message: string, customerData: any) {
  const stage = intent.stage;

  // Stage 1: Initial booking request
  if (stage === 'initial') {
    return {
      response: `Wonderful! I'd love to help you book your appointment! 🎉

To get started, I'll need a few details:

1️⃣ **Your Name**
2️⃣ **Email Address**
3️⃣ **Phone Number**
4️⃣ **Which service?** (Microblading, Powder Brows, Lip Blush, or Eyeliner)
5️⃣ **Preferred Date & Time**

**Our Booking Process:**
💰 $50 deposit to secure your spot
📧 Instant confirmation email with payment link
🎁 Before your appointment: Registration link with **GRANOPEN250** coupon ($250 value!)
💳 Final payment: Only $200 (after $50 deposit credit)

You can share all details now, or we can go step by step!`,
      customerData: { bookingStage: 'collecting_info' },
      actions: [
        { type: 'view_services', label: '📋 View Services First' }
      ]
    };
  }

  // Stage 2: Collecting information
  if (stage === 'collecting_info') {
    const bookingData = extractBookingData(message, customerData);
    const missing = getMissingBookingInfo(bookingData);

    if (missing.length > 0) {
      return {
        response: `Great! I have some of your information. I still need:\n\n${missing.map((m, i) => `${i + 1}. ${m}`).join('\n')}\n\nPlease provide these details so I can complete your booking!`,
        customerData: { ...customerData, ...bookingData, bookingStage: 'collecting_info' }
      };
    }

    // All info collected - create booking
    return await createBooking(bookingData);
  }

  return {
    response: 'Let me help you with your booking! What would you like to know?'
  };
}

function handleServiceInfo(intent: any) {
  const service = intent.service;

  if (service === 'microblading') {
    return {
      response: `✨ **Microblading** - The Art of Natural Brows

**What is it?**
A semi-permanent technique creating hair-like strokes for fuller, natural-looking eyebrows.

**Perfect for:**
• Sparse or thin brows
• Over-plucked brows
• Uneven brow shape
• Anyone wanting fuller brows

**The Process:**
1. Consultation & design (30 min)
2. Numbing (20 min)
3. Microblading procedure (1.5-2 hours)
4. Aftercare instructions

**Results:**
• Lasts 1-3 years
• Natural, hair-like appearance
• Waterproof & smudge-proof
• Touch-up in 6-8 weeks

**Investment:** $500 (includes touch-up)

Ready to book? I can help you schedule!`,
      actions: [
        { type: 'book_appointment', label: '📅 Book Microblading' },
        { type: 'view_services', label: '📋 See Other Services' }
      ]
    };
  }

  if (service === 'powder_brows') {
    return {
      response: `💎 **Powder Brows** - Soft & Elegant

**What is it?**
A shading technique creating a soft, powdered makeup look for your brows.

**Perfect for:**
• Oily skin
• Large pores
• Makeup lovers
• Soft, filled-in look

**The Process:**
1. Consultation & design (30 min)
2. Numbing (20 min)
3. Powder brow procedure (2-2.5 hours)
4. Aftercare instructions

**Results:**
• Lasts 2-3 years
• Soft, makeup-like finish
• Great for all skin types
• Touch-up in 6-8 weeks

**Investment:** $450 (includes touch-up)

Interested in booking?`,
      actions: [
        { type: 'book_appointment', label: '📅 Book Powder Brows' }
      ]
    };
  }

  if (service === 'lip_blush') {
    return {
      response: `💋 **Lip Blush** - Natural Lip Enhancement

**What is it?**
Semi-permanent lip color that enhances your natural lip tone and shape.

**Perfect for:**
• Pale or uneven lip color
• Undefined lip line
• Thin-looking lips
• Natural lip enhancement

**The Process:**
1. Consultation & color matching (30 min)
2. Numbing (20 min)
3. Lip blush procedure (2-2.5 hours)
4. Aftercare instructions

**Results:**
• Lasts 2-3 years
• Natural, enhanced color
• Defined lip line
• Touch-up in 6-8 weeks

**Investment:** $550 (includes touch-up)

Want to schedule your lip blush?`,
      actions: [
        { type: 'book_appointment', label: '📅 Book Lip Blush' }
      ]
    };
  }

  // General services overview
  return {
    response: `💎 **Our Premium PMU Services:**

**Microblading** - $500
Natural hair-like strokes for fuller brows

**Powder Brows** - $450
Soft, powdered makeup look

**Lip Blush** - $550
Natural lip color enhancement

**Eyeliner** - $400
Permanent eyeliner definition

All services include:
✅ Free consultation
✅ Custom color matching
✅ Numbing for comfort
✅ Aftercare kit
✅ Follow-up touch-up (6-8 weeks)

Which service interests you most?`,
    actions: [
      { type: 'book_appointment', label: '📅 Book Appointment' }
    ]
  };
}

function handlePricing(intent: any) {
  return {
    response: `💰 **Pricing & Payment Options:**

**Services:**
• Microblading: $500
• Powder Brows: $450
• Lip Blush: $550
• Eyeliner: $400

**What's Included:**
✅ Initial procedure
✅ Touch-up session (6-8 weeks)
✅ Consultation
✅ Aftercare kit
✅ Follow-up support

**Booking Process:**
1. **$50 Deposit** - Secures your appointment
2. **GRANOPEN250 Coupon** - Sent before appointment ($250 value!)
3. **Final Payment** - Only $200 at appointment (after deposit credit)

**Example:** Microblading
- Regular: $500
- Deposit: -$50
- Coupon: -$250
- **You Pay: $200 at appointment!**

Ready to book with this amazing deal?`,
    actions: [
      { type: 'book_appointment', label: '📅 Book Now & Save!' }
    ]
  };
}

function handleCareInstructions(intent: any) {
  if (intent.timing === 'pre') {
    return {
      response: `📋 **Pre-Care Instructions** (Before Your Appointment)

**24-48 Hours Before:**
❌ No alcohol or caffeine
❌ No blood thinners (aspirin, ibuprofen)
❌ No retinol or vitamin A products
❌ No waxing or tinting

**Day Of:**
✅ Come with clean, makeup-free face
✅ Avoid sun exposure
✅ Stay hydrated
✅ Eat a good meal
✅ Bring reference photos

**Avoid if:**
• Pregnant or nursing
• On Accutane (wait 1 year)
• Recent Botox (wait 2 weeks)
• Active skin conditions

Following these ensures the best results! 💕`,
      actions: [
        { type: 'book_appointment', label: '📅 Ready to Book' }
      ]
    };
  }

  return {
    response: `🌟 **Aftercare Instructions** (Post-Procedure)

**First 7 Days (Critical!):**
✅ Keep area clean & dry
✅ Apply provided ointment 2-3x daily
✅ Sleep on your back
❌ No water on treated area
❌ No makeup
❌ No sweating/exercise
❌ No picking or scratching

**Days 7-14:**
✅ Gentle cleansing
✅ Light moisturizer
❌ Still no makeup
❌ No swimming/sauna

**Healing Timeline:**
• Days 1-3: Darker & bolder
• Days 4-7: Flaking begins
• Days 8-14: Color lightens (normal!)
• Week 6-8: Touch-up appointment

**Final Results:** 4-6 weeks after touch-up

We'll send detailed instructions after your appointment!`,
      actions: [
        { type: 'book_appointment', label: '📅 Book Appointment' }
      ]
    };
  };
}

function handlePainHealing() {
  return {
    response: `💭 **Pain & Healing - What to Expect**

**Pain Level:**
Most clients rate it 2-3 out of 10!

We use:
• Topical numbing cream (applied before)
• Secondary numbing (during procedure)
• Breaks as needed

**What it feels like:**
"Like tiny scratches" or "light pressure"

**Healing Process:**

**Week 1:** 
• Darker than expected (normal!)
• Slight tenderness
• Some flaking

**Week 2:**
• Color lightens significantly
• May look patchy (temporary!)
• Itching (don't scratch!)

**Week 3-4:**
• True color emerges
• Skin fully healed
• Ready for touch-up

**Week 6-8:**
• Touch-up appointment
• Perfect final results!

**Total Healing:** 4-6 weeks

Most clients say it's much easier than expected! 💕`,
    actions: [
      { type: 'book_appointment', label: '📅 I\'m Ready!' }
    ]
  };
}

function handleDuration() {
  return {
    response: `⏰ **How Long Does PMU Last?**

**Longevity by Service:**
• **Microblading:** 1-3 years
• **Powder Brows:** 2-3 years
• **Lip Blush:** 2-3 years
• **Eyeliner:** 3-5 years

**Factors Affecting Duration:**
• Skin type (oily skin fades faster)
• Sun exposure
• Skincare products
• Metabolism
• Lifestyle

**Maintenance:**
• Touch-up at 6-8 weeks (included!)
• Annual refresh recommended
• Proper aftercare extends results

**Appointment Time:**
• Initial session: 2-3 hours
• Touch-up: 1-2 hours
• Includes consultation, numbing, procedure

Worth every minute for years of beautiful results! ✨`,
    actions: [
      { type: 'book_appointment', label: '📅 Book Now' }
    ]
  };
}

function handlePortfolio() {
  return {
    response: `📸 **Our Portfolio & Results**

I'd love to show you our work!

**View Our Portfolio:**
• Instagram: @yourpmuartist
• Website Gallery: [Link to portfolio]
• Before & After Photos
• Client Testimonials

**What You'll See:**
✨ Natural, beautiful results
✨ Various skin tones & types
✨ Different styles & techniques
✨ Healing progression photos

**Client Reviews:**
⭐⭐⭐⭐⭐ "Best decision ever!"
⭐⭐⭐⭐⭐ "Woke up beautiful every day!"
⭐⭐⭐⭐⭐ "Painless and professional!"

Want to schedule a free consultation to see more examples and discuss your perfect look?`,
    actions: [
      { type: 'book_appointment', label: '📅 Book Free Consultation' }
    ]
  };
}

function handleGreeting() {
  return {
    response: `👋 Hello! Welcome to our Permanent Makeup studio!

I'm here to help you discover the perfect PMU service for you!

**I can help with:**
✨ Service information & recommendations
💰 Pricing & special offers
📅 Booking appointments
📋 Pre & post-care instructions
🎨 Portfolio & results

**Current Special:**
Book now and get **GRANOPEN250** coupon ($250 off!) 🎁

What would you like to know?`,
    actions: [
      { type: 'view_services', label: '📋 View Services' },
      { type: 'book_appointment', label: '📅 Book Appointment' }
    ]
  };
}

function handleGeneral(message: string) {
  return {
    response: `I'd be happy to help you with that!

I specialize in:
• **Services:** Microblading, Powder Brows, Lip Blush, Eyeliner
• **Booking:** Schedule your appointment
• **Pricing:** Transparent pricing & payment options
• **Care:** Pre & post-procedure instructions
• **Results:** Portfolio & what to expect

Could you tell me more about what you're interested in? Or would you like to:`,
    actions: [
      { type: 'view_services', label: '📋 View All Services' },
      { type: 'book_appointment', label: '📅 Book Appointment' }
    ]
  };
}

// Helper functions
function extractBookingData(message: string, existingData: any = {}) {
  const data = { ...existingData };

  // Extract email
  const emailMatch = message.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
  if (emailMatch) data.email = emailMatch[1];

  // Extract phone
  const phoneMatch = message.match(/(\+?1?\s*\(?[0-9]{3}\)?[\s.-]?[0-9]{3}[\s.-]?[0-9]{4})/);
  if (phoneMatch) data.phone = phoneMatch[1];

  // Extract name (basic pattern)
  if (!data.name && message.match(/my name is ([a-zA-Z\s]+)/i)) {
    data.name = message.match(/my name is ([a-zA-Z\s]+)/i)![1].trim();
  }

  // Extract service
  if (message.toLowerCase().includes('microblading')) data.service = 'Microblading';
  if (message.toLowerCase().includes('powder brow')) data.service = 'Powder Brows';
  if (message.toLowerCase().includes('lip blush')) data.service = 'Lip Blush';
  if (message.toLowerCase().includes('eyeliner')) data.service = 'Eyeliner';

  return data;
}

function extractServiceType(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('microblading')) return 'microblading';
  if (lowerMessage.includes('powder')) return 'powder_brows';
  if (lowerMessage.includes('lip')) return 'lip_blush';
  if (lowerMessage.includes('eyeliner') || lowerMessage.includes('liner')) return 'eyeliner';
  return 'all';
}

function getMissingBookingInfo(data: any): string[] {
  const missing = [];
  if (!data.name) missing.push('Your name');
  if (!data.email) missing.push('Email address');
  if (!data.phone) missing.push('Phone number');
  if (!data.service) missing.push('Which service (Microblading, Powder Brows, Lip Blush, or Eyeliner)');
  if (!data.preferredDate) missing.push('Preferred date and time');
  return missing;
}

async function createBooking(bookingData: any) {
  try {
    // Create booking in database
    const booking = {
      ...bookingData,
      status: 'pending_deposit',
      depositAmount: 50,
      depositPaid: false,
      couponCode: 'GRANOPEN250',
      createdAt: new Date()
    };

    // In production, save to database
    const bookingId = `BK${Date.now()}`;

    // Trigger booking workflow
    await fetch('/api/workflows/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trigger: 'booking_created',
        data: {
          ...bookingData,
          bookingId
        }
      })
    });

    return {
      response: `🎉 **Booking Created Successfully!**

**Your Details:**
📧 Email: ${bookingData.email}
📱 Phone: ${bookingData.phone}
💎 Service: ${bookingData.service}

**Next Steps:**

1️⃣ **Pay $50 Deposit**
   Click below to secure your appointment

2️⃣ **Confirmation Email**
   You'll receive instant confirmation

3️⃣ **Before Your Appointment**
   We'll send registration link with **GRANOPEN250** coupon ($250 off!)

4️⃣ **Final Payment**
   Only $200 at your appointment (after deposit credit)

**Total Savings: $300!** 🎁

Ready to secure your spot?`,
      actions: [
        { 
          type: 'pay_deposit', 
          label: '💳 Pay $50 Deposit Now',
          data: { bookingId, amount: 50 }
        }
      ],
      triggerWorkflow: {
        trigger: 'booking_created',
        data: { ...bookingData, bookingId }
      },
      customerData: { ...bookingData, bookingId, bookingStage: 'deposit_pending' }
    };

  } catch (error) {
    return {
      response: '❌ Sorry, there was an error creating your booking. Please try again or call us directly.',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
