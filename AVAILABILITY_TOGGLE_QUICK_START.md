# 🚀 Quick Start: GHL Availability Toggle

## ✅ **What You Now Have**

A **toggle switch** that lets you choose between two availability systems:

1. **Website Mode** (Default): Uses your Artist Availability Manager settings
2. **GHL Mode**: Uses GoHighLevel calendar booking rules

**Both systems are preserved** - switch anytime without losing data!

---

## ⚡ **Quick Setup (30 Seconds)**

### **Step 1: Find the Toggle**
1. Go to: www.aprettygirlmatter.com/dashboard
2. Click: **GoHighLevel** tab
3. Scroll to: **"Use GHL Calendar Availability"** card

### **Step 2: Choose Your System**

**Option A: Use Website Availability (Default)**
- Toggle: **OFF**
- Uses: Artist Availability Manager
- Best for: Simple, manual control

**Option B: Use GHL Calendar Rules**
- Toggle: **ON**
- Uses: GHL calendar booking rules
- Best for: Advanced scheduling, multiple calendars

### **Step 3: Save**
1. Click: **"Save API Key"** button
2. ✅ Done! Takes effect immediately

---

## 🎯 **How to Test**

### **Test Website Mode:**
1. Toggle: **OFF**
2. Save settings
3. Go to: www.aprettygirlmatter.com/book-now-custom
4. Select a date
5. ✅ See slots from Artist Availability Manager

### **Test GHL Mode:**
1. Toggle: **ON**
2. Save settings
3. Go to: www.aprettygirlmatter.com/book-now-custom
4. Select a date
5. ✅ See blue banner: "Using GHL Calendar"
6. ✅ See slots from GHL calendars

---

## 📋 **Visual Indicators**

### **Website Mode:**
```
Available Times for Monday, November 25
Select a 4-hour time slot to continue

[Time slots displayed normally]
```

### **GHL Mode:**
```
ℹ️ Using GHL Calendar: Showing available slots from 
   GoHighLevel calendar booking rules

Available Times for Monday, November 25
Select a 4-hour time slot to continue

[Time slots from GHL]
```

---

## 🔄 **When to Use Each Mode**

### **Use Website Mode When:**
- ✅ You want simple, manual control
- ✅ You prefer 4-hour booking blocks
- ✅ You don't need GHL calendar integration
- ✅ You want to configure in admin dashboard

### **Use GHL Mode When:**
- ✅ You have complex booking rules in GHL
- ✅ You want to sync with existing GHL appointments
- ✅ You have multiple team members/calendars
- ✅ You want centralized calendar management
- ✅ You need advanced availability logic

---

## 🎨 **The Toggle Switch**

Located in: **Admin Dashboard → GoHighLevel Tab**

**Appearance:**
```
┌─────────────────────────────────────────────┐
│  Use GHL Calendar Availability              │
│                                             │
│  When enabled, booking system will use     │
│  GHL calendar rules instead of website's   │
│  built-in availability system.             │
│                                             │
│                              [OFF] ◯────    │
│                                             │
│  ℹ️ GHL Mode: Uses calendar booking rules  │
│  ℹ️ Website Mode: Uses Artist Availability │
└─────────────────────────────────────────────┘
```

---

## ⚠️ **Important Notes**

### **1. No Data Loss**
- Switching doesn't delete anything
- Website availability settings preserved
- GHL calendars unchanged
- Switch back anytime

### **2. Instant Effect**
- Changes apply immediately
- No deployment needed
- Refresh booking page to see changes

### **3. GHL Requirements**
For GHL mode to work:
- ✅ Valid GHL API Key
- ✅ Location ID configured
- ✅ GHL calendars set up with booking rules
- ✅ API key has `calendars.readonly` scope

---

## 🆘 **Troubleshooting**

### **"No slots available" in GHL mode**
**Fix:**
1. Check GHL calendars have booking rules configured
2. Verify selected date has availability
3. Test connection in GoHighLevel tab

### **Toggle doesn't appear**
**Fix:**
1. Hard refresh: Ctrl + Shift + R
2. Check you're on GoHighLevel tab
3. Wait for deployment (2-3 minutes)

### **Slots don't change after toggling**
**Fix:**
1. Click "Save API Key" after toggling
2. Hard refresh booking page
3. Clear browser cache if needed

---

## 📚 **Full Documentation**

For complete details, see: `docs/GHL_AVAILABILITY_TOGGLE.md`

---

## ✅ **Quick Checklist**

After deployment:

- [ ] Go to Admin Dashboard → GoHighLevel tab
- [ ] See "Use GHL Calendar Availability" toggle
- [ ] Toggle OFF = Website mode (default)
- [ ] Toggle ON = GHL mode
- [ ] Click "Save API Key" to apply
- [ ] Test booking page shows correct slots
- [ ] GHL mode shows blue banner
- [ ] Switch back and forth works

---

## 🎉 **You're All Set!**

You now have **complete flexibility** in managing availability:

✅ **Simple toggle** - one click to switch  
✅ **No data loss** - both systems preserved  
✅ **Instant switching** - takes effect immediately  
✅ **Clear indicators** - know which system is active  

Choose what works best for you and switch anytime! 🚀
