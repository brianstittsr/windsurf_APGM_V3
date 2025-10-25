'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  notes?: string;
  createdAt?: Date;
}

export default function BookingCalendarManager() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'pending' | 'completed' | 'cancelled'>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const appointmentsCollection = collection(db, 'appointments');
      const appointmentsSnapshot = await getDocs(appointmentsCollection);
      const appointmentsList = appointmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Appointment));
      setAppointments(appointmentsList.sort((a, b) => {
        const dateA = new Date(`${a.appointmentDate}T${a.appointmentTime}`);
        const dateB = new Date(`${b.appointmentDate}T${b.appointmentTime}`);
        return dateB.getTime() - dateA.getTime();
      }));
    } catch (error) {
      console.error('Error fetching appointments:', error);
      alert('Error fetching appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        status: newStatus,
        updatedAt: new Date()
      });
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Error updating appointment. Please try again.');
    }
  };

  const handleDeleteAppointment = async (appointmentId: string, clientName: string) => {
    if (!confirm(`Are you sure you want to delete the appointment for ${clientName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'appointments', appointmentId));
      alert('Appointment deleted successfully!');
      fetchAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Error deleting appointment. Please try again.');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed': return 'badge bg-success';
      case 'pending': return 'badge bg-warning';
      case 'completed': return 'badge bg-info';
      case 'cancelled': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const statusMatch = filterStatus === 'all' || apt.status === filterStatus;
    return statusMatch;
  });

  const upcomingAppointments = filteredAppointments.filter(apt => {
    const aptDate = new Date(`${apt.appointmentDate}T${apt.appointmentTime}`);
    return aptDate >= new Date();
  });

  const pastAppointments = filteredAppointments.filter(apt => {
    const aptDate = new Date(`${apt.appointmentDate}T${apt.appointmentTime}`);
    return aptDate < new Date();
  });

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h4><i className="fas fa-calendar-alt me-2"></i>Booking Calendar</h4>
        </div>
      </div>

      {/* Filter and Stats */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h6 className="card-title">Total Appointments</h6>
              <h3>{filteredAppointments.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h6 className="card-title">Upcoming</h6>
              <h3>{upcomingAppointments.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h6 className="card-title">Completed</h6>
              <h3>{filteredAppointments.filter(a => a.status === 'completed').length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-danger text-white">
            <div className="card-body">
              <h6 className="card-title">Cancelled</h6>
              <h3>{filteredAppointments.filter(a => a.status === 'cancelled').length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="btn-group" role="group">
            {(['all', 'confirmed', 'pending', 'completed', 'cancelled'] as const).map(status => (
              <button
                key={status}
                type="button"
                className={`btn ${filterStatus === status ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilterStatus(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-success text-white">
                <h5 className="card-title mb-0"><i className="fas fa-clock me-2"></i>Upcoming Appointments</h5>
              </div>
              <div className="card-body">
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
                      {upcomingAppointments.map((apt) => (
                        <tr key={apt.id}>
                          <td>
                            <strong>{new Date(`${apt.appointmentDate}T${apt.appointmentTime}`).toLocaleDateString()}</strong><br />
                            <small className="text-muted">{apt.appointmentTime}</small>
                          </td>
                          <td>
                            <strong>{apt.clientName}</strong><br />
                            <small className="text-muted">{apt.clientEmail}</small>
                          </td>
                          <td>{apt.serviceName}</td>
                          <td>
                            <select
                              className="form-select form-select-sm"
                              value={apt.status}
                              onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteAppointment(apt.id, apt.clientName)}
                              title="Delete Appointment"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-secondary text-white">
                <h5 className="card-title mb-0"><i className="fas fa-history me-2"></i>Past Appointments</h5>
              </div>
              <div className="card-body">
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
                      {pastAppointments.map((apt) => (
                        <tr key={apt.id} className="table-light">
                          <td>
                            <strong>{new Date(`${apt.appointmentDate}T${apt.appointmentTime}`).toLocaleDateString()}</strong><br />
                            <small className="text-muted">{apt.appointmentTime}</small>
                          </td>
                          <td>
                            <strong>{apt.clientName}</strong><br />
                            <small className="text-muted">{apt.clientEmail}</small>
                          </td>
                          <td>{apt.serviceName}</td>
                          <td>
                            <span className={getStatusBadgeClass(apt.status)}>
                              {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteAppointment(apt.id, apt.clientName)}
                              title="Delete Appointment"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {filteredAppointments.length === 0 && (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                <p className="text-muted">No appointments found.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
