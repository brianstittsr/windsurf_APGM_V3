'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, where } from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { Button } from '@/components/ui/button';
import { useAlertDialog } from '@/components/ui/alert-dialog';

interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  serviceName: string;
  appointmentDate?: string;
  appointmentTime?: string;
  date?: string;
  time?: string;
  artistName?: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  notes?: string;
  price?: number;
  depositPaid?: boolean;
  createdAt?: Date;
}

export default function BookingCalendarManager() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'pending' | 'completed' | 'cancelled'>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const { showAlert, showConfirm, AlertDialogComponent } = useAlertDialog();
  
  // Edit appointment modal state
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      // Try bookings collection first (new format)
      const bookingsCollection = collection(getDb(), 'bookings');
      const bookingsSnapshot = await getDocs(bookingsCollection);
      let appointmentsList = bookingsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          clientName: data.clientName,
          clientEmail: data.clientEmail,
          clientPhone: data.clientPhone,
          serviceName: data.serviceName,
          appointmentDate: data.date,
          appointmentTime: data.time,
          date: data.date,
          time: data.time,
          artistName: data.artistName,
          status: data.status,
          notes: data.notes,
          price: data.price,
          depositPaid: data.depositPaid,
          createdAt: data.createdAt
        } as Appointment;
      });

      // If no bookings found, try appointments collection (old format)
      if (appointmentsList.length === 0) {
        const appointmentsCollection = collection(getDb(), 'appointments');
        const appointmentsSnapshot = await getDocs(appointmentsCollection);
        appointmentsList = appointmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Appointment));
      }

      setAppointments(appointmentsList.sort((a, b) => {
        const dateA = new Date(`${a.appointmentDate || a.date}T${a.appointmentTime || a.time}`);
        const dateB = new Date(`${b.appointmentDate || b.date}T${b.appointmentTime || b.time}`);
        return dateB.getTime() - dateA.getTime();
      }));
    } catch (error) {
      console.error('Error fetching appointments:', error);
      showAlert({ title: 'Error', description: 'Error fetching appointments. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      // Try bookings collection first
      let appointmentRef = doc(getDb(), 'bookings', appointmentId);
      try {
        await updateDoc(appointmentRef, {
          status: newStatus,
          updatedAt: new Date()
        });
      } catch (e) {
        // If not found in bookings, try appointments
        appointmentRef = doc(getDb(), 'appointments', appointmentId);
        await updateDoc(appointmentRef, {
          status: newStatus,
          updatedAt: new Date()
        });
      }
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      showAlert({ title: 'Error', description: 'Error updating appointment. Please try again.', variant: 'destructive' });
    }
  };

  const handleDeleteAppointment = async (appointmentId: string, clientName: string) => {
    const confirmed = await showConfirm({ title: 'Delete Appointment', description: `Are you sure you want to delete the appointment for ${clientName}? This action cannot be undone.`, confirmText: 'Delete', variant: 'destructive' });
    if (!confirmed) return;

    try {
      // Try bookings collection first
      try {
        await deleteDoc(doc(getDb(), 'bookings', appointmentId));
      } catch (e) {
        // If not found in bookings, try appointments
        await deleteDoc(doc(getDb(), 'appointments', appointmentId));
      }
      await showAlert({ title: 'Success', description: 'Appointment deleted successfully!', variant: 'success' });
      fetchAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      await showAlert({ title: 'Error', description: 'Error deleting appointment. Please try again.', variant: 'destructive' });
    }
  };

  // Open edit modal
  const handleEditAppointment = (apt: Appointment) => {
    setEditingAppointment(apt);
    setEditDate(apt.appointmentDate || apt.date || '');
    setEditTime(apt.appointmentTime || apt.time || '');
  };

  // Save edited appointment and send email
  const handleSaveAppointmentTime = async () => {
    if (!editingAppointment) return;

    const confirmed = await showConfirm({
      title: 'Update Appointment Time',
      description: `Update appointment for ${editingAppointment.clientName} to ${editDate} at ${editTime}? An email notification will be sent to the client.`,
      confirmText: 'Update & Send Email',
      variant: 'default'
    });

    if (!confirmed) return;

    try {
      setSendingEmail(true);

      // Update in Firestore
      let appointmentRef = doc(getDb(), 'bookings', editingAppointment.id);
      try {
        await updateDoc(appointmentRef, {
          date: editDate,
          time: editTime,
          appointmentDate: editDate,
          appointmentTime: editTime,
          updatedAt: new Date()
        });
      } catch (e) {
        appointmentRef = doc(getDb(), 'appointments', editingAppointment.id);
        await updateDoc(appointmentRef, {
          appointmentDate: editDate,
          appointmentTime: editTime,
          updatedAt: new Date()
        });
      }

      // Send email notification
      const emailResponse = await fetch('/api/bookings/time-change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: editingAppointment.clientName,
          clientEmail: editingAppointment.clientEmail,
          serviceName: editingAppointment.serviceName,
          oldDate: editingAppointment.appointmentDate || editingAppointment.date,
          oldTime: editingAppointment.appointmentTime || editingAppointment.time,
          newDate: editDate,
          newTime: editTime
        })
      });

      if (!emailResponse.ok) {
        console.warn('Email notification may not have been sent');
      }

      await showAlert({
        title: 'Success',
        description: 'Appointment time updated and email notification sent to client!',
        variant: 'success'
      });

      setEditingAppointment(null);
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      await showAlert({
        title: 'Error',
        description: 'Error updating appointment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const statusMatch = filterStatus === 'all' || apt.status === filterStatus;
    return statusMatch;
  });

  const upcomingAppointments = filteredAppointments.filter(apt => {
    const aptDate = new Date(`${apt.appointmentDate || apt.date}T${apt.appointmentTime || apt.time}`);
    return aptDate >= new Date();
  });

  const pastAppointments = filteredAppointments.filter(apt => {
    const aptDate = new Date(`${apt.appointmentDate || apt.date}T${apt.appointmentTime || apt.time}`);
    return aptDate < new Date();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#AD6269]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
        <i className="fas fa-calendar-alt text-[#AD6269]"></i>Booking Calendar
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Appointments</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{filteredAppointments.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="fas fa-calendar text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Upcoming</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{upcomingAppointments.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <i className="fas fa-clock text-green-600 text-xl"></i>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{filteredAppointments.filter(a => a.status === 'completed').length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="fas fa-check-circle text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Cancelled</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{filteredAppointments.filter(a => a.status === 'cancelled').length}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <i className="fas fa-times-circle text-red-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden w-fit">
        {(['all', 'confirmed', 'pending', 'completed', 'cancelled'] as const).map(status => (
          <button
            key={status}
            type="button"
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              filterStatus === status 
                ? 'bg-[#AD6269] text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setFilterStatus(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-green-600">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <i className="fas fa-clock"></i>Upcoming Appointments
            </h3>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date & Time</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Client</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Service</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingAppointments.map((apt) => (
                    <tr key={apt.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium text-gray-900">{new Date(`${apt.appointmentDate || apt.date}T${apt.appointmentTime || apt.time}`).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">{apt.appointmentTime || apt.time}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium text-gray-900">{apt.clientName}</div>
                        <div className="text-xs text-gray-500">{apt.clientEmail}</div>
                        {apt.artistName && <div className="text-xs text-cyan-600">Artist: {apt.artistName}</div>}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-900">{apt.serviceName}</div>
                        {apt.price && <div className="text-xs text-green-600">${apt.price}</div>}
                        {apt.depositPaid && <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800 mt-1">Deposit Paid</span>}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          className="w-full h-9 px-2 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                          value={apt.status}
                          onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            onClick={() => handleEditAppointment(apt)}
                            title="Edit Appointment Time"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            onClick={() => handleDeleteAppointment(apt.id, apt.clientName)}
                            title="Delete Appointment"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-600">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <i className="fas fa-history"></i>Past Appointments
            </h3>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date & Time</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Client</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Service</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pastAppointments.map((apt) => (
                    <tr key={apt.id} className="border-b border-gray-100 bg-gray-50/50 hover:bg-gray-100 transition-colors">
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium text-gray-900">{new Date(`${apt.appointmentDate || apt.date}T${apt.appointmentTime || apt.time}`).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">{apt.appointmentTime || apt.time}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium text-gray-900">{apt.clientName}</div>
                        <div className="text-xs text-gray-500">{apt.clientEmail}</div>
                        {apt.artistName && <div className="text-xs text-cyan-600">Artist: {apt.artistName}</div>}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-900">{apt.serviceName}</div>
                        {apt.price && <div className="text-xs text-green-600">${apt.price}</div>}
                        {apt.depositPaid && <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800 mt-1">Deposit Paid</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(apt.status)}`}>
                          {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
      )}

      {filteredAppointments.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <i className="fas fa-calendar-times text-5xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">No appointments found.</p>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {editingAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200 bg-[#AD6269] rounded-t-xl">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <i className="fas fa-edit"></i>
                Edit Appointment Time
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Client</p>
                <p className="font-semibold text-gray-900">{editingAppointment.clientName}</p>
                <p className="text-sm text-gray-500">{editingAppointment.clientEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Service</p>
                <p className="font-semibold text-gray-900">{editingAppointment.serviceName}</p>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">New Appointment Time</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Date</label>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Time</label>
                    <select
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                    >
                      <option value="">Select time</option>
                      <option value="10:00">10:00 AM (Morning)</option>
                      <option value="13:00">1:00 PM (Afternoon)</option>
                      <option value="16:00">4:00 PM (Evening)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <i className="fas fa-envelope mr-2"></i>
                  An email notification will be sent to the client confirming the time change.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setEditingAppointment(null)}
                disabled={sendingEmail}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#AD6269] hover:bg-[#9d5860]"
                onClick={handleSaveAppointmentTime}
                disabled={!editDate || !editTime || sendingEmail}
              >
                {sendingEmail ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>
                    Save & Send Email
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {AlertDialogComponent}
    </div>
  );
}
