'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { getDb } from '../../lib/firebase';

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

  useEffect(() => {
    fetchBookings();
    fetchGHLCalendars();
  }, [currentDate, viewMode]);

  const fetchGHLCalendars = async () => {
    try {
      const response = await fetch('/api/calendars/list', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.calendars) {
          setCalendars(data.calendars);
        }
      } else {
        console.error('Failed to fetch calendars:', response.status);
      }
    } catch (error) {
      console.error('Error fetching GHL calendars:', error);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Try fetching from the primary 'bookings' collection first
      const bookingsRef = collection(getDb(), 'bookings');
      const startDate = getViewStartDate();
      const endDate = getViewEndDate();

      const q = query(
        bookingsRef,
        where('date', '>=', startDate.toISOString().split('T')[0]),
        where('date', '<=', endDate.toISOString().split('T')[0])
      );

      const snapshot = await getDocs(q);
      let bookingsData = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // Ensure all required fields are present
        const booking: Booking = {
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
          createdAt: data.createdAt
        };
        
        return booking;
      });

      // If no bookings found in the primary collection, try the legacy 'appointments' collection
      if (bookingsData.length === 0) {
        console.log('No bookings found in primary collection, checking legacy appointments...');
        const appointmentsRef = collection(getDb(), 'appointments');
        
        // Convert date range query to work with legacy fields
        const appointmentsQuery = query(appointmentsRef);
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        
        // Map legacy appointments to booking format
        const legacyBookings = appointmentsSnapshot.docs
          .map(doc => {
            const data = doc.data();
            // Check if the appointment date falls within our date range
            const apptDate = data.scheduledDate || data.appointmentDate;
            if (!apptDate) return null;
            
            const formattedDate = typeof apptDate === 'string' ? apptDate : 
              apptDate.toDate ? apptDate.toDate().toISOString().split('T')[0] : null;
              
            // Skip if not in range
            if (!formattedDate || 
                formattedDate < startDate.toISOString().split('T')[0] || 
                formattedDate > endDate.toISOString().split('T')[0]) {
              return null;
            }
            
            // Create booking from appointment
            return {
              id: doc.id,
              clientName: data.clientName || '',
              clientEmail: data.clientEmail || '',
              clientPhone: data.clientPhone || '',
              artistId: data.artistId || '',
              artistName: data.artistName || '',
              serviceName: data.serviceName || '',
              date: formattedDate,
              time: data.scheduledTime || data.appointmentTime || '',
              status: data.status || 'pending',
              price: data.totalAmount || 0,
              depositPaid: (data.depositAmount > 0 && data.paymentStatus === 'deposit_paid') || false,
              notes: data.specialRequests || '',
              createdAt: data.createdAt
            } as Booking;
          })
          .filter(booking => booking !== null) as Booking[];
          
        if (legacyBookings.length > 0) {
          console.log(`Found ${legacyBookings.length} legacy appointments`);
          bookingsData = legacyBookings;
        }
      }

      console.log(`Displaying ${bookingsData.length} bookings for date range ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Show error message
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
    if (!confirm('Are you sure you want to delete this booking?')) return;

    try {
      await deleteDoc(doc(getDb(), 'bookings', bookingId));
      
      // Remove from GHL
      const booking = bookings.find(b => b.id === bookingId);
      if (booking?.ghlAppointmentId) {
        await deleteGHLAppointment(booking.ghlAppointmentId);
      }
      
      fetchBookings();
      setShowModal(false);
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Failed to delete booking');
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

  const deleteGHLAppointment = async (appointmentId: string) => {
    try {
      await fetch('/api/calendar/sync-ghl', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId })
      });
    } catch (error) {
      console.error('Error deleting GHL appointment:', error);
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
      
      alert(`Successfully synced ${result.synced} appointments from GHL!\n\nCalendars checked: ${result.calendars}\nFailed: ${result.failed}`);
      
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
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return 'check-circle';
      case 'pending': return 'clock';
      case 'completed': return 'check-all';
      case 'cancelled': return 'x-circle';
      default: return 'circle';
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">
          <i className="bi bi-calendar3 me-2"></i>
          Booking Calendar
        </h2>
        <div>
          <button 
            className="btn btn-info me-2"
            onClick={() => setShowCreateModal(true)}
            title="Create new appointment in GHL"
          >
            <i className="bi bi-plus-circle me-2"></i>
            Create Appointment
          </button>
          <button 
            className="btn btn-success me-2"
            onClick={syncFromGHL}
            disabled={syncing}
            title="Import appointments from GHL to website"
          >
            {syncing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Syncing...
              </>
            ) : (
              <>
                <i className="bi bi-download me-2"></i>
                Sync FROM GHL
              </>
            )}
          </button>
          <button 
            className="btn btn-primary"
            onClick={syncAllBookingsWithGHL}
            disabled={syncing}
            title="Push website bookings to GHL"
          >
            {syncing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Syncing...
              </>
            ) : (
              <>
                <i className="bi bi-upload me-2"></i>
                Sync TO GHL
              </>
            )}
          </button>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white border rounded mb-3 p-3">
        <div className="row align-items-center">
          <div className="col-auto">
            <button className="btn btn-outline-secondary btn-sm" onClick={handleToday}>
              Today
            </button>
          </div>
          <div className="col-auto">
            <div className="btn-group btn-group-sm" role="group">
              <button className="btn btn-outline-secondary" onClick={handlePrevious}>
                <i className="bi bi-chevron-left"></i>
              </button>
              <button className="btn btn-outline-secondary" onClick={handleNext}>
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
          <div className="col">
            <h4 className="mb-0">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h4>
          </div>
          <div className="col-auto">
            <div className="btn-group btn-group-sm" role="group">
              <button 
                className={`btn ${viewMode === 'month' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setViewMode('month')}
              >
                Month
              </button>
              <button 
                className={`btn ${viewMode === 'week' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setViewMode('week')}
              >
                Week
              </button>
              <button 
                className={`btn ${viewMode === 'day' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setViewMode('day')}
              >
                Day
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="bg-white border rounded">
          <table className="table table-bordered mb-0 calendar-table">
            <thead>
              <tr className="bg-light">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                  <th key={day} className="text-center py-3 fw-semibold text-uppercase" style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(() => {
                const days = getDaysInMonth();
                const weeks = [];
                for (let i = 0; i < days.length; i += 7) {
                  weeks.push(days.slice(i, i + 7));
                }
                return weeks.map((week, weekIndex) => (
                  <tr key={weekIndex}>
                    {week.map((day, dayIndex) => {
                      const dayBookings = getBookingsForDate(day);
                      const isToday = day && 
                        day === new Date().getDate() && 
                        currentDate.getMonth() === new Date().getMonth() &&
                        currentDate.getFullYear() === new Date().getFullYear();

                      return (
                        <td 
                          key={dayIndex} 
                          className={`calendar-cell ${!day ? 'bg-light' : ''} ${isToday ? 'today-cell' : ''}`}
                          style={{ 
                            height: '140px', 
                            verticalAlign: 'top',
                            padding: '8px',
                            position: 'relative'
                          }}
                        >
                          {day && (
                            <>
                              <div className={`calendar-date ${isToday ? 'today-date' : ''}`}>
                                {day}
                              </div>
                              <div className="bookings-container" style={{ marginTop: '4px' }}>
                                {dayBookings.slice(0, 3).map(booking => (
                                  <div
                                    key={booking.id}
                                    className={`booking-pill bg-${getStatusColor(booking.status)}`}
                                    onClick={() => handleBookingClick(booking)}
                                    title={`${booking.time} - ${booking.clientName} - ${booking.serviceName}`}
                                  >
                                    <span className="booking-time">{booking.time}</span>
                                    <span className="booking-name">{booking.clientName}</span>
                                  </div>
                                ))}
                                {dayBookings.length > 3 && (
                                  <div className="more-bookings" onClick={() => {
                                    const firstBooking = dayBookings[3];
                                    if (firstBooking) handleBookingClick(firstBooking);
                                  }}>
                                    +{dayBookings.length - 3} more
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      )}

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-calendar-event me-2"></i>
                  Booking Details
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <h6>Client Information</h6>
                    <p className="mb-1"><strong>Name:</strong> {selectedBooking.clientName}</p>
                    <p className="mb-1"><strong>Email:</strong> {selectedBooking.clientEmail}</p>
                    <p className="mb-1"><strong>Phone:</strong> {selectedBooking.clientPhone}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Appointment Details</h6>
                    <p className="mb-1"><strong>Service:</strong> {selectedBooking.serviceName}</p>
                    <p className="mb-1"><strong>Artist:</strong> {selectedBooking.artistName}</p>
                    <p className="mb-1"><strong>Date:</strong> {selectedBooking.date}</p>
                    <p className="mb-1"><strong>Time:</strong> {selectedBooking.time}</p>
                    <p className="mb-1"><strong>Price:</strong> ${selectedBooking.price}</p>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-12">
                    <h6>Status</h6>
                    <span className={`badge bg-${getStatusColor(selectedBooking.status)} fs-6`}>
                      <i className={`bi bi-${getStatusIcon(selectedBooking.status)} me-2`}></i>
                      {selectedBooking.status.toUpperCase()}
                    </span>
                    {selectedBooking.depositPaid && (
                      <span className="badge bg-success ms-2 fs-6">
                        <i className="bi bi-cash me-2"></i>
                        Deposit Paid
                      </span>
                    )}
                  </div>
                </div>

                {selectedBooking.ghlContactId && (
                  <div className="alert alert-info">
                    <i className="bi bi-link-45deg me-2"></i>
                    Synced with GoHighLevel
                    {selectedBooking.ghlAppointmentId && (
                      <span className="ms-2">
                        (Appointment ID: {selectedBooking.ghlAppointmentId.substring(0, 8)}...)
                      </span>
                    )}
                  </div>
                )}

                {selectedBooking.notes && (
                  <div className="mb-3">
                    <h6>Notes</h6>
                    <p className="text-muted">{selectedBooking.notes}</p>
                  </div>
                )}

                <div className="mb-3">
                  <h6>Update Status</h6>
                  <div className="btn-group w-100" role="group">
                    <button
                      className="btn btn-outline-warning"
                      onClick={() => handleStatusChange(selectedBooking.id, 'pending')}
                    >
                      Pending
                    </button>
                    <button
                      className="btn btn-outline-success"
                      onClick={() => handleStatusChange(selectedBooking.id, 'confirmed')}
                    >
                      Confirmed
                    </button>
                    <button
                      className="btn btn-outline-info"
                      onClick={() => handleStatusChange(selectedBooking.id, 'completed')}
                    >
                      Completed
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => handleStatusChange(selectedBooking.id, 'cancelled')}
                    >
                      Cancelled
                    </button>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleDeleteBooking(selectedBooking.id)}
                >
                  <i className="bi bi-trash me-2"></i>
                  Delete Booking
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Appointment Modal */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-plus-circle me-2"></i>
                  Create New Appointment in GHL
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Client Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newAppointment.name}
                      onChange={(e) => setNewAppointment({...newAppointment, name: e.target.value})}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={newAppointment.email}
                      onChange={(e) => setNewAppointment({...newAppointment, email: e.target.value})}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={newAppointment.phone}
                      onChange={(e) => setNewAppointment({...newAppointment, phone: e.target.value})}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Calendar *</label>
                    <select
                      className="form-select"
                      value={newAppointment.calendarId}
                      onChange={(e) => setNewAppointment({...newAppointment, calendarId: e.target.value})}
                    >
                      <option value="">Select Calendar</option>
                      {calendars.map(cal => (
                        <option key={cal.id} value={cal.id}>{cal.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-12">
                    <label className="form-label">Service Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newAppointment.serviceName}
                      onChange={(e) => setNewAppointment({...newAppointment, serviceName: e.target.value})}
                      placeholder="Microblading, Lip Blush, etc."
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={newAppointment.date}
                      onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Time *</label>
                    <input
                      type="time"
                      className="form-control"
                      value={newAppointment.time}
                      onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Duration (minutes)</label>
                    <select
                      className="form-select"
                      value={newAppointment.duration}
                      onChange={(e) => setNewAppointment({...newAppointment, duration: parseInt(e.target.value)})}
                    >
                      <option value="60">1 hour</option>
                      <option value="90">1.5 hours</option>
                      <option value="120">2 hours</option>
                      <option value="150">2.5 hours</option>
                      <option value="180">3 hours</option>
                      <option value="210">3.5 hours</option>
                      <option value="240">4 hours</option>
                    </select>
                  </div>
                  <div className="col-md-12">
                    <label className="form-label">Notes</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={newAppointment.notes}
                      onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                      placeholder="Any additional notes..."
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={createGHLAppointment}
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Create Appointment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .calendar-table {
          table-layout: fixed;
        }
        .calendar-table th {
          border: 1px solid #dee2e6;
          font-weight: 600;
        }
        .calendar-cell {
          border: 1px solid #dee2e6 !important;
          background-color: #fff;
        }
        .calendar-cell:hover {
          background-color: #f8f9fa;
        }
        .today-cell {
          background-color: #e3f2fd !important;
        }
        .calendar-date {
          font-size: 0.875rem;
          font-weight: 600;
          color: #495057;
          margin-bottom: 4px;
        }
        .today-date {
          display: inline-block;
          background-color: #0d6efd;
          color: white;
          width: 28px;
          height: 28px;
          line-height: 28px;
          text-align: center;
          border-radius: 50%;
        }
        .bookings-container {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .booking-pill {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: opacity 0.2s;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .booking-pill:hover {
          opacity: 0.85;
          transform: translateY(-1px);
        }
        .booking-time {
          font-weight: 600;
          flex-shrink: 0;
        }
        .booking-name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .more-bookings {
          font-size: 0.75rem;
          color: #6c757d;
          cursor: pointer;
          padding: 2px 4px;
          text-align: center;
          font-weight: 500;
        }
        .more-bookings:hover {
          color: #0d6efd;
          text-decoration: underline;
        }
        .bg-warning {
          background-color: #ffc107 !important;
        }
        .bg-success {
          background-color: #198754 !important;
        }
        .bg-info {
          background-color: #0dcaf0 !important;
        }
        .bg-danger {
          background-color: #dc3545 !important;
        }
      `}</style>
    </div>
  );
}
