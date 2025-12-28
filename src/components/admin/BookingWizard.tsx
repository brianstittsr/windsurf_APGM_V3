'use client';

import { useState, useEffect } from 'react';
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
  const [dateSelectionMode, setDateSelectionMode] = useState<DateSelectionMode | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [calendarOverrideDate, setCalendarOverrideDate] = useState('');
  const [duration, setDuration] = useState(180); // 3 hours default
  const [notes, setNotes] = useState('');
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'zelle' | 'external' | null>(null);
  const [depositAmount, setDepositAmount] = useState(50);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [zelleConfirmed, setZelleConfirmed] = useState(false);
  const [externalPaymentNote, setExternalPaymentNote] = useState('');
  
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
      let searchDate = new Date();
      const maxDaysToSearch = 60; // Search up to 60 days ahead
      let daysSearched = 0;
      let foundSlots: TimeSlot[] = [];

      while (foundSlots.length === 0 && daysSearched < maxDaysToSearch) {
        // For weekend mode, skip to next weekend
        if (mode === 'weekend') {
          const dayOfWeek = searchDate.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            // Skip to Saturday
            const daysUntilSaturday = 6 - dayOfWeek;
            searchDate.setDate(searchDate.getDate() + daysUntilSaturday);
          }
        }

        const dateStr = searchDate.toISOString().split('T')[0];
        
        // Fetch slots from GHL
        const response = await fetch(`/api/availability/ghl?date=${dateStr}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.timeSlots && data.timeSlots.length > 0) {
            // Filter for available slots only
            const available = data.timeSlots.filter((slot: TimeSlot) => slot.available);
            
            if (available.length > 0) {
              foundSlots = available.map((slot: TimeSlot) => ({
                ...slot,
                date: dateStr
              }));
              setSelectedDate(dateStr);
            }
          }
        }

        // Move to next day (or next weekend day for weekend mode)
        if (mode === 'weekend') {
          // If Saturday, try Sunday. If Sunday, skip to next Saturday
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
          description: `No available slots found in the next ${maxDaysToSearch} days. Try using Calendar Override.`,
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

  const fetchSlotsForDate = async (date: string) => {
    setLoadingSlots(true);
    setAvailableSlots([]);
    setSelectedSlot(null);
    
    try {
      // For calendar override, we fetch GHL appointments but ignore availability settings
      const response = await fetch(`/api/availability/ghl?date=${date}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // For calendar override, show all time slots (9 AM - 6 PM) that don't conflict with existing appointments
        const slots: TimeSlot[] = [];
        const existingTimesArray: string[] = data.timeSlots?.filter((s: TimeSlot) => !s.available).map((s: TimeSlot) => s.time) || [];
        
        // Generate slots from 9 AM to 6 PM
        for (let hour = 9; hour <= 15; hour++) { // Last slot at 3 PM for 3-hour appointments
          const time = `${String(hour).padStart(2, '0')}:00`;
          const endTime = `${String(hour + 3).padStart(2, '0')}:00`;
          
          // Check if this slot conflicts with existing appointments
          const hasConflict = existingTimesArray.some((existingTime) => {
            const existingHour = parseInt(existingTime.split(':')[0]);
            return existingHour >= hour && existingHour < hour + 3;
          });
          
          slots.push({
            time,
            endTime,
            available: !hasConflict,
            calendarId: calendars[0]?.id || '',
            calendarName: calendars[0]?.name || 'Default Calendar',
            date
          } as TimeSlot & { date: string });
        }
        
        setAvailableSlots(slots.filter(s => s.available));
        setSelectedDate(date);
      }
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

  const handleStripePayment = async () => {
    setProcessingPayment(true);
    try {
      // Create Stripe checkout session - API expects email, name, phone, serviceName
      const response = await fetch('/api/create-deposit-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: selectedClient?.email,
          name: selectedClient?.displayName || `${selectedClient?.firstName} ${selectedClient?.lastName}`,
          phone: selectedClient?.phone || '',
          serviceName: serviceName || 'PMU Appointment',
          servicePrice: depositAmount
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment session');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe checkout using the URL from the API
      if (url) {
        window.open(url, '_blank');
      } else {
        throw new Error('No checkout URL returned');
      }
      
      // For now, mark as complete (in production, you'd use webhooks)
      await showAlert({
        title: 'Payment Window Opened',
        description: 'Complete the payment in the new window. Click OK once payment is complete.',
        variant: 'default'
      });
      
      setPaymentComplete(true);
    } catch (error) {
      console.error('Error processing payment:', error);
      await showAlert({
        title: 'Payment Error',
        description: error instanceof Error ? error.message : 'Failed to process payment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setProcessingPayment(false);
    }
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
      // Create appointment in GHL
      const startDateTime = new Date(`${selectedDate}T${selectedSlot.time}:00`);
      const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

      const appointmentData = {
        name: selectedClient.displayName,
        email: selectedClient.email,
        phone: selectedClient.phone,
        calendarId: selectedSlot.calendarId || calendars[0]?.id,
        serviceName: serviceName || 'PMU Appointment',
        title: serviceName || 'PMU Appointment',
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        notes: notes + (paymentMethod === 'zelle' 
          ? '\n[Deposit: Zelle - Pending Confirmation]' 
          : paymentMethod === 'external' 
          ? `\n[Deposit: External Payment${externalPaymentNote ? ' - ' + externalPaymentNote : ''}]`
          : '\n[Deposit: Stripe - Paid]'),
        status: 'new'
      };

      const ghlResponse = await fetch('/api/appointments/create-ghl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      });

      if (!ghlResponse.ok) {
        const errorData = await ghlResponse.json();
        throw new Error(errorData.error || 'Failed to create GHL appointment');
      }

      const ghlResult = await ghlResponse.json();

      // Create booking in Firestore
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
        status: 'confirmed',
        price: 0, // Set based on service
        depositPaid: paymentComplete,
        depositMethod: paymentMethod,
        depositAmount: depositAmount,
        notes: notes + (externalPaymentNote ? ` | Payment Note: ${externalPaymentNote}` : ''),
        externalPaymentNote: paymentMethod === 'external' ? externalPaymentNote : null,
        ghlContactId: ghlResult.contactId,
        ghlAppointmentId: ghlResult.appointmentId,
        createdAt: new Date(),
        createdBy: currentUser?.uid
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
    setServiceName('');
    setNotes('');
    setPaymentMethod(null);
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

                {/* Service Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                  <input
                    type="text"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269]"
                    placeholder="e.g., Microblading, Lip Blush, etc."
                  />
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
                        <strong>Calendar Override:</strong> This ignores availability settings but respects existing GHL bookings.
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
                    <Button 
                      onClick={() => fetchSlotsForDate(calendarOverrideDate)}
                      disabled={!calendarOverrideDate}
                      className="w-full bg-[#AD6269] hover:bg-[#9d5860]"
                    >
                      Find Available Times
                    </Button>
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
                  <h3 className="text-xl font-semibold text-gray-900">Deposit Payment</h3>
                  <p className="text-gray-500 mt-2">Collect ${depositAmount} deposit to confirm booking</p>
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        onClick={() => setPaymentMethod('stripe')}
                        className={`p-4 border-2 rounded-xl transition-all ${
                          paymentMethod === 'stripe'
                            ? 'border-[#AD6269] bg-[#AD6269]/10'
                            : 'border-gray-200 hover:border-[#AD6269]'
                        }`}
                      >
                        <div className="flex items-center justify-center mb-2">
                          <svg className="w-12 h-8" viewBox="0 0 60 25" fill="none">
                            <path d="M59.64 14.28c0-4.8-2.32-8.6-6.76-8.6-4.48 0-7.16 3.8-7.16 8.56 0 5.64 3.2 8.48 7.76 8.48 2.24 0 3.92-.52 5.2-1.24v-3.76c-1.28.64-2.76 1.04-4.64 1.04-1.84 0-3.48-.64-3.68-2.88h9.24c0-.24.04-1.2.04-1.6zm-9.32-1.8c0-2.12 1.32-3.04 2.52-3.04 1.16 0 2.4.92 2.4 3.04h-4.92z" fill="#635BFF"/>
                            <path d="M39.88 5.72c-1.84 0-3.04.88-3.72 1.48l-.24-1.16h-4.16v21.92l4.72-1v-5.32c.68.48 1.68 1.2 3.36 1.2 3.4 0 6.52-2.72 6.52-8.72-.04-5.48-3.16-8.4-6.48-8.4zm-1.12 12.92c-1.12 0-1.8-.4-2.24-.88v-7c.48-.52 1.16-.92 2.24-.92 1.72 0 2.92 1.92 2.92 4.4 0 2.52-1.16 4.4-2.92 4.4z" fill="#635BFF"/>
                            <path d="M25.48 4.36l4.76-1.04V0l-4.76 1v3.36zM25.48 5.96h4.76v16.56h-4.76V5.96z" fill="#635BFF"/>
                            <path d="M20.44 7.24l-.28-1.28h-4.12v16.56h4.72V11.2c1.12-1.44 3-1.2 3.6-.96V5.96c-.64-.24-2.96-.68-3.92 1.28z" fill="#635BFF"/>
                            <path d="M10.76 2.68l-4.6 1-.04 15.16c0 2.8 2.12 4.88 4.92 4.88 1.56 0 2.72-.28 3.36-.64v-3.84c-.6.24-3.6 1.12-3.6-1.68V9.72h3.6V5.96h-3.6l-.04-3.28z" fill="#635BFF"/>
                            <path d="M4.24 10.12c0-.72.6-1 1.6-1 1.44 0 3.24.44 4.68 1.2V5.96c-1.56-.64-3.12-.88-4.68-.88C2.32 5.08 0 6.88 0 9.96c0 4.84 6.68 4.08 6.68 6.16 0 .84-.72 1.12-1.76 1.12-1.52 0-3.48-.64-5.04-1.48v4.4c1.72.72 3.44 1.04 5.04 1.04 3.6 0 6.08-1.76 6.08-4.92-.04-5.24-6.76-4.32-6.76-6.16z" fill="#635BFF"/>
                          </svg>
                        </div>
                        <h4 className="font-semibold text-gray-900">Pay with Stripe</h4>
                        <p className="text-xs text-gray-500 mt-1">Credit/Debit Card</p>
                      </button>

                      <button
                        onClick={() => setPaymentMethod('zelle')}
                        className={`p-4 border-2 rounded-xl transition-all ${
                          paymentMethod === 'zelle'
                            ? 'border-[#AD6269] bg-[#AD6269]/10'
                            : 'border-gray-200 hover:border-[#AD6269]'
                        }`}
                      >
                        <div className="flex items-center justify-center mb-2">
                          <div className="w-12 h-8 bg-purple-600 rounded flex items-center justify-center text-white font-bold text-sm">
                            Zelle
                          </div>
                        </div>
                        <h4 className="font-semibold text-gray-900">Pay with Zelle</h4>
                        <p className="text-xs text-gray-500 mt-1">Bank Transfer</p>
                      </button>

                      <button
                        onClick={() => setPaymentMethod('external')}
                        className={`p-4 border-2 rounded-xl transition-all ${
                          paymentMethod === 'external'
                            ? 'border-[#AD6269] bg-[#AD6269]/10'
                            : 'border-gray-200 hover:border-[#AD6269]'
                        }`}
                      >
                        <div className="flex items-center justify-center mb-2">
                          <div className="w-12 h-8 bg-gray-600 rounded flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <h4 className="font-semibold text-gray-900">External Payment</h4>
                        <p className="text-xs text-gray-500 mt-1">Cash, Check, Other</p>
                      </button>
                    </div>

                    {/* Stripe Payment Button */}
                    {paymentMethod === 'stripe' && (
                      <Button 
                        onClick={handleStripePayment}
                        disabled={processingPayment}
                        className="w-full bg-[#635BFF] hover:bg-[#5851db] text-white"
                      >
                        {processingPayment ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Pay ${depositAmount} with Stripe
                          </>
                        )}
                      </Button>
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
                        : 'Stripe payment has been processed.'}
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
