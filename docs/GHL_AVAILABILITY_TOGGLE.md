# GHL Calendar Availability Toggle System

## 🎯 **Overview**

Your booking system now supports **two availability modes** with a simple toggle switch:

1. **Website Mode** (Default): Uses artist availability configured in your admin dashboard
2. **GHL Mode**: Uses GoHighLevel calendar booking rules and free slots

Both systems are preserved - you can switch between them anytime without losing any configuration!

---

## 🔄 **How It Works**

### **Website Availability Mode**
- Uses `artistAvailability` collection in Firestore
- Configured via Admin Dashboard → Artist Availability tab
- You manually set:
  - Days of week artist is available
  - Time ranges for each day
  - Break times between appointments
  - Service-specific availability

### **GHL Availability Mode**
- Fetches directly from GoHighLevel calendars
- Uses GHL's calendar booking rules
- Respects:
  - GHL calendar availability settings
  - Team member schedules
  - Existing GHL appointments
  - Calendar-specific booking rules

---

## ⚙️ **How to Toggle Between Systems**

### **Step 1: Access GoHighLevel Settings**
1. Go to: www.aprettygirlmatter.com/dashboard
2. Click: **GoHighLevel** tab
3. Scroll to: **"Use GHL Calendar Availability"** section

### **Step 2: Toggle the Switch**
- **OFF** (Default): Uses website's artist availability system
- **ON**: Uses GHL calendar booking rules

### **Step 3: Save Settings**
1. Click: **"Save API Key"** button
2. Settings are saved immediately
3. Booking page will use the selected system

---

## 📋 **What Customers See**

### **Website Mode**
```
Available Times for Monday, November 25
Select a 4-hour time slot to continue

[Time slots from Artist Availability Manager]
```

### **GHL Mode**
```
ℹ️ Using GHL Calendar: Showing available slots from GoHighLevel calendar booking rules

Available Times for Monday, November 25
Select a 4-hour time slot to continue

[Time slots from GHL calendars]
```

---

## 🎨 **Toggle Switch UI**

The toggle appears in the GoHighLevel Manager with:

**Visual Design:**
- Large switch (3rem wide)
- Shows "ON" or "OFF" label
- Info card with blue border
- Clear explanation of each mode

**Information Displayed:**
- **Title:** "Use GHL Calendar Availability"
- **Description:** When enabled, booking system will use GHL calendar rules
- **GHL Mode Info:** Uses calendar booking rules, free slots, and team member availability
- **Website Mode Info:** Uses artist availability configured in Artist Availability tab

---

## 🔧 **Technical Implementation**

### **Files Created:**

1. **`src/services/ghlAvailabilityService.ts`**
   - Fetches available slots from GHL calendars
   - Converts GHL slots to website format
   - Handles booking in GHL calendars

2. **`src/app/api/availability/ghl/route.ts`**
   - API endpoint: `GET /api/availability/ghl?date=YYYY-MM-DD`
   - Fetches slots from all GHL calendars
   - Returns unified format

3. **`src/hooks/useAvailabilitySystem.ts`**
   - Unified hook that checks toggle setting
   - Automatically switches between systems
   - Returns slots in consistent format

### **Files Modified:**

1. **`src/components/admin/GoHighLevelManager.tsx`**
   - Added `useGHLAvailability` field to settings
   - Added toggle switch UI
   - Saves setting to Firestore

2. **`src/app/book-now-custom/page.tsx`**
   - Uses `useAvailabilitySystem` hook
   - Shows indicator when using GHL
   - Seamlessly switches between systems

---

## 📊 **Data Flow**

### **Website Mode:**
```
Customer selects date
    ↓
useAvailabilitySystem checks toggle (OFF)
    ↓
Fetches from artistAvailability collection
    ↓
Generates 4-hour time slots
    ↓
Checks bookedSlots collection
    ↓
Returns available slots
```

### **GHL Mode:**
```
Customer selects date
    ↓
useAvailabilitySystem checks toggle (ON)
    ↓
Calls /api/availability/ghl
    ↓
Fetches all GHL calendars
    ↓
Gets free slots from each calendar
    ↓
Combines and formats slots
    ↓
Returns available slots
```

---

## 🎯 **Use Cases**

### **Use Case 1: Start with Website, Switch to GHL**

**Scenario:** You've been using website availability, now want to use GHL calendars.

