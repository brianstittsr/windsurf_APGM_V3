'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppointmentService } from '@/services/database';
import { Appointment } from '@/types/database';
import AppointmentCard from './AppointmentCard';

interface AppointmentsListProps {
  clientId: string;
  showTitle?: boolean;
  maxItems?: number;
}

export default function AppointmentsList({ clientId, showTitle = true, maxItems }: AppointmentsListProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!clientId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching appointments for clientId:', clientId);
        
        const appointmentsData = await AppointmentService.getAppointmentsByClient(clientId);
        console.log('Appointments fetched:', appointmentsData?.length || 0);
        
        // Sort appointments by date (upcoming first)
        const sortedAppointments = (appointmentsData || []).sort((a, b) => {
          const dateA = new Date(`${a.scheduledDate} ${a.scheduledTime}`);
          const dateB = new Date(`${b.scheduledDate} ${b.scheduledTime}`);
          return dateA.getTime() - dateB.getTime();
        });
        
        // Limit items if maxItems is specified
        const limitedAppointments = maxItems ? sortedAppointments.slice(0, maxItems) : sortedAppointments;
        
        setAppointments(limitedAppointments);
      } catch (err: any) {
        console.error('Error fetching appointments:', err);
        // Handle permission errors gracefully
        if (err?.code === 'permission-denied' || err?.message?.includes('permission')) {
          setError('Unable to access appointments. Please ensure you are signed in.');
        } else {
          setError('Failed to load appointments. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [clientId, maxItems]);

  if (loading) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mb-0">Loading your appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-0 shadow-sm border-start border-danger border-3">
        <div className="card-body py-4">
          <div className="d-flex align-items-center">
            <i className="fas fa-exclamation-triangle text-danger me-3" style={{ fontSize: '2rem' }}></i>
            <div>
              <h5 className="mb-1 text-danger">Unable to Load Appointments</h5>
              <p className="text-muted mb-2">{error}</p>
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={() => window.location.reload()}
              >
                <i className="fas fa-redo me-2"></i>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <div className="mb-4">
            <i className="fas fa-calendar-plus text-primary" style={{ fontSize: '4rem', opacity: 0.5 }}></i>
          </div>
          <h4 className="mb-2">No Appointments Yet</h4>
          <p className="text-muted mb-4">
            You don't have any appointments scheduled. Book your first appointment to get started!
          </p>
          <Link href="/book-now-custom" className="btn btn-primary">
            <i className="fas fa-plus me-2"></i>
            Book Your First Appointment
          </Link>
        </div>
      </div>
    );
  }

  // Separate upcoming and past appointments
  const now = new Date();
  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(`${apt.scheduledDate} ${apt.scheduledTime}`);
    return aptDate >= now;
  });
  const pastAppointments = appointments.filter(apt => {
    const aptDate = new Date(`${apt.scheduledDate} ${apt.scheduledTime}`);
    return aptDate < now;
  });

  return (
    <div>
      {showTitle && (
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0">
            {maxItems ? 'Recent Appointments' : 'All Appointments'}
            <span className="badge bg-primary ms-2">{appointments.length}</span>
          </h4>
        </div>
      )}

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <div className="mb-4">
          <h5 className="text-success mb-3">
            <i className="fas fa-clock me-2"></i>
            Upcoming Appointments
            <span className="badge bg-success ms-2">{upcomingAppointments.length}</span>
          </h5>
          <div className="row">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="col-lg-6 mb-4">
                <AppointmentCard appointment={appointment} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <div>
          <h5 className="text-muted mb-3">
            <i className="fas fa-history me-2"></i>
            Past Appointments
            <span className="badge bg-secondary ms-2">{pastAppointments.length}</span>
          </h5>
          <div className="row">
            {pastAppointments.map((appointment) => (
              <div key={appointment.id} className="col-lg-6 mb-4">
                <AppointmentCard appointment={appointment} showActions={false} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
