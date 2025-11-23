# 🔧 Troubleshooting GHL Integration Issues

## 🚨 Current Issues

### Issue 1: Test Connection Shows "0 Locations Found"
**Expected:** Should show "1 location found"  
**Actual:** Shows "0 locations found"

### Issue 2: GHL Entries Not Showing on Website Calendar
**Expected:** GHL appointments should appear on the booking calendar  
**Actual:** Calendar is empty or only shows website bookings

---

## ✅ Step-by-Step Diagnostic

### **Step 1: Verify GHL API Key and Location ID**

1. Go to: www.aprettygirlmatter.com/dashboard
2. Click: **GoHighLevel** tab
3. Check:
   - ✅ API Key is entered (should be long string starting with "eyJ...")
   - ✅ Location ID is entered (should be like "kfGFMn1aPE1AhW18tpG8")

**If missing:**
- Get API Key from: GHL Settings → Integrations → Private Integrations
- Get Location ID from: GHL Settings → Business Profile

---

### **Step 2: Test API Connection**

1. In GoHighLevel tab, click: **"Test Connection"** button
2. Wait for response

**Expected Results:**
```
✅ Connection successful! Found 1 location(s).
```

**If you see "0 locations found":**

This means the API key doesn't have access to locations. Try these fixes:

#### **Fix A: Check API Key Scopes**
1. Go to GHL: Settings → Integrations → Private Integrations
2. Find your integration
3. Verify these scopes are enabled:
   - ✅ `locations.readonly` (REQUIRED)
   - ✅ `calendars.readonly`
   - ✅ `calendars.write`
   - ✅ `contacts.readonly`
   - ✅ `contacts.write`

4. **After enabling scopes, you MUST regenerate the API key**
5. Copy the new API key
6. Paste into website GoHighLevel tab
7. Click "Save API Key"
8. Click "Test Connection" again

#### **Fix B: Use Correct API Key Type**
- ✅ Use: **Private Integration** API key
- ❌ Don't use: Agency API key or OAuth token

#### **Fix C: Verify Location ID**
1. In GHL, go to: Settings → Business Profile
2. Look for "Location ID" or check the URL
3. URL format: `https://app.gohighlevel.com/location/YOUR_LOCATION_ID/...`
4. Copy the location ID
5. Paste into website

---

### **Step 3: Check if GHL Has Appointments**

Before syncing, verify GHL actually has appointments:

1. Log into GHL
2. Go to: Calendars
3. Check if you have:
   - ✅ At least one calendar created
   - ✅ At least one appointment scheduled
   - ✅ Appointments are in the future or recent past (within 7 days)

**If no appointments exist in GHL:**
- The sync will work but show "0 appointments synced"
- This is normal - create a test appointment in GHL first

---

### **Step 4: Manual Sync from GHL**

Once Test Connection shows "1 location found":

1. Go to: www.aprettygirlmatter.com/dashboard
2. Click: **Booking Calendar** tab
3. Click: **"Sync FROM GHL"** button (green button with download icon)
4. Wait for sync to complete

**Expected Result:**
```
Successfully synced X appointments from GHL!

Calendars checked: 2
Failed: 0
```

**If sync fails:**
- Check browser console (F12) for errors
- Check that API key has `calendars.readonly` scope
- Verify appointments exist in GHL within date range (past 7 days to future 90 days)

---

### **Step 5: Verify Appointments Appear on Calendar**

After successful sync:

1. Stay on Booking Calendar tab
2. Navigate to the month/week where appointments should be
3. Look for appointment cards

**If appointments still don't appear:**
- Check the date range - calendar only shows current view
- Try clicking "Today" button
- Check if appointments are in the correct date range

---

## 🔍 Advanced Diagnostics

### **Check Firestore Database**

Synced appointments should be in the `bookings` collection:

1. Go to: Firebase Console
2. Navigate to: Firestore Database
3. Open: `bookings` collection
4. Look for documents with:
   - `ghlAppointmentId` field (indicates synced from GHL)
   - `ghlContactId` field

**If no documents have these fields:**
- Sync hasn't run successfully yet
- Run manual sync again

