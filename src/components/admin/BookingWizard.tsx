'use client';

import { useState, useEffect, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { collection, getDocs, addDoc, query, where, orderBy } from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAlertDialog } from '@/components/ui/alert-dialog';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  User, 
  UserPlus, 
  Calendar, 
  Clock, 
  CreditCard, 
  CheckCircle,
  Search,
  Loader2,
  CalendarDays,
  CalendarRange,
  CalendarClock,
  DollarSign
} from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

interface Client {
  id: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface TimeSlot {
  time: string;
  endTime: string;
  available: boolean;
  calendarId: string;
  calendarName: string;
}

interface BookingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingCreated: () => void;
  calendars: Array<{ id: string; name: string }>;
}

type WizardStep = 'client-type' | 'client-selection' | 'new-client' | 'date-selection' | 'payment' | 'confirmation';
type DateSelectionMode = 'next-available' | 'weekend' | 'calendar-override';

interface InlineStripeFormProps {
  onSuccess: () => void;
  onError: (msg: string) => void;
}

function InlineStripeForm({ onSuccess, onError }: InlineStripeFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setErrorMsg(null);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    });
    if (error) {
      setErrorMsg(error.message ?? 'Payment failed');
      onError(error.message ?? 'Payment failed');
      setSubmitting(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement options={{ layout: 'tabs' }} />
      {errorMsg && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{errorMsg}</p>
      )}
      <Button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full bg-[#635BFF] hover:bg-[#5851db] text-white h-12"
      >
        {submitting ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
        ) : (
          <><CreditCard className="w-4 h-4 mr-2" />Confirm Payment</>
        )}
      </Button>
    </form>
  );
}

