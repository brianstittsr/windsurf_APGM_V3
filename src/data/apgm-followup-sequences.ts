/**
 * APGM Follow-Up Sequence Templates
 * Automated nurturing sequences for PMU leads
 * 
 * These sequences are designed to be imported into GHL workflows
 * Each sequence includes timing, message content, and conditions
 */

export interface FollowUpMessage {
  day: number;
  hour?: number;
  minute?: number;
  channel: 'sms' | 'email' | 'both';
  subject?: string;
  body: string;
  condition?: string;
  tag?: string;
}

export interface FollowUpSequence {
  name: string;
  description: string;
  trigger: string;
  stopCondition: string;
  messages: FollowUpMessage[];
}

/**
 * Sequence 1: New Lead Nurture (Day 1, 2, 5, 14)
 * Trigger: Contact created with tag 'facebook-lead' or 'instagram-lead'
 * Stop: When lead responds OR books consultation
 */
export const NEW_LEAD_NURTURE: FollowUpSequence = {
  name: 'New Lead Nurture (14-Day)',
  description: 'Welcomes new leads and nurtures them toward booking a consultation',
  trigger: 'contact_created with tag facebook-lead OR instagram-lead',
  stopCondition: 'lead_responds OR consultation_scheduled',
  messages: [
    {
      day: 0,
      hour: 0,
      minute: 5,
      channel: 'sms',
      body: `Hi {{contact.first_name}}! 👋 This is Victoria from A Pretty Girl Matter. Thanks for your interest in permanent makeup! I'd love to help you achieve your brow goals. When would be a good time for a quick chat?`,
      tag: 'initial-contact-sent',
    },
    {
      day: 1,
      hour: 10,
      minute: 0,
      channel: 'sms',
      body: `Hi {{contact.first_name}}! I wanted to share that our clients LOVE their results - natural-looking brows that save time every morning. 🌟 Would you like to see some before/after photos?`,
      condition: 'if_no_response',
    },
    {
      day: 2,
      hour: 14,
      minute: 0,
      channel: 'sms',
      body: `Hi {{contact.first_name}}! Quick question - are you looking for something natural and subtle, or more defined? I customize every procedure to match your unique features and style. 😊`,
      condition: 'if_no_response',
    },
    {
      day: 3,
      hour: 11,
      minute: 0,
      channel: 'email',
      subject: 'Everything you need to know about PMU at APGM',
      body: `Hi {{contact.first_name}},

I know choosing permanent makeup is a big decision! Here's what you can expect when you book with A Pretty Girl Matter:

✨ Complimentary consultation (30 min)
✨ Custom design based on your face shape
✨ Premium pigments that heal beautifully
✨ 6-8 week touch-up included
✨ Annual refresh discounts

Most clients say their only regret is not doing it sooner! 

Ready to book your consultation? Reply to this email or text me at (980) 555-0123.

Best,
Victoria
A Pretty Girl Matter`,
      condition: 'if_no_response',
    },
    {
      day: 5,
      hour: 16,
      minute: 0,
      channel: 'sms',
      body: `Hi {{contact.first_name}}! Just checking in - I have a few consultation openings this week if you're still considering PMU. No pressure at all, just want to make sure you have all the info you need! 💕`,
      condition: 'if_no_response',
    },
    {
      day: 7,
      hour: 10,
      minute: 0,
      channel: 'sms',
      body: `{{contact.first_name}}, I'd love to help when you're ready. Many of my clients take weeks to decide, and that's totally fine! I'll be here whenever you want to chat about your brow goals. 🌸`,
      condition: 'if_no_response',
    },
    {
      day: 14,
      hour: 13,
      minute: 0,
      channel: 'email',
      subject: 'Still thinking about permanent makeup?',
      body: `Hi {{contact.first_name}},

I wanted to reach out one more time about your interest in permanent makeup. I completely understand wanting to think it over - it's an investment in yourself!

If you have any questions at all, I'm happy to answer them. No pressure, just support. 😊

When you're ready, you can:
• Text me: (980) 555-0123
• Book online: www.aprettygirlmatter.com/contact
• Reply to this email

Looking forward to helping you wake up with perfect brows!

Warmly,
Victoria
A Pretty Girl Matter`,
      condition: 'if_no_response',
      tag: 'nurture-sequence-completed',
    },
  ],
};

