/**
 * GoHighLevel Workflow Knowledge Base
 * Comprehensive reference for AI workflow builder
 */

// Workflow Triggers - Events that start a workflow
export const GHL_TRIGGERS = {
  contact: {
    label: 'Contact Triggers',
    triggers: [
      { id: 'contact_created', name: 'Contact Created', description: 'Fires when a new contact is added to the system' },
      { id: 'contact_changed', name: 'Contact Changed', description: 'Fires when any contact field is updated' },
      { id: 'contact_tag_added', name: 'Contact Tag Added', description: 'Fires when a specific tag is added to a contact' },
      { id: 'contact_tag_removed', name: 'Contact Tag Removed', description: 'Fires when a specific tag is removed from a contact' },
      { id: 'contact_dnd_enabled', name: 'Contact DND Enabled', description: 'Fires when Do Not Disturb is enabled for a contact' },
      { id: 'contact_dnd_disabled', name: 'Contact DND Disabled', description: 'Fires when Do Not Disturb is disabled for a contact' },
      { id: 'birthday', name: 'Birthday Reminder', description: 'Fires on or before a contact\'s birthday' },
      { id: 'custom_date', name: 'Custom Date Reminder', description: 'Fires based on a custom date field' },
    ]
  },
  appointment: {
    label: 'Appointment Triggers',
    triggers: [
      { id: 'appointment_booked', name: 'Appointment Booked', description: 'Fires when an appointment is scheduled' },
      { id: 'appointment_confirmed', name: 'Appointment Confirmed', description: 'Fires when an appointment is confirmed' },
      { id: 'appointment_rescheduled', name: 'Appointment Rescheduled', description: 'Fires when an appointment is rescheduled' },
      { id: 'appointment_cancelled', name: 'Appointment Cancelled', description: 'Fires when an appointment is cancelled' },
      { id: 'appointment_no_show', name: 'Appointment No Show', description: 'Fires when a contact is marked as no-show' },
      { id: 'appointment_reminder', name: 'Appointment Reminder', description: 'Fires at specified time before appointment' },
    ]
  },
  opportunity: {
    label: 'Pipeline/Opportunity Triggers',
    triggers: [
      { id: 'opportunity_created', name: 'Opportunity Created', description: 'Fires when a new opportunity is created' },
      { id: 'opportunity_changed', name: 'Opportunity Changed', description: 'Fires when opportunity details change' },
      { id: 'pipeline_stage_changed', name: 'Pipeline Stage Changed', description: 'Fires when opportunity moves to a new stage' },
      { id: 'opportunity_status_changed', name: 'Opportunity Status Changed', description: 'Fires when opportunity status changes (won/lost/open)' },
      { id: 'stale_opportunity', name: 'Stale Opportunity', description: 'Fires when opportunity has been inactive for specified time' },
    ]
  },
  form: {
    label: 'Form & Survey Triggers',
    triggers: [
      { id: 'form_submitted', name: 'Form Submitted', description: 'Fires when a specific form is submitted' },
      { id: 'survey_submitted', name: 'Survey Submitted', description: 'Fires when a survey is completed' },
    ]
  },
  communication: {
    label: 'Communication Triggers',
    triggers: [
      { id: 'inbound_call', name: 'Inbound Call', description: 'Fires when an inbound call is received' },
      { id: 'outbound_call', name: 'Outbound Call', description: 'Fires when an outbound call is made' },
      { id: 'call_status', name: 'Call Status', description: 'Fires based on call outcome (answered, voicemail, etc.)' },
      { id: 'sms_received', name: 'SMS Received', description: 'Fires when an SMS message is received' },
      { id: 'email_received', name: 'Email Received', description: 'Fires when an email is received' },
      { id: 'email_opened', name: 'Email Opened', description: 'Fires when a sent email is opened' },
      { id: 'email_clicked', name: 'Email Link Clicked', description: 'Fires when a link in an email is clicked' },
      { id: 'voicemail_received', name: 'Voicemail Received', description: 'Fires when a voicemail is left' },
    ]
  },
  payment: {
    label: 'Payment Triggers',
    triggers: [
      { id: 'invoice_created', name: 'Invoice Created', description: 'Fires when a new invoice is created' },
      { id: 'invoice_paid', name: 'Invoice Paid', description: 'Fires when an invoice is paid' },
      { id: 'invoice_overdue', name: 'Invoice Overdue', description: 'Fires when an invoice becomes overdue' },
      { id: 'payment_received', name: 'Payment Received', description: 'Fires when any payment is received' },
      { id: 'subscription_created', name: 'Subscription Created', description: 'Fires when a new subscription starts' },
      { id: 'subscription_cancelled', name: 'Subscription Cancelled', description: 'Fires when a subscription is cancelled' },
    ]
  },
  membership: {
    label: 'Membership Triggers',
    triggers: [
      { id: 'membership_new', name: 'New Membership', description: 'Fires when someone joins a membership' },
      { id: 'membership_cancelled', name: 'Membership Cancelled', description: 'Fires when membership is cancelled' },
      { id: 'course_completed', name: 'Course Completed', description: 'Fires when a course is completed' },
      { id: 'lesson_completed', name: 'Lesson Completed', description: 'Fires when a lesson is completed' },
    ]
  },
  other: {
    label: 'Other Triggers',
    triggers: [
      { id: 'manual', name: 'Manual Trigger', description: 'Workflow is triggered manually' },
      { id: 'webhook', name: 'Inbound Webhook', description: 'Fires when webhook receives data' },
      { id: 'facebook_lead', name: 'Facebook Lead Ad', description: 'Fires when a Facebook lead ad is submitted' },
      { id: 'google_lead', name: 'Google Lead Form', description: 'Fires when a Google lead form is submitted' },
      { id: 'shopify_order', name: 'Shopify Order', description: 'Fires on Shopify order events' },
    ]
  }
};

