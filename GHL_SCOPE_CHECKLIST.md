# GoHighLevel Scope Checklist - CRITICAL!

## ⚠️ **Your New API Key is Still Getting 403 Error**

**New API Key:** `pit-a9a1aff9-0619-4b36-8122-6c42d8c5dfda`  
**Error:** 403 Forbidden  
**Cause:** Missing required scopes

---

## ✅ **EXACT Steps to Fix This:**

### **Step 1: Go to GoHighLevel**
1. Open: https://app.gohighlevel.com/
2. Log in
3. Click **Settings** (gear icon, bottom-left corner)

### **Step 2: Navigate to Private Integrations**
1. Click **"Integrations"** in the left sidebar
2. Click **"Private Integrations"** tab at the top
3. You should see your integration in the list

### **Step 3: Edit Your Integration**
1. Find the integration you just created (or regenerated)
2. Click on it to open the details
3. Scroll down to the **"Scopes"** section

### **Step 4: Enable EVERY Scope Below**

Copy this list and check each one in GoHighLevel:

#### **READ Scopes:**
- [ ] `businesses.readonly`
- [ ] `calendars.readonly`
- [ ] `campaigns.readonly`
- [ ] `contacts.readonly` ← **CRITICAL FOR TESTING**
- [ ] `conversations.readonly`
- [ ] `forms.readonly`
- [ ] `invoices.readonly`
- [ ] `opportunities.readonly`
- [ ] `surveys.readonly`
- [ ] `workflows.readonly`

#### **WRITE Scopes:**
- [ ] `calendars.write`
- [ ] `contacts.write` ← **CRITICAL FOR CREATING CONTACTS**
- [ ] `conversations.write`
- [ ] `invoices.write`
- [ ] `opportunities.write`

### **Step 5: REGENERATE THE API KEY** ⚠️

**THIS IS THE MOST IMPORTANT STEP!**

1. After checking all the scopes above
2. Scroll down to the API Key section
3. Click **"Regenerate API Key"** button
4. **COPY THE NEW KEY IMMEDIATELY**
5. Save it somewhere safe

**Important:** The key `pit-a9a1aff9-0619-4b36-8122-6c42d8c5dfda` will NOT work even after enabling scopes. You MUST regenerate to get a new key with the new permissions.

---

## 🎯 **What You Should See:**

### **In GoHighLevel - Scopes Section:**

It should look something like this:

```
Scopes
Select the scopes you want to grant access to:

☑ businesses.readonly
☑ calendars.readonly
☑ calendars.write
☑ campaigns.readonly
☑ contacts.readonly
☑ contacts.write
☑ conversations.readonly
☑ conversations.write
☑ forms.readonly
☑ invoices.readonly
☑ invoices.write
☑ opportunities.readonly
☑ opportunities.write
☑ surveys.readonly
☑ workflows.readonly
```

**ALL boxes should be checked!**

### **After Regenerating:**

You'll see a new API key like:
```
pit-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

This will be DIFFERENT from your current key.

---

## 🧪 **Test the New Key:**

Once you have the regenerated key:

### **Option 1: PowerShell Script**
```powershell
.\test-ghl-api-key.ps1 "YOUR_NEW_REGENERATED_KEY"
```

### **Option 2: Web Interface**
1. Go to: http://localhost:3000/test-ghl-key
2. Paste your new regenerated key
3. Click "Run Diagnostic Test"
4. Should show: ✅ **SUCCESS!**

---

## ❌ **Common Mistakes:**

### **Mistake 1: Not Regenerating**
- ❌ Enabling scopes but using the old key
- ✅ Must regenerate to get new permissions

### **Mistake 2: Missing Scopes**
- ❌ Only enabling some scopes
- ✅ Enable ALL scopes listed above

### **Mistake 3: Wrong Location**
- ❌ Creating integration in wrong location
- ✅ Make sure you're in "A Pretty Girl Matter" location

### **Mistake 4: Not Saving**
- ❌ Enabling scopes but not clicking Save
- ✅ Click Save, then Regenerate

---

## 📸 **Screenshot Guide:**

When you're in GoHighLevel, you should see:

1. **Left Sidebar:**
   - Settings (gear icon)

2. **Settings Page:**
   - Integrations menu item

3. **Integrations Page:**
   - "Private Integrations" tab

4. **Private Integrations List:**
   - Your integration name
   - Click to edit

5. **Integration Details:**
   - Scopes section (checkboxes)
   - API Key section (regenerate button)

---

## 🆘 **Still Not Working?**

If after regenerating with all scopes you still get 403:

### **Create a Brand New Integration:**

1. **Delete the old one** (optional)
2. Click **"+ Create"** or **"New Integration"**
3. **Name:** "APGM Website Integration v2"
4. **Enable ALL scopes** from the list above
5. Click **"Create"** or **"Generate API Key"**
6. **Copy the API key**
7. **Test immediately**

---

## 📋 **Quick Reference:**

### **Minimum Required Scopes for Testing:**
```
✅ contacts.readonly
✅ contacts.write
```

### **Recommended Scopes for Full Functionality:**
```
✅ ALL scopes listed in Step 4
```

---

## 💡 **Why This Keeps Happening:**

GoHighLevel's Private Integrations require you to:
1. **Explicitly enable each scope** (they're not enabled by default)
2. **Regenerate the API key** after changing scopes
3. **Use the new key** (old keys don't get updated permissions)

It's a security feature to ensure you only grant the permissions you actually need.

---

## ✅ **Success Indicators:**

You'll know it's working when:

1. **Test shows SUCCESS:**
   ```
   ✅ API Key is valid and working!
   Contact Count: 0 (or more)
   ```

2. **No 403 errors**

3. **Can create contacts in GoHighLevel via API**

---

**Next Step:** Go to GoHighLevel RIGHT NOW and:
1. Enable ALL scopes
2. Regenerate API key
3. Reply with the NEW key
4. I'll help you test and save it!

---

**Last Updated:** November 17, 2025  
**Status:** Waiting for regenerated API key with all scopes enabled