/**
 * Sequence 2: Consultation Reminder
 * Trigger: Stage = "Consultation Scheduled"
 * Stop: Consultation completed OR cancelled
 */
export const CONSULTATION_REMINDER: FollowUpSequence = {
  name: 'Consultation Reminder Sequence',
  description: 'Reminds clients about upcoming consultation and sends preparation info',
  trigger: 'pipeline_stage_changed to Consultation Scheduled',
  stopCondition: 'consultation_completed OR consultation_cancelled',
  messages: [
    {
      day: 0,
      hour: 0,
      minute: 10,
      channel: 'sms',
      body: `Hi {{contact.first_name}}! 🎉 Your consultation is confirmed for {{custom.consultation_date}}. I'm excited to meet you and design your perfect brows! You'll receive location details and prep info soon. -Victoria`,
    },
    {
      day: 0,
      hour: 1,
      minute: 0,
      channel: 'email',
      subject: 'Your PMU Consultation Details - A Pretty Girl Matter',
      body: `Hi {{contact.first_name}},

Your consultation is confirmed! Here are the details:

📅 Date: {{custom.consultation_date}}
📍 Location: [Your Address]
⏰ Duration: 30 minutes

What to bring:
• Photos of brow styles you like
• List of any allergies
• Questions you have!

What we'll do:
• Discuss your brow goals
• Assess your natural brows
• Design your custom shape
• Explain the procedure
• Provide pricing

If you need to reschedule, just reply to this email or text me at (980) 555-0123.

See you soon!
Victoria`,
    },
    {
      day: -1, // Day before
      hour: 18,
      minute: 0,
      channel: 'sms',
      body: `Hi {{contact.first_name}}! Reminder: Your consultation is tomorrow at {{custom.consultation_time}}. Looking forward to meeting you! 💕`,
    },
    {
      day: 0, // Day of (morning)
      hour: 8,
      minute: 0,
      channel: 'sms',
      body: `Good morning {{contact.first_name}}! ☀️ Your consultation is today. See you soon! -Victoria`,
    },
  ],
};

/**
 * Sequence 3: No-Show Recovery
 * Trigger: Appointment marked as No-Show
 * Stop: Lead reschedules OR declines
 */
export const NO_SHOW_RECOVERY: FollowUpSequence = {
  name: 'No-Show Recovery',
  description: 'Attempts to reschedule missed consultations',
  trigger: 'appointment_no_show',
  stopCondition: 'consultation_rescheduled OR lead_declines',
  messages: [
    {
      day: 0,
      hour: 0,
      minute: 30,
      channel: 'sms',
      body: `Hi {{contact.first_name}}, I noticed you missed your consultation today. No worries at all - life happens! Would you like to reschedule? I have openings this week and next. 😊`,
    },
    {
      day: 1,
      hour: 14,
      minute: 0,
      channel: 'sms',
      body: `Hi {{contact.first_name}}! Just following up about rescheduling your consultation. Even if you're not ready yet, I'd love to stay in touch. Let me know either way! 💕`,
      condition: 'if_no_response',
    },
    {
      day: 3,
      hour: 11,
      minute: 0,
      channel: 'email',
      subject: 'Can we reschedule your PMU consultation?',
      body: `Hi {{contact.first_name}},

I wanted to reach out about rescheduling your missed consultation. I completely understand that things come up unexpectedly!

If you're still interested in permanent makeup, I'd love to find a time that works better for your schedule. If you've decided it's not the right time, no pressure at all - just let me know so I can update my records.

To reschedule, you can:
• Reply to this email
• Text me: (980) 555-0123  
• Book online: www.aprettygirlmatter.com/contact

Hope to hear from you!

Best,
Victoria`,
      condition: 'if_no_response',
    },
  ],
};

