# Alexa Skills & SMS Integration Guide

## 📍 Location
**Admin Dashboard → Integrations → Alexa Skills**

## 🎤 Alexa Skills Integration

### **Overview**
Enable voice booking and customer service through Amazon Alexa devices. Customers can ask about services, check availability, and get business information using voice commands.

### **Setup Steps**

#### **1. Configure in Admin Dashboard**
1. Navigate to: Admin Dashboard → Integrations → Alexa Skills
2. Click on "Alexa Skills" tab
3. Fill in configuration:
   - **Skill Name:** Your skill's display name (e.g., "PMU Booking Assistant")
   - **Invocation Name:** What users say to activate (e.g., "beauty booking")
   - **Skill ID:** From Amazon Developer Console
4. Copy the **Webhook Endpoint URL** provided

#### **2. Create Alexa Skill in Amazon Developer Console**
1. Go to [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask)
2. Click "Create Skill"
3. Choose "Custom" model and "Provision your own" backend
4. Set invocation name (must match dashboard config)
5. Configure endpoint:
   - Type: HTTPS
   - URL: Paste webhook URL from dashboard
   - SSL Certificate: "My development endpoint is a sub-domain..."

#### **3. Build Interaction Model**
Copy the Intent Schema from the "Voice Commands" tab and paste into Alexa Developer Console:
- Go to "Build" → "JSON Editor"
- Paste the intent schema
- Click "Save Model" and "Build Model"

#### **4. Test Your Skill**
1. In dashboard, click "Test Skill" button
2. In Alexa Developer Console, use the Test tab
3. Try commands like:
   - "Alexa, open beauty booking"
   - "Book an appointment"
   - "What are your business hours?"

### **Supported Voice Commands**

| Command | Intent | What It Does |
|---------|--------|--------------|
| "Book an appointment" | BookAppointment | Initiates booking process |
| "Check availability" | CheckAvailability | Shows available time slots |
| "Get service information" | ServiceInfo | Explains services offered |
| "What are your business hours?" | BusinessHours | Provides operating hours |
| "Cancel appointment" | CancelAppointment | Guides through cancellation |

### **Webhook Endpoint**
- **URL:** `https://yourdomain.com/api/alexa/webhook`
- **Method:** POST
- **Format:** Alexa Request/Response JSON

---

## 📱 SMS/Texting Integration

### **Overview**
Send automated text messages for booking confirmations, reminders, and two-way customer communication.

### **SMS Provider Options**

#### **Option 1: Twilio (Recommended)**
**Best for:** Most businesses, reliable delivery, competitive pricing

