# BMAD Workflow Integration Guide
## Permanent Makeup Website Automation

This guide shows you how to use BMAD's workflow features to automate your permanent makeup business operations.

## 🎯 Overview

BMAD Workflows automate repetitive tasks and ensure consistent customer communication throughout the customer journey.

## 📋 Available Workflows

### 1. **New Booking Workflow** 
**Trigger:** When a customer books an appointment

**Automated Actions:**
1. ✅ Creates contact in GoHighLevel
2. ✅ Adds to "New Booking" pipeline
3. ✅ Sends confirmation SMS/Email
4. ✅ Creates follow-up task for 2 days after appointment
5. ✅ Tags customer with service type

**Example Message:**
```
Hi Sarah! 

Your Microblading appointment has been scheduled for March 15, 2024 at 2:00 PM.

We're excited to help you achieve your beauty goals! 

If you need to reschedule, please contact us at least 24 hours in advance.

Thank you for choosing us! 💕
```

---

### 2. **Booking Confirmation Workflow**
**Trigger:** When customer confirms appointment

**Automated Actions:**
1. ✅ Updates GHL opportunity stage to "Confirmed"
2. ✅ Sends detailed preparation instructions
3. ✅ Schedules 24-hour reminder

**Preparation Instructions Sent:**
```
Thank you for confirming your Microblading appointment! 

📋 Preparation Instructions:

✅ Avoid alcohol, caffeine, and blood thinners 24 hours before
✅ Come with a clean face (no makeup)
✅ Avoid sun exposure and tanning
✅ Stay hydrated
✅ Get a good night's sleep

📍 Location: [Your Address]
🕐 Time: 2:00 PM
📅 Date: March 15, 2024

We look forward to seeing you!
```

---

### 3. **New User Registration Workflow**
**Trigger:** When someone creates an account

**Automated Actions:**
1. ✅ Creates contact in GoHighLevel
2. ✅ Adds to "Leads" pipeline
3. ✅ Sends welcome email
4. ✅ Tags as "Website User"

**Welcome Message:**
```
Welcome to our permanent makeup family! 🎨

We're thrilled to have you here. 

Explore our services:
• Microblading
• Powder Brows
• Lip Blush
• Eyeliner

Book your free consultation today!
```

---

### 4. **Consultation Request Workflow**
**Trigger:** When customer requests a consultation

**Automated Actions:**
1. ✅ Creates high-priority opportunity
2. ✅ Notifies staff
3. ✅ Sends consultation preparation info

**Consultation Message:**
```
Thank you for requesting a consultation! 

During your consultation, we'll:
✨ Discuss your desired look
✨ Review before/after photos
✨ Explain the procedure
✨ Answer all your questions
✨ Provide pricing details

Our artist will contact you within 24 hours.
```

---

### 5. **Payment Received Workflow**
**Trigger:** When payment is processed

**Automated Actions:**
1. ✅ Updates opportunity to "Paid"
2. ✅ Sends receipt
3. ✅ Sends thank you message
4. ✅ Confirms appointment details

**Thank You Message:**
```
Thank you for your payment! 

Receipt: $500 for Microblading

Your appointment is confirmed for March 15, 2024 at 2:00 PM.

We can't wait to see you! 💕
```

---

### 6. **Review Submitted Workflow**
**Trigger:** When customer leaves a review

**Automated Actions:**
1. ✅ Sends thank you message
2. ✅ Offers referral discount
3. ✅ Adds to "Happy Customers" segment
4. ✅ Tags for future marketing

**Thank You + Referral Message:**
```
Thank you so much for your 5-star review! ⭐

We're thrilled you love your new look!

As a thank you, here's a special offer:
🎁 Refer a friend and you BOTH get 15% off your next service!

Share your referral code: SARAH123
```

---

### 7. **Appointment Reminder Workflow**
**Trigger:** 24 hours before appointment

**Automated Actions:**
1. ✅ Sends reminder SMS
2. ✅ Requests confirmation
3. ✅ Provides last-minute instructions

**Reminder Message:**
```
⏰ Reminder: Your Microblading appointment is tomorrow!

📅 March 15, 2024
🕐 2:00 PM
📍 [Your Address]

Please remember:
✅ Arrive 10 minutes early
✅ Come with a clean face
✅ Bring any reference photos

Reply CONFIRM to confirm or RESCHEDULE if needed.
```

---

### 8. **Follow-Up Workflow**
**Trigger:** 2 days after appointment

**Automated Actions:**
1. ✅ Checks customer satisfaction
2. ✅ Requests review
3. ✅ Offers aftercare support
4. ✅ Encourages social media sharing

