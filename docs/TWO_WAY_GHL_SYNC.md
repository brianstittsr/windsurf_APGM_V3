# Two-Way GHL Calendar Sync System

Complete synchronization between your website and GoHighLevel calendars.

## 🔄 **Overview**

Your website now has **complete two-way synchronization** with GoHighLevel:

1. **Website → GHL**: Bookings created on your website automatically sync to GHL
2. **GHL → Website**: Appointments created in GHL can be synced to your website

## 📋 **Features**

### **1. Manual Sync Buttons (Admin Dashboard)**

In the Calendar tab, you now have two sync buttons:

- **"Sync FROM GHL"** (Green, Download icon)
  - Imports appointments from ALL GHL calendars to your website
  - Checks: Service Calendar, Victoria's Personal Calendar, Free Virtual Consultation
  - Date range: Past 7 days to future 90 days
  - Updates existing bookings if they already exist
  - Creates new bookings for new appointments

- **"Sync TO GHL"** (Blue, Upload icon)
  - Pushes all website bookings to GHL
  - Creates/updates contacts in GHL
  - Creates/updates appointments in GHL calendars
  - Links bookings with GHL IDs

### **2. Webhook Integration (Real-Time)**

**Setup in GHL:**
1. Go to: Settings → Integrations → Webhooks
2. Click: "Create Webhook"
3. URL: `https://www.aprettygirlmatter.com/api/webhooks/ghl-appointment`
4. Select events:
   - ✅ `appointment.created`
   - ✅ `appointment.updated`
   - ✅ `appointment.deleted`
5. Click: "Save"

**What it does:**
- Automatically syncs appointments from GHL to website in real-time
- No manual sync needed
- Instant updates when appointments change in GHL

### **3. Scheduled Sync (Optional)**

You can set up automatic syncing using Vercel Cron Jobs:

**Create `vercel.json` in project root:**
```json
{
  "crons": [{
    "path": "/api/sync/ghl-to-website",
    "schedule": "0 * * * *"
  }]
}
```

This runs the sync every hour automatically.

## 🎯 **Use Cases**

### **Use Case 1: Book on Website**
1. Customer books appointment on www.aprettygirlmatter.com
2. Booking is saved to website database
3. Click "Sync TO GHL" or it syncs automatically
4. Appointment appears in GHL calendar
5. Contact is created/updated in GHL

### **Use Case 2: Book in GHL**
1. You create appointment in GHL calendar
2. **Option A:** Webhook automatically syncs to website (if configured)
3. **Option B:** Click "Sync FROM GHL" button in admin dashboard
4. Appointment appears in website calendar

### **Use Case 3: Update in GHL**
1. You update appointment status in GHL (e.g., confirmed → completed)
2. Webhook automatically updates website booking
3. Status changes reflect in website calendar

### **Use Case 4: Cancel in GHL**
1. You cancel appointment in GHL
2. Webhook automatically marks booking as cancelled on website
3. Booking status updates to "cancelled"

## 📊 **Data Mapping**

### **GHL → Website**

| GHL Field | Website Field | Notes |
|-----------|---------------|-------|
| `title` | `serviceName` | Extracts service name before "-" |
| `contactId` → `contact.name` | `clientName` | Fetches from GHL Contacts API |
| `contactId` → `contact.email` | `clientEmail` | Fetches from GHL Contacts API |
| `contactId` → `contact.phone` | `clientPhone` | Fetches from GHL Contacts API |
| `startTime` | `date` + `time` | Converts to local timezone |
| `appointmentStatus` | `status` | Maps: new→pending, confirmed→confirmed, showed→completed, cancelled→cancelled |
| `notes` | `notes` | Full notes text |
| `notes` (Price: $X) | `price` | Extracts price from notes |
| `notes` (Deposit: paid) | `depositPaid` | Checks if deposit mentioned |
| `id` | `ghlAppointmentId` | Stores GHL appointment ID |
| `contactId` | `ghlContactId` | Stores GHL contact ID |

### **Website → GHL**

| Website Field | GHL Field | Notes |
|---------------|-----------|-------|
| `serviceName` + `clientName` | `title` | Format: "Service - Client Name" |
| `clientName` | `contact.name` | Creates/updates contact |
| `clientEmail` | `contact.email` | Creates/updates contact |
| `clientPhone` | `contact.phone` | Creates/updates contact |
| `date` + `time` | `startTime` | Converts to ISO format |
| `status` | `appointmentStatus` | Maps: pending→new, confirmed→confirmed, completed→showed, cancelled→cancelled |
| `serviceName` + `price` + `depositPaid` | `notes` | Formatted notes |
| `artistId` | `assignedUserId` | Assigns to artist in GHL |

