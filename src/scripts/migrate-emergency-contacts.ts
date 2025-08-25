import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';

// Firebase configuration - using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  preferredContactMethod: string;
  hearAboutUs: string;
  notes?: string;
  createdAt: any;
  updatedAt: any;
}

interface User {
  id: string;
  profile: UserProfile;
  role: 'client' | 'admin' | 'artist';
  isActive: boolean;
}

async function migrateEmergencyContacts() {
  console.log('🔄 Starting emergency contact migration...');
  
  try {
    // Get all users from the database
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    
    let totalUsers = 0;
    let usersNeedingUpdate = 0;
    let usersUpdated = 0;
    let errors = 0;

    console.log(`📊 Found ${usersSnapshot.size} users to check`);

    for (const userDoc of usersSnapshot.docs) {
      totalUsers++;
      const userData = userDoc.data() as User;
      const userId = userDoc.id;
      
      console.log(`\n👤 Checking user: ${userId} (${userData.profile?.email || 'No email'})`);
      
      // Check if profile exists
      if (!userData.profile) {
        console.log(`  ⚠️  User ${userId} has no profile - skipping`);
        continue;
      }

      // Check if emergency contact fields are missing or empty
      const needsEmergencyContactName = !userData.profile.emergencyContactName || userData.profile.emergencyContactName.trim() === '';
      const needsEmergencyContactPhone = !userData.profile.emergencyContactPhone || userData.profile.emergencyContactPhone.trim() === '';

      if (needsEmergencyContactName || needsEmergencyContactPhone) {
        usersNeedingUpdate++;
        console.log(`  🔧 User needs emergency contact update:`);
        console.log(`    - emergencyContactName: ${needsEmergencyContactName ? 'MISSING' : 'OK'}`);
        console.log(`    - emergencyContactPhone: ${needsEmergencyContactPhone ? 'MISSING' : 'OK'}`);

        try {
          // Update the user profile with empty emergency contact fields if missing
          const updateData: any = {
            'profile.updatedAt': Timestamp.now()
          };

          if (needsEmergencyContactName) {
            updateData['profile.emergencyContactName'] = '';
          }
          
          if (needsEmergencyContactPhone) {
            updateData['profile.emergencyContactPhone'] = '';
          }

          await updateDoc(doc(db, 'users', userId), updateData);
          usersUpdated++;
          console.log(`  ✅ Updated user ${userId} with emergency contact fields`);
          
        } catch (updateError) {
          errors++;
          console.error(`  ❌ Failed to update user ${userId}:`, updateError);
        }
      } else {
        console.log(`  ✅ User already has emergency contact fields`);
      }
    }

    console.log('\n📋 Migration Summary:');
    console.log(`  Total users checked: ${totalUsers}`);
    console.log(`  Users needing update: ${usersNeedingUpdate}`);
    console.log(`  Users successfully updated: ${usersUpdated}`);
    console.log(`  Errors encountered: ${errors}`);
    
    if (errors === 0 && usersUpdated > 0) {
      console.log('\n✅ Emergency contact migration completed successfully!');
    } else if (errors === 0 && usersUpdated === 0) {
      console.log('\n✅ All users already have emergency contact fields - no migration needed!');
    } else {
      console.log('\n⚠️  Migration completed with some errors. Please review the logs above.');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
if (require.main === module) {
  migrateEmergencyContacts()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

export { migrateEmergencyContacts };
