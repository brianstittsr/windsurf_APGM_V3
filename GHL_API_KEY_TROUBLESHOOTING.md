# GoHighLevel API Key Troubleshooting Guide

## Issue: "System Cannot Read API Key"

You're correctly creating the API key in GoHighLevel Private Integrations, but the system returns "Cannot GET /locations/" error.

---

## 🔍 **Common Causes & Solutions**

### **1. Missing `locations.readonly` Scope** ⚠️ **MOST COMMON**

**Problem:** The API key doesn't have the required scope enabled.

**Solution:**
1. Go to [GoHighLevel](https://app.gohighlevel.com/)
2. Settings → Integrations → **Private Integrations**
3. Click on your integration
4. Scroll down to **Scopes** section
5. **CRITICAL:** Check the box for `locations.readonly`
6. Also enable these scopes:
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
   ✅ locations.readonly          ← MUST HAVE THIS!
   ✅ opportunities.readonly
   ✅ opportunities.write
   ✅ surveys.readonly
   ✅ workflows.readonly
   ```
7. **IMPORTANT:** Click **"Regenerate API Key"** button
8. Copy the **NEW** API key (old one won't work with new scopes)

---

### **2. API Key Not Regenerated After Enabling Scopes**

**Problem:** You enabled scopes but didn't regenerate the key.

**Why This Happens:**
- Existing API keys don't automatically get new permissions
- You MUST regenerate the key after changing scopes

**Solution:**
1. After enabling all scopes
2. Scroll down and click **"Regenerate API Key"**
3. Copy the NEW key (it will be different from the old one)
4. Update your application with the new key

---

### **3. Copying API Key Incorrectly**

**Problem:** Extra spaces, line breaks, or partial key copied.

**Common Mistakes:**
- ❌ Copying only part of the key
- ❌ Including spaces before/after the key
- ❌ Line breaks in the middle of the key
- ❌ Copying from a formatted document that adds characters

**Solution:**
1. In GoHighLevel, click the **"Copy"** button next to the API key (don't manually select)
2. If manually selecting:
   - Triple-click to select the entire key
   - Verify no spaces before or after
   - Paste into a plain text editor first to check
3. The key should be one continuous string (typically 40-60 characters)

---

### **4. Using Wrong Integration Type**

**Problem:** Created an Agency API key instead of Private Integration.

**How to Check:**
- Go to Settings → Integrations
- You should be in **"Private Integrations"** tab
- NOT in "Agency API" or "OAuth" sections

**Solution:**
1. If you're in the wrong section, delete that key
2. Go to **Private Integrations** tab
3. Click **"+ Create"** to make a new Private Integration
4. Name it (e.g., "APGM Website")
5. Enable all required scopes
6. Generate API key

---

### **5. API Key Expired or Revoked**

**Problem:** Key was valid but has expired or been revoked.

**Solution:**
1. Go to Private Integrations
2. Check if your integration is still active
3. If not, create a new one
4. If yes, regenerate the API key

---

## 🧪 **Diagnostic Tool**

I've created a diagnostic endpoint to help troubleshoot:

### **How to Use:**

1. Go to your browser console (F12)
2. Run this command:

```javascript
fetch('/api/crm/diagnose-key', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ apiKey: 'YOUR_API_KEY_HERE' })
})
.then(r => r.json())
.then(d => console.log('Diagnostic Results:', d));
```

3. Replace `YOUR_API_KEY_HERE` with your actual API key
4. Check the console output for detailed diagnostics

### **What It Checks:**
- ✅ Key length and format
- ✅ Presence of spaces or newlines
- ✅ Actual API connection test
- ✅ Detailed error analysis
- ✅ Specific recommendations

---

## 📋 **Step-by-Step Verification Checklist**

### **In GoHighLevel:**
- [ ] Logged into GoHighLevel
- [ ] Navigated to Settings → Integrations → **Private Integrations**
- [ ] Found or created integration
- [ ] Enabled **ALL** required scopes (especially `locations.readonly`)
- [ ] Clicked **"Regenerate API Key"**
- [ ] Copied the NEW API key using the copy button

### **In Your Application:**
- [ ] Went to Admin Dashboard → GoHighLevel tab
- [ ] Pasted API key (no spaces before/after)
- [ ] Entered Location ID
- [ ] Clicked "Save Settings"
- [ ] Clicked "Test Connection"

### **Expected Result:**
```
✅ Connection successful! Found X location(s).
```

### **If Still Failing:**
- [ ] Checked browser console for detailed error
- [ ] Verified key was copied correctly (no spaces/breaks)
- [ ] Confirmed using Private Integration (not Agency API)
- [ ] Tried regenerating key again
- [ ] Cleared browser cache and tried again

---

## 🔧 **Manual API Test**

Test the API key directly using curl or Postman:

### **Using curl:**
```bash
curl -X GET "https://services.leadconnectorhq.com/locations/" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -H "Version: 2021-07-28" \
  -H "Accept: application/json"
