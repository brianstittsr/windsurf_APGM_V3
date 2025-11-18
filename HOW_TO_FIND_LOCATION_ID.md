# How to Find Your GoHighLevel Location ID

## ❌ Current Error:
```
403 Forbidden
"The token does not have access to this location."
```

This means your API key is valid, but the Location ID `kfGFMn1aPE1AhW18tpG8` is incorrect for your Private Integration.

---

## ✅ **Method 1: Check GoHighLevel URL (Easiest)**

### **Steps:**

1. **Log into GoHighLevel:**
   - Go to: https://app.gohighlevel.com/
   - Log in with your credentials

2. **Navigate to Your Dashboard:**
   - Make sure you're in the correct location/sub-account
   - Click around (Contacts, Calendars, Settings, etc.)

3. **Look at the Browser URL:**
   - The URL will look like:
   ```
   https://app.gohighlevel.com/location/YOUR_LOCATION_ID/dashboard
   ```
   - Or:
   ```
   https://app.gohighlevel.com/v2/location/YOUR_LOCATION_ID/contacts
   ```

4. **Copy the Location ID:**
   - It's the long string after `/location/`
   - Example: If URL is `https://app.gohighlevel.com/location/abc123xyz/dashboard`
   - Your Location ID is: `abc123xyz`

---

## ✅ **Method 2: Check Private Integration Settings**

### **Steps:**

1. **Go to Integrations:**
   - Click **Settings** (gear icon, bottom-left)
   - Navigate to **Integrations** → **Private Integrations**

2. **Find Your Integration:**
   - Look for the integration you created
   - Click on it to view details

3. **Check Location:**
   - The integration should show which location it belongs to
   - Note: Private Integrations are tied to ONE specific location

4. **Verify You're in the Right Location:**
   - If you have multiple locations, make sure you created the Private Integration in the correct one
   - You might need to switch locations (top-left dropdown) and check each one

---

## ✅ **Method 3: Check Business Profile**

### **Steps:**

1. **Go to Settings:**
   - Click **Settings** (gear icon, bottom-left)

2. **Click "Business Profile":**
   - Look for business information

3. **Find Location ID:**
   - It might be displayed as:
     - "Location ID"
     - "Sub-Account ID"
     - "Company ID"

---

## ✅ **Method 4: Create New Private Integration in Correct Location**

If you're not sure which location your current API key belongs to:

### **Steps:**

1. **Switch to Your Desired Location:**
   - Use the location switcher (usually top-left)
   - Select "A Pretty Girl Matter" or your studio name

2. **Create New Private Integration:**
   - Go to **Settings** → **Integrations** → **Private Integrations**
   - Click **"+ Create"** or **"New Integration"**
   - Give it a name: "APGM Website Integration"

3. **Enable ALL Scopes:**
   ```
   ✅ businesses.readonly
   ✅ calendars.readonly
   ✅ calendars.write
   ✅ campaigns.readonly
   ✅ contacts.readonly
   ✅ contacts.write
   ✅ conversations.readonly
   ✅ conversations.write
   ✅ forms.readonly
   ✅ invoices.readonly
   ✅ invoices.write
   ✅ opportunities.readonly
   ✅ opportunities.write
   ✅ surveys.readonly
   ✅ workflows.readonly
   ```

4. **Generate API Key:**
   - Click **"Generate API Key"** or **"Create"**
   - Copy the NEW API key

5. **Note the Location:**
   - The Location ID should be visible in the URL or settings
   - This is the Location ID that matches your new API key

---

## 🔍 **What to Look For:**

### **Location ID Format:**
- Usually 20-25 characters long
- Mix of letters and numbers
- Examples:
  - `kfGFMn1aPE1AhW18tpG8` (the one you provided)
  - `ve9EPM428h8vShlRW1KT`
  - `abc123xyz456def789`

### **Where It Appears:**
- Browser URL: `/location/{LOCATION_ID}/`
- API responses: `"locationId": "..."`
- Settings pages
- Integration details

---

## 📋 **Once You Find the Correct Location ID:**

### **Test It:**

Run the diagnostic script with your API key:
```powershell
.\test-ghl-api-key.ps1 "pit-7448430c-05cd-4aa8-acfd-afc6cf3e84d2"
```

If you still get 403, the Location ID is still wrong.

### **Update Your Application:**

1. Go to: http://localhost:3000/dashboard
2. Click **"GoHighLevel"** tab
3. Enter:
   - **API Key:** `pit-7448430c-05cd-4aa8-acfd-afc6cf3e84d2`
   - **Location ID:** `YOUR_CORRECT_LOCATION_ID`
4. Click **"Save Settings"**
5. Click **"Test Connection"**

Should show: ✅ **"Connection successful!"**

---

## 🆘 **Still Having Issues?**

### **Possible Causes:**

1. **Wrong Location:**
   - Your API key was created in a different location
   - Solution: Create new API key in the correct location

2. **Multiple Locations:**
   - You have multiple sub-accounts
   - Solution: Make sure you're in the right one when creating the integration

3. **Missing Scopes:**
   - Even with correct Location ID, missing scopes cause 403
   - Solution: Enable all scopes and regenerate API key

4. **API Key Expired:**
   - Old API keys can expire
   - Solution: Generate a new one

---

## 💡 **Pro Tip:**

The easiest way is to:
1. Log into GoHighLevel
2. Go to any page (Contacts, Calendar, etc.)
3. Look at the URL
4. Copy the Location ID from the URL

Example URL:
```
https://app.gohighlevel.com/location/ve9EPM428h8vShlRW1KT/contacts/smart_list/All
```

Your Location ID is: `ve9EPM428h8vShlRW1KT`

---

## 📞 **Need Help?**

If you can't find your Location ID:
1. Take a screenshot of your GoHighLevel dashboard URL
2. Take a screenshot of your Private Integration settings
3. Check if you have access to the correct location/sub-account

---

**Last Updated:** November 17, 2025  
**Status:** Troubleshooting Location ID Issue
