'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import AvailabilityCalendar from '../../components/AvailabilityCalendar';
import UserManagement from '../../components/UserManagement';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { onAuthStateChanged, User, Auth } from 'firebase/auth';
import { UserService } from '@/services/database';
import { User as DatabaseUser } from '@/types/database';

export default function ArtistProfile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<DatabaseUser | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'admin'>('profile');
  const [adminUsers, setAdminUsers] = useState<{
    admins: DatabaseUser[];
    artists: DatabaseUser[];
    clients: DatabaseUser[];
  }>({
    admins: [],
    artists: [],
    clients: []
  });
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      // Development mode - check localStorage for admin
      const adminEmail = localStorage.getItem('adminEmail');
      if (adminEmail) {
        setUser({ uid: 'admin', email: adminEmail, displayName: 'Admin' } as User);
        setUserRole('admin');
      } else {
        router.push('/login?redirect=/artist-profile');
      }
      setLoading(false);
      return;
    }

    // Firebase auth listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setLoading(false);
      
      if (!currentUser) {
        router.push('/login?redirect=/artist-profile');
        return;
      }

      setUser(currentUser);
      
      // Fetch user role and data from database
      fetchUserData(currentUser.uid, currentUser.email || '');
    });

    return () => unsubscribe();
  }, [router]);

  const fetchUserData = async (uid: string, email: string) => {
    try {
      // Check for admin@example.com development bypass
      if (email === 'admin@example.com') {
        const mockAdminUser: DatabaseUser = {
          id: 'admin-example',
          profile: {
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            phone: '(555) 000-0000',
            dateOfBirth: '1990-01-01',
            address: '123 Admin Street',
            city: 'Raleigh',
            state: 'NC',
            zipCode: '27601',
            emergencyContactName: 'Emergency Contact',
            emergencyContactPhone: '(555) 000-0001',
            preferredContactMethod: 'email',
            hearAboutUs: 'System Administrator',
            createdAt: { seconds: 1640995200, nanoseconds: 0 } as any,
            updatedAt: { seconds: 1640995200, nanoseconds: 0 } as any
          },
          role: 'admin',
          isActive: true
        };
        setCurrentUser(mockAdminUser);
        setUserRole('admin');
        return;
      }

      // Try to get user from database
      const dbUser = await UserService.getUserByEmail(email);
      if (dbUser) {
        setCurrentUser(dbUser);
        setUserRole(dbUser.role);
      } else {
        // Default to artist role if not found in database
        setUserRole('artist');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Default to artist role on error
      setUserRole('artist');
    }
  };

  const loadAdminUsers = async () => {
    if (userRole !== 'admin') return;
    
    try {
      setAdminLoading(true);
      const [admins, artists, clients] = await Promise.all([
        UserService.getAdmins(),
        UserService.getArtists(),
        UserService.getClients()
      ]);
      
      setAdminUsers({ admins, artists, clients });
    } catch (error) {
      console.error('Error loading admin users:', error);
    } finally {
      setAdminLoading(false);
    }
  };

  // Load admin users when user role is admin and tab is admin
  useEffect(() => {
    if (userRole === 'admin' && activeTab === 'admin') {
      loadAdminUsers();
    }
  }, [userRole, activeTab]);

  const handleAdminUsersUpdated = () => {
    loadAdminUsers();
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <>
        <Header />
        <div className="container-fluid" style={{ paddingTop: '140px', minHeight: '100vh' }}>
          <div className="row justify-content-center">
            <div className="col-12 text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Loading profile...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return null;
  }

  // Check if user has proper role (artist, admin, or client)
  if (userRole && !['artist', 'admin', 'client'].includes(userRole)) {
    return (
      <>
        <Header />
        <div className="container-fluid" style={{ paddingTop: '140px', minHeight: '100vh' }}>
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="alert alert-warning text-center">
                <h4>Access Denied</h4>
                <p>You don't have permission to access this profile page. Please contact an administrator if you believe this is an error.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => router.push('/dashboard')}
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container-fluid" style={{ paddingTop: '140px', minHeight: '100vh' }}>
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white border-0 py-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h1 className="h3 fw-bold text-primary mb-1">
                      {userRole === 'admin' ? 'Admin Dashboard' : 'Artist Profile'}
                    </h1>
                    <p className="text-muted mb-0">
                      {userRole === 'admin' 
                        ? 'Manage users, appointments, and system settings'
                        : 'Manage your availability, services, and profile settings'
                      }
                    </p>
                  </div>
                  <div className="text-end">
                    <span className="badge bg-primary px-3 py-2">
                      {userRole === 'admin' ? 'Administrator' : userRole === 'artist' ? 'Artist' : 'Client'}
                    </span>
                  </div>
                </div>
                
                {/* Tab Navigation - Only show for admin users */}
                {userRole === 'admin' && (
                  <div className="mt-4">
                    <ul className="nav nav-tabs" role="tablist">
                      <li className="nav-item" role="presentation">
                        <button
                          className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                          onClick={() => setActiveTab('profile')}
                          type="button"
                          role="tab"
                        >
                          <i className="fas fa-user me-2"></i>
                          Profile & Availability
                        </button>
                      </li>
                      <li className="nav-item" role="presentation">
                        <button
                          className={`nav-link ${activeTab === 'admin' ? 'active' : ''}`}
                          onClick={() => setActiveTab('admin')}
                          type="button"
                          role="tab"
                        >
                          <i className="fas fa-users me-2"></i>
                          User Management
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="card-body p-4">
                {/* Profile Tab Content */}
                {activeTab === 'profile' && (
                  <>
                    {/* User Info */}
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <div className="d-flex align-items-center">
                          <div className="avatar-circle bg-primary text-white me-3" style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            fontWeight: 'bold'
                          }}>
                            {currentUser?.profile.firstName 
                              ? currentUser.profile.firstName.charAt(0).toUpperCase() 
                              : user.displayName 
                                ? user.displayName.charAt(0).toUpperCase() 
                                : user.email?.charAt(0).toUpperCase()
                            }
                          </div>
                          <div>
                            <h5 className="mb-1">
                              {currentUser?.profile.firstName && currentUser?.profile.lastName
                                ? `${currentUser.profile.firstName} ${currentUser.profile.lastName}`
                                : user.displayName || 'User'
                              }
                            </h5>
                            <p className="text-muted mb-0">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 text-md-end">
                        <button 
                          className="btn btn-outline-primary me-2"
                          onClick={() => router.push('/dashboard')}
                        >
                          <i className="fas fa-arrow-left me-2"></i>
                          Back to Dashboard
                        </button>
                        <button className="btn btn-primary">
                          <i className="fas fa-edit me-2"></i>
                          Edit Profile
                        </button>
                      </div>
                    </div>

                    {/* Availability Calendar - Show for artists and admins */}
                    {(userRole === 'artist' || userRole === 'admin') && (
                      <AvailabilityCalendar 
                        artistId={user.uid} 
                        isEditable={true}
                      />
                    )}

                    {/* Message for clients */}
                    {userRole === 'client' && (
                      <div className="alert alert-info text-center">
                        <i className="fas fa-info-circle fa-2x mb-3"></i>
                        <h5>Client Profile</h5>
                        <p className="mb-0">Welcome! You can view your appointment history and manage your profile settings here.</p>
                      </div>
                    )}
                  </>
                )}

                {/* Admin Tab Content - Only visible to admin users */}
                {activeTab === 'admin' && userRole === 'admin' && (
                  <div>
                    {adminLoading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading users...</span>
                        </div>
                        <p className="mt-2 text-muted">Loading user management...</p>
                      </div>
                    ) : (
                      <UserManagement 
                        users={adminUsers}
                        onUsersUpdated={handleAdminUsersUpdated}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
