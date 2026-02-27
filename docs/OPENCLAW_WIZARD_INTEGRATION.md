# 🦞 OpenClaw AI Wizard Integration Guide

**Date:** January 30, 2026  
**Version:** 1.0  
**Integration:** OpenClaw AI Assistant with Step-by-Step Wizard Journeys

---

## 🎯 Overview

The OpenClaw AI Wizard system provides **guided, step-by-step booking journeys** for different customer types. Instead of free-form conversations, customers follow structured wizards that ensure complete booking information and higher conversion rates.

### **Key Features:**

✅ **6 Pre-built Wizard Flows** for different customer journeys  
✅ **Step-by-Step Guidance** with validation and confirmation  
✅ **Multi-Channel Support** (WhatsApp, Telegram, SMS, WebChat)  
✅ **Admin Configuration** with drag-and-drop flow editor  
✅ **Analytics Tracking** for wizard performance and completion rates  
✅ **Firestore Integration** for wizard state persistence  

---

## 🧙‍♂️ Available Wizard Flows

### **1. New Customer Booking Wizard**
**Use Case:** First-time customers booking PMU services  
**Steps:** 6
- Welcome and introduction
- Service selection (Microblading, Lip Blushing, Eyeliner, Consultation)
- Availability check
- Artist selection (optional)
- Contact information collection
- Booking confirmation

### **2. Existing Customer Booking Wizard**
**Use Case:** Returning customers for quick booking  
**Steps:** 4
- Welcome back message
- Service selection
- Preferred time selection
- Booking confirmation

### **3. Consultation Request Wizard**
**Use Case:** Customers wanting to discuss options  
**Steps:** 7
- Free consultation introduction
- Interest area selection (eyebrows, lips, eyes, multiple)
- Consultation type (in-person, virtual, phone)
- Availability selection
- Contact information
- Confirmation

### **4. Service Inquiry Wizard**
**Use Case:** Customers seeking service information  
**Steps:** 8
- Service information introduction
- Service category selection
- Specific interest (pricing, process, aftercare, healing, booking)
- Delivery method preference
- Contact information
- Information delivery confirmation

### **5. Reschedule Request Wizard**
**Use Case:** Customers changing existing appointments  
**Steps:** 6
- Reschedule introduction
- Booking lookup method
- Booking details input
- New time preference
- Reason (optional)
- Confirmation

### **6. Cancellation Request Wizard**
**Use Case:** Customers cancelling appointments  
**Steps:** 7
- Cancellation introduction
- Policy information display
- Booking lookup method
- Booking details input
- Cancellation confirmation
- Feedback collection (optional)
- Final confirmation

---

## 🏗️ Technical Architecture

### **Component Structure:**

```
Admin Dashboard
├── OpenClaw Manager (Gateway & Channels)
└── OpenClaw Wizard Manager (Wizard Flows)
    ├── Wizard Flows Tab (Overview)
    ├── Flow Editor Tab (Configuration)
    └── Analytics Tab (Performance)
```

### **API Endpoints:**

**`/api/openclaw/webhook`** (Main webhook)
- Routes wizard messages to wizard handler
- Handles general OpenClaw conversations

**`/api/openclaw/wizard`** (Wizard-specific)
- Processes wizard flow execution
- Manages wizard state transitions
- Handles step validation and data collection

**`/api/openclaw/status`** (Gateway status)
- Checks OpenClaw Gateway connection
- Returns active channels

**`/api/openclaw/test`** (Connection test)
- Tests Gateway connectivity

### **Data Flow:**

```
Customer Message
    ↓
OpenClaw Gateway (ws://localhost:18789)
    ↓
Main Webhook (/api/openclaw/webhook)
    ↓
Wizard Detection (if wizardState exists)
    ↓
Wizard Handler (/api/openclaw/wizard)
    ↓
Firestore Wizard State
    ↓
Step Processing & Validation
    ↓
Response with Next Step
    ↓
Customer receives guided response
```

---

## 🎨 Admin Interface

