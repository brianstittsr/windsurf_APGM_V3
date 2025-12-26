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
      {AlertDialogComponent}
    </div>
  );
}