// Workflow Actions - Things a workflow can do
export const GHL_ACTIONS = {
  communication: {
    label: 'Communication Actions',
    actions: [
      { id: 'send_sms', name: 'Send SMS', description: 'Send an SMS message to the contact', params: ['message', 'from_number'] },
      { id: 'send_email', name: 'Send Email', description: 'Send an email to the contact', params: ['subject', 'body', 'from_email', 'template'] },
      { id: 'send_voicemail', name: 'Send Ringless Voicemail', description: 'Drop a voicemail without ringing', params: ['audio_file'] },
      { id: 'make_call', name: 'Make Phone Call', description: 'Initiate an outbound call', params: ['from_number', 'whisper_message'] },
      { id: 'send_review_request', name: 'Send Review Request', description: 'Send a review request to the contact', params: ['platform', 'message'] },
      { id: 'send_internal_notification', name: 'Internal Notification', description: 'Send notification to team member', params: ['user', 'message', 'channel'] },
    ]
  },
  contact: {
    label: 'Contact Actions',
    actions: [
      { id: 'add_tag', name: 'Add Tag', description: 'Add a tag to the contact', params: ['tag_name'] },
      { id: 'remove_tag', name: 'Remove Tag', description: 'Remove a tag from the contact', params: ['tag_name'] },
      { id: 'update_contact', name: 'Update Contact Field', description: 'Update a contact field value', params: ['field', 'value'] },
      { id: 'add_note', name: 'Add Note', description: 'Add a note to the contact record', params: ['note_content'] },
      { id: 'assign_user', name: 'Assign to User', description: 'Assign contact to a team member', params: ['user'] },
      { id: 'create_contact', name: 'Create Contact', description: 'Create a new contact', params: ['contact_data'] },
      { id: 'delete_contact', name: 'Delete Contact', description: 'Delete the contact from the system', params: [] },
      { id: 'set_dnd', name: 'Set DND Status', description: 'Enable or disable Do Not Disturb', params: ['dnd_status', 'channels'] },
    ]
  },
  opportunity: {
    label: 'Pipeline Actions',
    actions: [
      { id: 'create_opportunity', name: 'Create Opportunity', description: 'Create a new pipeline opportunity', params: ['pipeline', 'stage', 'value'] },
      { id: 'update_opportunity', name: 'Update Opportunity', description: 'Update opportunity details', params: ['field', 'value'] },
      { id: 'move_opportunity', name: 'Move to Stage', description: 'Move opportunity to a different stage', params: ['pipeline', 'stage'] },
      { id: 'change_opportunity_status', name: 'Change Status', description: 'Change opportunity status', params: ['status'] },
    ]
  },
  appointment: {
    label: 'Appointment Actions',
    actions: [
      { id: 'book_appointment', name: 'Book Appointment', description: 'Schedule an appointment', params: ['calendar', 'date', 'time', 'duration'] },
      { id: 'cancel_appointment', name: 'Cancel Appointment', description: 'Cancel an existing appointment', params: ['appointment_id'] },
      { id: 'update_appointment', name: 'Update Appointment', description: 'Update appointment details', params: ['field', 'value'] },
    ]
  },
  task: {
    label: 'Task Actions',
    actions: [
      { id: 'create_task', name: 'Create Task', description: 'Create a task for follow-up', params: ['title', 'description', 'due_date', 'assigned_to'] },
      { id: 'complete_task', name: 'Complete Task', description: 'Mark a task as complete', params: ['task_id'] },
    ]
  },
  workflow: {
    label: 'Workflow Actions',
    actions: [
      { id: 'add_to_workflow', name: 'Add to Workflow', description: 'Add contact to another workflow', params: ['workflow_id'] },
      { id: 'remove_from_workflow', name: 'Remove from Workflow', description: 'Remove contact from a workflow', params: ['workflow_id'] },
      { id: 'remove_from_all', name: 'Remove from All Workflows', description: 'Remove contact from all active workflows', params: [] },
      { id: 'goal_event', name: 'Goal Event', description: 'Mark a goal as achieved', params: ['goal_name'] },
    ]
  },
  integration: {
    label: 'Integration Actions',
    actions: [
      { id: 'webhook', name: 'Send Webhook', description: 'Send data to external webhook', params: ['url', 'method', 'payload'] },
      { id: 'google_sheet', name: 'Add to Google Sheet', description: 'Add row to Google Sheet', params: ['sheet_id', 'data'] },
      { id: 'slack_message', name: 'Send Slack Message', description: 'Send message to Slack channel', params: ['channel', 'message'] },
      { id: 'zapier', name: 'Trigger Zapier', description: 'Trigger a Zapier automation', params: ['zap_url'] },
    ]
  },
  ai: {
    label: 'AI Actions',
    actions: [
      { id: 'ai_conversation', name: 'AI Conversation', description: 'Start AI-powered conversation', params: ['bot_id', 'initial_message'] },
      { id: 'ai_content', name: 'Generate AI Content', description: 'Generate content using AI', params: ['prompt', 'output_field'] },
    ]
  },
  payment: {
    label: 'Payment Actions',
    actions: [
      { id: 'create_invoice', name: 'Create Invoice', description: 'Create a new invoice', params: ['items', 'due_date'] },
      { id: 'send_invoice', name: 'Send Invoice', description: 'Send invoice to contact', params: ['invoice_id'] },
      { id: 'add_to_subscription', name: 'Add to Subscription', description: 'Add contact to a subscription', params: ['subscription_id'] },
    ]
  }
};

