# Calendar Integration & Features Guide

## 📍 Where to Find Everything

### **Calendar Integrations Page**
**Location:** Admin Dashboard → Integrations → Calendar Integrations

**What's Here:**
1. **Calendar Provider Settings** (Top Section)
   - Toggle between GoHighLevel, Google Calendar, Both, or None
   - Enable/disable bidirectional sync
   - View integration status
   
2. **Google Calendar Setup Wizard** (Below Provider Settings)
   - 4-step wizard to configure Google OAuth
   - No .env.local editing required
   - Test connection button

### **Artist Availability Page**
**Location:** Admin Dashboard → Services & Artists → Availability

**What's Here:**
1. **Artist Selection Dropdown**
2. **Settings Card:**
   - Break time configuration
   - **"Use AI Assistant" button** ← AI-powered availability management
3. **Weekly Schedule Card:**
   - Day toggles (Mon-Sun)
   - Time slots per day
   - Service-specific availability
4. **Date-Specific Hours Card:**
   - Override specific dates
   - Holiday blocking
   - Custom hours

---

## 🤖 AI Availability Chat Feature

### **How to Access:**
1. Go to: Admin Dashboard → Services & Artists → Availability
2. Select an artist from dropdown
3. Click **"Use AI Assistant"** button in Settings card
4. Chat interface appears below

### **What You Can Do:**
Use natural language to manage availability:

**Examples:**
- "Block next Monday afternoon"
- "Make December 25th unavailable"
- "I'm off for the holidays from Dec 20-27"
- "Remove availability for January 15th"
- "Add Tuesday morning slots"

### **How It Works:**
- AI processes your natural language request
- Automatically updates availability in Firestore
- Changes reflect immediately in the schedule
- No manual date/time selection needed

---

## 🔄 Calendar Provider Toggle System

### **Provider Options:**

#### **1. GoHighLevel (CRM + Calendar)**
- Full CRM integration
- Automated workflows
- Contact management
- Appointment scheduling
- Email/SMS notifications

**Best For:** Businesses using GHL for complete CRM

#### **2. Google Calendar (Personal Calendar)**
- Syncs to artist's personal Google Calendar
- Each artist connects their own calendar
- Events include client details
- 1-hour default appointments

**Best For:** Artists who prefer Google Calendar

#### **3. Both Systems (Dual Sync)**
- Syncs to both GHL and Google simultaneously
- Best of both worlds
- Requires both integrations configured

**Best For:** Maximum visibility and backup

#### **4. Website Only (No External Sync)**
- Bookings managed only on website
- No external calendar dependencies
- Simplest setup

**Best For:** Testing or minimal setup

### **How to Switch Providers:**

1. Navigate to: **Admin Dashboard → Integrations → Calendar Integrations**
2. Click one of the 4 provider cards
3. (Optional) Enable "Bidirectional Sync" to import external events
4. Click **"Save Settings"**
5. Done! All future bookings will sync accordingly

---

## 📅 Booking Flow with Calendar Providers

### **When a Booking is Created:**

The system automatically:
1. Checks which calendar provider(s) are enabled
2. Creates booking in Firestore `bookings` collection
3. Syncs to enabled provider(s):
   - **If GHL enabled:** Creates contact + appointment in GHL
   - **If Google enabled:** Creates event in artist's Google Calendar
   - **If Both enabled:** Syncs to both systems
   - **If None:** Stores only on website

### **Unified Sync API:**
**Endpoint:** `/api/bookings/sync`

**Features:**
- Automatically routes to correct provider(s)
- Handles errors gracefully
- Returns detailed sync results
- Skips disabled providers

---

## 🔧 Setup Instructions

### **Google Calendar Setup:**

1. **Navigate to Calendar Integrations:**
   - Admin Dashboard → Integrations → Calendar Integrations

2. **Follow 4-Step Wizard:**
   - **Step 1:** Create Google Cloud Project
   - **Step 2:** Configure OAuth Consent Screen
   - **Step 3:** Create OAuth Credentials (copy/paste redirect URI)
   - **Step 4:** Test connection

3. **No .env.local Required:**
   - All credentials stored in Firestore
   - Configured via UI wizard
   - Admin-only access

4. **Artists Connect Their Calendars:**
   - Each artist connects individually
   - OAuth flow stores tokens per artist
   - Artists can disconnect anytime

### **GoHighLevel Setup:**

1. Navigate to: Admin Dashboard → Integrations → GoHighLevel
2. Enter API key and Location ID
3. Test connection
4. Enable in Calendar Provider Settings

---

## 📊 Integration Status

### **Check Integration Status:**
Admin Dashboard → Integrations → Calendar Integrations → Integration Status Card

Shows:
- ✅ GoHighLevel: Enabled/Disabled
- ✅ Google Calendar: Enabled/Disabled

---

## 🔐 Security & Permissions

### **Firestore Collections:**
- `settings/calendarProvider` - Provider settings (admin-only)
- `integrationSettings/googleCalendar` - Google OAuth credentials (admin-only)
- `googleCalendarTokens/{artistId}` - Artist OAuth tokens (artist/admin access)

### **Firestore Rules:**
All rules deployed and active. See `firestore.rules` for details.

---

## 🧪 Testing

### **Test Calendar Provider Toggle:**
1. Go to Calendar Integrations
2. Switch between providers
3. Create a test booking
4. Verify sync to correct calendar(s)
5. Check booking appears in:
   - Website (Admin → Calendar or Bookings)
   - GHL (if enabled)
   - Google Calendar (if enabled)

### **Test AI Availability Chat:**
1. Go to Artist Availability
2. Click "Use AI Assistant"
3. Type: "Block next Monday"
4. Verify Monday becomes unavailable
5. Check Firestore `artist-availability` collection

---

## 📝 Summary

**What's Been Implemented:**
✅ Calendar Provider toggle (GHL/Google/Both/None)
✅ Google Calendar OAuth setup wizard (no .env.local needed)
✅ Unified booking sync API
✅ Google Calendar sync endpoint
✅ AI-powered availability chat (natural language)
✅ Calendar Integrations added to sidebar
✅ Firestore rules deployed

**Where Everything Is:**
- **Calendar Integrations:** Admin Dashboard → Integrations → Calendar Integrations
- **AI Availability Chat:** Admin Dashboard → Services & Artists → Availability → "Use AI Assistant"
- **Booking Calendar:** Admin Dashboard → Clients & Bookings → Calendar
- **Bookings List:** Admin Dashboard → Clients & Bookings → Bookings

**Next Steps:**
1. Configure Google Calendar via wizard (if using Google)
2. Select calendar provider in Calendar Integrations
3. Test with a booking
4. Train artists on AI chat feature
