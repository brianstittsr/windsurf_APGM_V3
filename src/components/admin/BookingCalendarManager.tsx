'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc, query, where } from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { Button } from '@/components/ui/button';
import { useAlertDialog } from '@/components/ui/alert-dialog';
import BookingWizard from './BookingWizard';

interface BookingNote {
  id: string;
  text: string;
  timestamp: string;
  createdBy?: string;
}

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
  bookingNotes?: BookingNote[];
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
  
  // Booking wizard state
  const [showBookingWizard, setShowBookingWizard] = useState(false);
  const [calendars, setCalendars] = useState<Array<{id: string, name: string}>>([]);
  
  // Edit appointment modal state
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  
  // View/Edit booking modal state
  const [viewingBooking, setViewingBooking] = useState<Appointment | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [editedBooking, setEditedBooking] = useState<Partial<Appointment>>({});
  
  // Historical booking state
  const [showHistoricalModal, setShowHistoricalModal] = useState(false);
  const [creatingHistorical, setCreatingHistorical] = useState(false);
  const [historicalBooking, setHistoricalBooking] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    serviceName: 'Microblading',
    date: '',
    time: '10:00',
    price: 500,
    status: 'completed' as 'pending' | 'confirmed' | 'completed' | 'cancelled',
    depositPaid: true,
    bookingNotes: [] as Array<{ id: string; text: string; timestamp: string; createdBy?: string }>
  });
  const [historicalNoteText, setHistoricalNoteText] = useState('');

  useEffect(() => {
    fetchAppointments();
    fetchCalendars();
  }, []);

  const fetchCalendars = async () => {
    try {
      const response = await fetch('/api/calendars/list');
      if (response.ok) {
        const data = await response.json();
        if (data.calendars) {
          setCalendars(data.calendars);
        }
      }
    } catch (error) {
      console.error('Error fetching calendars:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      let appointmentsList: Appointment[] = [];

      // Fetch from bookings collection (new format)
      try {
        const bookingsCollection = collection(getDb(), 'bookings');
        const bookingsSnapshot = await getDocs(bookingsCollection);
        const bookingsList = bookingsSnapshot.docs.map(doc => {
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
            bookingNotes: data.bookingNotes || [],
            price: data.price,
            depositPaid: data.depositPaid,
            createdAt: data.createdAt,
            _collection: 'bookings'
          } as Appointment;
        });
        appointmentsList = [...bookingsList];
      } catch (e) {
        console.log('No bookings collection or error:', e);
      }

      // Also fetch from appointments collection (legacy format)
      try {
        const appointmentsCollection = collection(getDb(), 'appointments');
        const appointmentsSnapshot = await getDocs(appointmentsCollection);
        const legacyList = appointmentsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            clientName: data.clientName || 'Unknown Client',
            clientEmail: data.clientEmail,
            clientPhone: data.clientPhone,
            serviceName: data.serviceName,
            appointmentDate: data.scheduledDate || data.appointmentDate,
            appointmentTime: data.scheduledTime || data.appointmentTime,
            date: data.scheduledDate || data.date,
            time: data.scheduledTime || data.time,
            artistName: data.artistId === 'victoria' ? 'Victoria Escobar' : data.artistName,
            status: data.status,
            notes: data.specialRequests || data.notes,
            bookingNotes: data.bookingNotes || [],
            price: data.totalAmount || data.price,
            depositPaid: data.depositAmount > 0,
            createdAt: data.createdAt,
            _collection: 'appointments'
          } as Appointment;
        });
        appointmentsList = [...appointmentsList, ...legacyList];
      } catch (e) {
        console.log('No appointments collection or error:', e);
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

  // Open view booking modal
  const handleViewBooking = (apt: Appointment) => {
    setViewingBooking(apt);
    setIsEditMode(false);
    setNewNoteText('');
    setEditedBooking({
      clientName: apt.clientName,
      clientEmail: apt.clientEmail,
      clientPhone: apt.clientPhone,
      serviceName: apt.serviceName,
      price: apt.price,
      status: apt.status,
    });
  };

  // Close view booking modal
  const handleCloseViewBooking = () => {
    setViewingBooking(null);
    setIsEditMode(false);
    setNewNoteText('');
    setEditedBooking({});
  };

  // Add a new note with timestamp
  const handleAddNote = async () => {
    if (!viewingBooking || !newNoteText.trim()) return;

    setSavingNote(true);
    try {
      const newNote: BookingNote = {
        id: `note_${Date.now()}`,
        text: newNoteText.trim(),
        timestamp: new Date().toISOString(),
      };

      const updatedNotes = [...(viewingBooking.bookingNotes || []), newNote];

      // Update in Firestore
      let bookingRef = doc(getDb(), 'bookings', viewingBooking.id);
      try {
        await updateDoc(bookingRef, {
          bookingNotes: updatedNotes,
          updatedAt: new Date()
        });
      } catch (e) {
        bookingRef = doc(getDb(), 'appointments', viewingBooking.id);
        await updateDoc(bookingRef, {
          bookingNotes: updatedNotes,
          updatedAt: new Date()
        });
      }

      // Update local state
      setViewingBooking({ ...viewingBooking, bookingNotes: updatedNotes });
      setNewNoteText('');
      
      // Refresh appointments list
      fetchAppointments();
    } catch (error) {
      console.error('Error adding note:', error);
      await showAlert({ title: 'Error', description: 'Failed to add note. Please try again.', variant: 'destructive' });
    } finally {
      setSavingNote(false);
    }
  };

  // Delete a note
  const handleDeleteNote = async (noteId: string) => {
    if (!viewingBooking) return;

    const confirmed = await showConfirm({
      title: 'Delete Note',
      description: 'Are you sure you want to delete this note?',
      confirmText: 'Delete',
      variant: 'destructive'
    });

    if (!confirmed) return;

    try {
      const updatedNotes = (viewingBooking.bookingNotes || []).filter(note => note.id !== noteId);

      let bookingRef = doc(getDb(), 'bookings', viewingBooking.id);
      try {
        await updateDoc(bookingRef, {
          bookingNotes: updatedNotes,
          updatedAt: new Date()
        });
      } catch (e) {
        bookingRef = doc(getDb(), 'appointments', viewingBooking.id);
        await updateDoc(bookingRef, {
          bookingNotes: updatedNotes,
          updatedAt: new Date()
        });
      }

      setViewingBooking({ ...viewingBooking, bookingNotes: updatedNotes });
      fetchAppointments();
    } catch (error) {
      console.error('Error deleting note:', error);
      await showAlert({ title: 'Error', description: 'Failed to delete note. Please try again.', variant: 'destructive' });
    }
  };

  // Save edited booking details
  const handleSaveBookingDetails = async () => {
    if (!viewingBooking) return;

    setSavingNote(true);
    try {
      let bookingRef = doc(getDb(), 'bookings', viewingBooking.id);
      try {
        await updateDoc(bookingRef, {
          ...editedBooking,
          updatedAt: new Date()
        });
      } catch (e) {
        bookingRef = doc(getDb(), 'appointments', viewingBooking.id);
        await updateDoc(bookingRef, {
          ...editedBooking,
          updatedAt: new Date()
        });
      }

      await showAlert({ title: 'Success', description: 'Booking details updated successfully!', variant: 'success' });
      setViewingBooking({ ...viewingBooking, ...editedBooking });
      setIsEditMode(false);
      fetchAppointments();
    } catch (error) {
      console.error('Error saving booking:', error);
      await showAlert({ title: 'Error', description: 'Failed to save booking details. Please try again.', variant: 'destructive' });
    } finally {
      setSavingNote(false);
    }
  };

  // Format timestamp for display
  const formatNoteTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
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

  const createHistoricalBooking = async () => {
    if (!historicalBooking.clientName || !historicalBooking.date || !historicalBooking.serviceName) {
      await showAlert({
        title: 'Missing Information',
        description: 'Please fill in client name, date, and service.',
        variant: 'warning'
      });
      return;
    }

    setCreatingHistorical(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const isPastDate = historicalBooking.date < today;

      // Create booking directly in Firestore
      const bookingData = {
        clientName: historicalBooking.clientName,
        clientEmail: historicalBooking.clientEmail || '',
        clientPhone: historicalBooking.clientPhone || '',
        serviceName: historicalBooking.serviceName,
        date: historicalBooking.date,
        time: historicalBooking.time,
        artistId: 'victoria',
        artistName: 'Victoria Escobar',
        price: historicalBooking.price,
        status: historicalBooking.status,
        depositPaid: historicalBooking.depositPaid,
        bookingNotes: historicalBooking.bookingNotes,
        ghlContactId: null,
        ghlAppointmentId: null,
        ghlSkippedReason: isPastDate ? 'past_date' : null,
        isHistoricalEntry: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(getDb(), 'bookings'), bookingData);

      // If it's a future date, try to sync with GHL
      if (!isPastDate) {
        try {
          await fetch('/api/calendar/sync-ghl', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              booking: bookingData,
              collection: 'bookings'
            })
          });
        } catch (syncError) {
          console.log('GHL sync will be retried later:', syncError);
        }
      }

      await showAlert({
        title: 'Booking Created!',
        description: isPastDate 
          ? 'Historical booking added successfully. It will not sync to GHL calendar (past date).'
          : 'Booking created and will sync to GHL.',
        variant: 'success'
      });

      // Reset form
      setHistoricalBooking({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        serviceName: 'Microblading',
        date: '',
        time: '10:00',
        price: 500,
        status: 'completed',
        depositPaid: true,
        bookingNotes: []
      });
      setHistoricalNoteText('');
      setShowHistoricalModal(false);
      fetchAppointments();
    } catch (error) {
      console.error('Error creating historical booking:', error);
      await showAlert({
        title: 'Error',
        description: `Failed to create booking: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      });
    } finally {
      setCreatingHistorical(false);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <i className="fas fa-calendar-alt text-[#AD6269]"></i>Booking Calendar
        </h2>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowHistoricalModal(true)}
            variant="outline"
            className="border-[#AD6269] text-[#AD6269] hover:bg-[#AD6269]/10"
          >
            <i className="fas fa-history mr-2"></i>
            Add Historical Booking
          </Button>
          <Button 
            onClick={() => setShowBookingWizard(true)}
            className="bg-[#AD6269] hover:bg-[#9d5860] text-white"
          >
            <i className="fas fa-plus mr-2"></i>
            Create Booking
          </Button>
        </div>
      </div>

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
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            onClick={() => handleViewBooking(apt)}
                            title="View Booking Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
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
                        <div className="flex gap-2">
                          <button
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            onClick={() => handleViewBooking(apt)}
                            title="View Booking Details"
                          >
                            <i className="fas fa-eye"></i>
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

      {/* View/Edit Booking Modal */}
      {viewingBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-[#AD6269] rounded-t-xl flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <i className={`fas ${isEditMode ? 'fa-edit' : 'fa-eye'}`}></i>
                {isEditMode ? 'Edit Booking' : 'Booking Details'}
              </h3>
              <div className="flex items-center gap-2">
                {!isEditMode && (
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <i className="fas fa-edit mr-1"></i>Edit
                  </button>
                )}
                <button
                  onClick={handleCloseViewBooking}
                  className="p-1.5 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Booking Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <i className="fas fa-user text-[#AD6269]"></i>Client Information
                  </h4>
                  {isEditMode ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Name</label>
                        <input
                          type="text"
                          value={editedBooking.clientName || ''}
                          onChange={(e) => setEditedBooking({ ...editedBooking, clientName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Email</label>
                        <input
                          type="email"
                          value={editedBooking.clientEmail || ''}
                          onChange={(e) => setEditedBooking({ ...editedBooking, clientEmail: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={editedBooking.clientPhone || ''}
                          onChange={(e) => setEditedBooking({ ...editedBooking, clientPhone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p className="text-gray-900 font-medium">{viewingBooking.clientName}</p>
                      <p className="text-gray-600 text-sm flex items-center gap-2">
                        <i className="fas fa-envelope text-gray-400"></i>{viewingBooking.clientEmail}
                      </p>
                      {viewingBooking.clientPhone && (
                        <p className="text-gray-600 text-sm flex items-center gap-2">
                          <i className="fas fa-phone text-gray-400"></i>{viewingBooking.clientPhone}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Appointment Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <i className="fas fa-calendar-check text-[#AD6269]"></i>Appointment Details
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Service:</span>
                      <span className="text-gray-900 font-medium">{viewingBooking.serviceName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Date:</span>
                      <span className="text-gray-900 font-medium">
                        {new Date(`${viewingBooking.appointmentDate || viewingBooking.date}T${viewingBooking.appointmentTime || viewingBooking.time}`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Time:</span>
                      <span className="text-gray-900 font-medium">{viewingBooking.appointmentTime || viewingBooking.time}</span>
                    </div>
                    {viewingBooking.artistName && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Artist:</span>
                        <span className="text-cyan-600 font-medium">{viewingBooking.artistName}</span>
                      </div>
                    )}
                    {viewingBooking.price && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Price:</span>
                        <span className="text-green-600 font-medium">${viewingBooking.price}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Status:</span>
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(viewingBooking.status)}`}>
                        {viewingBooking.status.charAt(0).toUpperCase() + viewingBooking.status.slice(1)}
                      </span>
                    </div>
                    {viewingBooking.depositPaid && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Deposit:</span>
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <i className="fas fa-check mr-1"></i>Paid
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <i className="fas fa-sticky-note text-[#AD6269]"></i>Procedure Notes
                </h4>

                {/* Legacy Notes Field (if exists) */}
                {viewingBooking.notes && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-amber-800 mb-1">
                      <i className="fas fa-info-circle mr-1"></i>Original Note/Description:
                    </p>
                    <p className="text-gray-900 whitespace-pre-wrap">{viewingBooking.notes}</p>
                  </div>
                )}

                {/* Add New Note */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Add New Note</label>
                  <div className="flex gap-2">
                    <textarea
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Enter note about the procedure..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent resize-none"
                      rows={2}
                    />
                    <Button
                      onClick={handleAddNote}
                      disabled={!newNoteText.trim() || savingNote}
                      className="bg-[#AD6269] hover:bg-[#9d5860] self-end"
                    >
                      {savingNote ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-plus"></i>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    <i className="fas fa-info-circle mr-1"></i>
                    Notes are automatically timestamped when added.
                  </p>
                </div>

                {/* Notes List */}
                <div className="space-y-3">
                  {(viewingBooking.bookingNotes || []).length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <i className="fas fa-clipboard text-3xl mb-2 text-gray-300"></i>
                      <p>No notes yet. Add a note above to track procedure details.</p>
                    </div>
                  ) : (
                    [...(viewingBooking.bookingNotes || [])].reverse().map((note) => (
                      <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <p className="text-gray-900 whitespace-pre-wrap">{note.text}</p>
                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                              <i className="fas fa-clock"></i>
                              {formatNoteTimestamp(note.timestamp)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Note"
                          >
                            <i className="fas fa-trash-alt text-sm"></i>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              {isEditMode ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditMode(false);
                      setEditedBooking({
                        clientName: viewingBooking.clientName,
                        clientEmail: viewingBooking.clientEmail,
                        clientPhone: viewingBooking.clientPhone,
                        serviceName: viewingBooking.serviceName,
                        price: viewingBooking.price,
                        status: viewingBooking.status,
                      });
                    }}
                    disabled={savingNote}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-[#AD6269] hover:bg-[#9d5860]"
                    onClick={handleSaveBookingDetails}
                    disabled={savingNote}
                  >
                    {savingNote ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save mr-2"></i>
                        Save Changes
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleCloseViewBooking}
                >
                  Close
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {AlertDialogComponent}

      {/* Booking Wizard */}
      <BookingWizard
        isOpen={showBookingWizard}
        onClose={() => setShowBookingWizard(false)}
        onBookingCreated={fetchAppointments}
        calendars={calendars}
      />

      {/* Historical Booking Modal */}
      {showHistoricalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-[#AD6269] text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <i className="fas fa-history"></i>
                Add Historical Booking
              </h3>
              <button 
                onClick={() => setShowHistoricalModal(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Client Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <i className="fas fa-user text-[#AD6269]"></i>Client Information
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
                    <input
                      type="text"
                      value={historicalBooking.clientName}
                      onChange={(e) => setHistoricalBooking({...historicalBooking, clientName: e.target.value})}
                      placeholder="Enter client name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={historicalBooking.clientEmail}
                        onChange={(e) => setHistoricalBooking({...historicalBooking, clientEmail: e.target.value})}
                        placeholder="email@example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={historicalBooking.clientPhone}
                        onChange={(e) => setHistoricalBooking({...historicalBooking, clientPhone: e.target.value})}
                        placeholder="(555) 123-4567"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <i className="fas fa-calendar-check text-[#AD6269]"></i>Appointment Details
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service *</label>
                    <select
                      value={historicalBooking.serviceName}
                      onChange={(e) => setHistoricalBooking({...historicalBooking, serviceName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                    >
                      <option value="Microblading">Microblading - $500</option>
                      <option value="Powder Brows">Powder Brows - $550</option>
                      <option value="Combo Brows">Combo Brows - $600</option>
                      <option value="Lip Blush">Lip Blush - $450</option>
                      <option value="Eyeliner">Eyeliner - $400</option>
                      <option value="Touch Up">Touch Up - $200</option>
                      <option value="Consultation">Consultation - $0</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                      <input
                        type="date"
                        value={historicalBooking.date}
                        onChange={(e) => setHistoricalBooking({...historicalBooking, date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                      <select
                        value={historicalBooking.time}
                        onChange={(e) => setHistoricalBooking({...historicalBooking, time: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                      >
                        <option value="09:00">9:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="13:00">1:00 PM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="15:00">3:00 PM</option>
                        <option value="16:00">4:00 PM</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                      <input
                        type="number"
                        value={historicalBooking.price}
                        onChange={(e) => setHistoricalBooking({...historicalBooking, price: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={historicalBooking.status}
                        onChange={(e) => setHistoricalBooking({...historicalBooking, status: e.target.value as any})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                      >
                        <option value="completed">Completed</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="historicalDepositPaid"
                      checked={historicalBooking.depositPaid}
                      onChange={(e) => setHistoricalBooking({...historicalBooking, depositPaid: e.target.checked})}
                      className="rounded border-gray-300 text-[#AD6269] focus:ring-[#AD6269]"
                    />
                    <label htmlFor="historicalDepositPaid" className="text-sm text-gray-700">Deposit was paid</label>
                  </div>
                </div>
              </div>

              {/* Procedure Notes - styled like the Booking Details modal */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <i className="fas fa-sticky-note text-[#AD6269]"></i>Procedure Notes
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Add New Note</label>
                  <div className="flex gap-2">
                    <textarea
                      value={historicalNoteText}
                      onChange={(e) => setHistoricalNoteText(e.target.value)}
                      placeholder="Enter note about the procedure..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent resize-none"
                      rows={2}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (historicalNoteText.trim()) {
                          const newNote = {
                            id: `note-${Date.now()}`,
                            text: historicalNoteText.trim(),
                            timestamp: new Date().toISOString(),
                            createdBy: 'admin'
                          };
                          setHistoricalBooking({
                            ...historicalBooking,
                            bookingNotes: [...historicalBooking.bookingNotes, newNote]
                          });
                          setHistoricalNoteText('');
                        }
                      }}
                      disabled={!historicalNoteText.trim()}
                      className="bg-[#AD6269] hover:bg-[#9d5860] self-end"
                    >
                      <i className="fas fa-plus"></i>
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    <i className="fas fa-info-circle mr-1"></i>
                    Notes are automatically timestamped when added.
                  </p>
                </div>

                {/* Notes List */}
                {historicalBooking.bookingNotes.length > 0 && (
                  <div className="space-y-3">
                    {[...historicalBooking.bookingNotes].reverse().map((note) => (
                      <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <p className="text-gray-900 whitespace-pre-wrap">{note.text}</p>
                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                              <i className="fas fa-clock"></i>
                              {new Date(note.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setHistoricalBooking({
                                ...historicalBooking,
                                bookingNotes: historicalBooking.bookingNotes.filter(n => n.id !== note.id)
                              });
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Note"
                          >
                            <i className="fas fa-trash-alt text-sm"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Info Banner for past dates */}
              {historicalBooking.date && historicalBooking.date < new Date().toISOString().split('T')[0] && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-700">
                    <i className="fas fa-info-circle mr-2"></i>
                    <strong>Note:</strong> This is a past date. The booking will be saved to your records but will not sync to GHL calendar (GHL doesn't allow past appointments).
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <Button variant="outline" onClick={() => setShowHistoricalModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={createHistoricalBooking}
                disabled={creatingHistorical}
                className="bg-[#AD6269] hover:bg-[#9d5860]"
              >
                {creatingHistorical ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus mr-2"></i>
                    Add Booking
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