export default function BookingWizard({ isOpen, onClose, onBookingCreated, calendars }: BookingWizardProps) {
  const { user: currentUser } = useAuth();
  const { showAlert, AlertDialogComponent } = useAlertDialog();
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>('client-type');
  const [isNewClient, setIsNewClient] = useState<boolean | null>(null);
  
  // Client selection state
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loadingClients, setLoadingClients] = useState(false);
  
  // New client form state
  const [newClientForm, setNewClientForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [creatingClient, setCreatingClient] = useState(false);
  
  // Appointment state
  const [selectedCalendar, setSelectedCalendar] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState<number>(500); // Custom service price
  const [dateSelectionMode, setDateSelectionMode] = useState<DateSelectionMode | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [calendarOverrideDate, setCalendarOverrideDate] = useState('');
  const [calendarOverrideTime, setCalendarOverrideTime] = useState('');
  const [useManualTime, setUseManualTime] = useState(false);
  const [duration, setDuration] = useState(180); // 3 hours default
  const [notes, setNotes] = useState('');
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'klarna' | 'afterpay' | 'affirm' | 'zelle' | 'external' | null>(null);
  const [depositAmount, setDepositAmount] = useState(50);
  const [customDepositInput, setCustomDepositInput] = useState<string>('50');
  const [cardPaymentAmount, setCardPaymentAmount] = useState<'deposit' | 'full' | 'custom'>('deposit');
  const [customCardAmount, setCustomCardAmount] = useState<number>(50);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [zelleConfirmed, setZelleConfirmed] = useState(false);
  const [externalPaymentNote, setExternalPaymentNote] = useState('');
  // Inline Stripe payment state
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [stripePaymentMethodTypes, setStripePaymentMethodTypes] = useState<string[]>(['card']);
  const [stripePaymentError, setStripePaymentError] = useState<string | null>(null);
  const [loadingPaymentIntent, setLoadingPaymentIntent] = useState(false);
  
  // Final booking state
  const [creatingBooking, setCreatingBooking] = useState(false);
  const [bookingCreated, setBookingCreated] = useState(false);

  // Fetch clients when modal opens
  useEffect(() => {
    if (isOpen && currentStep === 'client-selection') {
      fetchClients();
    }
  }, [isOpen, currentStep]);

  // Filter clients based on search
  useEffect(() => {
    if (clientSearch.trim() === '') {
      setFilteredClients(clients);
    } else {
      const search = clientSearch.toLowerCase();
      setFilteredClients(clients.filter(client => 
        client.displayName?.toLowerCase().includes(search) ||
        client.email?.toLowerCase().includes(search) ||
        client.phone?.includes(search) ||
        client.firstName?.toLowerCase().includes(search) ||
        client.lastName?.toLowerCase().includes(search)
      ));
    }
  }, [clientSearch, clients]);

  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const usersRef = collection(getDb(), 'users');
      const snapshot = await getDocs(usersRef);
      const clientsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email || data.profile?.email || '',
          displayName: data.displayName || 
            (data.profile?.firstName && data.profile?.lastName 
              ? `${data.profile.firstName} ${data.profile.lastName}` 
              : data.profile?.firstName || ''),
          firstName: data.firstName || data.profile?.firstName || '',
          lastName: data.lastName || data.profile?.lastName || '',
          phone: data.phone || data.profile?.phone || ''
        };
      }).filter(client => client.email); // Only show clients with email
      
      setClients(clientsData);
      setFilteredClients(clientsData);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleCreateNewClient = async () => {
    // Validation
    if (!newClientForm.firstName.trim()) {
      await showAlert({ title: 'Missing Information', description: 'First name is required.', variant: 'warning' });
      return;
    }
    if (!newClientForm.lastName.trim()) {
      await showAlert({ title: 'Missing Information', description: 'Last name is required.', variant: 'warning' });
      return;
    }
    if (!newClientForm.email.trim()) {
      await showAlert({ title: 'Missing Information', description: 'Email is required.', variant: 'warning' });
      return;
    }
    if (!newClientForm.phone.trim()) {
      await showAlert({ title: 'Missing Information', description: 'Phone number is required.', variant: 'warning' });
      return;
    }
    if (!newClientForm.password) {
      await showAlert({ title: 'Missing Information', description: 'Password is required.', variant: 'warning' });
      return;
    }
    if (newClientForm.password.length < 6) {
      await showAlert({ title: 'Invalid Password', description: 'Password must be at least 6 characters.', variant: 'warning' });
      return;
    }
    if (newClientForm.password !== newClientForm.confirmPassword) {
      await showAlert({ title: 'Password Mismatch', description: 'Passwords do not match.', variant: 'warning' });
      return;
    }

    setCreatingClient(true);
    try {
      const idToken = await currentUser?.getIdToken();
      const displayName = `${newClientForm.firstName} ${newClientForm.lastName}`;
      
      const response = await fetch('/api/users/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          action: 'create_user',
          email: newClientForm.email,
          displayName,
          firstName: newClientForm.firstName,
          lastName: newClientForm.lastName,
          role: 'client',
          phone: newClientForm.phone,
          newPassword: newClientForm.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create client');
      }

      // Set the newly created client as selected
      setSelectedClient({
        id: data.uid,
        email: newClientForm.email,
        displayName,
        firstName: newClientForm.firstName,
        lastName: newClientForm.lastName,
        phone: newClientForm.phone
      });

      await showAlert({
        title: 'Success',
        description: 'Client created successfully!',
        variant: 'success'
      });

      // Move to date selection
      setCurrentStep('date-selection');
    } catch (error: any) {
      console.error('Error creating client:', error);
      await showAlert({
        title: 'Error',
        description: error.message || 'Error creating client.',
        variant: 'destructive'
      });
    } finally {
      setCreatingClient(false);
    }
  };

  const fetchAvailableSlots = async (mode: DateSelectionMode) => {
    setLoadingSlots(true);
    setAvailableSlots([]);
    setSelectedSlot(null);
    
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const todayStr = now.toISOString().split('T')[0];
      
      let searchDate = new Date();
      const maxDaysToSearch = 60;
      let daysSearched = 0;
      let foundSlots: TimeSlot[] = [];

      while (foundSlots.length === 0 && daysSearched < maxDaysToSearch) {
        // For weekend mode, skip to next weekend
        if (mode === 'weekend') {
          const dayOfWeek = searchDate.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            const daysUntilSaturday = 6 - dayOfWeek;
            searchDate.setDate(searchDate.getDate() + daysUntilSaturday);
          }
        }

        const dateStr = searchDate.toISOString().split('T')[0];
        
        // Check existing bookings from Firestore for conflicts
        const existingBookings = await getExistingBookingsForDate(dateStr);
        const bookedTimes = existingBookings.map(b => b.time);
        
        // Generate slots from 9 AM to 3 PM (3-hour appointments)
        const slots: TimeSlot[] = [];
        for (let hour = 9; hour <= 15; hour++) {
          const time = `${String(hour).padStart(2, '0')}:00`;
          const endTime = `${String(hour + 3).padStart(2, '0')}:00`;
          
          // Skip if this time is already booked
          const isBooked = bookedTimes.some(bookedTime => {
            const bookedHour = parseInt(bookedTime.split(':')[0]);
            return bookedHour >= hour && bookedHour < hour + 3;
          });
          
          // Skip past times for today
          const isPast = dateStr === todayStr && hour <= currentHour;
          
          if (!isBooked && !isPast) {
            slots.push({
              time,
              endTime,
              available: true,
              calendarId: calendars[0]?.id || 'website-calendar',
              calendarName: calendars[0]?.name || 'Website Calendar'
            });
          }
        }
        
        if (slots.length > 0) {
          foundSlots = slots;
          setSelectedDate(dateStr);
        }

        // Move to next day
        if (mode === 'weekend') {
          if (searchDate.getDay() === 6) {
            searchDate.setDate(searchDate.getDate() + 1);
          } else {
            searchDate.setDate(searchDate.getDate() + 6);
          }
        } else {
          searchDate.setDate(searchDate.getDate() + 1);
        }
        
        daysSearched++;
      }

      setAvailableSlots(foundSlots);
      
      if (foundSlots.length === 0) {
        await showAlert({
          title: 'No Availability',
          description: `No available slots found in the next ${maxDaysToSearch} days. Try using Calendar Override with manual time entry.`,
          variant: 'warning'
        });
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      await showAlert({
        title: 'Error',
        description: 'Failed to fetch available time slots.',
        variant: 'destructive'
      });
    } finally {
      setLoadingSlots(false);
    }
  };

  // Helper function to get existing bookings for a date
  const getExistingBookingsForDate = async (date: string): Promise<Array<{time: string}>> => {
    try {
      const db = getDb();
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, where('date', '==', date));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        time: doc.data().time || '00:00'
      }));
    } catch (error) {
      console.error('Error fetching existing bookings:', error);
      return [];
    }
  };

  const fetchSlotsForDate = async (date: string) => {
    setLoadingSlots(true);
    setAvailableSlots([]);
    setSelectedSlot(null);
    
    try {
      // Check existing bookings from Firestore for conflicts
      const existingBookings = await getExistingBookingsForDate(date);
      const bookedTimes = existingBookings.map(b => b.time);
      
      // Generate slots from 9 AM to 3 PM (3-hour appointments)
      const slots: TimeSlot[] = [];
      for (let hour = 9; hour <= 15; hour++) {
        const time = `${String(hour).padStart(2, '0')}:00`;
        const endTime = `${String(hour + 3).padStart(2, '0')}:00`;
        
        // Check if this slot conflicts with existing appointments
        const hasConflict = bookedTimes.some(bookedTime => {
          const bookedHour = parseInt(bookedTime.split(':')[0]);
          return bookedHour >= hour && bookedHour < hour + 3;
        });
        
        slots.push({
          time,
          endTime,
          available: !hasConflict,
          calendarId: calendars[0]?.id || 'website-calendar',
          calendarName: calendars[0]?.name || 'Website Calendar'
        });
      }
      
      setAvailableSlots(slots.filter(s => s.available));
      setSelectedDate(date);
    } catch (error) {
      console.error('Error fetching slots for date:', error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateModeSelect = async (mode: DateSelectionMode) => {
    setDateSelectionMode(mode);
    
    if (mode === 'calendar-override') {
      // Don't fetch yet, wait for user to select a date
      return;
    }
    
    await fetchAvailableSlots(mode);
  };

  const computeStripeAmount = useCallback((paymentType: 'card' | 'klarna' | 'afterpay' | 'affirm'): number => {
    const isBNPL = ['klarna', 'afterpay', 'affirm'].includes(paymentType);
    if (isBNPL) return servicePrice;
    if (cardPaymentAmount === 'full') return servicePrice;
    if (cardPaymentAmount === 'custom') return customCardAmount;
    return depositAmount;
  }, [servicePrice, cardPaymentAmount, customCardAmount, depositAmount]);

  const handleInitStripePayment = async (paymentType: 'card' | 'klarna' | 'afterpay' | 'affirm') => {
    setLoadingPaymentIntent(true);
    setStripeClientSecret(null);
    setStripePaymentError(null);
    try {
      const paymentAmount = computeStripeAmount(paymentType);
      const methodTypes = paymentType === 'card' ? ['card'] :
        paymentType === 'klarna' ? ['klarna'] :
        paymentType === 'afterpay' ? ['afterpay_clearpay'] : ['affirm'];

      setStripePaymentMethodTypes(methodTypes);

      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(paymentAmount * 100),
          currency: 'usd',
          payment_method_types: methodTypes,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create payment intent');
      }

      const { client_secret } = await response.json();
      setStripeClientSecret(client_secret);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to initialize payment';
      setStripePaymentError(msg);
    } finally {
      setLoadingPaymentIntent(false);
    }
  };

  const handleStripePaymentSuccess = () => {
    setPaymentComplete(true);
    setStripeClientSecret(null);
  };

  const handleZellePayment = () => {
    setZelleConfirmed(true);
    setPaymentComplete(true);
  };

  const createBooking = async () => {
    if (!selectedClient || !selectedSlot || !selectedDate) {
      await showAlert({
        title: 'Missing Information',
        description: 'Please complete all required steps.',
        variant: 'warning'
      });
      return;
    }

    setCreatingBooking(true);
    try {
      // Create booking directly in Firestore (skip GHL sync)
      const bookingData = {
        clientName: selectedClient.displayName,
        clientEmail: selectedClient.email,
        clientPhone: selectedClient.phone,
        clientId: selectedClient.id,
        artistId: 'victoria',
        artistName: 'Victoria',
        serviceName: serviceName || 'PMU Appointment',
        date: selectedDate,
        time: selectedSlot.time,
        endTime: selectedSlot.endTime,
        status: 'confirmed',
        price: servicePrice, // Use custom service price
        depositPaid: paymentComplete,
        depositMethod: paymentMethod,
        depositAmount: depositAmount,
        notes: notes + (externalPaymentNote ? ` | Payment Note: ${externalPaymentNote}` : ''),
        externalPaymentNote: paymentMethod === 'external' ? externalPaymentNote : null,
        // No GHL IDs - website only booking
        ghlContactId: null,
        ghlAppointmentId: null,
        createdAt: new Date(),
        createdBy: currentUser?.uid || null
      };

      await addDoc(collection(getDb(), 'bookings'), bookingData);

      // Send confirmation emails
      await sendConfirmationEmails(bookingData);

      setBookingCreated(true);
      setCurrentStep('confirmation');
      
      await showAlert({
        title: 'Booking Created!',
        description: 'The appointment has been created and confirmation emails have been sent.',
        variant: 'success'
      });

    } catch (error: any) {
      console.error('Error creating booking:', error);
      await showAlert({
        title: 'Error',
        description: error.message || 'Failed to create booking.',
        variant: 'destructive'
      });
    } finally {
      setCreatingBooking(false);
    }
  };

  const sendConfirmationEmails = async (bookingData: any) => {
    try {
      // Send client confirmation email
      await fetch('/api/bookings/confirmation-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'client',
          booking: bookingData,
          studioAddress: '123 Beauty Lane, Suite 100, City, State 12345' // Update with actual address
        })
      });

      // Send Victoria reminder email about BoldSign forms
      await fetch('/api/bookings/confirmation-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'admin',
          booking: bookingData,
          reminderType: 'boldsign_forms'
        })
      });
    } catch (error) {
      console.error('Error sending confirmation emails:', error);
      // Don't fail the booking if emails fail
    }
  };

  const resetWizard = () => {
    setCurrentStep('client-type');
    setIsNewClient(null);
    setSelectedClient(null);
    setClientSearch('');
    setNewClientForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    });
    setDateSelectionMode(null);
    setAvailableSlots([]);
    setSelectedSlot(null);
    setSelectedDate('');
    setCalendarOverrideDate('');
    setCalendarOverrideTime('');
    setUseManualTime(false);
    setServiceName('');
    setServicePrice(500);
    setNotes('');
    setPaymentMethod(null);
    setCardPaymentAmount('deposit');
    setCustomCardAmount(50);
    setPaymentComplete(false);
    setZelleConfirmed(false);
    setBookingCreated(false);
  };

  const handleClose = () => {
    resetWizard();
    onClose();
    if (bookingCreated) {
      onBookingCreated();
    }
  };

  const getStepNumber = () => {
    switch (currentStep) {
      case 'client-type': return 1;
      case 'client-selection':
      case 'new-client': return 2;
      case 'date-selection': return 3;
      case 'payment': return 4;
      case 'confirmation': return 5;
      default: return 1;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Book Appointment</h2>
                <p className="text-gray-500 text-sm mt-1">Step {getStepNumber()} of 5</p>
              </div>
              <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4 flex gap-2">
              {[1, 2, 3, 4, 5].map(step => (
                <div 
                  key={step}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    step <= getStepNumber() ? 'bg-[#AD6269]' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Step 1: Client Type Selection */}
            {currentStep === 'client-type' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#AD6269]/10 mb-4">
                    <User className="w-8 h-8 text-[#AD6269]" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Is this a new or existing client?</h3>
                  <p className="text-gray-500 mt-2">Select the client type to continue</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setIsNewClient(false);
                      setCurrentStep('client-selection');
                    }}
                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-[#AD6269] hover:bg-[#AD6269]/5 transition-all group"
                  >
                    <User className="w-12 h-12 text-gray-400 group-hover:text-[#AD6269] mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900">Existing Client</h4>
                    <p className="text-gray-500 text-sm mt-2">Search and select from your client list</p>
                  </button>

                  <button
                    onClick={() => {
                      setIsNewClient(true);
                      setCurrentStep('new-client');
                    }}
                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-[#AD6269] hover:bg-[#AD6269]/5 transition-all group"
                  >
                    <UserPlus className="w-12 h-12 text-gray-400 group-hover:text-[#AD6269] mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900">New Client</h4>
                    <p className="text-gray-500 text-sm mt-2">Create a new client account</p>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2a: Existing Client Selection */}
            {currentStep === 'client-selection' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Select Existing Client</h3>
                  <p className="text-gray-500 mt-2">Search by name, email, or phone</p>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                  />
                </div>

                {/* Client List */}
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                  {loadingClients ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-[#AD6269]" />
                    </div>
                  ) : filteredClients.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No clients found
                    </div>
                  ) : (
                    filteredClients.map(client => (
                      <button
                        key={client.id}
                        onClick={() => setSelectedClient(client)}
                        className={`w-full p-4 text-left border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
                          selectedClient?.id === client.id ? 'bg-[#AD6269]/10 border-l-4 border-l-[#AD6269]' : ''
                        }`}
                      >
                        <div className="font-medium text-gray-900">{client.displayName || 'No Name'}</div>
                        <div className="text-sm text-gray-500">{client.email}</div>
                        {client.phone && <div className="text-sm text-gray-400">{client.phone}</div>}
                      </button>
                    ))
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep('client-type')}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    onClick={() => setCurrentStep('date-selection')}
                    disabled={!selectedClient}
                    className="bg-[#AD6269] hover:bg-[#9d5860]"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2b: New Client Registration */}
            {currentStep === 'new-client' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#AD6269]/10 mb-4">
                    <UserPlus className="w-8 h-8 text-[#AD6269]" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Create New Client</h3>
                  <p className="text-gray-500 mt-2">Enter the client's information</p>
                </div>

                {/* Registration Form */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <i className="fas fa-user mr-2 text-gray-400"></i>First Name *
                      </label>
                      <input
                        type="text"
                        value={newClientForm.firstName}
                        onChange={(e) => setNewClientForm({ ...newClientForm, firstName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269]"
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <i className="fas fa-user mr-2 text-gray-400"></i>Last Name *
                      </label>
                      <input
                        type="text"
                        value={newClientForm.lastName}
                        onChange={(e) => setNewClientForm({ ...newClientForm, lastName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269]"
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <i className="fas fa-envelope mr-2 text-gray-400"></i>Email Address *
                    </label>
                    <input
                      type="email"
                      value={newClientForm.email}
                      onChange={(e) => setNewClientForm({ ...newClientForm, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269]"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <i className="fas fa-phone mr-2 text-gray-400"></i>Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={newClientForm.phone}
                      onChange={(e) => setNewClientForm({ ...newClientForm, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269]"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <i className="fas fa-lock mr-2 text-gray-400"></i>Password (min 6 characters) *
                    </label>
                    <input
                      type="password"
                      value={newClientForm.password}
                      onChange={(e) => setNewClientForm({ ...newClientForm, password: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269]"
                      placeholder="Create a password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <i className="fas fa-lock mr-2 text-gray-400"></i>Confirm Password *
                    </label>
                    <input
                      type="password"
                      value={newClientForm.confirmPassword}
                      onChange={(e) => setNewClientForm({ ...newClientForm, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269]"
                      placeholder="Confirm password"
                    />
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep('client-type')}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    onClick={handleCreateNewClient}
                    disabled={creatingClient}
                    className="bg-[#AD6269] hover:bg-[#9d5860]"
                  >
                    {creatingClient ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Create & Continue
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Date Selection */}
            {currentStep === 'date-selection' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#AD6269]/10 mb-4">
                    <Calendar className="w-8 h-8 text-[#AD6269]" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Select Appointment Date</h3>
                  <p className="text-gray-500 mt-2">
                    Booking for: <span className="font-medium text-gray-900">{selectedClient?.displayName}</span>
                  </p>
                </div>

                {/* Service Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                  <select
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269] bg-white"
                  >
                    <option value="">Select a service...</option>
                    <option value="Microblading">Microblading</option>
                    <option value="Powder Brows">Powder Brows</option>
                    <option value="Combo Brows">Combo Brows</option>
                    <option value="Lip Blush">Lip Blush</option>
                    <option value="Eyeliner">Eyeliner</option>
                    <option value="Lash Enhancement">Lash Enhancement</option>
                    <option value="Microblading Touch-Up">Microblading Touch-Up</option>
                    <option value="Powder Brows Touch-Up">Powder Brows Touch-Up</option>
                    <option value="Lip Blush Touch-Up">Lip Blush Touch-Up</option>
                    <option value="Consultation">Consultation</option>
                  </select>
                </div>

                {/* Custom Price Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Price ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={servicePrice}
                      onChange={(e) => setServicePrice(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269]"
                      placeholder="Enter service price"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Enter the total price for this service</p>
                </div>

                {/* Date Selection Mode Buttons */}
                {!dateSelectionMode && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => handleDateModeSelect('next-available')}
                      className="p-4 border-2 border-gray-200 rounded-xl hover:border-[#AD6269] hover:bg-[#AD6269]/5 transition-all group text-center"
                    >
                      <CalendarClock className="w-10 h-10 text-gray-400 group-hover:text-[#AD6269] mx-auto mb-3" />
                      <h4 className="font-semibold text-gray-900">Next Available</h4>
                      <p className="text-xs text-gray-500 mt-1">First available slot</p>
                    </button>

                    <button
                      onClick={() => handleDateModeSelect('weekend')}
                      className="p-4 border-2 border-gray-200 rounded-xl hover:border-[#AD6269] hover:bg-[#AD6269]/5 transition-all group text-center"
                    >
                      <CalendarDays className="w-10 h-10 text-gray-400 group-hover:text-[#AD6269] mx-auto mb-3" />
                      <h4 className="font-semibold text-gray-900">Weekend</h4>
                      <p className="text-xs text-gray-500 mt-1">Sat/Sun only</p>
                    </button>

                    <button
                      onClick={() => handleDateModeSelect('calendar-override')}
                      className="p-4 border-2 border-gray-200 rounded-xl hover:border-[#AD6269] hover:bg-[#AD6269]/5 transition-all group text-center"
                    >
                      <CalendarRange className="w-10 h-10 text-gray-400 group-hover:text-[#AD6269] mx-auto mb-3" />
                      <h4 className="font-semibold text-gray-900">Calendar Override</h4>
                      <p className="text-xs text-gray-500 mt-1">Pick any date</p>
                    </button>
                  </div>
                )}

                {/* Calendar Override Date Picker */}
                {dateSelectionMode === 'calendar-override' && !selectedDate && (
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800 text-sm">
                        <strong>Calendar Override:</strong> This allows booking at any time, ignoring standard availability. Existing website bookings will still be respected.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                      <input
                        type="date"
                        value={calendarOverrideDate}
                        onChange={(e) => setCalendarOverrideDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269]"
                      />
                    </div>
                    
                    {/* Manual Time Entry Option */}
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="useManualTime"
                        checked={useManualTime}
                        onChange={(e) => setUseManualTime(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-[#AD6269] focus:ring-[#AD6269]"
                      />
                      <label htmlFor="useManualTime" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Enter time manually (skip availability check)
                      </label>
                    </div>
                    
                    {useManualTime && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Enter Time</label>
                        <input
                          type="time"
                          value={calendarOverrideTime}
                          onChange={(e) => setCalendarOverrideTime(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269]"
                        />
                      </div>
                    )}
                    
                    {useManualTime ? (
                      <Button 
                        onClick={() => {
                          if (calendarOverrideDate && calendarOverrideTime) {
                            const endHour = parseInt(calendarOverrideTime.split(':')[0]) + 3;
                            const endTime = `${String(endHour).padStart(2, '0')}:${calendarOverrideTime.split(':')[1]}`;
                            setSelectedSlot({
                              time: calendarOverrideTime,
                              endTime: endTime,
                              available: true,
                              calendarId: calendars[0]?.id || '',
                              calendarName: calendars[0]?.name || 'Default Calendar'
                            });
                            setSelectedDate(calendarOverrideDate);
                          }
                        }}
                        disabled={!calendarOverrideDate || !calendarOverrideTime}
                        className="w-full bg-[#AD6269] hover:bg-[#9d5860]"
                      >
                        Use This Time
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => fetchSlotsForDate(calendarOverrideDate)}
                        disabled={!calendarOverrideDate}
                        className="w-full bg-[#AD6269] hover:bg-[#9d5860]"
                      >
                        Find Available Times
                      </Button>
                    )}
                  </div>
                )}

                {/* Loading State */}
                {loadingSlots && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-[#AD6269] mb-4" />
                    <p className="text-gray-500">Finding available time slots...</p>
                  </div>
                )}

                {/* Available Slots */}
                {dateSelectionMode && !loadingSlots && availableSlots.length > 0 && (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800 font-medium">
                        Available on: {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-3 border-2 rounded-lg transition-all ${
                            selectedSlot?.time === slot.time
                              ? 'border-[#AD6269] bg-[#AD6269]/10'
                              : 'border-gray-200 hover:border-[#AD6269]'
                          }`}
                        >
                          <Clock className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                          <div className="font-medium">{slot.time}</div>
                          <div className="text-xs text-gray-500">to {slot.endTime}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedSlot && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269]"
                      rows={3}
                      placeholder="Any special notes for this appointment..."
                    />
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      if (dateSelectionMode) {
                        setDateSelectionMode(null);
                        setAvailableSlots([]);
                        setSelectedSlot(null);
                        setSelectedDate('');
                      } else {
                        setCurrentStep(isNewClient ? 'new-client' : 'client-selection');
                      }
                    }}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    onClick={() => setCurrentStep('payment')}
                    disabled={!selectedSlot}
                    className="bg-[#AD6269] hover:bg-[#9d5860]"
                  >
                    Continue to Payment
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Payment */}
            {currentStep === 'payment' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#AD6269]/10 mb-4">
                    <CreditCard className="w-8 h-8 text-[#AD6269]" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Payment</h3>
                  <p className="text-gray-500 mt-1 text-sm">Enter the amount to collect and select a payment method</p>
                  <div className="mt-3 inline-flex items-center gap-2 bg-white border-2 border-[#AD6269]/30 rounded-xl px-4 py-2 focus-within:border-[#AD6269]">
                    <span className="text-[#AD6269] font-bold text-lg">$</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={customDepositInput}
                      onChange={(e) => {
                        setCustomDepositInput(e.target.value);
                        const v = parseFloat(e.target.value);
                        if (!isNaN(v) && v > 0) setDepositAmount(v);
                        setStripeClientSecret(null);
                      }}
                      className="w-24 text-center text-2xl font-bold text-[#AD6269] border-none outline-none bg-transparent"
                      placeholder="50"
                    />
                  </div>
                </div>

                {/* Booking Summary */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-gray-900">Booking Summary</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Client:</strong> {selectedClient?.displayName}</p>
                    <p><strong>Service:</strong> {serviceName || 'PMU Appointment'}</p>
                    <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p><strong>Time:</strong> {selectedSlot?.time} - {selectedSlot?.endTime}</p>
                  </div>
                </div>

                {/* Payment Method Selection */}
                {!paymentComplete && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Select Payment Method</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Credit Card */}
                      <button
                        onClick={() => { setPaymentMethod('card'); setStripeClientSecret(null); setStripePaymentError(null); }}
                        className={`p-4 border-2 rounded-xl transition-all ${
                          paymentMethod === 'card'
                            ? 'border-[#AD6269] bg-[#AD6269]/10'
                            : 'border-gray-200 hover:border-[#AD6269]'
                        }`}
                      >
                        <div className="flex items-center justify-center mb-2">
                          <CreditCard className="w-10 h-10 text-gray-400" />
                        </div>
                        <h4 className="font-semibold text-gray-900">Credit Card</h4>
                        <p className="text-xs text-gray-500 mt-1">Visa, Mastercard, Amex</p>
                      </button>

                      {/* Klarna */}
                      <button
                        onClick={() => { setPaymentMethod('klarna'); setStripeClientSecret(null); setStripePaymentError(null); }}
                        className={`p-4 border-2 rounded-xl transition-all ${
                          paymentMethod === 'klarna'
                            ? 'border-[#AD6269] bg-[#AD6269]/10'
                            : 'border-gray-200 hover:border-[#AD6269]'
                        }`}
                      >
                        <div className="flex items-center justify-center mb-2">
                          <div className="w-10 h-10 bg-pink-500 rounded flex items-center justify-center text-white font-bold text-sm">
                            K
                          </div>
                        </div>
                        <h4 className="font-semibold text-gray-900">Klarna</h4>
                        <p className="text-xs text-gray-500 mt-1">Pay in 4 or 30 days</p>
                      </button>

                      {/* Afterpay */}
                      <button
                        onClick={() => { setPaymentMethod('afterpay'); setStripeClientSecret(null); setStripePaymentError(null); }}
                        className={`p-4 border-2 rounded-xl transition-all ${
                          paymentMethod === 'afterpay'
                            ? 'border-[#AD6269] bg-[#AD6269]/10'
                            : 'border-gray-200 hover:border-[#AD6269]'
                        }`}
                      >
                        <div className="flex items-center justify-center mb-2">
                          <div className="w-10 h-10 bg-black rounded flex items-center justify-center text-white font-bold text-xs">
                            afterpay
                          </div>
                        </div>
                        <h4 className="font-semibold text-gray-900">Afterpay</h4>
                        <p className="text-xs text-gray-500 mt-1">Pay in 4 installments</p>
                      </button>

                      {/* Affirm */}
                      <button
                        onClick={() => { setPaymentMethod('affirm'); setStripeClientSecret(null); setStripePaymentError(null); }}
                        className={`p-4 border-2 rounded-xl transition-all ${
                          paymentMethod === 'affirm'
                            ? 'border-[#AD6269] bg-[#AD6269]/10'
                            : 'border-gray-200 hover:border-[#AD6269]'
                        }`}
                      >
                        <div className="flex items-center justify-center mb-2">
                          <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm">
                            Affirm
                          </div>
                        </div>
                        <h4 className="font-semibold text-gray-900">Affirm</h4>
                        <p className="text-xs text-gray-500 mt-1">Monthly payments</p>
                      </button>

                      {/* Zelle */}
                      <button
                        onClick={() => setPaymentMethod('zelle')}
                        className={`p-4 border-2 rounded-xl transition-all ${
                          paymentMethod === 'zelle'
                            ? 'border-[#AD6269] bg-[#AD6269]/10'
                            : 'border-gray-200 hover:border-[#AD6269]'
                        }`}
                      >
                        <div className="flex items-center justify-center mb-2">
                          <div className="w-10 h-10 bg-purple-600 rounded flex items-center justify-center text-white font-bold text-sm">
                            Zelle
                          </div>
                        </div>
                        <h4 className="font-semibold text-gray-900">Zelle</h4>
                        <p className="text-xs text-gray-500 mt-1">Bank Transfer</p>
                      </button>

                      {/* External */}
                      <button
                        onClick={() => setPaymentMethod('external')}
                        className={`p-4 border-2 rounded-xl transition-all ${
                          paymentMethod === 'external'
                            ? 'border-[#AD6269] bg-[#AD6269]/10'
                            : 'border-gray-200 hover:border-[#AD6269]'
                        }`}
                      >
                        <div className="flex items-center justify-center mb-2">
                          <div className="w-10 h-10 bg-gray-600 rounded flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <h4 className="font-semibold text-gray-900">External</h4>
                        <p className="text-xs text-gray-500 mt-1">Cash, Check, Other</p>
                      </button>
                    </div>

                    {/* Stripe Payment (card / Klarna / Afterpay / Affirm) */}
                    {(paymentMethod === 'card' || paymentMethod === 'klarna' || paymentMethod === 'afterpay' || paymentMethod === 'affirm') && (
                      <div className="space-y-4">
                        {/* Full payment override for card — amount above is the default */}
                        {paymentMethod === 'card' && !stripeClientSecret && (
                          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3">
                            <input
                              type="checkbox"
                              id="fullPaymentToggle"
                              checked={cardPaymentAmount === 'full'}
                              onChange={(e) => {
                                setCardPaymentAmount(e.target.checked ? 'full' : 'deposit');
                                setStripeClientSecret(null);
                              }}
                              className="w-4 h-4 text-[#AD6269] rounded focus:ring-[#AD6269]"
                            />
                            <label htmlFor="fullPaymentToggle" className="text-sm text-gray-700 cursor-pointer">
                              Charge full service price instead —{' '}
                              <strong className="text-[#AD6269]">${servicePrice}</strong>
                            </label>
                          </div>
                        )}

                        {/* BNPL info banners */}
                        {paymentMethod === 'klarna' && !stripeClientSecret && (
                          <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 text-sm text-pink-800">
                            Pay <strong>${servicePrice}</strong> in 4 interest-free installments or in 30 days via Klarna.
                          </div>
                        )}
                        {paymentMethod === 'afterpay' && !stripeClientSecret && (
                          <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm text-gray-800">
                            Pay <strong>${servicePrice}</strong> in 4 equal fortnightly installments via Afterpay. US only.
                          </div>
                        )}
                        {paymentMethod === 'affirm' && !stripeClientSecret && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                            Pay <strong>${servicePrice}</strong> in monthly installments over 3–12 months via Affirm. US &amp; CA only.
                          </div>
                        )}

                        {/* Error message */}
                        {stripePaymentError && (
                          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{stripePaymentError}</p>
                        )}

                        {/* Inline Stripe payment form */}
                        {stripeClientSecret ? (
                          <div className="border border-[#635BFF]/30 rounded-xl p-4 bg-white space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-[#635BFF]" />
                                Complete Payment
                                <span className="text-[#AD6269] font-bold ml-1">
                                  ${computeStripeAmount(paymentMethod as 'card' | 'klarna' | 'afterpay' | 'affirm')}
                                </span>
                              </h4>
                              <button
                                type="button"
                                onClick={() => setStripeClientSecret(null)}
                                className="text-xs text-gray-400 hover:text-gray-600 underline"
                              >
                                Change amount
                              </button>
                            </div>
                            <Elements
                              stripe={stripePromise}
                              options={{
                                clientSecret: stripeClientSecret,
                                appearance: { theme: 'stripe', variables: { colorPrimary: '#635BFF' } },
                              }}
                            >
                              <InlineStripeForm
                                onSuccess={handleStripePaymentSuccess}
                                onError={(msg) => setStripePaymentError(msg)}
                              />
                            </Elements>
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleInitStripePayment(paymentMethod as 'card' | 'klarna' | 'afterpay' | 'affirm')}
                            disabled={loadingPaymentIntent}
                            className="w-full bg-[#635BFF] hover:bg-[#5851db] text-white h-12"
                          >
                            {loadingPaymentIntent ? (
                              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Preparing payment form...</>
                            ) : (
                              <>
                                <CreditCard className="w-4 h-4 mr-2" />
                                Pay ${computeStripeAmount(paymentMethod as 'card' | 'klarna' | 'afterpay' | 'affirm')} with{' '}
                                {paymentMethod === 'card' ? 'Credit Card' : paymentMethod === 'klarna' ? 'Klarna' : paymentMethod === 'afterpay' ? 'Afterpay' : 'Affirm'}
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Zelle Instructions */}
                    {paymentMethod === 'zelle' && (
                      <div className="space-y-4">
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <h4 className="font-semibold text-purple-900 mb-2">Zelle Payment Instructions</h4>
                          <p className="text-purple-800 text-sm mb-2">
                            Send ${depositAmount} to: <strong>victoria@aprettygirlmatter.com</strong>
                          </p>
                          <p className="text-purple-700 text-xs">
                            Include client name in the memo. Payment will be verified before appointment.
                          </p>
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={zelleConfirmed}
                            onChange={(e) => setZelleConfirmed(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-[#AD6269] focus:ring-[#AD6269]"
                          />
                          <span className="text-sm text-gray-700">
                            I confirm that the client will send ${depositAmount} via Zelle
                          </span>
                        </label>
                        <Button 
                          onClick={handleZellePayment}
                          disabled={!zelleConfirmed}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          Confirm Zelle Payment
                        </Button>
                      </div>
                    )}

                    {/* External Payment */}
                    {paymentMethod === 'external' && (
                      <div className="space-y-4">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">External Payment</h4>
                          <p className="text-gray-700 text-sm">
                            Payment will be collected externally (cash, check, or other method). 
                            The booking will be created and added to the GHL calendar.
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Note (optional)</label>
                          <textarea
                            value={externalPaymentNote}
                            onChange={(e) => setExternalPaymentNote(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269] resize-none"
                            rows={2}
                            placeholder="e.g., Cash deposit collected, Check #1234, etc."
                          />
                        </div>
                        <Button 
                          onClick={() => {
                            setPaymentComplete(true);
                          }}
                          className="w-full bg-gray-600 hover:bg-gray-700 text-white"
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Confirm External Payment
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Payment Complete */}
                {paymentComplete && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-green-900">
                      {paymentMethod === 'zelle' ? 'Payment Pending' : paymentMethod === 'external' ? 'External Payment Confirmed' : 'Payment Complete'}
                    </h4>
                    <p className="text-green-700 text-sm">
                      {paymentMethod === 'zelle' 
                        ? 'Zelle payment will be verified before appointment.'
                        : paymentMethod === 'external'
                        ? 'External payment noted. Booking will be created.'
                        : paymentMethod === 'card'
                        ? 'Credit card payment has been processed via Stripe.'
                        : paymentMethod === 'klarna'
                        ? 'Klarna payment has been processed.'
                        : paymentMethod === 'afterpay'
                        ? 'Afterpay payment has been processed.'
                        : paymentMethod === 'affirm'
                        ? 'Affirm payment has been processed.'
                        : 'Payment has been processed.'}
                    </p>
                    {paymentMethod === 'external' && externalPaymentNote && (
                      <p className="text-green-600 text-xs mt-2">
                        Note: {externalPaymentNote}
                      </p>
                    )}
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep('date-selection')}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    onClick={createBooking}
                    disabled={!paymentComplete || creatingBooking}
                    className="bg-[#AD6269] hover:bg-[#9d5860]"
                  >
                    {creatingBooking ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Booking...
                      </>
                    ) : (
                      <>
                        Create Booking
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 5: Confirmation */}
            {currentStep === 'confirmation' && (
              <div className="space-y-6 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h3>
                
                <div className="bg-gray-50 rounded-lg p-6 text-left space-y-3">
                  <h4 className="font-semibold text-gray-900 text-center mb-4">Appointment Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Client:</span>
                      <p className="font-medium text-gray-900">{selectedClient?.displayName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <p className="font-medium text-gray-900">{selectedClient?.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Service:</span>
                      <p className="font-medium text-gray-900">{serviceName || 'PMU Appointment'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Time:</span>
                      <p className="font-medium text-gray-900">{selectedSlot?.time} - {selectedSlot?.endTime}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Service Price:</span>
                      <p className="font-medium text-gray-900">${servicePrice}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Deposit:</span>
                      <p className="font-medium text-gray-900">${depositAmount} ({paymentMethod})</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">
                    <strong>Emails Sent:</strong>
                    <br />• Client confirmation with appointment details and studio address
                    <br />• Reminder to send BoldSign compliance forms
                  </p>
                </div>

                <Button 
                  onClick={handleClose}
                  className="bg-[#AD6269] hover:bg-[#9d5860] w-full"
                >
                  Done
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      {AlertDialogComponent}
    </>
  );
}
