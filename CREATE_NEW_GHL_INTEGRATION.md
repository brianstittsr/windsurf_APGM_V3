# Create New GoHighLevel Private Integration - Step by Step

## 🎯 **Goal:** Create a working Private Integration with all scopes enabled

---

## 📋 **Complete Step-by-Step Process:**

### **Step 1: Log into GoHighLevel**
1. Go to: https://app.gohighlevel.com/
2. Log in with your credentials
3. **IMPORTANT:** Make sure you're in the correct location
   - Look at top-left for location name
   - Should be "A Pretty Girl Matter" or your studio name

---

### **Step 2: Navigate to Private Integrations**
1. Click **Settings** (gear icon, bottom-left corner)
2. In the left sidebar, click **"Integrations"**
3. At the top, you should see tabs - click **"Private Integrations"**

---

### **Step 3: Create New Integration**
1. Look for a button that says:
   - **"+ Create"** or
   - **"+ New Integration"** or
   - **"Add Integration"**
2. Click that button

---

### **Step 4: Fill in Integration Details**

#### **Name:**
```
APGM Website Integration
```

#### **Description (optional):**
```
Integration for A Pretty Girl Matter website - booking system, contact management, and automated workflows
```

---

### **Step 5: Enable ALL Scopes** ⚠️ **CRITICAL!**

You should see a section called **"Scopes"** with checkboxes.

**Check EVERY SINGLE ONE of these:**

#### **Read Permissions:**
- ☑ `businesses.readonly`
- ☑ `calendars.readonly`
- ☑ `campaigns.readonly`
- ☑ `contacts.readonly` ← **MUST HAVE**
- ☑ `conversations.readonly`
- ☑ `forms.readonly`
- ☑ `invoices.readonly`
- ☑ `locations.readonly` (if available)
- ☑ `opportunities.readonly`
- ☑ `surveys.readonly`
- ☑ `workflows.readonly`

#### **Write Permissions:**
- ☑ `calendars.write`
- ☑ `contacts.write` ← **MUST HAVE**
- ☑ `conversations.write`
- ☑ `invoices.write`
- ☑ `locations.write` (if available)
- ☑ `opportunities.write`

**IMPORTANT:** If you see ANY other scopes not listed here, check them too! We want ALL scopes enabled.

---

### **Step 6: Save and Generate API Key**
1. Click **"Save"** or **"Create"** button
2. The system should generate an API key automatically
3. **COPY THE API KEY IMMEDIATELY**
4. It will look like: `pit-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

---

### **Step 7: Save Your Credentials**

Write down:
- **API Key:** `pit-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **Location ID:** `kfGFMn1aPE1AhW18tpG8`

---

### **Step 8: Test Immediately**

Run this command with your NEW API key:
```powershell
.\test-ghl-api-key.ps1 "YOUR_NEW_API_KEY_HERE"
```

Or test via web:
1. Go to: http://localhost:3000/test-ghl-key
2. Paste your API key
3. Click "Run Diagnostic Test"

**Expected Result:**
```
✅ SUCCESS!
API Key is valid and working!
```

---

## 🔍 **What If You Don't See Scopes Section?**

If you don't see checkboxes for scopes when creating the integration:

### **Option A: Check Integration Type**
- Make sure you're creating a **"Private Integration"** not an "OAuth App"
- Private Integrations should have scope checkboxes

### **Option B: Check After Creation**
- Create the integration first
- Then click on it to edit
- Scopes might appear in the edit view

### **Option C: Different UI**
- GoHighLevel might have updated their UI
- Look for:
  - "Permissions"
  - "Access"
  - "Scopes"
  - "API Permissions"
- Any section that lets you choose what the integration can access

---

## 🆘 **Troubleshooting:**

### **Problem: Still Getting 403 After Creating New Integration**

**Possible Causes:**

1. **Scopes weren't actually enabled**
   - Go back and verify ALL checkboxes are checked
   - Click Save again
   - Regenerate API key

2. **Wrong location**
   - You created the integration in a different location
   - Switch locations (top-left dropdown)
   - Create integration in the correct location

3. **GoHighLevel account limitations**
   - Your account might not have permission to create Private Integrations
   - Contact GoHighLevel support

---

## 📸 **What You Should See:**

### **In Private Integrations List:**
```
Name                          | Status  | Created
------------------------------|---------|----------
APGM Website Integration      | Active  | Nov 17, 2025
```

### **When Editing Integration:**
```
Name: APGM Website Integration

Scopes:
☑ businesses.readonly
☑ calendars.readonly
☑ calendars.write
☑ contacts.readonly
☑ contacts.write
... (all checked)

API Key: pit-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
[Regenerate API Key]
```

---

## ✅ **Success Checklist:**

Before testing, verify:
- [ ] Created new Private Integration
- [ ] Named it "APGM Website Integration"
- [ ] Enabled ALL scopes (especially contacts.readonly and contacts.write)
- [ ] Clicked Save/Create
- [ ] Copied the API key
- [ ] API key starts with "pit-"
- [ ] API key is 40 characters long

---

## 🎯 **Next Steps After Success:**

Once the test shows SUCCESS:

1. **Save in Application:**
   - Go to: http://localhost:3000/dashboard
   - Click "GoHighLevel" tab
   - Enter API Key and Location ID
   - Click "Save Settings"

2. **Test Connection:**
   - Click "Test Connection" button
   - Should show: ✅ "Connection successful!"

3. **Start Using:**
   - Create test booking
   - Verify it syncs to GoHighLevel
   - Check automated workflows

---

## 💡 **Pro Tips:**

1. **Keep the API key safe** - treat it like a password
2. **Don't share it** - it has full access to your GoHighLevel data
3. **Create a backup** - save it in a password manager
4. **Test immediately** - don't wait to verify it works

---

## 📞 **Still Need Help?**

If you're still getting 403 errors after creating a brand new integration with all scopes:

1. **Take a screenshot** of the scopes section showing all checkboxes
2. **Take a screenshot** of the API key (you can blur most of it)
3. **Copy the exact error message** from the test
4. Reply with these details

We'll figure out what's going on!

---

**Last Updated:** November 17, 2025  
**Status:** Ready to create fresh integration with all scopes