/**
 * Sequence 4: Post-Consultation Follow-Up
 * Trigger: Stage = "Consultation Completed"
 * Stop: Deposit paid OR 7 days pass
 */
export const POST_CONSULTATION_FOLLOWUP: FollowUpSequence = {
  name: 'Post-Consultation Follow-Up',
  description: 'Follows up after consultation to secure booking',
  trigger: 'pipeline_stage_changed to Consultation Completed',
  stopCondition: 'deposit_paid OR 7_days_elapsed',
  messages: [
    {
      day: 0,
      hour: 2,
      minute: 0,
      channel: 'sms',
      body: `Hi {{contact.first_name}}! Thank you for coming in today. It was wonderful meeting you! 💕 I've sent your custom brow design and pricing to your email. Let me know if you have any questions!`,
    },
    {
      day: 0,
      hour: 2,
      minute: 15,
      channel: 'email',
      subject: 'Your Custom Brow Design & Next Steps - APGM',
      body: `Hi {{contact.first_name}},

Thank you so much for coming in for your consultation today! I loved getting to know you and designing your custom brows.

As promised, here's everything we discussed:

🎨 YOUR CUSTOM DESIGN
• Shape: [Based on your face]
• Color: [Custom matched]
• Technique: [Recommended service]

💰 INVESTMENT
• Service: {{custom.service_value}}
• Deposit to book: {{custom.deposit_amount}}
• Balance due at appointment

📅 NEXT STEPS
To secure your appointment:
1. Pay deposit: [Payment Link]
2. Select your date: [Calendar Link]
3. Receive pre-procedure instructions

Ready to book? Just reply to this email or text me!

Excited to create your perfect brows,
Victoria`,
    },
    {
      day: 2,
      hour: 14,
      minute: 0,
      channel: 'sms',
      body: `Hi {{contact.first_name}}! Just checking in - do you have any questions about the procedure or your custom design? I'm here to help! 😊`,
      condition: 'if_no_deposit',
    },
    {
      day: 4,
      hour: 11,
      minute: 0,
      channel: 'sms',
      body: `Hi {{contact.first_name}}! I wanted to let you know that my weekend slots are filling up quickly for {{custom.service_interest}}. If you're ready to book, just let me know and I'll hold your spot! 💕`,
      condition: 'if_no_deposit',
    },
    {
      day: 7,
      hour: 10,
      minute: 0,
      channel: 'email',
      subject: 'Last chance to book your PMU appointment',
      body: `Hi {{contact.first_name}},

I wanted to reach out one last time about booking your permanent makeup appointment. I know it's a big decision, and I want you to feel completely confident!

If you have ANY concerns or questions, please let me know. I'm happy to address them - whether it's about pain, healing, color, or anything else.

If now isn't the right time, I completely understand. Just reply and let me know, and I'll check back with you in a few months if that's okay.

Either way, thank you for considering A Pretty Girl Matter!

Warmly,
Victoria`,
      condition: 'if_no_deposit',
    },
  ],
};

/**
 * Sequence 5: Procedure Preparation
 * Trigger: Stage = "Procedure Scheduled"
 * Stop: Procedure completed
 */
