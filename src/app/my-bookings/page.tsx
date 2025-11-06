'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from '@/hooks/useAuthState';
import { getDb } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/common/Modal';
import { BookingForm } from '@/components/BookingForm';
import { FiCalendar, FiClock, FiDollarSign, FiEdit, FiTrash, FiCheck, FiX } from 'react-icons/fi';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  artistId: string;
  artistName: string;
  serviceName: string;
  serviceId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price: number;
  depositPaid: boolean;
  notes?: string;
  createdAt?: Timestamp;
  ghlContactId?: string;
  ghlAppointmentId?: string;
  lastSyncedAt?: string;
}

export default function MyBookingsPage() {
  const { user, loading: authLoading } = useAuthState();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const db = getDb();
        const bookingsRef = collection(db, 'bookings');
        const q = query(bookingsRef, where('clientEmail', '==', user.email));
        
        const querySnapshot = await getDocs(q);
        const fetchedBookings: Booking[] = [];
        
        querySnapshot.forEach((doc) => {
          fetchedBookings.push({ id: doc.id, ...doc.data() } as Booking);
        });
        
        // Sort bookings by date (newest first)
        fetchedBookings.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateB.getTime() - dateA.getTime();
        });
        
        setBookings(fetchedBookings);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load your bookings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchUserBookings();
    }
  }, [user, authLoading]);

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    
    try {
      const db = getDb();
      const bookingRef = doc(db, 'bookings', selectedBooking.id);
      
      // Update the booking status to cancelled
      await updateDoc(bookingRef, {
        status: 'cancelled',
        cancellationReason: cancellationReason || 'No reason provided',
        updatedAt: new Date().toISOString(),
      });
      
      // Update the local state
      setBookings(bookings.map(booking => 
        booking.id === selectedBooking.id 
          ? { ...booking, status: 'cancelled' } 
          : booking
      ));
      
      // Close the modal
      setShowCancelModal(false);
      setCancellationReason('');
      setSelectedBooking(null);
      
      // Sync with GHL if applicable
      if (selectedBooking.ghlAppointmentId) {
        await fetch('/api/calendar/sync-ghl', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: selectedBooking.id,
            booking: { ...selectedBooking, status: 'cancelled' },
            action: 'update'
          })
        });
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel your booking. Please try again later.');
    }
  };

  const isCancellable = (booking: Booking) => {
    // Booking can be cancelled if it's pending or confirmed
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return false;
    }
    
    // Cannot cancel within 24 hours of appointment
    const appointmentDate = new Date(`${booking.date}T${booking.time}`);
    const now = new Date();
    const hoursDifference = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return hoursDifference > 24;
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="mb-4">Please log in to view your bookings.</p>
          <Link href="/login" 
                className="inline-block bg-pink-600 text-white px-6 py-2 rounded hover:bg-pink-700 transition">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="mb-4">You don't have any bookings yet.</p>
          <Link href="/booking" 
                className="inline-block bg-pink-600 text-white px-6 py-2 rounded hover:bg-pink-700 transition">
            Book Now
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold">{booking.serviceName}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center">
                    <FiCalendar className="mr-2 text-gray-500" />
                    <span>{formatDate(booking.date)}</span>
                  </div>
                  <div className="flex items-center">
                    <FiClock className="mr-2 text-gray-500" />
                    <span>{formatTime(booking.time)}</span>
                  </div>
                  <div className="flex items-center">
                    <FiDollarSign className="mr-2 text-gray-500" />
                    <span>${booking.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2 font-medium">Artist:</span>
                    <span>{booking.artistName}</span>
                  </div>
                </div>
                
                {booking.notes && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">{booking.notes}</p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2">
                  {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowModifyModal(true);
                        }}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        disabled={!isCancellable(booking)}
                      >
                        <FiEdit className="mr-1" /> Modify
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowCancelModal(true);
                        }}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                        disabled={!isCancellable(booking)}
                      >
                        <FiTrash className="mr-1" /> Cancel
                      </button>
                    </>
                  )}
                </div>
                
                {!isCancellable(booking) && booking.status !== 'cancelled' && booking.status !== 'completed' && (
                  <p className="text-sm text-red-500 mt-2">
                    This booking cannot be modified or cancelled as it's within 24 hours.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Booking Modal */}
      {showCancelModal && selectedBooking && (
        <Modal
          isOpen={showCancelModal}
          onClose={() => {
            setShowCancelModal(false);
            setCancellationReason('');
          }}
          title="Cancel Booking"
        >
          <div className="p-6">
            <p className="mb-4">
              Are you sure you want to cancel your booking for {selectedBooking.serviceName} on{' '}
              {formatDate(selectedBooking.date)} at {formatTime(selectedBooking.time)}?
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for cancellation (optional):
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                rows={3}
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Please let us know why you're cancelling"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancellationReason('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                No, Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Yes, Cancel Booking
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modify Booking Modal */}
      {showModifyModal && selectedBooking && (
        <Modal
          isOpen={showModifyModal}
          onClose={() => setShowModifyModal(false)}
          title="Modify Booking"
          maxWidth="max-w-4xl"
        >
          <div className="p-4">
            <p className="mb-4 text-gray-600">
              You are modifying your booking for {selectedBooking.serviceName} on{' '}
              {formatDate(selectedBooking.date)} at {formatTime(selectedBooking.time)}.
            </p>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Modifying your booking will create a new booking and cancel your current one. 
                    Your deposit will be transferred to the new booking.
                  </p>
                </div>
              </div>
            </div>
            
            <BookingForm
              initialServiceId={selectedBooking.serviceId}
              initialArtistId={selectedBooking.artistId}
              initialDate={selectedBooking.date}
              initialTime={selectedBooking.time}
              onBookingComplete={() => {
                setShowModifyModal(false);
                // After creating a new booking, cancel the old one silently
                const db = getDb();
                const bookingRef = doc(db, 'bookings', selectedBooking.id);
                updateDoc(bookingRef, {
                  status: 'cancelled',
                  cancellationReason: 'Modified to new booking',
                  updatedAt: new Date().toISOString(),
                });
                router.push('/my-bookings?modified=true');
              }}
              prefilledUserInfo={{
                name: selectedBooking.clientName,
                email: selectedBooking.clientEmail,
                phone: selectedBooking.clientPhone
              }}
              isModification={true}
              oldBookingId={selectedBooking.id}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