```

### **Expected Success Response:**
```json
{
  "locations": [
    {
      "id": "location_id",
      "name": "Your Location Name",
      ...
    }
  ]
}
```

### **Common Error Responses:**

**401 Unauthorized:**
```json
{
  "message": "Unauthorized"
}
```
→ API key is invalid or expired

**403 Forbidden:**
```json
{
  "message": "Insufficient permissions"
}
```
→ Missing `locations.readonly` scope

---

## 💡 **Pro Tips**

1. **Always Regenerate After Scope Changes**
   - Enabling scopes doesn't update existing keys
   - You MUST regenerate to get new permissions

2. **Use the Copy Button**
   - Don't manually select the key
   - Use the copy button in GoHighLevel interface

3. **Test Immediately**
   - After generating a new key, test it right away
   - This confirms it's working before you save it

4. **Keep a Backup**
   - Save the working API key in a secure password manager
   - Don't rely on browser autofill

5. **Check Expiration**
   - Some GHL plans have API key expiration
   - Set a reminder to regenerate periodically

---

## 🆘 **Still Not Working?**

If you've tried everything above and it still doesn't work:

### **Verify GoHighLevel Account:**
1. Check your GHL account status (active subscription?)
2. Verify you have permission to create API keys
3. Try logging out and back into GHL
4. Contact GHL support to verify API access

### **Verify Application:**
1. Check that `.env.local` doesn't have conflicting keys
2. Restart your dev server after updating keys
3. Clear browser cache completely
4. Try in incognito/private browsing mode

### **Contact Support:**
- **GoHighLevel Support:** support@gohighlevel.com
- **Check GHL Status:** https://status.gohighlevel.com/

---

## 📊 **Understanding the Error**

### **"Cannot GET /locations/"**

This specific error means:
- The API endpoint exists and is reachable
- But your API key doesn't have permission to access it
- Almost always caused by missing `locations.readonly` scope

### **Why `/locations/` is the First Test:**
- It's the simplest endpoint
- Requires minimal permissions
- If this works, everything else will work
- If this fails, nothing else will work

---

## ✅ **Success Indicators**

You'll know it's working when you see:

### **In Browser Console:**
```
🔑 Testing GHL API Key: eyJhbGciOiJIUzI1...
📡 Calling GHL API: https://services.leadconnectorhq.com/locations/
📊 GHL API Response Status: 200
✅ Connection successful! Found 1 location(s).
```

### **In Admin Dashboard:**
```
✅ Connection successful! Found 1 location(s).
Location: Your Studio Name
```

---

## 📚 **Additional Resources**

- [GoHighLevel API Documentation](https://highlevel.stoplight.io/)
- [Private Integrations Guide](https://help.gohighlevel.com/)
- Project File: `GHL-INTEGRATION-SETUP.md`
- Project File: `CONSOLE_ERRORS_FIX.md`

---

**Last Updated:** November 17, 2025  
**Status:** Active Troubleshooting Guide
