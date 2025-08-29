# Admin Login Fix for admin@example.com

## 🔍 Problem Identified
The error `auth/invalid-credential` confirms that `admin@example.com` doesn't exist in Firebase Authentication. Your scripts created Firestore profiles but not the actual Firebase Auth account.

## ✅ Immediate Solutions

### Option 1: Use Working Admin Account
**Email:** `victoria@aprettygirlmatter.com`  
**Password:** `LexxieDexx3#`  
**Status:** ✅ Has both Firebase Auth + Firestore profile

### Option 2: Create admin@example.com in Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `aprettygirlmatterllc`
3. Go to **Authentication** → **Users**
4. Click **Add user**
5. Enter:
   - **Email:** `admin@example.com`
   - **Password:** `admin123`
6. Click **Add user**

The Firestore profile already exists from your scripts, so this will complete the setup.

### Option 3: Enable Development Bypass
Your system has bypass logic for `admin@example.com`. To activate:

1. **Open browser console** on your login page
2. **Run this command:**
   ```javascript
   localStorage.setItem('adminEmail', 'admin@example.com');
   localStorage.setItem('bypassAuth', 'true');
   ```
3. **Navigate to admin page directly:** `/admin`

## 🔧 Technical Details

**Error Analysis:**
- `auth/invalid-credential` = Firebase Auth account doesn't exist
- Your Firestore profile exists but Firebase Auth account is missing
- Development bypass exists but requires localStorage setup

**Working Accounts:**
- `victoria@aprettygirlmatter.com` - Full setup ✅
- `clientone@aprettygirlmatter.com` - Client role ✅  
- `artistone@aprettygirlmatter.com` - Artist role ✅

**Missing:**
- `admin@example.com` Firebase Auth account (Firestore profile exists)

## 🚀 Recommended Action

**Use the working admin account immediately:**
- Email: `victoria@aprettygirlmatter.com`
- Password: `LexxieDexx3#`

This will give you full admin access to test the Stripe mode toggle and other admin features while we resolve the `admin@example.com` issue.
