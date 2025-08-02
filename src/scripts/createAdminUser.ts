import { UserService } from '@/services/database';

// Create admin@example.com as an admin user
export async function createExampleAdminUser() {
  try {
    console.log('🚀 Creating admin@example.com as admin user...');

    // Create admin user profile
    const adminProfile = {
      firstName: 'Admin',
      lastName: 'User',
      phone: '(555) 000-0000',
      dateOfBirth: '1990-01-01',
      address: '123 Admin Street',
      city: 'Raleigh',
      state: 'NC',
      zipCode: '27601',
      emergencyContactName: 'Emergency Contact',
      emergencyContactPhone: '(555) 000-0001',
      preferredContactMethod: 'email' as const,
      hearAboutUs: 'System Administrator'
    };

    // Create or update admin user
    console.log('👤 Creating admin user for admin@example.com...');
    const adminUserId = await UserService.createAdminUser('admin@example.com', adminProfile);
    
    console.log('✅ Admin user created/updated successfully!');
    console.log(`   User ID: ${adminUserId}`);
    console.log(`   Email: admin@example.com`);
    console.log(`   Role: admin`);

    // Verify the admin user was created
    const adminUser = await UserService.getUserByEmail('admin@example.com');
    if (adminUser && adminUser.role === 'admin') {
      console.log('✅ Admin user verification successful!');
      console.log(`   Name: ${adminUser.profile.firstName} ${adminUser.profile.lastName}`);
      console.log(`   Active: ${adminUser.isActive}`);
    } else {
      console.error('❌ Admin user verification failed!');
    }

    return {
      success: true,
      adminUserId,
      message: 'Admin user admin@example.com created successfully'
    };

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}

// Function to run the script
export async function runCreateAdminUser() {
  try {
    const result = await createExampleAdminUser();
    console.log('🎉 Script completed:', result.message);
    return result;
  } catch (error) {
    console.error('💥 Script failed:', error);
    throw error;
  }
}
