'use client';

import { useState, useEffect } from 'react';
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
      try {
        setLoading(true);
        const appointmentsData = await AppointmentService.getAppointmentsByClient(clientId);
        
        // Sort appointments by date (upcoming first)
        const sortedAppointments = appointmentsData.sort((a, b) => {
          const dateA = new Date(`${a.scheduledDate} ${a.scheduledTime}`);
          const dateB = new Date(`${b.scheduledDate} ${b.scheduledTime}`);
          return dateA.getTime() - dateB.getTime();
        });
        
        // Limit items if maxItems is specified
        const limitedAppointments = maxItems ? sortedAppointments.slice(0, maxItems) : sortedAppointments;
        
        setAppointments(limitedAppointments);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load appointments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [clientId, maxItems]);

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading appointments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <i className="fas fa-exclamation-triangle me-2"></i>
        {error}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-4">
        <i className="fas fa-calendar-alt fa-3x text-muted mb-3"></i>
        <h5>No Appointments Found</h5>
        <p className="text-muted">You don't have any appointments scheduled yet.</p>
      </div>
    );
  }

  return (
    <div>
      {showTitle && (
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>
            {maxItems ? 'Recent Appointments' : 'All Appointments'}
            <span className="badge bg-primary ms-2">{appointments.length}</span>
          </h4>
        </div>
      )}
      
      <div className="row">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="col-lg-6 mb-4">
            <AppointmentCard appointment={appointment} />
          </div>
        ))}
      </div>
    </div>
  );
}
