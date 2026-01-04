'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, addDoc, Timestamp } from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAlertDialog } from '@/components/ui/alert-dialog';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Download, 
  Upload, 
  X, 
  Trash2, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Link2 
} from 'lucide-react';
import BookingWizard from './BookingWizard';

interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  artistId: string;
  artistName: string;
  serviceName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price: number;
  depositPaid: boolean;
  notes?: string;
  ghlContactId?: string;
  ghlAppointmentId?: string;
  createdAt: any;
}

export default function BookingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [calendars, setCalendars] = useState<Array<{id: string, name: string}>>([]);
  const [loadingCalendars, setLoadingCalendars] = useState(false);
  const { showAlert, showConfirm, AlertDialogComponent } = useAlertDialog();
  const [newAppointment, setNewAppointment] = useState({
    name: '',
    email: '',
    phone: '',
    calendarId: '',
    serviceName: '',
    date: '',
    time: '',
    duration: 180, // 3 hours in minutes
    notes: '',
    status: 'new' as const
  });
  
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
    notes: ''
  });

  useEffect(() => {
    fetchBookings();
    fetchGHLCalendars();
  }, [currentDate, viewMode]);

  // Also fetch calendars when create modal opens
  useEffect(() => {
    if (showCreateModal && calendars.length === 0) {
      fetchGHLCalendars();
    }
  }, [showCreateModal]);

  const fetchGHLCalendars = async () => {
    setLoadingCalendars(true);
    try {
      console.log('Fetching GHL calendars...');
      const response = await fetch('/api/calendars/list', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('GHL calendars response:', data);
        if (data.calendars && data.calendars.length > 0) {
          console.log('Setting calendars:', data.calendars);
          setCalendars(data.calendars);
        } else {
          console.warn('No calendars returned from API:', data.message || data.error || 'Unknown reason');
        }
      } else {
        console.error('Failed to fetch calendars:', response.status);
      }
    } catch (error) {
      console.error('Error fetching GHL calendars:', error);
    } finally {
      setLoadingCalendars(false);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const startDate = getViewStartDate();
      const endDate = getViewEndDate();
      let allBookings: Booking[] = [];

      // Fetch from the primary 'bookings' collection
      try {
        const bookingsRef = collection(getDb(), 'bookings');
        const q = query(
          bookingsRef,
          where('date', '>=', startDate.toISOString().split('T')[0]),
          where('date', '<=', endDate.toISOString().split('T')[0])
        );

        const snapshot = await getDocs(q);
        const bookingsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            clientName: data.clientName || 'Unknown Client',
            clientEmail: data.clientEmail || '',
            clientPhone: data.clientPhone || '',
            artistId: data.artistId || '',
            artistName: data.artistName || 'Unknown Artist',
            serviceName: data.serviceName || 'Unknown Service',
            date: data.date || '',
            time: data.time || '',
            status: data.status || 'pending',
            price: data.price || 0,
            depositPaid: data.depositPaid || false,
            notes: data.notes,
            ghlContactId: data.ghlContactId,
            ghlAppointmentId: data.ghlAppointmentId,
            createdAt: data.createdAt,
            _collection: 'bookings'
          } as Booking;
        });
        allBookings = [...bookingsData];
      } catch (e) {
        console.log('Error fetching from bookings collection:', e);
      }

      // Also fetch from the legacy 'appointments' collection
      try {
        const appointmentsRef = collection(getDb(), 'appointments');
        const appointmentsQuery = query(appointmentsRef);
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        
        const legacyBookings = appointmentsSnapshot.docs
          .map(doc => {
            const data = doc.data();
            const apptDate = data.scheduledDate || data.appointmentDate;
            if (!apptDate) return null;
            
            const formattedDate = typeof apptDate === 'string' ? apptDate : 
              apptDate.toDate ? apptDate.toDate().toISOString().split('T')[0] : null;
              
            if (!formattedDate || 
                formattedDate < startDate.toISOString().split('T')[0] || 
                formattedDate > endDate.toISOString().split('T')[0]) {
              return null;
            }
            
            return {
              id: doc.id,
              clientName: data.clientName || 'Unknown Client',
              clientEmail: data.clientEmail || '',
              clientPhone: data.clientPhone || '',
              artistId: data.artistId || '',
              artistName: data.artistId === 'victoria' ? 'Victoria Escobar' : (data.artistName || ''),
              serviceName: data.serviceName || '',
              date: formattedDate,
              time: data.scheduledTime || data.appointmentTime || '',
              status: data.status || 'pending',
              price: data.totalAmount || 0,
              depositPaid: data.depositAmount > 0,
              notes: data.specialRequests || '',
              createdAt: data.createdAt,
              _collection: 'appointments'
            } as Booking;
          })
          .filter(booking => booking !== null) as Booking[];
          
        allBookings = [...allBookings, ...legacyBookings];
      } catch (e) {
        console.log('Error fetching from appointments collection:', e);
      }

      console.log(`Displaying ${allBookings.length} bookings for date range ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
      setBookings(allBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      const errorMessage = document.createElement('div');
      errorMessage.className = 'alert alert-danger mt-3';
      errorMessage.innerHTML = `<strong>Error loading bookings:</strong> ${error instanceof Error ? error.message : 'Unknown error'}`;
      document.querySelector('.container-fluid')?.appendChild(errorMessage);
      setTimeout(() => errorMessage.remove(), 5000);
    } finally {
      setLoading(false);
    }
  };

  const getViewStartDate = () => {
    const date = new Date(currentDate);
    if (viewMode === 'month') {
      date.setDate(1);
    } else if (viewMode === 'week') {
      const day = date.getDay();
      date.setDate(date.getDate() - day);
    }
    return date;
  };

  const getViewEndDate = () => {
    const date = new Date(currentDate);
    if (viewMode === 'month') {
      date.setMonth(date.getMonth() + 1);
      date.setDate(0);
    } else if (viewMode === 'week') {
      const day = date.getDay();
      date.setDate(date.getDate() + (6 - day));
    }
    return date;
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getBookingsForDate = (day: number | null) => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings.filter(b => b.date === dateStr);
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleStatusChange = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      const bookingRef = doc(getDb(), 'bookings', bookingId);
      await updateDoc(bookingRef, { status: newStatus });
      
      // Sync with GHL
      await syncBookingWithGHL(bookingId, { status: newStatus });
      
      fetchBookings();
      setShowModal(false);
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Failed to update booking status');
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    const hasGHLAppointment = booking?.ghlAppointmentId;
    
    const confirmMessage = hasGHLAppointment 
      ? 'This will permanently delete the booking from both the website and GoHighLevel. This action cannot be undone.'
      : 'This will permanently delete the booking. This action cannot be undone.';
    
    const confirmed = await showConfirm({
      title: 'Delete Booking',
      description: confirmMessage,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive'
    });
    
    if (!confirmed) return;

    try {
      // Delete from GHL first if it exists
      if (hasGHLAppointment && booking.ghlAppointmentId) {
        console.log('Deleting from GHL:', booking.ghlAppointmentId);
        const ghlDeleted = await deleteGHLAppointment(booking.ghlAppointmentId);
        if (!ghlDeleted) {
          const continueAnyway = await showConfirm({
            title: 'GHL Deletion Failed',
            description: 'Failed to delete from GoHighLevel. Do you want to continue deleting from the website?',
            confirmText: 'Continue',
            cancelText: 'Cancel',
            variant: 'warning'
          });
          if (!continueAnyway) return;
        }
      }
      
      // Delete from website database
      console.log('Deleting from website database:', bookingId);
      await deleteDoc(doc(getDb(), 'bookings', bookingId));
      
      await showAlert({
        title: 'Booking Deleted',
        description: 'The booking has been successfully deleted.',
        confirmText: 'OK',
        variant: 'success'
      });
      fetchBookings();
      setShowModal(false);
    } catch (error) {
      console.error('Error deleting booking:', error);
      await showAlert({
        title: 'Error',
        description: `Failed to delete booking: ${error instanceof Error ? error.message : 'Unknown error'}`,
        confirmText: 'OK',
        variant: 'destructive'
      });
    }
  };

  const syncBookingWithGHL = async (bookingId: string, updates: Partial<Booking>) => {
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) return;

      const response = await fetch('/api/calendar/sync-ghl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          booking: { ...booking, ...updates },
          action: 'update'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to sync with GHL');
      }

      const result = await response.json();
      console.log('GHL sync successful:', result);
    } catch (error) {
      console.error('Error syncing with GHL:', error);
    }
  };

  const deleteGHLAppointment = async (appointmentId: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/calendar/sync-ghl', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to delete GHL appointment:', errorData);
        return false;
      }
      
      console.log('Successfully deleted from GHL');
      return true;
    } catch (error) {
      console.error('Error deleting GHL appointment:', error);
      return false;
    }
  };

  const syncAllBookingsWithGHL = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/calendar/sync-all-ghl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to sync all bookings');
      }

      const result = await response.json();
      
      if (result.total === 0) {
        alert('No bookings to sync. Create some bookings first!');
      } else if (result.failed > 0) {
        alert(`Synced ${result.synced} bookings. ${result.failed} failed.\n\nCheck console for details.`);
        console.error('Sync errors:', result.errors);
      } else {
        alert(`Successfully synced ${result.synced} bookings with GHL`);
      }
      
      fetchBookings();
    } catch (error) {
      console.error('Error syncing all bookings:', error);
      alert(`Failed to sync bookings with GHL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSyncing(false);
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
        notes: historicalBooking.notes + (isPastDate ? ' [Historical Entry]' : ''),
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
        notes: ''
      });
      setShowHistoricalModal(false);
      fetchBookings();
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

  const syncFromGHL = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/sync/ghl-to-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to sync from GHL');
      }

      const result = await response.json();
      
      const message = `Successfully synced from GHL!\n\nSynced: ${result.synced}\nDeleted: ${result.deleted || 0}\nFailed: ${result.failed}\nCalendars checked: ${result.calendars}`;
      alert(message);
      
      fetchBookings();
    } catch (error) {
      console.error('Error syncing from GHL:', error);
      alert(`Failed to sync from GHL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSyncing(false);
    }
  };

  const createGHLAppointment = async () => {
    setCreating(true);
    try {
      // Validate required fields
      if (!newAppointment.name || !newAppointment.email || !newAppointment.calendarId || !newAppointment.date || !newAppointment.time) {
        alert('Please fill in all required fields');
        return;
      }

      // Create start and end times
      const startDateTime = new Date(`${newAppointment.date}T${newAppointment.time}:00`);
      const endDateTime = new Date(startDateTime.getTime() + newAppointment.duration * 60000);

      const appointmentData = {
        name: newAppointment.name,
        email: newAppointment.email,
        phone: newAppointment.phone,
        calendarId: newAppointment.calendarId,
        serviceName: newAppointment.serviceName,
        title: newAppointment.serviceName || 'Appointment',
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        notes: newAppointment.notes,
        status: newAppointment.status
      };

      const response = await fetch('/api/appointments/create-ghl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Create appointment error:', errorData);
        throw new Error(errorData.error || 'Failed to create appointment');
      }

      const result = await response.json();
      
      alert('Appointment created successfully in GHL!');
      
      // Reset form
      setNewAppointment({
        name: '',
        email: '',
        phone: '',
        calendarId: '',
        serviceName: '',
        date: '',
        time: '',
        duration: 180,
        notes: '',
        status: 'new'
      });
      
      setShowCreateModal(false);
      fetchBookings();
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert(`Failed to create appointment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadgeColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-[#AD6269]" />
          Booking Calendar
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline"
            onClick={syncFromGHL}
            disabled={syncing}
            className="border-green-500 text-green-600 hover:bg-green-50"
          >
            {syncing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                Syncing...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Sync FROM GHL
              </>
            )}
          </Button>
          <Button 
            variant="outline"
            onClick={syncAllBookingsWithGHL}
            disabled={syncing}
            className="border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            {syncing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Syncing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Sync TO GHL
              </>
            )}
          </Button>
          <Button 
            onClick={() => setShowHistoricalModal(true)}
            className="bg-[#AD6269] hover:bg-[#9d5860] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Historical Booking
          </Button>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleToday}
            className="text-gray-600"
          >
            Today
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={handlePrevious} className="p-2">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleNext} className="p-2">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 flex-grow">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button 
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'month' 
                  ? 'bg-[#AD6269] text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
            <button 
              className={`px-4 py-2 text-sm font-medium transition-colors border-l border-gray-200 ${
                viewMode === 'week' 
                  ? 'bg-[#AD6269] text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
            <button 
              className={`px-4 py-2 text-sm font-medium transition-colors border-l border-gray-200 ${
                viewMode === 'day' 
                  ? 'bg-[#AD6269] text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setViewMode('day')}
            >
              Day
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#AD6269]"></div>
        </div>
      ) : viewMode === 'month' ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>
          {/* Calendar Body */}
          <div className="grid grid-cols-7">
            {(() => {
              const days = getDaysInMonth();
              return days.map((day, index) => {
                const dayBookings = getBookingsForDate(day);
                const isToday = day && 
                  day === new Date().getDate() && 
                  currentDate.getMonth() === new Date().getMonth() &&
                  currentDate.getFullYear() === new Date().getFullYear();

                return (
                  <div 
                    key={index} 
                    className={`min-h-[120px] border-b border-r border-gray-200 p-2 ${
                      !day ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                    } ${isToday ? 'bg-blue-50' : ''}`}
                  >
                    {day && (
                      <>
                        <div className={`text-sm font-medium mb-1 ${
                          isToday 
                            ? 'w-7 h-7 flex items-center justify-center rounded-full bg-[#AD6269] text-white' 
                            : 'text-gray-700'
                        }`}>
                          {day}
                        </div>
                        <div className="space-y-1">
                          {dayBookings.slice(0, 3).map(booking => (
                            <div
                              key={booking.id}
                              className={`${getStatusColor(booking.status)} text-white text-xs px-2 py-1 rounded cursor-pointer hover:opacity-90 transition-opacity truncate`}
                              onClick={() => handleBookingClick(booking)}
                              title={`${booking.time} - ${booking.clientName} - ${booking.serviceName}`}
                            >
                              <span className="font-semibold">{booking.time}</span>
                              <span className="ml-1">{booking.clientName}</span>
                            </div>
                          ))}
                          {dayBookings.length > 3 && (
                            <div 
                              className="text-xs text-gray-500 hover:text-[#AD6269] cursor-pointer text-center"
                              onClick={() => {
                                const firstBooking = dayBookings[3];
                                if (firstBooking) handleBookingClick(firstBooking);
                              }}
                            >
                              +{dayBookings.length - 3} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      ) : viewMode === 'week' ? (
        /* Week View */
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
            {(() => {
              const weekStart = new Date(currentDate);
              weekStart.setDate(weekStart.getDate() - weekStart.getDay());
              return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => {
                const date = new Date(weekStart);
                date.setDate(date.getDate() + i);
                const isToday = date.toDateString() === new Date().toDateString();
                return (
                  <div key={day} className={`py-3 text-center ${isToday ? 'bg-blue-100' : ''}`}>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{day}</div>
                    <div className={`text-lg font-bold ${isToday ? 'text-[#AD6269]' : 'text-gray-700'}`}>{date.getDate()}</div>
                  </div>
                );
              });
            })()}
          </div>
          <div className="grid grid-cols-7 min-h-[400px]">
            {(() => {
              const weekStart = new Date(currentDate);
              weekStart.setDate(weekStart.getDate() - weekStart.getDay());
              return [0, 1, 2, 3, 4, 5, 6].map(i => {
                const date = new Date(weekStart);
                date.setDate(date.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                const dayBookings = bookings.filter(b => b.date === dateStr);
                const isToday = date.toDateString() === new Date().toDateString();
                return (
                  <div key={i} className={`border-r border-gray-200 p-2 ${isToday ? 'bg-blue-50' : ''}`}>
                    <div className="space-y-2">
                      {dayBookings.map(booking => (
                        <div
                          key={booking.id}
                          className={`${getStatusColor(booking.status)} text-white text-xs px-2 py-2 rounded cursor-pointer hover:opacity-90 transition-opacity`}
                          onClick={() => handleBookingClick(booking)}
                        >
                          <div className="font-semibold">{booking.time}</div>
                          <div className="truncate">{booking.clientName}</div>
                          <div className="truncate text-white/80">{booking.serviceName}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      ) : (
        /* Day View */
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 p-4 text-center">
            <div className="text-lg font-bold text-gray-900">
              {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
          <div className="p-4">
            {(() => {
              const dateStr = currentDate.toISOString().split('T')[0];
              const dayBookings = bookings.filter(b => b.date === dateStr);
              if (dayBookings.length === 0) {
                return (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No bookings for this day</p>
                  </div>
                );
              }
              return (
                <div className="space-y-3">
                  {dayBookings.sort((a, b) => a.time.localeCompare(b.time)).map(booking => (
                    <div
                      key={booking.id}
                      className={`${getStatusColor(booking.status)} text-white p-4 rounded-lg cursor-pointer hover:opacity-90 transition-opacity`}
                      onClick={() => handleBookingClick(booking)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-lg font-bold">{booking.time}</div>
                          <div className="text-xl font-semibold">{booking.clientName}</div>
                          <div className="text-white/80">{booking.serviceName}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm uppercase font-medium bg-white/20 px-2 py-1 rounded">{booking.status}</div>
                          {booking.depositPaid && <div className="text-xs mt-1">Deposit Paid</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#AD6269]" />
                Booking Details
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Client Information</h4>
                  <div className="space-y-2">
                    <p className="text-gray-900"><span className="font-medium">Name:</span> {selectedBooking.clientName}</p>
                    <p className="text-gray-900"><span className="font-medium">Email:</span> {selectedBooking.clientEmail}</p>
                    <p className="text-gray-900"><span className="font-medium">Phone:</span> {selectedBooking.clientPhone}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Appointment Details</h4>
                  <div className="space-y-2">
                    <p className="text-gray-900"><span className="font-medium">Service:</span> {selectedBooking.serviceName}</p>
                    <p className="text-gray-900"><span className="font-medium">Artist:</span> {selectedBooking.artistName}</p>
                    <p className="text-gray-900"><span className="font-medium">Date:</span> {selectedBooking.date}</p>
                    <p className="text-gray-900"><span className="font-medium">Time:</span> {selectedBooking.time}</p>
                    <p className="text-gray-900"><span className="font-medium">Price:</span> ${selectedBooking.price}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Status</h4>
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(selectedBooking.status)}`}>
                    {selectedBooking.status === 'confirmed' && <CheckCircle className="w-4 h-4 mr-1" />}
                    {selectedBooking.status === 'pending' && <Clock className="w-4 h-4 mr-1" />}
                    {selectedBooking.status === 'cancelled' && <XCircle className="w-4 h-4 mr-1" />}
                    {selectedBooking.status.toUpperCase()}
                  </span>
                  {selectedBooking.depositPaid && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Deposit Paid
                    </span>
                  )}
                </div>
              </div>

              {selectedBooking.ghlContactId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center text-blue-700">
                    <Link2 className="w-5 h-5 mr-2" />
                    <span className="font-medium">Synced with GoHighLevel</span>
                    {selectedBooking.ghlAppointmentId && (
                      <span className="ml-2 text-blue-600">
                        (ID: {selectedBooking.ghlAppointmentId.substring(0, 8)}...)
                      </span>
                    )}
                  </div>
                </div>
              )}

              {selectedBooking.notes && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Notes</h4>
                  <p className="text-gray-600">{selectedBooking.notes}</p>
                </div>
              )}

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Update Status</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    className="px-4 py-2 border border-yellow-500 text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors font-medium text-sm"
                    onClick={() => handleStatusChange(selectedBooking.id, 'pending')}
                  >
                    Pending
                  </button>
                  <button
                    className="px-4 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium text-sm"
                    onClick={() => handleStatusChange(selectedBooking.id, 'confirmed')}
                  >
                    Confirmed
                  </button>
                  <button
                    className="px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm"
                    onClick={() => handleStatusChange(selectedBooking.id, 'completed')}
                  >
                    Completed
                  </button>
                  <button
                    className="px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm"
                    onClick={() => handleStatusChange(selectedBooking.id, 'cancelled')}
                  >
                    Cancelled
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <Button
                variant="outline"
                className="border-red-500 text-red-600 hover:bg-red-50"
                onClick={() => handleDeleteBooking(selectedBooking.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Booking
              </Button>
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Wizard */}
      <BookingWizard
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onBookingCreated={fetchBookings}
        calendars={calendars}
      />

      {/* Historical Booking Modal */}
      {showHistoricalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#AD6269]" />
                  Add Historical Booking
                </h3>
                <p className="text-sm text-gray-500 mt-1">Add a past appointment to your records</p>
              </div>
              <button 
                onClick={() => setShowHistoricalModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Client Info */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Client Information</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
                  <Input
                    value={historicalBooking.clientName}
                    onChange={(e) => setHistoricalBooking({...historicalBooking, clientName: e.target.value})}
                    placeholder="Enter client name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <Input
                      type="email"
                      value={historicalBooking.clientEmail}
                      onChange={(e) => setHistoricalBooking({...historicalBooking, clientEmail: e.target.value})}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <Input
                      type="tel"
                      value={historicalBooking.clientPhone}
                      onChange={(e) => setHistoricalBooking({...historicalBooking, clientPhone: e.target.value})}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* Appointment Info */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Appointment Details</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service *</label>
                  <select
                    value={historicalBooking.serviceName}
                    onChange={(e) => setHistoricalBooking({...historicalBooking, serviceName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269]"
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
                    <Input
                      type="date"
                      value={historicalBooking.date}
                      onChange={(e) => setHistoricalBooking({...historicalBooking, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <select
                      value={historicalBooking.time}
                      onChange={(e) => setHistoricalBooking({...historicalBooking, time: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269]"
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
                    <Input
                      type="number"
                      value={historicalBooking.price}
                      onChange={(e) => setHistoricalBooking({...historicalBooking, price: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={historicalBooking.status}
                      onChange={(e) => setHistoricalBooking({...historicalBooking, status: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269]"
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
                    id="depositPaid"
                    checked={historicalBooking.depositPaid}
                    onChange={(e) => setHistoricalBooking({...historicalBooking, depositPaid: e.target.checked})}
                    className="rounded border-gray-300 text-[#AD6269] focus:ring-[#AD6269]"
                  />
                  <label htmlFor="depositPaid" className="text-sm text-gray-700">Deposit was paid</label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={historicalBooking.notes}
                    onChange={(e) => setHistoricalBooking({...historicalBooking, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269]"
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>

              {/* Info Banner */}
              {historicalBooking.date && historicalBooking.date < new Date().toISOString().split('T')[0] && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                  <strong>Note:</strong> This is a past date. The booking will be saved to your records but will not sync to GHL calendar (GHL doesn't allow past appointments).
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
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
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Booking
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Alert Dialog */}
      {AlertDialogComponent}
    </div>
  );
}