**Setup:**
1. Create account at [Twilio.com](https://www.twilio.com)
2. Get a phone number
3. Copy credentials:
   - Account SID
   - Auth Token
   - Phone Number
4. In dashboard, select "Twilio" provider
5. Paste credentials
6. Click "Save Configuration"
7. Click "Send Test SMS" to verify

**Pricing:** Pay-as-you-go, ~$0.0075 per SMS

#### **Option 2: AWS SNS**
**Best for:** Enterprise, existing AWS infrastructure

**Setup:**
1. Configure AWS SNS in AWS Console
2. Get access credentials
3. Configure in dashboard
4. Test connection

#### **Option 3: GoHighLevel**
**Best for:** Existing GHL users, integrated workflows

**Setup:**
1. Ensure GHL is configured (Admin → Integrations → GoHighLevel)
2. Select "GoHighLevel" as SMS provider
3. SMS will use your GHL phone number automatically
4. No additional configuration needed

### **SMS Features**

#### **Automatic Messages:**
- ✅ **Booking Confirmations** - Sent when booking is confirmed
- ✅ **24-Hour Reminders** - Sent day before appointment
- ✅ **1-Hour Reminders** - Sent hour before appointment
- ✅ **Status Updates** - Sent when booking status changes

#### **Two-Way Messaging:**
- Customers can reply to confirm/reschedule
- Responses logged in system
- Admin notifications for customer replies

#### **Message Templates:**
```
Booking Confirmation:
"Hi [Name]! Your [Service] appointment is confirmed for [Date] at [Time]. Reply CONFIRM to confirm or RESCHEDULE to change. - [Business Name]"

24-Hour Reminder:
"Reminder: Your [Service] appointment is tomorrow at [Time]. Reply CONFIRM or call us at [Phone]. See you soon!"

1-Hour Reminder:
"Your appointment starts in 1 hour! Address: [Address]. Questions? Call [Phone]."
```

### **Testing SMS**
1. Configure provider credentials
2. Click "Send Test SMS"
3. Check your phone for test message
4. Verify delivery in dashboard

---

## 🔧 Technical Details

### **API Endpoints**

#### **Alexa Webhook**
```
POST /api/alexa/webhook
Content-Type: application/json

Request: Alexa Request JSON
Response: Alexa Response JSON
```

#### **Alexa Test**
```
POST /api/alexa/test
Content-Type: application/json

Body: { "intent": "TestIntent" }
Response: { "success": true, "alexaResponse": {...} }
```

#### **SMS Test**
```
POST /api/sms/test
Response: { "success": true, "provider": "twilio" }
```

### **Firestore Collections**

#### **integrationSettings/alexa**
```typescript
{
  skillId: string;
  skillName: string;
  invocationName: string;
  endpointUrl: string;
  enabled: boolean;
  updatedAt: Date;
}
```

#### **integrationSettings/sms**
```typescript
{
  provider: 'twilio' | 'aws-sns' | 'ghl';
  accountSid?: string;      // Twilio only
  authToken?: string;        // Twilio only
  phoneNumber?: string;      // Twilio only
  enabled: boolean;
  updatedAt: Date;
}
```

#### **smsMessages/{messageId}**
```typescript
{
  to: string;
  from: string;
  body: string;
  status: 'sent' | 'delivered' | 'failed';
  provider: string;
  bookingId?: string;
  sentAt: Date;
}
```

---

## 🔐 Security & Permissions

### **Firestore Rules**
```javascript
// Integration settings - Admin only
match /integrationSettings/{integrationId} {
  allow read: if isAdmin();
  allow write: if isAdmin();
}

// SMS messages - Admin read, system write
match /smsMessages/{messageId} {
  allow read: if isAdmin();
  allow write: if isAdmin();
  allow create: if true; // System logging
}
```

### **Alexa Skill Verification**
- Webhook validates Alexa request signature
- Only accepts requests from Amazon Alexa service
- Timestamp validation prevents replay attacks

---

## 📊 Usage & Analytics

### **Track in Dashboard:**
- Total Alexa interactions
- Most used voice commands
- SMS delivery rates
- Customer response rates
- Failed message attempts

### **Integration with Booking System:**
- Alexa bookings create entries in `bookings` collection
- SMS confirmations link to booking IDs
- Automatic sync with calendar providers (GHL/Google)

---

## 🚀 Best Practices

### **Alexa Skills:**
1. Keep responses concise (under 8 seconds of speech)
2. Use cards for visual information
3. Provide clear next steps
4. Test with various phrasings
5. Handle errors gracefully

### **SMS Messaging:**
1. Keep messages under 160 characters when possible
2. Include business name in every message
3. Provide opt-out instructions
4. Use clear call-to-action
5. Test on multiple carriers

### **Compliance:**
- **TCPA Compliance:** Get consent before sending SMS
- **Opt-Out:** Honor STOP requests immediately
- **Privacy:** Don't share customer phone numbers
- **Timing:** Send messages during business hours only

---

## 🐛 Troubleshooting

### **Alexa Skill Not Responding**
1. Check webhook URL is correct
2. Verify skill is enabled in Amazon console
3. Test endpoint with "Test Skill" button
4. Check Firestore rules allow admin access
5. Review browser console for errors

### **SMS Not Sending**
1. Verify provider credentials are correct
2. Check phone number format (E.164: +1234567890)
3. Ensure sufficient balance (Twilio)
4. Test with "Send Test SMS" button
5. Check SMS provider dashboard for errors

### **Voice Commands Not Working**
1. Rebuild interaction model in Alexa console
2. Verify intent names match exactly
3. Test in Alexa simulator first
4. Check webhook logs for errors
5. Ensure intents are enabled

---

## 📞 Support

**Need Help?**
- Check webhook logs in browser console
- Test endpoints individually
- Verify all credentials are correct
- Review Firestore rules are deployed
- Contact support with error messages

**Resources:**
- [Alexa Skills Kit Documentation](https://developer.amazon.com/docs/ask-overviews/build-skills-with-the-alexa-skills-kit.html)
- [Twilio SMS Documentation](https://www.twilio.com/docs/sms)
- [AWS SNS Documentation](https://docs.aws.amazon.com/sns/)

---

## ✅ Deployment Checklist

**Before Going Live:**
- [ ] Alexa skill tested in simulator
- [ ] Webhook endpoint accessible publicly
- [ ] SSL certificate valid
- [ ] SMS provider configured and tested
- [ ] Message templates reviewed
- [ ] Firestore rules deployed
- [ ] Opt-out mechanism in place
- [ ] Privacy policy updated
- [ ] Customer consent obtained
- [ ] Backup notification method configured

**After Deployment:**
- [ ] Monitor webhook logs
- [ ] Track SMS delivery rates
- [ ] Collect customer feedback
- [ ] Optimize voice responses
- [ ] Review message templates
- [ ] Update intents as needed