// Workflow Conditions - Logic for branching
export const GHL_CONDITIONS = {
  contact: {
    label: 'Contact Conditions',
    conditions: [
      { id: 'contact_has_tag', name: 'Contact Has Tag', description: 'Check if contact has a specific tag' },
      { id: 'contact_field_equals', name: 'Contact Field Equals', description: 'Check if a contact field equals a value' },
      { id: 'contact_field_contains', name: 'Contact Field Contains', description: 'Check if a contact field contains text' },
      { id: 'contact_field_empty', name: 'Contact Field Empty', description: 'Check if a contact field is empty' },
      { id: 'contact_in_workflow', name: 'Contact in Workflow', description: 'Check if contact is in a specific workflow' },
      { id: 'contact_source', name: 'Contact Source', description: 'Check the contact\'s source' },
    ]
  },
  opportunity: {
    label: 'Opportunity Conditions',
    conditions: [
      { id: 'opportunity_stage', name: 'Opportunity Stage', description: 'Check current pipeline stage' },
      { id: 'opportunity_status', name: 'Opportunity Status', description: 'Check opportunity status (open/won/lost)' },
      { id: 'opportunity_value', name: 'Opportunity Value', description: 'Check opportunity monetary value' },
    ]
  },
  time: {
    label: 'Time Conditions',
    conditions: [
      { id: 'time_of_day', name: 'Time of Day', description: 'Check current time of day' },
      { id: 'day_of_week', name: 'Day of Week', description: 'Check current day of week' },
      { id: 'business_hours', name: 'Business Hours', description: 'Check if within business hours' },
    ]
  },
  communication: {
    label: 'Communication Conditions',
    conditions: [
      { id: 'email_opened', name: 'Email Was Opened', description: 'Check if previous email was opened' },
      { id: 'email_clicked', name: 'Email Was Clicked', description: 'Check if email link was clicked' },
      { id: 'sms_replied', name: 'SMS Was Replied', description: 'Check if SMS received a reply' },
      { id: 'call_answered', name: 'Call Was Answered', description: 'Check if call was answered' },
    ]
  },
  math: {
    label: 'Math/Logic Conditions',
    conditions: [
      { id: 'random_split', name: 'Random Split (A/B Test)', description: 'Randomly split contacts for testing' },
      { id: 'custom_value', name: 'Custom Value Check', description: 'Check a custom/calculated value' },
    ]
  }
};