### **Wizard Flows Tab**
- **Overview:** All 6 wizard flows with enable/disable toggles
- **Flow Status:** Enabled/Disabled, step count, use case type
- **Quick Actions:** Edit flow, enable/disable, save configuration
- **Flow Cards:** Visual representation with icons and descriptions

### **Flow Editor Tab**
- **Flow Configuration:** Name, use case type, step management
- **Step Management:** Add, remove, reorder steps
- **Step Types:** Selection, Input, Calendar, Confirmation
- **Validation Rules:** Required fields, patterns, length limits
- **Real-time Preview:** See flow structure as you edit

### **Analytics Tab**
- **Performance Metrics:** Wizard starts, completions, completion rate
- **Duration Tracking:** Average completion time
- **Channel Performance:** Success rates by messaging channel
- **Conversion Tracking:** Bookings created via wizards

---

## 🔧 Wizard Flow Configuration

### **Step Types:**

**1. Selection Steps**
```typescript
{
  id: 'service_selection',
  title: 'Choose Your Service',
  description: 'Select the PMU service you are interested in',
  type: 'selection',
  options: [
    { value: 'microblading', label: 'Microblading', description: 'Natural-looking eyebrows ($350)' },
    { value: 'lip_blushing', label: 'Lip Blushing', description: 'Enhanced lip color ($400)' }
  ],
  validation: { required: true }
}
```

**2. Input Steps**
```typescript
{
  id: 'contact_info',
  title: 'Contact Information',
  description: 'We will need your details to confirm your appointment',
  type: 'input',
  validation: { required: true, minLength: 2, maxLength: 50 }
}
```

**3. Calendar Steps**
```typescript
{
  id: 'availability_check',
  title: 'Check Availability',
  description: 'When would you like to come in?',
  type: 'calendar',
  validation: { required: true }
}
```

**4. Confirmation Steps**
```typescript
{
  id: 'confirmation',
  title: 'Confirm Your Booking',
  description: 'Review and confirm your appointment details',
  type: 'confirmation',
  validation: { required: true }
}
```

### **Validation Rules:**
- `required`: Field must be completed
- `pattern`: Regex pattern for validation
- `minLength`: Minimum character length
- `maxLength`: Maximum character length

---

## 📱 Customer Experience

### **WhatsApp Example:**

```
Customer: "Hi, I want to book microblading"
OpenClaw: 🎯 **New Customer Booking**
Let's get you scheduled for your perfect PMU service

**Step 1: Welcome to PMU Booking**
Let's get you scheduled for your perfect PMU service

[Continue] [Services] [Pricing]

Customer: "Continue"
OpenClaw: **Step 2: Choose Your Service**
Select the PMU service you are interested in

[Microblading] [Lip Blushing] [Permanent Eyeliner] [Free Consultation]

Customer: "Microblading"
OpenClaw: **Step 3: Check Availability**
When would you like to come in?

[Tomorrow 2pm] [Friday 10am] [Saturday 3:30pm]

Customer: "Friday 10am"
OpenClaw: **Step 4: Choose Your Artist**
Select your preferred artist (optional)

[Any Available Artist] [Sarah Johnson] [Maria Rodriguez] [Jennifer Chen]

Customer: "Sarah Johnson"
OpenClaw: **Step 5: Contact Information**
We will need your details to confirm your appointment

Customer: "Sarah Smith, sarah@email.com, 555-123-4567"
OpenClaw: **Step 6: Confirm Your Booking**
Review and confirm your appointment details

[Confirm] [Edit Details]

Customer: "Confirm"
OpenClaw: ✅ **Booking Complete!**

📅 **Appointment Details:**
• Service: Microblading
• Date: Friday
• Artist: Sarah Johnson
• Price: $350

You'll receive a confirmation email shortly! 💄

[Book Another] [View Services] [Main Menu]
```

### **Telegram Example:**

