# 🚀 Quick Start: Two-Way GHL Calendar Sync

## ✅ **What You Now Have**

Your website now has **complete two-way synchronization** with GoHighLevel:

1. **📥 GHL → Website**: Import appointments from GHL calendars
2. **📤 Website → GHL**: Push bookings to GHL calendars
3. **🔔 Real-Time Webhooks**: Automatic sync when appointments change in GHL
4. **🎯 Book-Now System**: Create appointments on website that sync to GHL

---

## 🎯 **Quick Setup (5 Minutes)**

### **Step 1: Test the Sync Buttons** ⏱️ 1 minute

1. **Go to:** www.aprettygirlmatter.com/dashboard
2. **Click:** Calendar tab
3. **You'll see two new buttons:**
   - 🟢 **"Sync FROM GHL"** - Import from GHL to website
   - 🔵 **"Sync TO GHL"** - Push to GHL from website

4. **Click:** "Sync FROM GHL"
5. **Result:** Should see "Successfully synced X appointments from GHL!"

### **Step 2: Set Up GHL Webhooks (Recommended)** ⏱️ 3 minutes

This enables **real-time automatic sync** when you create/update appointments in GHL.

1. **Log in to GoHighLevel**
2. **Go to:** Settings → Integrations → Webhooks
3. **Click:** "Create Webhook"
4. **Fill in:**
   - Name: `Website Calendar Sync`
   - URL: `https://www.aprettygirlmatter.com/api/webhooks/ghl-appointment`
   - Events: Select ALL appointment events:
     - ✅ `appointment.created`
     - ✅ `appointment.updated`
     - ✅ `appointment.deleted`
5. **Click:** "Save"

### **Step 3: Test It!** ⏱️ 1 minute

**Test GHL → Website:**
1. Create a test appointment in GHL
2. Wait 5 seconds
3. Refresh your website calendar
4. ✅ Appointment should appear automatically!

**Test Website → GHL:**
1. Create a booking on your website (or use existing)
2. Click "Sync TO GHL"
3. Check GHL calendar
4. ✅ Booking should appear in GHL!

---

## 📋 **How to Use**

### **Scenario 1: Customer Books on Website**

**What happens:**
1. Customer fills out booking form on www.aprettygirlmatter.com
2. Booking saved to website database
3. Click "Sync TO GHL" (or it syncs automatically)
4. ✅ Appointment appears in GHL calendar
5. ✅ Contact created/updated in GHL

**You do:** Nothing! Just check GHL to see the appointment.

### **Scenario 2: You Book in GHL**

**What happens:**
1. You create appointment in GHL calendar
2. **If webhooks enabled:** Automatically syncs to website in 5 seconds
3. **If no webhooks:** Click "Sync FROM GHL" button
4. ✅ Appointment appears on website calendar

**You do:** Just create the appointment in GHL normally.

### **Scenario 3: Update Appointment Status**

**What happens:**
1. You mark appointment as "completed" in GHL
2. Webhook automatically updates website
3. ✅ Status changes on website calendar

**You do:** Update in GHL, website updates automatically.

---

## 🎨 **The Two Sync Buttons**

### 🟢 **"Sync FROM GHL"** (Green, Download Icon)

**What it does:**
- Imports appointments from ALL your GHL calendars
- Checks: Service Calendar, Victoria's Personal, Free Virtual Consultation
- Date range: Past 7 days to future 90 days
- Creates new bookings or updates existing ones

**When to use:**
- First time setup
- After creating multiple appointments in GHL
- Once a day as a backup (if using webhooks)
- If webhooks aren't working

### 🔵 **"Sync TO GHL"** (Blue, Upload Icon)

**What it does:**
- Pushes all website bookings to GHL
- Creates/updates contacts in GHL
- Creates/updates appointments in GHL
- Links bookings with GHL IDs

**When to use:**
- After customers book on website
- To ensure all website bookings are in GHL
- As a backup sync

---

## 🔔 **Webhooks vs Manual Sync**

| Feature | Webhooks | Manual Sync |
|---------|----------|-------------|
| **Speed** | Instant (5 seconds) | On-demand |
| **Automation** | Automatic | Click button |
| **Setup** | 3 minutes | None |
| **Best For** | Real-time updates | Backup/bulk sync |
| **Recommended** | ✅ Yes | Use as backup |

**💡 Tip:** Set up webhooks for automatic sync, then use manual sync buttons as a backup once a day.

---

## 📊 **What Gets Synced**

### **From GHL to Website:**
- ✅ Appointment title → Service name
- ✅ Contact name → Client name
- ✅ Contact email → Client email
- ✅ Contact phone → Client phone
- ✅ Start time → Date & time
- ✅ Status → Booking status
- ✅ Notes → Booking notes
- ✅ Price (from notes)
- ✅ Deposit status (from notes)

### **From Website to GHL:**
- ✅ Service + client name → Appointment title
- ✅ Client info → GHL contact
- ✅ Date & time → Appointment time
- ✅ Status → Appointment status
- ✅ Notes → Appointment notes
- ✅ Price & deposit → Notes

---

## 🎯 **Best Practices**

1. **✅ Set up webhooks** - Enables automatic real-time sync
2. **✅ Use "Sync FROM GHL" daily** - Catches any missed webhooks
3. **✅ Consistent naming** - Use same service names in both systems
4. **✅ Format notes** - In GHL, use: "Price: $450, Deposit: Paid"
5. **✅ Check after booking** - Verify appointments appear in both systems

---

## 🆘 **Troubleshooting**

### **"No appointments found"**
- Appointments must be within past 7 days to future 90 days
- Check that appointments exist in GHL calendars

### **"Failed to sync"**
- Verify GHL credentials in GoHighLevel tab
- Click "Test Connection" - should show "Found 1 location(s)"

### **Webhook not working**
- Check webhook URL: `https://www.aprettygirlmatter.com/api/webhooks/ghl-appointment`
- Verify webhook is active in GHL
- Test by creating appointment in GHL

### **Duplicate bookings**
- System automatically prevents duplicates
- Each booking linked by `ghlAppointmentId`

---

## 📚 **Full Documentation**

For complete details, see: `docs/TWO_WAY_GHL_SYNC.md`

---

## ✅ **You're All Set!**

Your calendar system is now fully integrated with GoHighLevel! 🎉

**Next steps:**
1. ✅ Test both sync buttons
2. ✅ Set up webhooks (3 minutes)
3. ✅ Create a test appointment in GHL
4. ✅ Watch it appear on your website automatically!

**Questions?** Check the full documentation or test the sync buttons to see it in action!
