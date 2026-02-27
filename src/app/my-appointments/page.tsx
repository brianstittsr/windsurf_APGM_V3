'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import AppointmentsList from '@/components/AppointmentsList';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function MyAppointments() {
  const { user, userProfile, loading: authLoading, isAuthenticated } = useAuth();
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      setClientId(user.uid);
    }
  }, [isAuthenticated, user]);

  if (authLoading) {
    return (
      <>
        <Header />
        <div className="container py-5">
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Loading your appointments...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-5">
                  <i className="fas fa-lock text-muted mb-4" style={{ fontSize: '3rem' }}></i>
                  <h2 className="h4 mb-3">Sign In Required</h2>
                  <p className="text-muted mb-4">
                    Please sign in to view your appointments.
                  </p>
                  <div className="d-flex gap-3 justify-content-center">
                    <Link href="/login" className="btn btn-primary">
                      <i className="fas fa-sign-in-alt me-2"></i>
                      Sign In
                    </Link>
                    <Link href="/register" className="btn btn-outline-primary">
                      <i className="fas fa-user-plus me-2"></i>
                      Create Account
                    </Link>
                  </div>
                </div>
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
      <div className="container py-5" style={{ marginTop: '80px' }}>
        <div className="row">
          <div className="col-12">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="h2 mb-1">My Appointments</h1>
                <p className="text-muted mb-0">Manage your upcoming and past appointments</p>
                {userProfile?.profile && (
                  <p className="text-primary small mb-0">
                    <i className="fas fa-user me-1"></i>
                    {userProfile.profile.firstName} {userProfile.profile.lastName}
                  </p>
                )}
              </div>
              <Link href="/book-now-custom" className="btn btn-primary">
                <i className="fas fa-plus me-2"></i>
                Book New Appointment
              </Link>
            </div>

            {/* Appointments List */}
            {clientId ? (
              <AppointmentsList clientId={clientId} showTitle={false} />
            ) : (
              <div className="text-center py-4">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted">Loading appointments...</p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="row mt-5">
              <div className="col-12">
                <div className="card bg-light border-0">
                  <div className="card-body text-center py-4">
                    <h5 className="mb-3">Need Help?</h5>
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <Link href="/contact" className="btn btn-outline-primary w-100">
                          <i className="fas fa-phone me-2"></i>
                          Contact Us
                        </Link>
                      </div>
                      <div className="col-md-4 mb-3">
                        <Link href="/services" className="btn btn-outline-primary w-100">
                          <i className="fas fa-info-circle me-2"></i>
                          View Services
                        </Link>
                      </div>
                      <div className="col-md-4 mb-3">
                        <Link href="/book-now-custom" className="btn btn-primary w-100">
                          <i className="fas fa-plus me-2"></i>
                          Book Another
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
