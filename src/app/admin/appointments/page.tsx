'use client';

import React, { useState, useEffect } from 'react';
import { DatabaseService } from '@/services/database';
import { Appointment, Service, User } from '@/types/database';
import { EmailService, AppointmentEmailData } from '@/services/emailService';
import AdminLayout from '@/components/AdminLayout';
import ClientOnly from '@/components/ClientOnly';

interface EditingAppointment {
  id: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  serviceId: string;
  specialRequests?: string;
}

export default function AppointmentsManagement() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingAppointment, setEditingAppointment] = useState<EditingAppointment | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [emailLoading, setEmailLoading] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonType, setReasonType] = useState<'cancel' | 'reschedule'>('cancel');
  const [pendingAppointmentId, setPendingAppointmentId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load appointments, services, and users
      const [appointmentsData, servicesData, usersData] = await Promise.all([
        DatabaseService.getAll<Appointment>('appointments'),
        DatabaseService.getAll<Service>('services'),
        DatabaseService.getAll<User>('users')
      ]);

      setAppointments(appointmentsData);
      setServices(servicesData);
      setUsers(usersData);
      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load appointments data');
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    // Handle special cases that require reasons
    if (newStatus === 'cancelled' || newStatus === 'rescheduled') {
      setReasonType(newStatus === 'cancelled' ? 'cancel' : 'reschedule');
      setPendingAppointmentId(appointmentId);
      setShowReasonModal(true);
      return;
    }

    await updateAppointmentWithNotification(appointmentId, { status: newStatus as 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled' });
  };

  const updateAppointmentWithNotification = async (
    appointmentId: string, 
    updates: Partial<Appointment>,
    reason?: string
  ) => {
    try {
      setEmailLoading(appointmentId);
      
      const appointment = appointments.find(apt => apt.id === appointmentId);
      if (!appointment) {
        throw new Error('Appointment not found');
      }

      const client = users.find(user => user.id === appointment.clientId);
      const service = services.find(svc => svc.id === appointment.serviceId);
      
      if (!client || !service) {
        throw new Error('Client or service not found');
      }

      // Update appointment in database
      await DatabaseService.update('appointments', appointmentId, {
        ...updates,
        updatedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any
      });

      // Prepare email data
      const emailData: AppointmentEmailData = {
        clientName: `${client.profile.firstName} ${client.profile.lastName}`,
        clientEmail: client.profile.email,
        serviceName: service.name,
        originalDate: appointment.scheduledDate,
        originalTime: appointment.scheduledTime,
        newDate: updates.scheduledDate || appointment.scheduledDate,
        newTime: updates.scheduledTime || appointment.scheduledTime,
        status: updates.status || appointment.status,
        adminName: 'Admin User',
        businessName: 'A Pretty Girl Matter',
        businessPhone: '(919) 441-0932',
        businessEmail: 'info@aprettygirl.com',
        cancellationReason: updates.status === 'cancelled' ? reason : undefined,
        rescheduleReason: updates.status === 'rescheduled' ? reason : undefined
      };

      // Send appropriate email notification
      let emailType: 'confirmation' | 'reschedule' | 'cancellation' | 'status_update';
      
      if (updates.status === 'cancelled') {
        emailType = 'cancellation';
      } else if (updates.status === 'confirmed') {
        emailType = 'confirmation';
      } else if (updates.scheduledDate || updates.scheduledTime) {
        emailType = 'reschedule';
      } else {
        emailType = 'status_update';
      }

      const emailSent = await EmailService.sendAppointmentNotification(emailType, emailData);
      
      await loadData(); // Refresh the list
      
      if (emailSent) {
        alert(`Appointment updated successfully and notification sent to ${client.profile.email}!`);
      } else {
        alert('Appointment updated successfully, but email notification failed to send.');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment');
    } finally {
      setEmailLoading(null);
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment({
      id: appointment.id,
      scheduledDate: appointment.scheduledDate,
      scheduledTime: appointment.scheduledTime,
      status: appointment.status,
      serviceId: appointment.serviceId,
      specialRequests: appointment.specialRequests || ''
    });
    setShowEditModal(true);
  };

  const saveAppointmentChanges = async () => {
    if (!editingAppointment) return;

    const originalAppointment = appointments.find(apt => apt.id === editingAppointment.id);
    if (!originalAppointment) return;

    const hasDateTimeChange = 
      originalAppointment.scheduledDate !== editingAppointment.scheduledDate ||
      originalAppointment.scheduledTime !== editingAppointment.scheduledTime;

    const updates: Partial<Appointment> = {
      scheduledDate: editingAppointment.scheduledDate,
      scheduledTime: editingAppointment.scheduledTime,
      status: editingAppointment.status,
      serviceId: editingAppointment.serviceId,
      specialRequests: editingAppointment.specialRequests
    };

    await updateAppointmentWithNotification(
      editingAppointment.id, 
      updates,
      hasDateTimeChange ? rescheduleReason : undefined
    );

    setShowEditModal(false);
    setEditingAppointment(null);
    setRescheduleReason('');
  };

  const handleReasonSubmit = async () => {
    if (!pendingAppointmentId) return;

    const reason = reasonType === 'cancel' ? cancellationReason : rescheduleReason;
    
    await updateAppointmentWithNotification(
      pendingAppointmentId,
      { status: reasonType === 'cancel' ? 'cancelled' : 'rescheduled' },
      reason
    );

    setShowReasonModal(false);
    setPendingAppointmentId(null);
    setCancellationReason('');
    setRescheduleReason('');
  };

  const getClientName = (clientId: string) => {
    const client = users.find(user => user.id === clientId);
    return client ? `${client.profile.firstName} ${client.profile.lastName}` : 'Unknown Client';
  };

  const getServiceName = (serviceId: string) => {
    const service = services.find(service => service.id === serviceId);
    return service ? service.name : 'Unknown Service';
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning';
      case 'confirmed': return 'bg-success';
      case 'completed': return 'bg-info';
      case 'cancelled': return 'bg-danger';
      case 'rescheduled': return 'bg-secondary';
      default: return 'bg-light text-dark';
    }
  };

  const filteredAppointments = appointments.filter(appointment => 
    filterStatus === 'all' || appointment.status === filterStatus
  );

  if (loading) {
    return (
      <AdminLayout title="Appointments Management">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading appointments...</span>
          </div>
          <p className="mt-2">Loading appointments...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <ClientOnly>
      <AdminLayout title="Appointments Management">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Appointments Management</h2>
            <button className="btn btn-primary" onClick={loadData}>
              <i className="fas fa-sync-alt me-2"></i>
              Refresh
            </button>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
              <button className="btn btn-outline-danger ms-2" onClick={loadData}>
                Try Again
              </button>
            </div>
          )}

          {/* Summary Cards */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h5 className="card-title">Total</h5>
                      <h2>{appointments.length}</h2>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-calendar fa-2x"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-warning text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h5 className="card-title">Pending</h5>
                      <h2>{appointments.filter(a => a.status === 'pending').length}</h2>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-clock fa-2x"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-success text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h5 className="card-title">Confirmed</h5>
                      <h2>{appointments.filter(a => a.status === 'confirmed').length}</h2>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-check fa-2x"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-info text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h5 className="card-title">Completed</h5>
                      <h2>{appointments.filter(a => a.status === 'completed').length}</h2>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-check-circle fa-2x"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <h5 className="mb-0">Filter Appointments</h5>
                </div>
                <div className="col-md-6">
                  <select 
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Appointments</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="rescheduled">Rescheduled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Appointments Table */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <span className="badge bg-primary me-2">{filteredAppointments.length}</span>
                {filterStatus === 'all' ? 'All Appointments' : `${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Appointments`}
              </h5>
            </div>
            <div className="card-body">
              {filteredAppointments.length === 0 ? (
                <p className="text-muted">No appointments found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Client</th>
                        <th>Service</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td>
                            <strong>{appointment.scheduledDate}</strong><br/>
                            <small className="text-muted">{appointment.scheduledTime}</small>
                          </td>
                          <td>{getClientName(appointment.clientId)}</td>
                          <td>{getServiceName(appointment.serviceId)}</td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(appointment.status)}`}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleEditAppointment(appointment)}
                                title="Edit Appointment"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <select 
                                className="form-select form-select-sm" 
                                style={{ minWidth: '120px' }}
                                value={appointment.status}
                                onChange={(e) => updateAppointmentStatus(appointment.id, e.target.value)}
                                disabled={emailLoading === appointment.id}
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="rescheduled">Rescheduled</option>
                              </select>
                              {emailLoading === appointment.id && (
                                <div className="spinner-border spinner-border-sm" role="status">
                                  <span className="visually-hidden">Sending...</span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Appointment Modal */}
      {showEditModal && editingAppointment && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Appointment</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingAppointment(null);
                    setRescheduleReason('');
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Date</label>
                    <input 
                      type="date" 
                      className="form-control"
                      value={editingAppointment.scheduledDate}
                      onChange={(e) => setEditingAppointment({
                        ...editingAppointment,
                        scheduledDate: e.target.value
                      })}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Time</label>
                    <input 
                      type="time" 
                      className="form-control"
                      value={editingAppointment.scheduledTime}
                      onChange={(e) => setEditingAppointment({
                        ...editingAppointment,
                        scheduledTime: e.target.value
                      })}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Service</label>
                    <select 
                      className="form-select"
                      value={editingAppointment.serviceId}
                      onChange={(e) => setEditingAppointment({
                        ...editingAppointment,
                        serviceId: e.target.value
                      })}
                    >
                      {services.map(service => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Status</label>
                    <select 
                      className="form-select"
                      value={editingAppointment.status}
                      onChange={(e) => setEditingAppointment({
                        ...editingAppointment,
                        status: e.target.value as 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
                      })}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="rescheduled">Rescheduled</option>
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Special Requests / Notes</label>
                  <textarea 
                    className="form-control" 
                    rows={3}
                    value={editingAppointment.specialRequests || ''}
                    onChange={(e) => setEditingAppointment({
                      ...editingAppointment,
                      specialRequests: e.target.value
                    })}
                    placeholder="Any special requests or notes for this appointment..."
                  />
                </div>
                {/* Show reschedule reason field if date/time changed */}
                {(() => {
                  const originalAppointment = appointments.find(apt => apt.id === editingAppointment.id);
                  const hasDateTimeChange = originalAppointment && (
                    originalAppointment.scheduledDate !== editingAppointment.scheduledDate ||
                    originalAppointment.scheduledTime !== editingAppointment.scheduledTime
                  );
                  return hasDateTimeChange ? (
                    <div className="mb-3">
                      <label className="form-label">Reason for Reschedule</label>
                      <textarea 
                        className="form-control" 
                        rows={2}
                        value={rescheduleReason}
                        onChange={(e) => setRescheduleReason(e.target.value)}
                        placeholder="Please provide a reason for rescheduling this appointment..."
                      />
                    </div>
                  ) : null;
                })()}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingAppointment(null);
                    setRescheduleReason('');
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={saveAppointmentChanges}
                  disabled={emailLoading !== null}
                >
                  {emailLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Saving & Sending Email...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reason Modal for Cancellation/Reschedule */}
      {showReasonModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {reasonType === 'cancel' ? 'Cancellation Reason' : 'Reschedule Reason'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowReasonModal(false);
                    setPendingAppointmentId(null);
                    setCancellationReason('');
                    setRescheduleReason('');
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">
                    Please provide a reason for {reasonType === 'cancel' ? 'cancelling' : 'rescheduling'} this appointment:
                  </label>
                  <textarea 
                    className="form-control" 
                    rows={3}
                    value={reasonType === 'cancel' ? cancellationReason : rescheduleReason}
                    onChange={(e) => {
                      if (reasonType === 'cancel') {
                        setCancellationReason(e.target.value);
                      } else {
                        setRescheduleReason(e.target.value);
                      }
                    }}
                    placeholder={`Enter reason for ${reasonType === 'cancel' ? 'cancellation' : 'rescheduling'}...`}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowReasonModal(false);
                    setPendingAppointmentId(null);
                    setCancellationReason('');
                    setRescheduleReason('');
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className={`btn btn-${reasonType === 'cancel' ? 'danger' : 'warning'}`}
                  onClick={handleReasonSubmit}
                  disabled={emailLoading !== null || (reasonType === 'cancel' ? !cancellationReason.trim() : !rescheduleReason.trim())}
                >
                  {emailLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Processing...
                    </>
                  ) : (
                    `Confirm ${reasonType === 'cancel' ? 'Cancellation' : 'Reschedule'}`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </AdminLayout>
    </ClientOnly>
  );
}
