'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import UserManagement from '../../components/UserManagement';
import AvailabilityCalendar from '../../components/AvailabilityCalendar';
import AdminAvailabilityManager from '../../components/AdminAvailabilityManager';
import MarketingAnalytics from '../../components/MarketingAnalytics';
import StripeManagement from '../../components/StripeManagement';
import MarketingWorkflows from '../../components/MarketingWorkflows';
import { ClientPDFManager } from '../../components/ClientPDFManager';
import { UserActivityFeed } from '../../components/UserActivityFeed';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { User } from 'firebase/auth';
import { UserService } from '@/services/database';
import { User as DatabaseUser } from '@/types/database';
import { ActivityService } from '@/services/activityService';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<DatabaseUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'availability' | 'admin' | 'analytics' | 'stripe' | 'workflows' | 'documents'>('dashboard');
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
    if (!isFirebaseConfigured() || !auth) {
      router.push('/login');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchUserData(currentUser.uid, currentUser.email || '');
        
        // Log login activity
        try {
          await ActivityService.logLoginActivity(currentUser.uid);
        } catch (activityError) {
          console.error('Failed to log login activity:', activityError);
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const fetchUserData = async (uid: string, email: string) => {
    try {
      // Try to get user from database
      const dbUser = await UserService.getUserByEmail(email);
      if (dbUser) {
        setCurrentUser(dbUser);
        setUserRole(dbUser.role);
      } else {
        // Default to client role if not found in database
        setUserRole('client');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Default to client role on error
      setUserRole('client');
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

  const handleSignOut = async () => {
    try {
      if (auth) {
        await signOut(auth);
        router.push('/');
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container-fluid" style={{ paddingTop: '140px', minHeight: '100vh' }}>
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading your dashboard...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <>
      <Header />
      <div className="container-fluid" style={{ paddingTop: '140px', minHeight: '100vh' }}>
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {/* Welcome Section */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <div className="d-flex align-items-center mb-2">
                      <h1 className="h3 text-primary fw-bold mb-0 me-3">
                        Welcome back, {currentUser?.profile?.firstName || user.displayName || user.email}!
                      </h1>
                      {userRole && (
                        <span className={`badge rounded-pill ${
                          userRole === 'admin' ? 'bg-danger' :
                          userRole === 'artist' ? 'bg-success' :
                          'bg-primary'
                        }`}>
                          {userRole === 'admin' ? 'Administrator' :
                           userRole === 'artist' ? 'Artist' :
                           'Client'}
                        </span>
                      )}
                    </div>
                    <p className="text-muted mb-0">
                      {userRole === 'admin' ? 'Manage users, appointments, and system settings' :
                       userRole === 'artist' ? 'Manage your appointments and availability' :
                       'Manage your appointments and profile'}
                    </p>
                  </div>
                  <div className="col-md-4 text-md-end">
                    <button
                      onClick={handleSignOut}
                      className="btn btn-outline-secondary rounded-pill"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation for Artists and Admins */}
            {(userRole === 'artist' || userRole === 'admin') && (
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-0">
                  <ul className="nav nav-tabs border-0" role="tablist">
                    <li className="nav-item" role="presentation">
                      <button
                        className={`nav-link px-4 py-3 ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                        type="button"
                        role="tab"
                      >
                        <i className="fas fa-tachometer-alt me-2"></i>
                        Dashboard
                      </button>
                    </li>
                    {userRole === 'artist' && (
                      <li className="nav-item" role="presentation">
                        <button
                          className={`nav-link px-4 py-3 ${activeTab === 'profile' ? 'active' : ''}`}
                          onClick={() => setActiveTab('profile')}
                          type="button"
                          role="tab"
                        >
                          <i className="fas fa-calendar-alt me-2"></i>
                          Availability
                        </button>
                      </li>
                    )}
                    {userRole === 'admin' && (
                      <>
                        <li className="nav-item" role="presentation">
                          <button
                            className={`nav-link px-4 py-3 ${activeTab === 'availability' ? 'active' : ''}`}
                            onClick={() => setActiveTab('availability')}
                            type="button"
                            role="tab"
                          >
                            <i className="fas fa-calendar-check me-2"></i>
                            Artist Schedules
                          </button>
                        </li>
                        <li className="nav-item" role="presentation">
                          <button
                            className={`nav-link px-4 py-3 ${activeTab === 'admin' ? 'active' : ''}`}
                            onClick={() => setActiveTab('admin')}
                            type="button"
                            role="tab"
                          >
                            <i className="fas fa-users-cog me-2"></i>
                            User Management
                          </button>
                        </li>
                        <li className="nav-item" role="presentation">
                          <button
                            className={`nav-link px-4 py-3 ${activeTab === 'analytics' ? 'active' : ''}`}
                            onClick={() => setActiveTab('analytics')}
                            type="button"
                            role="tab"
                          >
                            <i className="fas fa-chart-bar me-2"></i>
                            Marketing Analytics
                          </button>
                        </li>
                        <li className="nav-item" role="presentation">
                          <button
                            className={`nav-link px-4 py-3 ${activeTab === 'stripe' ? 'active' : ''}`}
                            onClick={() => setActiveTab('stripe')}
                            type="button"
                            role="tab"
                          >
                            <i className="fas fa-credit-card me-2"></i>
                            Stripe Management
                          </button>
                        </li>
                        <li className="nav-item" role="presentation">
                          <button
                            className={`nav-link px-4 py-3 ${activeTab === 'workflows' ? 'active' : ''}`}
                            onClick={() => setActiveTab('workflows')}
                            type="button"
                            role="tab"
                          >
                            <i className="fas fa-project-diagram me-2"></i>
                            Marketing Workflows
                          </button>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {/* Dashboard Tab Content */}
            {activeTab === 'dashboard' && (
              <>
                {/* Quick Actions */}
                <div className="row g-4 mb-4">
              <div className="col-md-6 col-lg-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center p-4">
                    <div className="mb-3">
                      <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                        <svg width="24" height="24" fill="currentColor" className="text-primary" viewBox="0 0 24 24">
                          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                        </svg>
                      </div>
                    </div>
                    <h5 className="card-title">Book Appointment</h5>
                    <p className="card-text text-muted small">Schedule your next semi-permanent makeup session</p>
                    <Link href="/book-now-custom" className="btn btn-primary rounded-pill">
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>

              <div className="col-md-6 col-lg-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center p-4">
                    <div className="mb-3">
                      <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                        <svg width="24" height="24" fill="currentColor" className="text-success" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </div>
                    </div>
                    <h5 className="card-title">My Appointments</h5>
                    <p className="card-text text-muted small">View and manage your upcoming appointments</p>
                    <button className="btn btn-success rounded-pill" disabled>
                      Coming Soon
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-md-6 col-lg-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center p-4">
                    <div className="mb-3">
                      <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                        <svg width="24" height="24" fill="currentColor" className="text-info" viewBox="0 0 24 24">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                        </svg>
                      </div>
                    </div>
                    <h5 className="card-title">My Documents</h5>
                    <p className="card-text text-muted small">View and download your forms and documents</p>
                    <button 
                      className="btn btn-info rounded-pill"
                      onClick={() => setActiveTab('documents')}
                    >
                      View Documents
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-md-6 col-lg-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center p-4">
                    <div className="mb-3">
                      <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                        <svg width="24" height="24" fill="currentColor" className="text-warning" viewBox="0 0 24 24">
                          <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/>
                        </svg>
                      </div>
                    </div>
                    <h5 className="card-title">Profile</h5>
                    <p className="card-text text-muted small">Update your personal information</p>
                    <button className="btn btn-warning rounded-pill" disabled>
                      Coming Soon
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0 pb-0">
                <h5 className="card-title text-primary fw-bold">Recent Activity</h5>
                <p className="text-muted small mb-0">Your latest actions and updates</p>
              </div>
              <div className="card-body">
                {user?.uid ? (
                  <UserActivityFeed 
                    userId={user.uid}
                    maxItems={5}
                    showFilters={false}
                  />
                ) : (
                  <div className="text-center py-5">
                    <div className="text-muted">
                      <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24" className="mb-3">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      <h6>Loading activity...</h6>
                      <p className="small">Your recent activity will appear here</p>
                    </div>
                  </div>
                )}
              </div>
                </div>
              </>
            )}

            {/* Artist Profile Tab Content */}
            {activeTab === 'profile' && userRole === 'artist' && (
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-0 pb-0">
                  <h5 className="card-title text-primary fw-bold">
                    <i className="fas fa-calendar-alt me-2"></i>
                    Availability Management
                  </h5>
                  <p className="text-muted small mb-0">
                    Manage your working hours and availability schedule
                  </p>
                </div>
                <div className="card-body">
                  {/* User Profile Info */}
                  <div className="row align-items-center mb-4 p-3 bg-light rounded">
                    <div className="col-md-8">
                      <div className="d-flex align-items-center">
                        <div className="avatar-circle bg-success text-white me-3" style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem',
                          fontWeight: 'bold'
                        }}>
                          {currentUser?.profile?.firstName 
                            ? currentUser.profile.firstName.charAt(0).toUpperCase() 
                            : user?.displayName 
                              ? user.displayName.charAt(0).toUpperCase() 
                              : user?.email?.charAt(0).toUpperCase()
                          }
                        </div>
                        <div>
                          <div className="d-flex align-items-center mb-1">
                            <h6 className="mb-0 me-2">
                              {currentUser?.profile?.firstName && currentUser?.profile?.lastName
                                ? `${currentUser.profile.firstName} ${currentUser.profile.lastName}`
                                : user?.displayName || 'Artist'
                              }
                            </h6>
                            <span className="badge bg-success rounded-pill">Artist</span>
                          </div>
                          <p className="text-muted mb-0 small">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4 text-md-end">
                      <small className="text-muted">Manage your availability below</small>
                    </div>
                  </div>

                  {/* Availability Calendar */}
                  <AvailabilityCalendar 
                    artistId={user?.uid || ''} 
                    isEditable={true}
                  />
                </div>
              </div>
            )}

            {/* Admin Availability Management Tab Content */}
            {activeTab === 'availability' && userRole === 'admin' && (
              <AdminAvailabilityManager />
            )}

            {/* Admin Tab Content */}
            {activeTab === 'admin' && userRole === 'admin' && (
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0 pb-0">
                  <h5 className="card-title text-primary fw-bold">
                    <i className="fas fa-users-cog me-2"></i>
                    User Management
                  </h5>
                  <p className="text-muted small mb-0">
                    Manage user accounts, roles, and permissions
                  </p>
                </div>
                <div className="card-body">
                  {adminLoading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading users...</span>
                      </div>
                      <p className="mt-3 text-muted">Loading user data...</p>
                    </div>
                  ) : (
                    <UserManagement
                      users={adminUsers}
                      onUsersUpdated={handleAdminUsersUpdated}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Marketing Analytics Tab Content */}
            {activeTab === 'analytics' && userRole === 'admin' && (
              <MarketingAnalytics />
            )}

            {/* Stripe Management Tab Content */}
            {activeTab === 'stripe' && userRole === 'admin' && (
              <StripeManagement />
            )}

            {/* Marketing Workflows Tab Content */}
            {activeTab === 'workflows' && userRole === 'admin' && (
              <MarketingWorkflows />
            )}

            {/* Documents Tab Content */}
            {activeTab === 'documents' && (
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0 pb-0">
                  <h5 className="card-title text-primary fw-bold">
                    <i className="fas fa-file-pdf me-2"></i>
                    My Documents
                  </h5>
                  <p className="text-muted small mb-0">
                    View and download your health forms, consent documents, and appointment confirmations
                  </p>
                </div>
                <div className="card-body">
                  {user?.uid ? (
                    <ClientPDFManager 
                      clientId={user.uid}
                      className="mt-3"
                    />
                  ) : (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-3 text-muted">Loading your documents...</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
