import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

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

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting emergency contact migration...');
    
    // Get all users from the database
    const usersCollection = collection(getDb(), 'users');
    const usersSnapshot = await getDocs(usersCollection);
    
    let totalUsers = 0;
    let usersNeedingUpdate = 0;
    let usersUpdated = 0;
    let errors = 0;
    const migrationLog: string[] = [];

    migrationLog.push(`📊 Found ${usersSnapshot.size} users to check`);

    for (const userDoc of usersSnapshot.docs) {
      totalUsers++;
      const userData = userDoc.data() as User;
      const userId = userDoc.id;
      
      migrationLog.push(`\n👤 Checking user: ${userId} (${userData.profile?.email || 'No email'})`);
      
      // Check if profile exists
      if (!userData.profile) {
        migrationLog.push(`  ⚠️  User ${userId} has no profile - skipping`);
        continue;
      }

      // Check if emergency contact fields are missing or empty
      const needsEmergencyContactName = !userData.profile.emergencyContactName || userData.profile.emergencyContactName.trim() === '';
      const needsEmergencyContactPhone = !userData.profile.emergencyContactPhone || userData.profile.emergencyContactPhone.trim() === '';

      if (needsEmergencyContactName || needsEmergencyContactPhone) {
        usersNeedingUpdate++;
        migrationLog.push(`  🔧 User needs emergency contact update:`);
        migrationLog.push(`    - emergencyContactName: ${needsEmergencyContactName ? 'MISSING' : 'OK'}`);
        migrationLog.push(`    - emergencyContactPhone: ${needsEmergencyContactPhone ? 'MISSING' : 'OK'}`);

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

          await updateDoc(doc(getDb(), 'users', userId), updateData);
          usersUpdated++;
          migrationLog.push(`  ✅ Updated user ${userId} with emergency contact fields`);
          
        } catch (updateError) {
          errors++;
          migrationLog.push(`  ❌ Failed to update user ${userId}: ${updateError}`);
        }
      } else {
        migrationLog.push(`  ✅ User already has emergency contact fields`);
      }
    }

    const summary = {
      totalUsers,
      usersNeedingUpdate,
      usersUpdated,
      errors,
      success: errors === 0
    };

    migrationLog.push('\n📋 Migration Summary:');
    migrationLog.push(`  Total users checked: ${totalUsers}`);
    migrationLog.push(`  Users needing update: ${usersNeedingUpdate}`);
    migrationLog.push(`  Users successfully updated: ${usersUpdated}`);
    migrationLog.push(`  Errors encountered: ${errors}`);
    
    if (errors === 0 && usersUpdated > 0) {
      migrationLog.push('\n✅ Emergency contact migration completed successfully!');
    } else if (errors === 0 && usersUpdated === 0) {
      migrationLog.push('\n✅ All users already have emergency contact fields - no migration needed!');
    } else {
      migrationLog.push('\n⚠️  Migration completed with some errors. Please review the logs above.');
    }

    return NextResponse.json({
      success: summary.success,
      message: summary.success ? 'Emergency contact migration completed successfully' : 'Migration completed with errors',
      summary,
      log: migrationLog
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : 'No stack trace available'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Emergency Contact Migration Endpoint',
    usage: 'Send POST request to migrate user profiles to include emergency contact fields',
    purpose: 'Ensures all user profiles have emergencyContactName and emergencyContactPhone fields'
  });
}