// Common Workflow Templates
export const GHL_WORKFLOW_TEMPLATES = {
  lead_nurturing: {
    id: 'lead_nurturing',
    name: 'Lead Nurturing Sequence',
    description: 'Automated follow-up sequence for new leads to build trust and convert',
    category: 'Lead Generation',
    trigger: 'contact_created',
    steps: [
      { type: 'action', action: 'add_tag', params: { tag: 'New Lead' }, delay: 0 },
      { type: 'action', action: 'send_sms', params: { message: 'Welcome SMS' }, delay: 0 },
      { type: 'action', action: 'send_email', params: { template: 'Welcome Email' }, delay: '1 hour' },
      { type: 'condition', condition: 'email_opened', branches: ['engaged', 'not_engaged'] },
      { type: 'action', action: 'send_email', params: { template: 'Value Email 1' }, delay: '2 days' },
      { type: 'action', action: 'send_sms', params: { message: 'Check-in SMS' }, delay: '4 days' },
      { type: 'action', action: 'send_email', params: { template: 'Case Study' }, delay: '7 days' },
      { type: 'action', action: 'create_task', params: { title: 'Follow up call' }, delay: '10 days' },
    ],
    promptDescription: `
LEAD NURTURING WORKFLOW

Purpose: Automatically nurture new leads through a multi-touch sequence to build trust and encourage booking.

Trigger: When a new contact is created

Sequence:
1. IMMEDIATELY: Add "New Lead" tag + Send welcome SMS
2. 1 HOUR LATER: Send welcome email with introduction
3. CHECK: Did they open the email?
   - If YES: Continue with engaged path
   - If NO: Send re-engagement message
4. 2 DAYS LATER: Send value-focused email #1
5. 4 DAYS LATER: Send check-in SMS
6. 7 DAYS LATER: Send case study/testimonial email
7. 10 DAYS LATER: Create task for personal follow-up call

Key Messages:
- Welcome: Introduce yourself and set expectations
- Value emails: Share tips, education, success stories
- Check-in: Personal touch asking if they have questions
- Case study: Social proof with real results

Goal: Move lead to booking an appointment within 14 days
`
  },
  appointment_reminder: {
    id: 'appointment_reminder',
    name: 'Appointment Reminder Sequence',
    description: 'Reduce no-shows with automated appointment reminders',
    category: 'Appointments',
    trigger: 'appointment_booked',
    steps: [
      { type: 'action', action: 'send_email', params: { template: 'Booking Confirmation' }, delay: 0 },
      { type: 'action', action: 'send_sms', params: { message: 'Confirmation SMS' }, delay: 0 },
      { type: 'action', action: 'send_email', params: { template: 'Preparation Email' }, delay: '24 hours before' },
      { type: 'action', action: 'send_sms', params: { message: '24hr Reminder' }, delay: '24 hours before' },
      { type: 'action', action: 'send_sms', params: { message: '1hr Reminder' }, delay: '1 hour before' },
    ],
    promptDescription: `
APPOINTMENT REMINDER WORKFLOW

Purpose: Reduce no-shows by sending timely reminders before appointments.

Trigger: When an appointment is booked

Sequence:
1. IMMEDIATELY after booking:
   - Send confirmation email with appointment details
   - Send confirmation SMS with date/time
   
2. 24 HOURS BEFORE appointment:
   - Send preparation email (what to expect, what to bring)
   - Send SMS reminder with option to confirm/reschedule
   
3. 1 HOUR BEFORE appointment:
   - Send final SMS reminder with address/directions

Key Elements:
- Include appointment date, time, and location in all messages
- Provide easy reschedule link if needed
- Include preparation instructions
- Add calendar invite attachment to emails

Goal: Achieve 95%+ show rate for appointments
`
  },
  no_show_recovery: {
    id: 'no_show_recovery',
    name: 'No-Show Recovery',
    description: 'Re-engage contacts who missed their appointment',
    category: 'Appointments',
    trigger: 'appointment_no_show',
    steps: [
      { type: 'action', action: 'add_tag', params: { tag: 'No Show' }, delay: 0 },
      { type: 'action', action: 'send_sms', params: { message: 'Missed appointment SMS' }, delay: '30 minutes' },
      { type: 'action', action: 'send_email', params: { template: 'Reschedule Email' }, delay: '2 hours' },
      { type: 'action', action: 'send_sms', params: { message: 'Reschedule offer' }, delay: '24 hours' },
      { type: 'action', action: 'create_task', params: { title: 'Call no-show' }, delay: '48 hours' },
    ],
    promptDescription: `
NO-SHOW RECOVERY WORKFLOW

Purpose: Re-engage contacts who missed their appointment and get them rescheduled.

Trigger: When a contact is marked as no-show

Sequence:
1. IMMEDIATELY: Add "No Show" tag for tracking
2. 30 MINUTES AFTER: Send caring SMS asking if everything is okay
3. 2 HOURS AFTER: Send email with easy reschedule link
4. 24 HOURS AFTER: Send SMS with special offer to reschedule
5. 48 HOURS AFTER: Create task for personal phone call

Messaging Tone:
- Be understanding, not accusatory
- Express concern for their wellbeing
- Make rescheduling easy
- Consider offering incentive for rebooking

Goal: Recover 50%+ of no-shows within 72 hours
`
  },
  review_request: {
    id: 'review_request',
    name: 'Review Request Sequence',
    description: 'Request reviews from satisfied customers after service',
    category: 'Reputation',
    trigger: 'appointment_completed',
    steps: [
      { type: 'action', action: 'add_tag', params: { tag: 'Service Completed' }, delay: 0 },
      { type: 'action', action: 'send_sms', params: { message: 'Thank you SMS' }, delay: '2 hours' },
      { type: 'action', action: 'send_email', params: { template: 'Review Request' }, delay: '24 hours' },
      { type: 'condition', condition: 'email_clicked', branches: ['reviewed', 'not_reviewed'] },
      { type: 'action', action: 'send_sms', params: { message: 'Review reminder' }, delay: '3 days' },
      { type: 'action', action: 'add_tag', params: { tag: 'Review Requested' }, delay: '3 days' },
    ],
    promptDescription: `
REVIEW REQUEST WORKFLOW

Purpose: Generate positive reviews from satisfied customers after their service.

Trigger: When an appointment is marked as completed

Sequence:
1. IMMEDIATELY: Add "Service Completed" tag
2. 2 HOURS AFTER: Send thank you SMS
3. 24 HOURS AFTER: Send email requesting review with direct link
4. CHECK: Did they click the review link?
   - If YES: Add "Reviewed" tag, send thank you
   - If NO: Continue to reminder
5. 3 DAYS AFTER: Send SMS reminder for review
6. Add "Review Requested" tag

Best Practices:
- Time the request when satisfaction is highest
- Make leaving a review as easy as possible (direct link)
- Personalize with their name and service received
- Thank them regardless of whether they leave a review

Goal: Achieve 30%+ review rate from completed appointments
`
  },
  reactivation: {
    id: 'reactivation',
    name: 'Client Reactivation',
    description: 'Re-engage inactive clients who haven\'t booked recently',
    category: 'Retention',
    trigger: 'custom_date',
    steps: [
      { type: 'action', action: 'add_tag', params: { tag: 'Reactivation Campaign' }, delay: 0 },
      { type: 'action', action: 'send_email', params: { template: 'We Miss You' }, delay: 0 },
      { type: 'action', action: 'send_sms', params: { message: 'Special offer SMS' }, delay: '3 days' },
      { type: 'condition', condition: 'contact_has_tag', params: { tag: 'Booked' }, branches: ['reactivated', 'still_inactive'] },
      { type: 'action', action: 'send_email', params: { template: 'Last Chance Offer' }, delay: '7 days' },
      { type: 'action', action: 'create_task', params: { title: 'Personal outreach' }, delay: '14 days' },
    ],
    promptDescription: `
CLIENT REACTIVATION WORKFLOW

Purpose: Re-engage clients who haven't booked in 60+ days.

Trigger: 60 days since last appointment (custom date field)

Sequence:
1. DAY 0: Add "Reactivation Campaign" tag + Send "We miss you" email
2. DAY 3: Send SMS with special comeback offer
3. CHECK: Have they booked?
   - If YES: Remove from workflow, add "Reactivated" tag
   - If NO: Continue sequence
4. DAY 7: Send "Last chance" email with expiring offer
5. DAY 14: Create task for personal phone call

Offer Ideas:
- Percentage discount on next service
- Free add-on service
- Loyalty points bonus
- Exclusive returning client package

Goal: Reactivate 20%+ of dormant clients
`
  },
  speed_to_lead: {
    id: 'speed_to_lead',
    name: 'Speed to Lead',
    description: 'Instantly respond to new leads for maximum conversion',
    category: 'Lead Generation',
    trigger: 'form_submitted',
    steps: [
      { type: 'action', action: 'add_tag', params: { tag: 'Hot Lead' }, delay: 0 },
      { type: 'action', action: 'send_sms', params: { message: 'Instant response SMS' }, delay: 0 },
      { type: 'action', action: 'send_email', params: { template: 'Instant Response' }, delay: 0 },
      { type: 'action', action: 'send_internal_notification', params: { message: 'New lead!' }, delay: 0 },
      { type: 'action', action: 'create_task', params: { title: 'Call new lead' }, delay: 0 },
      { type: 'action', action: 'send_sms', params: { message: 'Follow up SMS' }, delay: '5 minutes' },
    ],
    promptDescription: `
SPEED TO LEAD WORKFLOW

Purpose: Respond to new leads within seconds to maximize conversion rates.

Trigger: When a form is submitted (lead capture form)

Sequence:
1. INSTANTLY (within seconds):
   - Add "Hot Lead" tag
   - Send personalized SMS acknowledging their inquiry
   - Send email with more information
   - Notify team member via SMS/email
   - Create urgent task to call lead
   
2. 5 MINUTES LATER:
   - Send follow-up SMS if no response yet

Why Speed Matters:
- Leads contacted within 5 minutes are 100x more likely to convert
- First responder typically wins the business
- Shows professionalism and eagerness to help

Key Elements:
- Personalize with their name and inquiry details
- Include booking link in messages
- Make it easy to respond or call back
- Have team member ready to call immediately

Goal: Contact every new lead within 5 minutes
`
  },
  birthday_campaign: {
    id: 'birthday_campaign',
    name: 'Birthday Campaign',
    description: 'Celebrate client birthdays with special offers',
    category: 'Retention',
    trigger: 'birthday',
    steps: [
      { type: 'action', action: 'send_email', params: { template: 'Birthday Email' }, delay: '7 days before' },
      { type: 'action', action: 'send_sms', params: { message: 'Birthday SMS' }, delay: '0 days' },
      { type: 'action', action: 'add_tag', params: { tag: 'Birthday Offer Sent' }, delay: 0 },
    ],
    promptDescription: `
BIRTHDAY CAMPAIGN WORKFLOW

Purpose: Build loyalty by celebrating client birthdays with special offers.

Trigger: Contact's birthday (from birthday field)

Sequence:
1. 7 DAYS BEFORE birthday:
   - Send early birthday email with special offer
   - Offer valid for birthday month
   
2. ON BIRTHDAY:
   - Send birthday SMS with warm wishes
   - Include booking link for birthday treatment
   - Add "Birthday Offer Sent" tag

Offer Ideas:
- Free birthday service upgrade
- Percentage off any service
- Free gift with appointment
- Double loyalty points

Best Practices:
- Make the offer feel special and exclusive
- Set expiration within birthday month
- Personalize with their name
- Consider a small gift if they book

Goal: 40%+ of birthday contacts book an appointment
`
  },
  post_service_followup: {
    id: 'post_service_followup',
    name: 'Post-Service Follow-up',
    description: 'Check in after service and encourage rebooking',
    category: 'Retention',
    trigger: 'appointment_completed',
    steps: [
      { type: 'action', action: 'send_sms', params: { message: 'Thank you SMS' }, delay: '2 hours' },
      { type: 'action', action: 'send_email', params: { template: 'Aftercare Instructions' }, delay: '24 hours' },
      { type: 'action', action: 'send_email', params: { template: 'Review Request' }, delay: '3 days' },
      { type: 'action', action: 'send_sms', params: { message: 'Rebook reminder' }, delay: '3 weeks' },
      { type: 'action', action: 'send_email', params: { template: 'Rebook Offer' }, delay: '4 weeks' },
    ],
    promptDescription: `
POST-SERVICE FOLLOW-UP WORKFLOW

Purpose: Ensure client satisfaction, provide aftercare, and encourage rebooking.

Trigger: When an appointment is marked as completed

Sequence:
1. 2 HOURS AFTER service:
   - Send thank you SMS
   - Ask if they have any questions
   
2. 24 HOURS AFTER:
   - Send aftercare instructions email
   - Include tips for maintaining results
   
3. 3 DAYS AFTER:
   - Send review request email
   - Direct link to leave review
   
4. 3 WEEKS AFTER:
   - Send SMS reminder about rebooking
   - Mention optimal timing for next appointment
   
5. 4 WEEKS AFTER:
   - Send email with rebooking offer
   - Include easy booking link

Goal: 60%+ of clients rebook within 6 weeks
`
  },
  ghost_client_recovery: {
    id: 'ghost_client_recovery',
    name: 'Ghost Client Recovery',
    description: 'Re-engage leads who stopped responding and went silent',
    category: 'Lead Recovery',
    trigger: 'custom_date',
    steps: [
      { type: 'action', action: 'add_tag', params: { tag: 'Ghost Recovery' }, delay: 0 },
      { type: 'action', action: 'send_sms', params: { message: 'Soft check-in SMS' }, delay: 0 },
      { type: 'condition', condition: 'sms_replied', branches: ['responded', 'still_ghost'] },
      { type: 'action', action: 'send_email', params: { template: 'We Miss You Email' }, delay: '2 days' },
      { type: 'action', action: 'send_sms', params: { message: 'Value offer SMS' }, delay: '5 days' },
      { type: 'action', action: 'send_email', params: { template: 'Last Chance Email' }, delay: '10 days' },
      { type: 'action', action: 'send_sms', params: { message: 'Final breakup SMS' }, delay: '14 days' },
      { type: 'action', action: 'add_tag', params: { tag: 'Unresponsive' }, delay: '14 days' },
      { type: 'action', action: 'create_task', params: { title: 'Review ghost contact' }, delay: '14 days' },
    ],
    promptDescription: `
GHOST CLIENT RECOVERY WORKFLOW

Purpose: Re-engage leads or clients who have stopped responding to all communication attempts. Uses a strategic "breakup" approach to trigger a response.

Trigger: 14 days since last engagement (no reply to messages, no email opens, no calls answered)
- Can also trigger manually for contacts tagged "No Response"
- Or trigger when contact hasn't engaged in X days (custom field)

Sequence:
1. DAY 0 - SOFT CHECK-IN:
   - Add "Ghost Recovery" tag for tracking
   - Send casual SMS: "Hey [Name], just checking in! Haven't heard from you in a while. Everything okay? 😊"
   - CHECK: Did they reply?
     - If YES: Remove from workflow, notify team
     - If NO: Continue sequence

2. DAY 2 - VALUE EMAIL:
   - Send "We Miss You" email
   - Subject: "[Name], we saved something special for you"
   - Include: Recent success story, before/after photos
   - Soft CTA: "When you're ready, we're here"

3. DAY 5 - INCENTIVE OFFER:
   - Send SMS with exclusive offer
   - "Hi [Name]! I have a special offer just for you - [X% off / free add-on] if you book this week. Interested? Reply YES and I'll send details 💕"
   - Creates urgency without being pushy

4. DAY 10 - LAST CHANCE:
   - Send "Last Chance" email
   - Subject: "Should I close your file, [Name]?"
   - Acknowledge they may be busy
   - Mention you'll stop reaching out soon
   - Include easy booking link

5. DAY 14 - THE BREAKUP:
   - Send final "breakup" SMS
   - "Hi [Name], I haven't heard back so I'll assume now isn't the right time. No worries at all! I'm removing you from my follow-up list, but you're always welcome back when you're ready. Wishing you all the best! 💜 - [Your Name]"
   - Add "Unresponsive" tag
   - Create task to review contact

Key Message Templates:

**Soft Check-in SMS:**
"Hey [Name]! 👋 Just wanted to check in - I noticed we haven't connected in a while. Is everything okay? If you have any questions about [service], I'm here to help!"

**We Miss You Email:**
Subject: "We've been thinking about you, [Name]!"
- Personal greeting
- Mention their initial interest
- Share a recent transformation story
- "No pressure, just wanted you to know we're here when you're ready"

**Value Offer SMS:**
"Hi [Name]! Quick question - would a [special offer] help you finally book that [service] you were interested in? I have something special I can offer you this week only. Reply YES if interested! 💕"

**Last Chance Email:**
Subject: "Should I close your file?"
- Acknowledge life gets busy
- Express genuine care (not salesy)
- "I don't want to keep bothering you if you've moved on"
- Clear CTA: Book now or let me know to stop

**Breakup SMS:**
"Hi [Name], since I haven't heard back, I'll assume the timing isn't right. Totally understand! 💜 I'm going to stop following up, but my door is always open if you change your mind. Wishing you the best! - [Your Name]"

Why This Works:
- The "breakup" approach triggers loss aversion
- People often respond when they feel they're losing access
- Non-pushy tone maintains relationship for future
- Clear endpoint respects their time and yours

Tagging Strategy:
- "Ghost Recovery" - Currently in recovery sequence
- "Responded" - Replied during sequence (remove from workflow)
- "Unresponsive" - Completed sequence without response
- "Recovered" - Booked after recovery sequence

Goal: Recover 15-25% of ghost leads within 14 days
`
  },
  meta_24hr_engagement: {
    id: 'meta_24hr_engagement',
    name: 'Meta 24-Hour Engagement',
    description: 'Comply with Meta messaging rules by engaging Facebook/Instagram leads within 24 hours',
    category: 'Lead Generation',
    trigger: 'facebook_lead',
    steps: [
      { type: 'action', action: 'add_tag', params: { tag: 'Meta Lead' }, delay: 0 },
      { type: 'action', action: 'send_sms', params: { message: 'Instant welcome SMS' }, delay: 0 },
      { type: 'action', action: 'send_email', params: { template: 'Welcome Email' }, delay: 0 },
      { type: 'action', action: 'send_internal_notification', params: { message: 'New Meta lead!' }, delay: 0 },
      { type: 'action', action: 'create_task', params: { title: 'Call Meta lead ASAP' }, delay: 0 },
      { type: 'action', action: 'send_sms', params: { message: 'Follow-up SMS' }, delay: '2 hours' },
      { type: 'condition', condition: 'sms_replied', branches: ['engaged', 'no_response'] },
      { type: 'action', action: 'send_sms', params: { message: 'Value message' }, delay: '6 hours' },
      { type: 'action', action: 'send_sms', params: { message: '23hr reminder' }, delay: '23 hours' },
      { type: 'action', action: 'add_tag', params: { tag: '24hr Window Closed' }, delay: '24 hours' },
      { type: 'action', action: 'send_email', params: { template: 'Continue Conversation' }, delay: '24 hours' },
    ],
    promptDescription: `
META 24-HOUR ENGAGEMENT WORKFLOW

Purpose: Comply with Meta (Facebook/Instagram) messaging policy that requires businesses to respond to leads within 24 hours. After 24 hours, you can only send templated messages, not promotional content. This workflow maximizes engagement within the critical 24-hour window.

⚠️ META POLICY REMINDER:
- You have 24 HOURS from when a lead submits a form to send promotional/marketing messages
- After 24 hours, you can ONLY send approved message templates (transactional, not promotional)
- Violating this policy can result in messaging restrictions or account suspension

Trigger: Facebook Lead Ad Submitted OR Instagram Lead Form Submitted

Sequence:
1. IMMEDIATELY (Within seconds):
   - Add "Meta Lead" tag
   - Send instant SMS welcome
   - Send welcome email
   - Notify team member (SMS/email alert)
   - Create urgent task: "Call Meta lead ASAP"
   
2. 2 HOURS AFTER:
   - Send follow-up SMS if no response
   - "Hi [Name]! Just making sure you got my message. I'd love to answer any questions about [service]. What's the best time to chat?"
   - CHECK: Did they reply?
     - If YES: Continue conversation, book appointment
     - If NO: Continue sequence

3. 6 HOURS AFTER:
   - Send value-focused SMS
   - Share a quick tip or testimonial
   - Include booking link

4. 12 HOURS AFTER (if still no response):
   - Send email with more information
   - Include FAQ answers
   - Social proof (reviews, before/afters)

5. 23 HOURS AFTER (CRITICAL - 1 hour before window closes):
   - Send final promotional SMS
   - "Hi [Name]! Last chance to grab [special offer] - it expires tonight! Book here: [link] 💕"
   - This is your LAST chance for promotional messaging

6. 24 HOURS - WINDOW CLOSES:
   - Add "24hr Window Closed" tag
   - Switch to approved message templates only
   - Move to standard nurture sequence

Key Message Templates (Within 24 Hours):

**Instant Welcome SMS:**
"Hi [Name]! 🎉 Thanks for your interest in [service]! I'm [Your Name] and I'd love to help you achieve [benefit]. What questions can I answer for you?"

**2-Hour Follow-up:**
"Hey [Name]! Just checking in - did you get my message? I'm here to help with any questions about [service]. Reply anytime! 😊"

**6-Hour Value Message:**
"Quick tip [Name]: [Relevant tip about service]. Want to see some amazing transformations? Check these out: [link] 💕"

**23-Hour Final Push:**
"⏰ Hi [Name]! Just wanted to let you know - I have a special [X% off / bonus offer] available, but I can only hold it until midnight. Interested? Here's the link to book: [booking link]"

**Post-24hr Template (Transactional Only):**
"Hi [Name], this is [Your Name] from [Business]. You previously inquired about our services. If you'd like to schedule a consultation, please visit [booking link] or reply to this message."

Why 24-Hour Compliance Matters:
- Meta restricts promotional messaging after 24 hours
- Violations can disable your messaging capabilities
- First 24 hours have highest engagement rates anyway
- Speed to lead = higher conversion rates

Tagging Strategy:
- "Meta Lead" - Came from Facebook/Instagram
- "24hr Active" - Within promotional window
- "24hr Window Closed" - Past promotional window
- "Meta Converted" - Booked from Meta lead
- "Meta Nurture" - Moved to long-term nurture

Best Practices:
1. Respond within 5 MINUTES for best results
2. Use conversational, non-salesy tone
3. Ask questions to encourage replies
4. Include clear CTAs with booking links
5. Have team member call within first hour
6. Track which messages get responses

After 24 Hours - Approved Actions:
✅ Appointment confirmations/reminders
✅ Shipping/delivery updates
✅ Account updates
✅ Responses to customer inquiries
❌ Promotional offers
❌ Marketing messages
❌ Upsells/cross-sells

Goal: 
- 80%+ response rate within 24 hours
- 30%+ booking rate from Meta leads
- 100% compliance with Meta messaging policy
`
  }
};

