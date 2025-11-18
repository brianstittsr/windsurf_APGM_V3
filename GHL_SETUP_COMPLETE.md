# GoHighLevel Setup - Complete Configuration

## ✅ Your GoHighLevel Credentials

### **API Key:**
```
pit-7448430c-05cd-4aa8-acfd-afc6cf3e84d2
```

### **Location ID:**
```
kfGFMn1aPE1AhW18tpG8
```

---

## 🔧 **How to Save These in Your Application**

### **Option 1: Admin Dashboard (Recommended)**

1. **Go to Admin Dashboard:**
   - Navigate to: http://localhost:3000/dashboard
   - Click the **"GoHighLevel"** tab

2. **Enter Your Credentials:**
   - **API Key:** `pit-7448430c-05cd-4aa8-acfd-afc6cf3e84d2`
   - **Location ID:** `kfGFMn1aPE1AhW18tpG8`

3. **Click "Save Settings"**
   - This saves to Firestore: `crmSettings/gohighlevel`

4. **Click "Test Connection"**
   - Should show: ✅ "Connection successful!"

---

### **Option 2: Environment Variables**

Add to your `.env.local` file:

```env
# GoHighLevel Private Integration
GHL_API_KEY=pit-7448430c-05cd-4aa8-acfd-afc6cf3e84d2
GHL_LOCATION_ID=kfGFMn1aPE1AhW18tpG8
```

**Note:** The application checks Firestore first, then falls back to environment variables.

---

## 📋 **How to Use Location-Specific Endpoints**

### **Example API Calls:**

#### **1. Get Contacts for Your Location:**
```javascript
const response = await fetch('https://services.leadconnectorhq.com/contacts/', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer pit-7448430c-05cd-4aa8-acfd-afc6cf3e84d2',
    'Version': '2021-07-28'
  }
});
```

#### **2. Create Contact in Your Location:**
```javascript
const response = await fetch('https://services.leadconnectorhq.com/contacts/', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer pit-7448430c-05cd-4aa8-acfd-afc6cf3e84d2',
    'Version': '2021-07-28',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    locationId: 'kfGFMn1aPE1AhW18tpG8',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    phone: '+15551234567'
  })
});
```

#### **3. Create Calendar Appointment:**
```javascript
const response = await fetch('https://services.leadconnectorhq.com/calendars/events/appointments', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer pit-7448430c-05cd-4aa8-acfd-afc6cf3e84d2',
    'Version': '2021-07-28',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    locationId: 'kfGFMn1aPE1AhW18tpG8',
    contactId: 'contact_id_here',
    calendarId: 'calendar_id_here',
    startTime: '2024-03-15T14:00:00Z',
    endTime: '2024-03-15T15:00:00Z',
    title: 'Microblading Appointment',
    appointmentStatus: 'confirmed'
  })
});
```

#### **4. Get Calendars for Your Location:**
```javascript
const response = await fetch('https://services.leadconnectorhq.com/calendars/', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer pit-7448430c-05cd-4aa8-acfd-afc6cf3e84d2',
    'Version': '2021-07-28'
  }
});
```

---

## 🎯 **Using the GHL Orchestrator Service**

Your application has a built-in orchestrator service that handles all GHL API calls:

### **Example Usage:**

```typescript
import { GHLOrchestrator } from '@/services/ghl-orchestrator';

// Initialize with your credentials
const orchestrator = new GHLOrchestrator({
  apiKey: 'pit-7448430c-05cd-4aa8-acfd-afc6cf3e84d2',
  locationId: 'kfGFMn1aPE1AhW18tpG8'
});

// Get all contacts
const contacts = await orchestrator.getContacts();

// Create a new contact
const newContact = await orchestrator.createContact({
  firstName: 'Sarah',
  lastName: 'Johnson',
  email: 'sarah@example.com',
  phone: '+15551234567',
  locationId: 'kfGFMn1aPE1AhW18tpG8'
});

// Get calendars
const calendars = await orchestrator.getCalendars();

// Create appointment
const appointment = await orchestrator.createAppointment('calendar_id', {
  locationId: 'kfGFMn1aPE1AhW18tpG8',
  contactId: newContact.id,
  startTime: '2024-03-15T14:00:00Z',
  endTime: '2024-03-15T15:00:00Z',
  title: 'Microblading - Sarah Johnson',
  appointmentStatus: 'confirmed'
});
```

