'use client';

import { Appointment } from '@/types/database';

interface AppointmentCardProps {
  appointment: Appointment;
  showActions?: boolean;
}

export default function AppointmentCard({ appointment, showActions = true }: AppointmentCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      confirmed: 'bg-success',
      pending: 'bg-warning',
      completed: 'bg-primary',
      cancelled: 'bg-danger',
      rescheduled: 'bg-info'
    };
    
    return (
      <span className={`badge ${statusClasses[status as keyof typeof statusClasses] || 'bg-secondary'} text-white`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const statusClasses = {
      deposit_paid: 'bg-warning',
      paid_in_full: 'bg-success',
      pending: 'bg-secondary',
      refunded: 'bg-danger'
    };
    
    const statusLabels = {
      deposit_paid: 'Deposit Paid',
      paid_in_full: 'Paid in Full',
      pending: 'Payment Pending',
      refunded: 'Refunded'
    };
    
    return (
      <span className={`badge ${statusClasses[paymentStatus as keyof typeof statusClasses] || 'bg-secondary'} text-white`}>
        {statusLabels[paymentStatus as keyof typeof statusLabels] || paymentStatus}
      </span>
    );
  };

  const isUpcoming = (date: string, time: string) => {
    const appointmentDate = new Date(`${date} ${time}`);
    return appointmentDate > new Date();
  };

  const handleReschedule = () => {
    // TODO: Implement reschedule functionality
    alert('Reschedule functionality coming soon! Please contact us to reschedule.');
  };

  const handleCancel = () => {
    // TODO: Implement cancel functionality
    if (confirm('Are you sure you want to cancel this appointment?')) {
      alert('Cancel functionality coming soon! Please contact us to cancel.');
    }
  };

  return (
    <div className={`card h-100 border-0 shadow-sm ${isUpcoming(appointment.scheduledDate, appointment.scheduledTime) ? 'border-start border-primary border-3' : ''}`}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 className="card-title mb-1">{appointment.serviceName}</h5>
            <small className="text-muted">
              {isUpcoming(appointment.scheduledDate, appointment.scheduledTime) ? (
                <><i className="fas fa-clock me-1"></i>Upcoming</>
              ) : (
                <><i className="fas fa-history me-1"></i>Past</>
              )}
            </small>
          </div>
          <div className="text-end">
            {getStatusBadge(appointment.status)}
          </div>
        </div>

        <div className="mb-3">
          <div className="d-flex align-items-center mb-2">
            <i className="fas fa-calendar text-primary me-2"></i>
            <span>{formatDate(appointment.scheduledDate)}</span>
          </div>
          <div className="d-flex align-items-center mb-2">
            <i className="fas fa-clock text-primary me-2"></i>
            <span>{formatTime(appointment.scheduledTime)}</span>
          </div>
          <div className="d-flex align-items-center mb-2">
            <i className="fas fa-user text-primary me-2"></i>
            <span>Artist: {appointment.artistId}</span>
          </div>
        </div>

        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted">Total Amount:</span>
            <span className="fw-bold">${appointment.totalAmount.toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted">Deposit Paid:</span>
            <span className="text-success">${appointment.depositAmount.toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted">Remaining:</span>
            <span className="fw-bold text-warning">${appointment.remainingAmount.toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted">Payment Status:</span>
            {getPaymentStatusBadge(appointment.paymentStatus)}
          </div>
        </div>

        {appointment.specialRequests && (
          <div className="mb-3">
            <small className="text-muted d-block">Special Requests:</small>
            <small className="text-dark">{appointment.specialRequests}</small>
          </div>
        )}

        {showActions && isUpcoming(appointment.scheduledDate, appointment.scheduledTime) && appointment.status !== 'cancelled' && (
          <div className="d-grid gap-2">
            <div className="btn-group">
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={handleReschedule}
              >
                <i className="fas fa-edit me-1"></i>
                Reschedule
              </button>
              <button 
                className="btn btn-outline-danger btn-sm"
                onClick={handleCancel}
              >
                <i className="fas fa-times me-1"></i>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
