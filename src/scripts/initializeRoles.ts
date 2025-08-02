import { UserService } from '@/services/database';

// Initialize roles and create admin user
export async function initializeRoles() {
  try {
    console.log('🚀 Initializing user roles system...');

    // Create admin user profile
    const adminProfile = {
      firstName: 'Brian',
      lastName: 'Stitt',
      phone: '(555) 123-4567', // You can update this with real phone
      dateOfBirth: '1990-01-01', // You can update this with real DOB
      address: '123 Admin Street',
      city: 'Raleigh',
      state: 'NC',
      zipCode: '27601',
      emergencyContactName: 'Emergency Contact',
      emergencyContactPhone: '(555) 987-6543',
      preferredContactMethod: 'email',
      hearAboutUs: 'System Administrator'
    };

    // Create or update admin user
    console.log('👤 Creating admin user for brianstittsr@gmail.com...');
    const adminUserId = await UserService.createAdminUser('brianstittsr@gmail.com', adminProfile);
    
    console.log('✅ Admin user created/updated successfully!');
    console.log(`   User ID: ${adminUserId}`);
    console.log(`   Email: brianstittsr@gmail.com`);
    console.log(`   Role: admin`);

    // Verify the admin user was created
    const adminUser = await UserService.getUserByEmail('brianstittsr@gmail.com');
    if (adminUser && adminUser.role === 'admin') {
      console.log('✅ Admin user verification successful!');
      console.log(`   Name: ${adminUser.profile.firstName} ${adminUser.profile.lastName}`);
      console.log(`   Active: ${adminUser.isActive}`);
    } else {
      console.error('❌ Admin user verification failed!');
    }

    // Display role system summary
    console.log('\n📋 Role System Summary:');
    console.log('   Available Roles:');
    console.log('   • admin - Full system access, can manage users and settings');
    console.log('   • artist - Can manage appointments and client interactions');
    console.log('   • client - Can book appointments and manage their profile');
    
    console.log('\n🎉 Role system initialization completed successfully!');
    
    return {
      success: true,
      adminUserId,
      message: 'Roles initialized and admin user created'
    };

  } catch (error) {
    console.error('❌ Error initializing roles:', error);
    throw error;
  }
}

// Function to add more admin users if needed
export async function addAdminUser(email: string, profile: {
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  preferredContactMethod: string;
  hearAboutUs: string;
}) {
  try {
    console.log(`👤 Adding admin user: ${email}...`);
    const userId = await UserService.createAdminUser(email, profile);
    console.log(`✅ Admin user added successfully: ${email}`);
    return userId;
  } catch (error) {
    console.error(`❌ Error adding admin user ${email}:`, error);
    throw error;
  }
}

// Function to promote existing user to admin
export async function promoteToAdmin(email: string) {
  try {
    console.log(`🔄 Promoting user to admin: ${email}...`);
    const user = await UserService.getUserByEmail(email);
    
    if (!user) {
      throw new Error(`User not found: ${email}`);
    }

    await UserService.updateUserRole(user.id, 'admin');
    console.log(`✅ User promoted to admin: ${email}`);
    return user.id;
  } catch (error) {
    console.error(`❌ Error promoting user to admin ${email}:`, error);
    throw error;
  }
}

// Function to list all users by role
export async function listUsersByRole() {
  try {
    console.log('📊 Fetching users by role...');
    
    const admins = await UserService.getAdmins();
    const artists = await UserService.getArtists();
    const clients = await UserService.getClients();

    console.log('\n👥 Users by Role:');
    console.log(`\n🔧 Admins (${admins.length}):`);
    admins.forEach(user => {
      console.log(`   • ${user.profile.firstName} ${user.profile.lastName} (${user.profile.email}) - ${user.isActive ? 'Active' : 'Inactive'}`);
    });

    console.log(`\n🎨 Artists (${artists.length}):`);
    artists.forEach(user => {
      console.log(`   • ${user.profile.firstName} ${user.profile.lastName} (${user.profile.email}) - ${user.isActive ? 'Active' : 'Inactive'}`);
    });

    console.log(`\n👤 Clients (${clients.length}):`);
    clients.forEach(user => {
      console.log(`   • ${user.profile.firstName} ${user.profile.lastName} (${user.profile.email}) - ${user.isActive ? 'Active' : 'Inactive'}`);
    });

    return { admins, artists, clients };
  } catch (error) {
    console.error('❌ Error listing users by role:', error);
    throw error;
  }
}

// Run initialization if this script is executed directly
if (require.main === module) {
  initializeRoles()
    .then(() => {
      console.log('🎉 Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}