**Follow-Up Message:**
```
Hi Sarah! 

How are you loving your new Microblading? 

We'd love to hear about your experience! 

⭐ Leave us a review: [Review Link]

Questions about aftercare? We're here to help!

P.S. Share your beautiful results on social media and tag us! 📸
```

---

## 🚀 How to Use Workflows

### Method 1: Via BMAD Orchestrator Chat

Simply tell BMAD what you want:

**Examples:**
- "Set up automatic booking confirmations"
- "Send a reminder to all customers with appointments tomorrow"
- "Create a follow-up workflow for completed appointments"

### Method 2: Via Code Integration

```typescript
import { workflowEngine } from '@/services/bmad-workflows';

// Trigger workflow when booking is created
const booking = {
  name: 'Sarah Johnson',
  email: 'sarah@example.com',
  phone: '+1234567890',
  serviceName: 'Microblading',
  date: '2024-03-15',
  time: '2:00 PM',
  price: 500
};

await workflowEngine.executeWorkflow({
  type: 'booking_created',
  data: booking
});
```

### Method 3: Via API Endpoint

```javascript
// Trigger workflow via API
fetch('/api/workflows/trigger', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    trigger: 'booking_created',
    data: bookingData
  })
});
```

---

## 🎨 Customizing Workflows

### Edit Message Templates

All messages can be customized in `src/services/bmad-workflows.ts`:

```typescript
const welcomeMessage = `
  Welcome to [Your Business Name]! 🎨
  
  [Your custom message here]
`;
```

### Add Custom Workflows

Create new workflows by adding to the `executeWorkflow` switch statement:

```typescript
case 'custom_trigger':
  return await this.handleCustomWorkflow(trigger.data);
```

### Configure Timing

Adjust reminder timing in the workflow configuration:

```typescript
// Change from 24 hours to 48 hours before
dueDate: new Date(appointmentDate.getTime() - 48 * 60 * 60 * 1000)
```

---

## 📊 Workflow Analytics

Track workflow performance:

- **Delivery Rate:** % of messages successfully sent
- **Response Rate:** % of customers who respond
- **Conversion Rate:** % who complete desired action
- **Customer Satisfaction:** Based on follow-up responses

---

## 🔗 GoHighLevel Integration

All workflows integrate with GoHighLevel:

1. **Contacts:** Auto-created and updated
2. **Pipelines:** Customers moved through stages
3. **Tags:** Applied based on actions
4. **Tasks:** Created for staff follow-up
5. **Opportunities:** Tracked for revenue

---

## ⚙️ Setup Requirements

1. **GoHighLevel API Key:** Configured in admin dashboard
2. **Required Scopes:** 
   - contacts.write
   - conversations.write
   - opportunities.write
   - workflows.readonly
   - tags.write

3. **Database Collections:**
   - `bookings`
   - `users`
   - `workflows`
   - `crmSettings`

---

## 🎯 Best Practices

1. **Personalization:** Always use customer's name
2. **Timing:** Send messages at appropriate times
3. **Value:** Provide useful information, not just promotions
4. **Consistency:** Maintain brand voice across all messages
5. **Testing:** Test workflows before going live
6. **Monitoring:** Review workflow performance regularly

---

## 📱 Example Customer Journey

**Day 1:** Customer books appointment
- ✅ Instant confirmation SMS
- ✅ Added to GHL pipeline
- ✅ Welcome email sent

**Day 2:** Customer confirms
- ✅ Preparation instructions sent
- ✅ Reminder scheduled

**Day Before:** 24-hour reminder
- ✅ Reminder SMS sent
- ✅ Confirmation requested

**Appointment Day:** Service completed
- ✅ Thank you message
- ✅ Aftercare instructions

**2 Days Later:** Follow-up
- ✅ Satisfaction check
- ✅ Review request
- ✅ Referral offer

**Result:** Happy customer, 5-star review, referral generated! 🎉

---

## 🆘 Troubleshooting

**Workflows not triggering?**
- Check GHL API key is configured
- Verify required scopes are enabled
- Check workflow is marked as "active"

**Messages not sending?**
- Verify contact has valid phone/email
- Check GHL message quota
- Review error logs in console

**Wrong information in messages?**
- Verify data structure matches expected format
- Check field names in booking/user data
- Review message templates

---

## 🚀 Next Steps

1. Configure your GHL API key
2. Test each workflow with sample data
3. Customize message templates
4. Enable workflows one at a time
5. Monitor performance and adjust

**Need help?** Ask BMAD Orchestrator:
- "Show me active workflows"
- "Test the booking confirmation workflow"
- "How many messages were sent today?"