**Steps:**
1. Configure your GHL calendars with booking rules
2. Go to GoHighLevel tab in admin dashboard
3. Toggle "Use GHL Calendar Availability" to ON
4. Click "Save API Key"
5. ✅ Booking page now shows GHL slots

**Result:** Customers see slots from your GHL calendars. Your website availability settings are preserved.

### **Use Case 2: Test GHL, Switch Back**

**Scenario:** Want to test GHL availability but keep website as backup.

**Steps:**
1. Toggle to GHL mode
2. Test booking flow
3. If issues arise, toggle back to Website mode
4. ✅ Instantly back to website availability

**Result:** No data loss, instant switching.

### **Use Case 3: Use GHL for Some Services**

**Scenario:** Want different availability for different services.

**Current Limitation:** Toggle applies to all bookings.

**Workaround:** 
- Use GHL mode
- Create separate GHL calendars for each service
- Configure booking rules per calendar

---

## 🔍 **Comparison**

| Feature | Website Mode | GHL Mode |
|---------|-------------|----------|
| **Configuration** | Admin Dashboard | GHL Settings |
| **Time Slots** | 4-hour blocks | GHL calendar rules |
| **Flexibility** | Manual setup | GHL automation |
| **Team Members** | Single artist | Multiple team members |
| **External Sync** | No | Yes (GHL appointments) |
| **Booking Rules** | Basic | Advanced (GHL) |
| **Buffer Times** | Manual | GHL settings |
| **Recurring Availability** | Weekly pattern | GHL rules |
| **Holiday Management** | Manual | GHL calendar |

---

## ✅ **Benefits**

### **Website Mode Benefits:**
- ✅ Simple, straightforward setup
- ✅ No external dependencies
- ✅ 4-hour booking blocks
- ✅ Direct control in admin dashboard
- ✅ No API calls needed

### **GHL Mode Benefits:**
- ✅ Leverages GHL's powerful booking rules
- ✅ Syncs with existing GHL appointments
- ✅ Supports multiple team members
- ✅ Advanced availability logic
- ✅ Centralized calendar management
- ✅ Automatic conflict prevention

---

## 🚨 **Important Notes**

### **1. Both Systems Preserved**
- Toggling doesn't delete any data
- Website availability settings remain intact
- GHL calendars remain unchanged
- Switch back anytime

### **2. Real-Time Switching**
- Changes take effect immediately
- No deployment needed
- Customers see new system instantly

### **3. GHL Requirements**
- Must have valid GHL API Key
- Must have Location ID configured
- GHL calendars must have booking rules set up
- API key must have `calendars.readonly` scope

### **4. Booking Creation**
- Website mode: Books in Firestore only (sync to GHL manually)
- GHL mode: Books directly in GHL calendar

---

## 🔧 **Troubleshooting**

### **Issue: Toggle not appearing**
**Cause:** Old cache or not deployed  
**Fix:** 
1. Hard refresh (Ctrl + Shift + R)
2. Check deployment status
3. Verify you're on GoHighLevel tab

### **Issue: GHL mode shows no slots**
**Cause:** GHL calendars not configured or no availability  
**Fix:**
1. Check GHL calendars have booking rules
2. Verify date range has availability
3. Check API key has correct scopes
4. Test connection in GoHighLevel tab

### **Issue: Slots look different in GHL mode**
**Cause:** GHL uses different time blocks  
**Expected:** GHL respects its own booking rules (may not be 4-hour blocks)

### **Issue: Toggle saves but doesn't work**
**Cause:** Browser cache  
**Fix:** 
1. Clear browser cache
2. Hard refresh booking page
3. Check browser console for errors

---

## 📚 **Related Documentation**

- **Two-Way Sync:** `TWO_WAY_GHL_SYNC.md`
- **Quick Start:** `QUICK_START_TWO_WAY_SYNC.md`
- **Artist Availability:** Admin Dashboard → Artist Availability tab

---

## 🎉 **Summary**

You now have **complete flexibility** in how you manage availability:

✅ **Toggle switch** in admin dashboard  
✅ **Both systems preserved** - no data loss  
✅ **Instant switching** - takes effect immediately  
✅ **Clear indicators** - customers know which system is active  
✅ **Seamless integration** - works with existing booking flow  

Choose the system that works best for your workflow, and switch anytime!