export const PROCEDURE_PREPARATION: FollowUpSequence = {
  name: 'Procedure Preparation',
  description: 'Prepares client for their PMU procedure',
  trigger: 'pipeline_stage_changed to Procedure Scheduled',
  stopCondition: 'procedure_completed',
  messages: [
    {
      day: -7, // 1 week before
      hour: 10,
      minute: 0,
      channel: 'email',
      subject: 'Preparing for your PMU procedure - Important info inside',
      body: `Hi {{contact.first_name}},

Your procedure is coming up on {{custom.procedure_date}}! Here's everything you need to know to prepare:

✅ DO (Starting 1 week before):
• Stay hydrated
• Avoid alcohol
• Avoid blood thinners (if medically safe)
• Take a break from retinols/acids on brow area

❌ DON'T (48 hours before):
• No alcohol
• No caffeine (morning of)
• No working out day-of
• No makeup on brow area

📅 DAY OF:
• Arrive with clean face (no makeup)
• Eat a good meal beforehand
• Wear comfortable clothes
• Bring photos if you have reference images

QUESTIONS?
Text me anytime: (980) 555-0123

Can't wait to create your perfect brows!

Victoria`,
    },
    {
      day: -2, // 2 days before
      hour: 18,
      minute: 0,
      channel: 'sms',
      body: `Hi {{contact.first_name}}! Reminder: Your procedure is in 2 days! Remember - no alcohol tonight or tomorrow, and no caffeine the morning of. See you soon! 💕`,
    },
    {
      day: -1, // Day before
      hour: 19,
      minute: 0,
      channel: 'sms',
      body: `Hi {{contact.first_name}}! Tomorrow's the big day! 🎉 Get a good night's sleep and I'll see you tomorrow. Excited to create your perfect brows!`,
    },
    {
      day: 0, // Morning of
      hour: 7,
      minute: 30,
      channel: 'sms',
      body: `Good morning {{contact.first_name}}! ☀️ Today's your day! See you soon for your procedure. Remember - no caffeine, come with a clean face. Can't wait!`,
    },
    {
      day: 0, // After procedure
      hour: 2,
      minute: 0,
      channel: 'sms',
      body: `Hi {{contact.first_name}}! You did great today! 🎉 Your new brows look beautiful. I've sent aftercare instructions to your email - follow them closely for best results! Text me with any questions.`,
    },
  ],
};

/**
 * Sequence 6: Touch-Up Reminder
 * Trigger: 6 weeks after procedure
 * Stop: Touch-up scheduled OR declined
 */
export const TOUCHUP_REMINDER: FollowUpSequence = {
  name: 'Touch-Up Reminder',
  description: 'Reminds clients to book their included touch-up',
  trigger: '6_weeks_after_procedure',
  stopCondition: 'touchup_scheduled OR touchup_declined',
  messages: [
    {
      day: 0,
      hour: 10,
      minute: 0,
      channel: 'sms',
      body: `Hi {{contact.first_name}}! 👋 It's been 6 weeks since your procedure - your brows should be fully healed! Time for your complimentary touch-up to perfect the color and shape. Ready to schedule?`,
    },
    {
      day: 0,
      hour: 2,
      minute: 0,
      channel: 'email',
      subject: 'Your complimentary touch-up is ready to book!',
      body: `Hi {{contact.first_name}},

I hope you're loving your new brows! It's been about 6 weeks, which means:

✨ Your complimentary touch-up is ready to book!

The touch-up appointment:
• Perfects color retention
• Refines shape if needed
• Takes about 60-90 minutes
• Included with your original service

This is typically scheduled 6-10 weeks after your initial procedure. After this touch-up, your brows will be set for the year!

Ready to book? Reply to this email or text me at (980) 555-0123.

Talk soon!
Victoria`,
    },
    {
      day: 7,
      hour: 14,
      minute: 0,
      channel: 'sms',
      body: `Hi {{contact.first_name}}! Just following up about your complimentary touch-up. I have a few openings this month if you're ready to perfect your brows! 💕`,
      condition: 'if_not_scheduled',
    },
    {
      day: 14,
      hour: 11,
      minute: 0,
      channel: 'email',
      subject: 'Last reminder: Your touch-up window is closing',
      body: `Hi {{contact.first_name}},

I wanted to reach out one more time about your complimentary touch-up. The optimal window for touch-ups is 6-10 weeks post-procedure, and we're getting close to the end of that window.

After 12 weeks, touch-ups may require additional pigment and time, which would be charged as a color boost rather than the complimentary touch-up.

If you'd like to use your included touch-up, please book soon! If you have questions or concerns, just let me know.

To book: (980) 555-0123 or reply to this email.

Best,
Victoria`,
      condition: 'if_not_scheduled',
    },
  ],
};

