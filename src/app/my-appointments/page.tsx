'use client';

import Link from 'next/link';
import AppointmentsList from '@/components/AppointmentsList';

export default function MyAppointments() {
  // For now, we'll use a demo client ID since we don't have auth implemented
  // In a real app, this would come from the authenticated user
  const demoClientId = 'temp-client-id';

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h2 mb-1">My Appointments</h1>
              <p className="text-muted mb-0">Manage your upcoming and past appointments</p>
            </div>
            <Link href="/book-now-custom" className="btn btn-primary">
              <i className="fas fa-plus me-2"></i>
              Book New Appointment
            </Link>
          </div>

          {/* Appointments List */}
          <AppointmentsList clientId={demoClientId} showTitle={false} />

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
  );
}
