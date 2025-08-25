import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/database';

export async function POST(request: NextRequest) {
  try {
    const { email, password, profileData } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('🚀 Creating admin user:', email);

    // Default profile data if not provided
    const defaultProfileData = {
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
      preferredContactMethod: 'email',
      hearAboutUs: 'System Administrator'
    };

    const finalProfileData = { ...defaultProfileData, ...profileData };

    // First, create the user in Firebase Auth (if using Firebase Auth)
    // For now, we'll create the user in Firestore with admin role
    console.log('👤 Creating admin user in database...');
    const adminUserId = await UserService.createAdminUser(email, finalProfileData);
    
    console.log('✅ Admin user created successfully!');
    console.log(`   User ID: ${adminUserId}`);
    console.log(`   Email: ${email}`);
    console.log(`   Role: admin`);

    // Verify the admin user was created
    const adminUser = await UserService.getUserByEmail(email);
    if (adminUser && adminUser.role === 'admin') {
      console.log('✅ Admin user verification successful!');
      
      return NextResponse.json({
        success: true,
        message: 'Admin user created successfully',
        user: {
          id: adminUserId,
          email: email,
          role: 'admin',
          name: `${finalProfileData.firstName} ${finalProfileData.lastName}`,
          isActive: adminUser.isActive
        }
      });
    } else {
      console.error('❌ Admin user verification failed!');
      return NextResponse.json(
        { error: 'Admin user creation verification failed' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create admin user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check if admin user exists
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || 'admin@example.com';

    const adminUser = await UserService.getUserByEmail(email);
    
    if (adminUser) {
      return NextResponse.json({
        exists: true,
        user: {
          id: adminUser.id,
          email: adminUser.profile.email,
          role: adminUser.role,
          name: `${adminUser.profile.firstName} ${adminUser.profile.lastName}`,
          isActive: adminUser.isActive
        }
      });
    } else {
      return NextResponse.json({
        exists: false,
        message: 'Admin user not found'
      });
    }
  } catch (error) {
    console.error('❌ Error checking admin user:', error);
    return NextResponse.json(
      { error: 'Failed to check admin user' },
      { status: 500 }
    );
  }
}