---

### **Check Browser Console for Errors**

1. Open website: www.aprettygirlmatter.com/dashboard
2. Press F12 to open Developer Tools
3. Click: **Console** tab
4. Click: "Test Connection" or "Sync FROM GHL"
5. Look for red error messages

**Common Errors:**

**Error: "401 Unauthorized"**
- API key is invalid or expired
- Regenerate API key in GHL

**Error: "403 Forbidden"**
- API key missing required scopes
- Enable scopes and regenerate key

**Error: "Failed to fetch calendars"**
- Location ID is incorrect
- Verify location ID in GHL

---

## 🎯 Quick Fix Checklist

Run through this checklist in order:

- [ ] **API Key entered** in GoHighLevel tab
- [ ] **Location ID entered** in GoHighLevel tab
- [ ] **Click "Save API Key"** button
- [ ] **Test Connection shows "1 location found"**
- [ ] **At least one calendar exists in GHL**
- [ ] **At least one appointment exists in GHL**
- [ ] **Click "Sync FROM GHL"** button
- [ ] **Sync shows "X appointments synced"** (X > 0)
- [ ] **Navigate to correct date** on calendar
- [ ] **Appointments visible** on calendar

---

## 🔄 Fresh Start (Nuclear Option)

If nothing works, start fresh:

### **1. Clear Everything**
1. Go to GoHighLevel tab
2. Delete API Key and Location ID
3. Click "Save API Key"

### **2. Regenerate in GHL**
1. Go to GHL: Settings → Integrations → Private Integrations
2. Create NEW Private Integration
3. Enable ALL scopes:
   - businesses.readonly
   - calendars.readonly, calendars.write
   - contacts.readonly, contacts.write
   - conversations.readonly, conversations.write
   - locations.readonly
   - opportunities.readonly, opportunities.write
4. Click "Generate API Key"
5. Copy the key immediately

### **3. Re-enter on Website**
1. Paste API Key
2. Enter Location ID
3. Click "Save API Key"
4. Click "Test Connection"
5. Should show "1 location found"

### **4. Sync**
1. Go to Booking Calendar
2. Click "Sync FROM GHL"
3. Verify appointments appear

---

## 📞 Still Not Working?

If you've tried everything above and it still doesn't work:

### **Collect This Information:**

1. **Test Connection Result:**
   - Copy the exact message shown

2. **Browser Console Errors:**
   - Press F12
   - Click Console tab
   - Copy any red error messages

3. **GHL Setup:**
   - How many calendars do you have?
   - How many appointments exist?
   - What date range are they in?

4. **API Key Scopes:**
   - List all enabled scopes in your Private Integration

5. **Sync Result:**
   - What message appears after clicking "Sync FROM GHL"?

---

## 🎯 Most Common Solutions

Based on the issues you're experiencing:

### **For "0 Locations Found":**

**Most likely cause:** API key missing `locations.readonly` scope

**Fix:**
1. GHL → Settings → Integrations → Private Integrations
2. Edit your integration
3. Enable `locations.readonly` scope
4. **Regenerate API key** (this is critical!)
5. Copy new key to website
6. Save and test again

### **For "GHL Entries Not Showing":**

**Most likely causes:**
1. Haven't run "Sync FROM GHL" yet
2. Appointments are outside the date range (past 7 days to future 90 days)
3. Calendar is showing wrong month/week

**Fix:**
1. Click "Sync FROM GHL" button
2. Wait for success message
3. Click "Today" button on calendar
4. Check if appointments appear

---

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ Test Connection shows "1 location found"
2. ✅ Sync FROM GHL shows "X appointments synced" (X > 0)
3. ✅ Appointments appear on Booking Calendar
4. ✅ Appointments have GHL icon/indicator
5. ✅ Toggle switch works (if using GHL availability mode)

---

## 📚 Related Documentation

- **Full GHL Integration:** `docs/TWO_WAY_GHL_SYNC.md`
- **Availability Toggle:** `docs/GHL_AVAILABILITY_TOGGLE.md`
- **Quick Start:** `QUICK_START_TWO_WAY_SYNC.md`