/**
 * Sequence 7: Annual Refresh
 * Trigger: 11 months after procedure
 * Stop: Annual refresh booked OR declined
 */
export const ANNUAL_REFRESH: FollowUpSequence = {
  name: 'Annual Color Boost',
  description: 'Reminds clients to book their annual color refresh',
  trigger: '11_months_after_procedure',
  stopCondition: 'annual_refresh_booked OR client_declines',
  messages: [
    {
      day: 0,
      hour: 10,
      minute: 0,
      channel: 'email',
      subject: 'Time for your annual brow refresh? 💕',
      body: `Hi {{contact.first_name}},

Can you believe it's been almost a year since your PMU procedure? I hope your brows have been a daily joy!

Over time, PMU naturally fades due to:
• Sun exposure
• Skin cell turnover
• Skincare products

Annual Color Boost:
• Refreshes faded color
• Takes about 90 minutes
• 10% off for returning clients
• Keeps your brows looking fresh!

Ready to book your annual refresh? Reply to this email or text me at (980) 555-0123.

Looking forward to seeing you!

Victoria
A Pretty Girl Matter`,
    },
    {
      day: 14,
      hour: 14,
      minute: 0,
      channel: 'sms',
      body: `Hi {{contact.first_name}}! Just checking in - are you ready for your annual color boost? I have a 10% discount for returning clients this month! 💕`,
      condition: 'if_not_booked',
    },
    {
      day: 30,
      hour: 11,
      minute: 0,
      channel: 'email',
      subject: 'Your annual refresh reminder (with special offer!)',
      body: `Hi {{contact.first_name}},

I wanted to follow up about your annual color boost. As a valued client, I'd love to offer you 15% off your refresh appointment if you book this month!

Annual refreshes are important because:
• Color naturally fades over 12-18 months
• Keeps brows looking crisp and defined
• Shorter appointment than initial procedure
• Maintains your investment

Let me know if you'd like to schedule, or if you have any questions about the refresh process.

To book: (980) 555-0123

Best,
Victoria`,
      condition: 'if_not_booked',
    },
  ],
};

/**
 * All sequences for easy access
 */
export const ALL_SEQUENCES: FollowUpSequence[] = [
  NEW_LEAD_NURTURE,
  CONSULTATION_REMINDER,
  NO_SHOW_RECOVERY,
  POST_CONSULTATION_FOLLOWUP,
  PROCEDURE_PREPARATION,
  TOUCHUP_REMINDER,
  ANNUAL_REFRESH,
];

/**
 * Get sequence by name
 */
export function getSequenceByName(name: string): FollowUpSequence | undefined {
  return ALL_SEQUENCES.find(s => s.name.toLowerCase() === name.toLowerCase());
}

/**
 * Export sequence as GHL workflow JSON
 * This can be imported into GHL's workflow builder
 */
export function exportForGHL(sequence: FollowUpSequence): object {
  return {
    name: sequence.name,
    description: sequence.description,
    trigger: {
      type: sequence.trigger,
    },
    stopCondition: sequence.stopCondition,
    steps: sequence.messages.map((msg, index) => ({
      id: `step_${index + 1}`,
      type: msg.channel === 'sms' ? 'send_sms' : msg.channel === 'email' ? 'send_email' : 'send_both',
      timing: {
        day: msg.day,
        hour: msg.hour || 9,
        minute: msg.minute || 0,
      },
      condition: msg.condition,
      content: {
        subject: msg.subject,
        body: msg.body,
      },
      tag: msg.tag,
    })),
  };
}