---

## 🔄 **Automatic Booking Sync**

Once configured, your bookings will automatically sync to GoHighLevel:

### **What Gets Synced:**

1. **Contact Creation:**
   - Client name, email, phone
   - Tagged with service type
   - Tagged with booking status

2. **Appointment Creation:**
   - Linked to contact
   - Scheduled date/time
   - Service details in notes
   - Status (pending/confirmed/completed)

3. **Status Updates:**
   - When you change booking status in admin dashboard
   - Automatically updates GHL appointment

### **Manual Sync:**

- Go to **Admin Dashboard → Calendar**
- Click **"Sync All with GHL"** button
- All bookings will sync to GoHighLevel

---

## 📊 **Available Endpoints for Your Location**

With your Private Integration API key, you can access:

### **Contacts:**
- `GET /contacts/` - List all contacts
- `GET /contacts/{contactId}` - Get specific contact
- `POST /contacts/` - Create contact
- `PUT /contacts/{contactId}` - Update contact
- `DELETE /contacts/{contactId}` - Delete contact

### **Calendars:**
- `GET /calendars/` - List calendars
- `GET /calendars/{calendarId}` - Get calendar details
- `GET /calendars/{calendarId}/appointments` - List appointments
- `POST /calendars/events/appointments` - Create appointment
- `PUT /calendars/events/appointments/{appointmentId}` - Update appointment
- `DELETE /calendars/events/appointments/{appointmentId}` - Delete appointment

### **Opportunities (Pipelines):**
- `GET /opportunities/` - List opportunities
- `POST /opportunities/` - Create opportunity
- `PUT /opportunities/{opportunityId}` - Update opportunity

### **Conversations (Messaging):**
- `GET /conversations/` - List conversations
- `POST /conversations/{conversationId}/messages` - Send message

### **Workflows:**
- `GET /workflows/` - List workflows

---

## ✅ **Verification Checklist**

- [ ] API Key saved in Admin Dashboard or `.env.local`
- [ ] Location ID saved in Admin Dashboard or `.env.local`
- [ ] Test Connection shows success
- [ ] All required scopes enabled in GoHighLevel
- [ ] Firestore rules updated (if using Firestore storage)

---

## 🚀 **Next Steps**

1. **Save your credentials** in the Admin Dashboard
2. **Test the connection** - should show success
3. **Create a test booking** - verify it syncs to GHL
4. **Check GoHighLevel** - confirm contact and appointment appear
5. **Set up workflows** - configure automated messages

---

## 🆘 **Troubleshooting**

### **If Connection Fails:**

1. **Verify API Key:**
   - Go to GHL → Settings → Integrations → Private Integrations
   - Make sure you copied the entire key
   - No spaces before/after

2. **Check Scopes:**
   - Ensure `contacts.readonly` and `contacts.write` are enabled
   - Enable all other scopes you need
   - **Regenerate API key** after enabling scopes

3. **Verify Location ID:**
   - Should be exactly: `kfGFMn1aPE1AhW18tpG8`
   - No spaces, no extra characters

### **If Bookings Don't Sync:**

1. Check Admin Dashboard → Calendar
2. Click "Sync All with GHL"
3. Check browser console for errors
4. Verify API key has `calendars.write` scope

---

## 📚 **Documentation References**

- **GHL API Docs:** https://highlevel.stoplight.io/
- **Project Setup Guide:** `GHL-INTEGRATION-SETUP.md`
- **Troubleshooting Guide:** `GHL_API_KEY_TROUBLESHOOTING.md`
- **Orchestrator Service:** `src/services/ghl-orchestrator.ts`

---

**Last Updated:** November 17, 2025  
**Status:** Ready to Use  
**API Key Type:** Private Integration  
**Location:** A Pretty Girl Matter Studio