## 🔧 **API Endpoints**

### **1. POST /api/sync/ghl-to-website**
Syncs appointments from GHL to website.

**Request:**
```bash
POST https://www.aprettygirlmatter.com/api/sync/ghl-to-website
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "synced": 5,
  "failed": 0,
  "calendars": 3
}
```

### **2. POST /api/calendar/sync-all-ghl**
Syncs bookings from website to GHL.

**Request:**
```bash
POST https://www.aprettygirlmatter.com/api/calendar/sync-all-ghl
Content-Type: application/json
```

**Response:**
```json
{
  "total": 5,
  "synced": 5,
  "failed": 0
}
```

### **3. POST /api/webhooks/ghl-appointment**
Receives webhooks from GHL for real-time sync.

**Request (from GHL):**
```json
{
  "type": "appointment.created",
  "id": "appointment_id",
  "contactId": "contact_id",
  "title": "Microblading - Jane Doe",
  "startTime": "2025-11-24T14:00:00-06:00",
  "endTime": "2025-11-24T15:30:00-06:00",
  "appointmentStatus": "confirmed",
  "notes": "Price: $450, Deposit: Paid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

## 🚀 **Setup Instructions**

### **Step 1: Verify GHL Credentials**
1. Go to: www.aprettygirlmatter.com/dashboard
2. Click: GoHighLevel tab
3. Verify API Key and Location ID are saved
4. Click: "Test Connection" (should show "Found 1 location(s)")

### **Step 2: Test Manual Sync**
1. Go to: Calendar tab
2. Click: "Sync FROM GHL" button
3. Should see: "Successfully synced X appointments from GHL!"
4. Verify appointments appear in calendar

### **Step 3: Set Up Webhooks (Recommended)**
1. Log in to GoHighLevel
2. Go to: Settings → Integrations → Webhooks
3. Create webhook for appointment events
4. URL: `https://www.aprettygirlmatter.com/api/webhooks/ghl-appointment`
5. Test by creating an appointment in GHL
6. Check website calendar - should appear automatically

### **Step 4: Set Up Cron Job (Optional)**
1. Add `vercel.json` to project root (see above)
2. Deploy to Vercel
3. Sync runs automatically every hour

## 🔍 **Troubleshooting**

### **Issue: "No appointments found"**
**Cause**: Date range doesn't include appointments  
**Fix**: Appointments must be within past 7 days to future 90 days

### **Issue: "Failed to sync from GHL"**
**Cause**: GHL credentials not configured  
**Fix**: 
1. Check GoHighLevel tab in dashboard
2. Verify API Key and Location ID
3. Click "Test Connection"

### **Issue: Duplicate bookings**
**Cause**: Syncing multiple times  
**Fix**: System automatically prevents duplicates by checking `ghlAppointmentId`

### **Issue: Webhook not working**
**Cause**: Webhook URL incorrect or not configured  
**Fix**:
1. Verify webhook URL in GHL: `https://www.aprettygirlmatter.com/api/webhooks/ghl-appointment`
2. Check webhook is active
3. Test by creating appointment in GHL

### **Issue: Status not syncing correctly**
**Cause**: Status mapping mismatch  
**Fix**: Check status mapping in documentation above

## 📈 **Best Practices**

1. **Use Webhooks**: Set up webhooks for real-time sync instead of manual syncing
2. **Regular Manual Sync**: Click "Sync FROM GHL" once a day to catch any missed webhooks
3. **Check Sync Status**: After syncing, verify appointments appear correctly
4. **Update Notes Format**: When creating appointments in GHL, use format: "Price: $X, Deposit: Paid"
5. **Consistent Naming**: Use consistent service names in both systems

## 🎉 **Benefits**

- ✅ **Unified Calendar**: Single source of truth for all appointments
- ✅ **Real-Time Updates**: Webhooks keep everything in sync instantly
- ✅ **Flexibility**: Book appointments in either system
- ✅ **No Duplicates**: Automatic duplicate prevention
- ✅ **Complete Data**: Contact info, notes, status all synced
- ✅ **Easy Management**: Simple buttons for manual sync when needed

## 📝 **Files Created**

- `src/app/api/sync/ghl-to-website/route.ts` - Manual sync endpoint
- `src/app/api/webhooks/ghl-appointment/route.ts` - Webhook handler
- `src/components/admin/BookingCalendar.tsx` - Updated with sync buttons
- `docs/TWO_WAY_GHL_SYNC.md` - This documentation

Your calendar system is now fully integrated with GoHighLevel! 🚀