// Workflow building questions for AI
export const WORKFLOW_BUILDER_QUESTIONS = {
  initial: [
    "What is the main goal of this workflow? (e.g., nurture leads, reduce no-shows, get reviews)",
    "What event should trigger this workflow? (e.g., new contact, form submission, appointment booked)",
    "Who is the target audience for this workflow? (e.g., new leads, existing clients, inactive clients)",
  ],
  communication: [
    "What communication channels do you want to use? (SMS, Email, or both)",
    "What tone should the messages have? (Professional, Friendly, Casual)",
    "Do you have existing message templates, or should I help create them?",
  ],
  timing: [
    "How long should this workflow run? (e.g., 7 days, 30 days, ongoing)",
    "What time delays do you want between messages?",
    "Should messages only be sent during business hours?",
  ],
  conditions: [
    "Should the workflow behave differently based on contact responses?",
    "Are there any conditions that should stop the workflow early?",
    "Do you want to A/B test different message variations?",
  ],
  actions: [
    "Should contacts be tagged at different stages?",
    "Do you want tasks created for manual follow-up?",
    "Should team members be notified at any point?",
  ],
  goals: [
    "What is the success metric for this workflow? (e.g., appointment booked, review left)",
    "What should happen when the goal is achieved?",
    "How will you measure the workflow's effectiveness?",
  ]
};

// Export all for use in AI workflow builder
export const GHL_KNOWLEDGE_BASE = {
  triggers: GHL_TRIGGERS,
  actions: GHL_ACTIONS,
  conditions: GHL_CONDITIONS,
  templates: GHL_WORKFLOW_TEMPLATES,
  questions: WORKFLOW_BUILDER_QUESTIONS,
};

export default GHL_KNOWLEDGE_BASE;
