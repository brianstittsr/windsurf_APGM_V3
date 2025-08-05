# User Account Creation Guide

## ✅ Completed: Inactive Account Removal
- Successfully removed 2 inactive Brian Stitt accounts
- Database now has 1 active admin account (Admin User)

## 📝 Manual Account Creation Required

Due to Firebase Authentication security, new accounts need to be created through the registration process. Here are two approaches:

### Option 1: Use the Website Registration (Recommended)

1. **Victoria Escobar (Admin)**
   - Go to: `http://localhost:3000/register`
   - Fill out the form:
     - First Name: Victoria
     - Last Name: Escobar
     - Email: victoria@aprettygirlmatter.com
     - Password: LexxieDexx3#
     - Phone: (leave blank or add real number)
     - Address: (leave blank or add real address)
   - After registration, manually update the role to 'admin' in Firebase Console

2. **Client One**
   - Go to: `http://localhost:3000/register`
   - Fill out the form:
     - First Name: Client
     - Last Name: One
     - Email: clientone@aprettygirlmatter.com
     - Password: LexxieDexx3#
   - Role will default to 'client' (no change needed)

3. **Artist One**
   - Go to: `http://localhost:3000/register`
   - Fill out the form:
     - First Name: Artist
     - Last Name: One
     - Email: artistone@aprettygirlmatter.com
     - Password: LexxieDexx3#
   - After registration, manually update the role to 'artist' in Firebase Console

### Option 2: Firebase Console (Alternative)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `aprettygirlmatterllc`
3. Navigate to **Authentication > Users**
4. Click **"Add user"** for each account:

   **Victoria Escobar:**
   - Email: victoria@aprettygirlmatter.com
   - Password: LexxieDexx3#

   **Client One:**
   - Email: clientone@aprettygirlmatter.com
   - Password: LexxieDexx3#

   **Artist One:**
   - Email: artistone@aprettygirlmatter.com
   - Password: LexxieDexx3#

5. After creating each user, go to **Firestore Database > users collection**
6. Create a document for each user with their Auth UID as the document ID
7. Add the user profile data (see structure below)

### User Document Structure

```javascript
{
  role: "admin" | "client" | "artist",
  isActive: true,
  createdAt: [serverTimestamp],
  updatedAt: [serverTimestamp],
  profile: {
    firstName: "First Name",
    lastName: "Last Name", 
    email: "email@example.com",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    dateOfBirth: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    preferredContactMethod: "email",
    hearAboutUs: "System Created",
    createdAt: [serverTimestamp],
    updatedAt: [serverTimestamp]
  }
}
```

## 🔧 Role Updates

After creating accounts, update roles in Firebase Console:
- Victoria Escobar: Change role from 'client' to 'admin'
- Artist One: Change role from 'client' to 'artist'
- Client One: Keep as 'client'

## ✅ Verification

After creating accounts, run the user list script to verify:
```bash
node scripts/list-users.js
```

Expected result: 4 total users
- 2 admins (Admin User + Victoria Escobar)
- 1 client (Client One)
- 1 artist (Artist One)
