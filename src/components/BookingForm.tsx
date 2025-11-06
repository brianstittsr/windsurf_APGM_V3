'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import LoadingSpinner from './common/LoadingSpinner';
import { FiCalendar, FiClock, FiUser, FiDollarSign } from 'react-icons/fi';
import { format } from 'date-fns';

interface BookingFormProps {
  initialServiceId?: string;
  initialArtistId?: string;
  initialDate?: string;
  initialTime?: string;
  prefilledUserInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  onBookingComplete?: () => void;
  isModification?: boolean;
  oldBookingId?: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
  description?: string;
  duration: number;
  deposit: number;
  active: boolean;
}

interface Artist {
  id: string;
  name: string;
  profile?: {
    firstName?: string;
    lastName?: string;
  };
}

export const BookingForm = ({
  initialServiceId,
  initialArtistId,
  initialDate,
  initialTime,
  prefilledUserInfo,
  onBookingComplete,
  isModification = false,
  oldBookingId
}: BookingFormProps) => {
  const [step, setStep] = useState(isModification ? 2 : 1);
  const [services, setServices] = useState<Service[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || '');
  const [selectedTime, setSelectedTime] = useState<string>(initialTime || '');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [name, setName] = useState(prefilledUserInfo?.name || '');
  const [email, setEmail] = useState(prefilledUserInfo?.email || '');
  const [phone, setPhone] = useState(prefilledUserInfo?.phone || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  // Load services and artists
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const db = getDb();
        
        // Fetch services
        const servicesRef = collection(db, 'services');
        const serviceSnapshot = await getDocs(servicesRef);
        const serviceData: Service[] = [];
        serviceSnapshot.forEach((doc) => {
          const data = doc.data() as Omit<Service, 'id'>;
          serviceData.push({ id: doc.id, ...data });
        });
        
        // Only show active services
        const activeServices = serviceData.filter(service => service.active);
        setServices(activeServices);
        
        // Set initial selected service if provided
        if (initialServiceId) {
          const initialService = activeServices.find(s => s.id === initialServiceId);
          if (initialService) {
            setSelectedService(initialService);
          }
        }
        
        // Fetch artists
        const artistsRef = collection(db, 'users');
        const artistSnapshot = await getDocs(artistsRef);
        const artistData: Artist[] = [];
        artistSnapshot.forEach((doc) => {
          const data = doc.data();
          // Only include users with artist role
          if (data.role === 'artist') {
            artistData.push({ 
              id: doc.id, 
              name: data.profile?.firstName && data.profile?.lastName 
                ? `${data.profile.firstName} ${data.profile.lastName}` 
                : data.displayName || 'Unknown Artist',
              profile: data.profile
            });
          }
        });
        
        setArtists(artistData);
        
        // Set initial selected artist if provided
        if (initialArtistId) {
          const initialArtist = artistData.find(a => a.id === initialArtistId);
          if (initialArtist) {
            setSelectedArtist(initialArtist);
          }
        }
        
        // If we have all initial data, move to appropriate step
        if (initialServiceId && initialArtistId && initialDate && initialTime) {
          // Generate available dates and times (simplified for this example)
          const dates = generateDummyDates();
          setAvailableDates(dates);
          setAvailableTimes(['09:00', '10:00', '11:00', '13:00', '14:00', '15:00']);
          setStep(3);
        }
        
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load services and artists. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [initialServiceId, initialArtistId, initialDate, initialTime]);

  // Generate dummy dates (in a real implementation, these would be fetched based on artist availability)
  const generateDummyDates = (): string[] => {
    const dates: string[] = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      dates.push(format(date, 'yyyy-MM-dd'));
    }
    
    return dates;
  };

  // Handle service selection
  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep(2);
  };

  // Handle artist selection
  const handleArtistSelect = (artist: Artist) => {
    setSelectedArtist(artist);
    
    // Generate available dates (simplified for this example)
    const dates = generateDummyDates();
    setAvailableDates(dates);
    
    setStep(3);
  };

  // Handle date selection
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    
    // Generate available times (simplified for this example)
    setAvailableTimes(['09:00', '10:00', '11:00', '13:00', '14:00', '15:00']);
    
    setStep(4);
  };

  // Handle time selection
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(5);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService || !selectedArtist || !selectedDate || !selectedTime || !name || !email || !phone) {
      setError('Please fill out all required fields.');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const db = getDb();
      const bookingId = isModification ? `modified_${oldBookingId}_${Date.now()}` : `booking_${Date.now()}`;
      
      // Create new booking document
      const bookingData = {
        clientName: name,
        clientEmail: email,
        clientPhone: phone,
        artistId: selectedArtist.id,
        artistName: selectedArtist.name,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        date: selectedDate,
        time: selectedTime,
        status: 'pending',
        price: selectedService.price,
        depositPaid: isModification ? true : false, // If modifying, we assume deposit is transferred
        notes: notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        oldBookingId: isModification ? oldBookingId : undefined
      };
      
      await setDoc(doc(db, 'bookings', bookingId), bookingData);
      
      if (isModification && onBookingComplete) {
        onBookingComplete();
      } else {
        router.push('/booking/confirmation?id=' + bookingId);
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {/* Progress Steps */}
      <div className="mb-8 hidden md:block">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-pink-600 text-white' : 'bg-gray-200'}`}>
            1
          </div>
          <div className={`h-1 flex-1 ${step >= 2 ? 'bg-pink-600' : 'bg-gray-200'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-pink-600 text-white' : 'bg-gray-200'}`}>
            2
          </div>
          <div className={`h-1 flex-1 ${step >= 3 ? 'bg-pink-600' : 'bg-gray-200'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-pink-600 text-white' : 'bg-gray-200'}`}>
            3
          </div>
          <div className={`h-1 flex-1 ${step >= 4 ? 'bg-pink-600' : 'bg-gray-200'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 4 ? 'bg-pink-600 text-white' : 'bg-gray-200'}`}>
            4
          </div>
          <div className={`h-1 flex-1 ${step >= 5 ? 'bg-pink-600' : 'bg-gray-200'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 5 ? 'bg-pink-600 text-white' : 'bg-gray-200'}`}>
            5
          </div>
        </div>
        <div className="flex justify-between text-xs mt-2">
          <span>Service</span>
          <span>Artist</span>
          <span>Date</span>
          <span>Time</span>
          <span>Info</span>
        </div>
      </div>
      
      {/* Step Content */}
      <div>
        {/* Step 1: Select Service */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Select a Service</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {services.map((service) => (
                <div 
                  key={service.id}
                  className="border rounded-lg p-4 cursor-pointer hover:border-pink-500 transition-colors"
                  onClick={() => handleServiceSelect(service)}
                >
                  <h3 className="font-bold">{service.name}</h3>
                  <p className="text-gray-600">${service.price.toFixed(2)}</p>
                  {service.description && (
                    <p className="text-sm mt-2">{service.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Step 2: Select Artist */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Select an Artist</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {artists.map((artist) => (
                <div 
                  key={artist.id}
                  className="border rounded-lg p-4 cursor-pointer hover:border-pink-500 transition-colors"
                  onClick={() => handleArtistSelect(artist)}
                >
                  <h3 className="font-bold">{artist.name}</h3>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setStep(1)} 
              className="mt-4 text-pink-600 hover:text-pink-800"
            >
              &larr; Back to Services
            </button>
          </div>
        )}
        
        {/* Step 3: Select Date */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Select a Date</h2>
            <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
              {availableDates.map((date) => {
                const dateObj = new Date(date);
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNum = dateObj.getDate();
                const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
                
                return (
                  <div 
                    key={date}
                    className={`border rounded-lg p-3 text-center cursor-pointer hover:border-pink-500 transition-colors ${date === selectedDate ? 'bg-pink-50 border-pink-500' : ''}`}
                    onClick={() => handleDateSelect(date)}
                  >
                    <p className="text-sm text-gray-600">{dayName}</p>
                    <p className="font-bold text-lg">{dayNum}</p>
                    <p className="text-sm">{month}</p>
                  </div>
                );
              })}
            </div>
            <button 
              onClick={() => setStep(2)} 
              className="mt-4 text-pink-600 hover:text-pink-800"
            >
              &larr; Back to Artists
            </button>
          </div>
        )}
        
        {/* Step 4: Select Time */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Select a Time</h2>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {availableTimes.map((time) => {
                // Format time for display (e.g. "09:00" to "9:00 AM")
                const timeParts = time.split(':');
                const hours = parseInt(timeParts[0], 10);
                const minutes = timeParts[1];
                const period = hours >= 12 ? 'PM' : 'AM';
                const displayHours = hours % 12 || 12;
                const displayTime = `${displayHours}:${minutes} ${period}`;
                
                return (
                  <div 
                    key={time}
                    className={`border rounded-lg p-3 text-center cursor-pointer hover:border-pink-500 transition-colors ${time === selectedTime ? 'bg-pink-50 border-pink-500' : ''}`}
                    onClick={() => handleTimeSelect(time)}
                  >
                    <p className="font-bold">{displayTime}</p>
                  </div>
                );
              })}
            </div>
            <button 
              onClick={() => setStep(3)} 
              className="mt-4 text-pink-600 hover:text-pink-800"
            >
              &larr; Back to Dates
            </button>
          </div>
        )}
        
        {/* Step 5: Personal Information */}
        {step === 5 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Your Information</h2>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-bold mb-2">Booking Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  <FiUser className="mr-2 text-gray-500" />
                  <span>Service:</span>
                </div>
                <span className="font-medium">{selectedService?.name}</span>
                
                <div className="flex items-center">
                  <FiUser className="mr-2 text-gray-500" />
                  <span>Artist:</span>
                </div>
                <span className="font-medium">{selectedArtist?.name}</span>
                
                <div className="flex items-center">
                  <FiCalendar className="mr-2 text-gray-500" />
                  <span>Date:</span>
                </div>
                <span className="font-medium">
                  {new Date(selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
                
                <div className="flex items-center">
                  <FiClock className="mr-2 text-gray-500" />
                  <span>Time:</span>
                </div>
                <span className="font-medium">
                  {(() => {
                    const [hours, minutes] = selectedTime.split(':');
                    const date = new Date();
                    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
                    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  })()}
                </span>
                
                <div className="flex items-center">
                  <FiDollarSign className="mr-2 text-gray-500" />
                  <span>Price:</span>
                </div>
                <span className="font-medium">${selectedService?.price.toFixed(2)}</span>
                
                <div className="flex items-center">
                  <FiDollarSign className="mr-2 text-gray-500" />
                  <span>Deposit:</span>
                </div>
                <span className="font-medium">${selectedService?.deposit.toFixed(2)}</span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special requests or information we should know"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-between items-center">
                <button 
                  type="button"
                  onClick={() => setStep(4)} 
                  className="text-pink-600 hover:text-pink-800"
                >
                  &larr; Back to Time Selection
                </button>
                
                <button 
                  type="submit" 
                  className="bg-pink-600 text-white px-6 py-2 rounded hover:bg-pink-700 transition"
                  disabled={submitting}
                >
                  {submitting ? (
                    <div className="flex items-center">
                      <LoadingSpinner size="sm" color="white" /> 
                      <span className="ml-2">Processing...</span>
                    </div>
                  ) : isModification ? 'Update Booking' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