```
Customer: "/book"
OpenClaw: 🎯 **New Customer Booking**
Let's get you scheduled for your perfect PMU service

**Step 1: Welcome to PMU Booking**
Let's get you scheduled for your perfect PMU service

[Continue] [Services] [Pricing]

Customer: "Continue"
OpenClaw: **Step 2: Choose Your Service**
Select the PMU service you are interested in

[Microblading] [Lip Blushing] [Permanent Eyeliner] [Free Consultation]

Customer: "Lip Blushing"
OpenClaw: **Step 3: Check Availability**
When would you like to come in?

[Tomorrow 2pm] [Friday 10am] [Saturday 3:30pm]

Customer: "Friday 10am"
OpenClaw: **Step 4: Choose Your Artist**
Select your preferred artist (optional)

[Any Available Artist] [Sarah Johnson] [Maria Rodriguez] [Jennifer Chen]

Customer: "Any Available Artist"
OpenClaw: **Step 5: Contact Information**
We will need your details to confirm your appointment

Customer: "John Doe, john@email.com, 555-987-6543"
OpenClaw: **Step 6: Confirm Your Booking**
Review and confirm your appointment details

[Confirm] [Edit Details]

Customer: "Confirm"
OpenClaw: ✅ **Booking Complete!**

📅 **Appointment Details:**
• Service: Lip Blushing
• Date: Friday
• Artist: Any Available Artist
• Price: $400

You'll receive a confirmation email shortly! 💄

[Book Another] [View Services] [Main Menu]
```

---

## 📊 Analytics & Tracking

### **Wizard Performance Metrics:**

**Completion Rates:**
- Total wizard starts
- Successful completions
- Drop-off points by step
- Completion rate percentage

**Duration Tracking:**
- Average completion time
- Fastest/slowest wizard flows
- Time per step analysis

**Channel Performance:**
- Success rates by channel (WhatsApp, Telegram, SMS, WebChat)
- Channel-specific completion rates
- Customer preference by channel

**Conversion Tracking:**
- Bookings created via wizards
- Consultation requests processed
- Service inquiries converted to bookings

### **Firestore Collections:**

**`openclawWizardLogs`**
```typescript
{
  channel: string;
  customer: string;
  message: string;
  timestamp: Timestamp;
  sessionId: string;
  wizardState: {
    flowId: string;
    currentStep: number;
    data: any;
    startedAt: string;
  };
}
```

**`integrationSettings/openclaw_wizards`**
```typescript
{
  flows: WizardFlow[];
  defaultFlowId: string;
  enabled: boolean;
  updatedAt: Timestamp;
}
```

---

## 🔐 Security & Permissions

### **Firestore Security Rules:**

```javascript
// OpenClaw wizard logs - Admin and system access
match /openclawWizardLogs/{logId} {
  allow read: if isAdmin();
  allow write: if isAdmin();
  allow create: if true; // Allow system to create wizard logs
}

// OpenClaw wizard configuration - Admin access only
match /integrationSettings/openclaw_wizards {
  allow read: if isAdmin();
  allow write: if isAdmin();
}
```

### **Data Privacy:**
- Customer conversations stored locally in OpenClaw
- Wizard state data synced to Firestore with proper security
- No sensitive customer data in wizard logs
- Option to delete wizard conversation history

---

## 🚀 Deployment Guide

### **1. Install OpenClaw Gateway**

```bash
npm install -g openclaw@latest
openclaw onboard --install-daemon
openclaw gateway --port 18789 --verbose
```

### **2. Configure Channels**

Navigate to **Admin Dashboard → Integrations → OpenClaw AI**

**Enable Channels:**
- WhatsApp (run `openclaw channels login`)
- Telegram (add bot token from @BotFather)
- SMS (integrate with existing Twilio)
- WebChat (always available)

### **3. Configure Wizard Flows**

Navigate to **Admin Dashboard → Integrations → AI Wizards**

**Default Setup:**
- All 6 wizard flows pre-configured and enabled
- Ready to use immediately
- Customize steps as needed

**Customization:**
- Enable/disable specific wizard flows
- Edit step content and validation rules
- Add custom wizard flows for specific use cases
- Configure quick reply options

### **4. Test Wizard Flows**

**WebChat Testing:**
1. Enable WebChat channel
2. Send test message: "book"
3. Follow wizard steps
4. Verify booking creation in Firestore

**Multi-Channel Testing:**
1. Test each enabled channel
2. Verify wizard state persistence
3. Check analytics tracking
4. Validate booking creation

### **5. Monitor Performance**

**Analytics Dashboard:**
- View wizard completion rates
- Track average completion time
- Monitor conversion rates
- Analyze drop-off points

**Optimization:**
- A/B test different wizard flows
- Optimize step content for higher completion
- Adjust validation rules based on customer feedback
- Add new wizard flows based on customer needs

---

## 💡 Best Practices

### **Wizard Design:**
1. **Keep steps short and focused** - One question per step
2. **Use clear, conversational language** - Avoid technical jargon
3. **Provide helpful context** - Explain why information is needed
4. **Offer smart defaults** - Pre-fill common selections when possible
5. **Validate input early** - Catch errors in current step before proceeding

### **Customer Experience:**
1. **Welcome customers warmly** - Set positive tone
2. **Explain the process** - Help customers understand wizard flow
3. **Provide progress indicators** - Show current step and remaining steps
4. **Allow easy backtracking** - Let customers change previous answers
5. **Confirm important details** - Double-check critical information

### **Performance Optimization:**
1. **Monitor completion rates** - Identify problematic steps
2. **Track drop-off points** - Optimize steps with high abandonment
3. **A/B test variations** - Test different wording and flows
4. **Analyze channel differences** - Optimize for each messaging platform
5. **Iterate based on data** - Continuously improve wizard flows

---

## 🔧 Troubleshooting

### **Common Issues:**

**Wizard Not Starting:**
- Check if wizard flow is enabled in admin
- Verify wizard configuration in Firestore
- Ensure OpenClaw Gateway is running
- Check webhook URL configuration

**Steps Not Progressing:**
- Validate wizard state data structure
- Check step validation rules
- Verify wizard flow configuration
- Check API endpoint connectivity

**Booking Not Created:**
- Verify Firestore permissions
- Check booking data structure
- Validate required fields
- Review error logs

**Analytics Not Tracking:**
- Check wizard log collection permissions
- Verify analytics data structure
- Validate tracking implementation
- Check dashboard data queries

### **Debug Commands:**

```bash
# Check OpenClaw Gateway status
openclaw status

# Test webhook connectivity
curl -X POST https://yourdomain.com/api/openclaw/webhook \
  -H "Content-Type: application/json" \
  -d '{"channel":"test","from":"debug","text":"test"}'

# View wizard logs
firebase firestore:logs --collection=openclawWizardLogs
```

---

## 📈 Success Metrics

### **Key Performance Indicators:**

**Completion Metrics:**
- [ ] 85%+ wizard completion rate
- [ ] < 3 minutes average completion time
- [ ] < 10% drop-off at any single step
- [ ] 90%+ booking creation success rate

**Customer Satisfaction:**
- [ ] > 4.5/5 customer satisfaction rating
- [ ] < 5 second average response time
- [ ] < 5% customer support escalations
- [ ] 80%+ would recommend wizard booking

**Business Impact:**
- [ ] 50%+ increase in booking conversions
- [ ] 70%+ reduction in manual booking management
- [ ] 60%+ increase in consultation requests
- [ ] 40%+ improvement in customer acquisition

---

## 🎯 Next Steps

### **Immediate Actions:**
1. **Deploy OpenClaw Gateway** on production server
2. **Configure channels** (start with WebChat)
3. **Enable wizard flows** in admin dashboard
4. **Test end-to-end** booking wizard
5. **Monitor performance** and optimize

### **Future Enhancements:**
1. **Voice wizard support** - OpenClaw Talk Mode integration
2. **Image wizard steps** - Photo consultation workflows
3. **Payment wizard integration** - Direct deposit collection
4. **Multi-language wizards** - International customer support
5. **AI-powered optimization** - Automatic wizard flow improvements

---

## 📞 Support

For technical support or questions about the OpenClaw Wizard integration:

**Documentation:** `/docs/OPENCLAW_WIZARD_INTEGRATION.md`  
**Admin Interface:** `/dashboard` → Integrations → AI Wizards  
**API Reference:** `/api/openclaw/wizard`  

---

*OpenClaw AI Wizard Integration - Version 1.0*  
*For A Pretty Girl Matter PMU Website*
