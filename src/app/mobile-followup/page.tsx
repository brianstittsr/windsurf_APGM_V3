'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useServices } from '@/hooks/useFirebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAlertDialog } from '@/components/ui/alert-dialog';
import { 
  ChevronRight, 
  ChevronLeft, 
  User, 
  UserPlus, 
  Calendar, 
  CheckCircle,
  Search,
  Loader2,
  CalendarDays,
  CalendarRange,
  CalendarClock,
  Phone,
  Mail,
  Clock,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

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

type WizardStep = 'client-type' | 'client-selection' | 'new-client' | 'date-selection' | 'confirmation';
type DateSelectionMode = 'next-available' | 'weekend' | 'calendar-override';

export default function MobileFollowupPage() {
  const { user: currentUser, loading: authLoading, userRole } = useAuth();
  const { services, loading: servicesLoading } = useServices();
  const { showAlert, AlertDialogComponent } = useAlertDialog();
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>('client-type');
  const [clientType, setClientType] = useState<'existing' | 'new' | null>(null);
  
  // Client state
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientSearch, setClientSearch] = useState('');
  const [loadingClients, setLoadingClients] = useState(false);
  
  // New client form
  const [newClientForm, setNewClientForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [creatingClient, setCreatingClient] = useState(false);
  
  // Calendars
  const [calendars, setCalendars] = useState<Array<{id: string, name: string}>>([]);
  
  // Appointment state
  const [serviceName, setServiceName] = useState('');
  const [dateSelectionMode, setDateSelectionMode] = useState<DateSelectionMode | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [calendarOverrideDate, setCalendarOverrideDate] = useState('');
  const [duration] = useState(180);
  const [notes, setNotes] = useState('');
  
  // Final booking state
  const [creatingBooking, setCreatingBooking] = useState(false);
  const [bookingCreated, setBookingCreated] = useState(false);

  // Define functions BEFORE useEffects to avoid "Cannot access before initialization" error
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
          firstName: data.profile?.firstName || data.firstName || '',
          lastName: data.profile?.lastName || data.lastName || '',
          phone: data.profile?.phone || data.phone || ''
        };
      }).filter(c => c.email);
      setClients(clientsData);
      setFilteredClients(clientsData);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoadingClients(false);
    }
  };

  // useEffects after function definitions
  useEffect(() => {
    fetchCalendars();
  }, []);

  useEffect(() => {
    if (currentStep === 'client-selection') {
      fetchClients();
    }
  }, [currentStep]);

  useEffect(() => {
    if (clientSearch.trim() === '') {
      setFilteredClients(clients);
    } else {
      const search = clientSearch.toLowerCase();
      setFilteredClients(clients.filter(client => 
        client.displayName?.toLowerCase().includes(search) ||
        client.email?.toLowerCase().includes(search) ||
        client.phone?.includes(search)
      ));
    }
  }, [clientSearch, clients]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#AD6269]/10 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#AD6269] mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Require admin login
  if (!currentUser || userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#AD6269]/10 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#AD6269]/10 mb-6">
            <User className="w-10 h-10 text-[#AD6269]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h1>
          <p className="text-gray-500 mb-6">
            {!currentUser 
              ? 'Please log in with your admin account to access the mobile followup system.'
              : 'You need admin privileges to access this page.'}
          </p>
          <Link 
            href="/login?redirect=/mobile-followup"
            className="inline-flex items-center justify-center w-full h-14 bg-[#AD6269] hover:bg-[#9d5860] text-white font-semibold rounded-xl transition-colors"
          >
            {!currentUser ? 'Log In' : 'Switch Account'}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Link>
          <Link 
            href="/"
            className="inline-flex items-center justify-center w-full mt-3 py-3 text-gray-500 hover:text-gray-700 text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  console.log('Mobile Followup Auth:', { currentUser: currentUser?.email, userRole, authLoading });

  const handleCreateClient = async () => {
    if (!newClientForm.firstName || !newClientForm.lastName || !newClientForm.email) {
      await showAlert({
        title: 'Missing Information',
        description: 'Please fill in first name, last name, and email.',
        variant: 'warning'
      });
      return;
    }

    setCreatingClient(true);
    try {
      const newClient: Client = {
        id: `temp-${Date.now()}`,
        email: newClientForm.email,
        displayName: `${newClientForm.firstName} ${newClientForm.lastName}`,
        firstName: newClientForm.firstName,
        lastName: newClientForm.lastName,
        phone: newClientForm.phone
      };
      
      setSelectedClient(newClient);
      setCurrentStep('date-selection');
    } catch (error) {
      console.error('Error creating client:', error);
      await showAlert({
        title: 'Error',
        description: 'Failed to create client. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setCreatingClient(false);
    }
  };

  const fetchAvailableSlots = async (mode: DateSelectionMode) => {
    setLoadingSlots(true);
    setAvailableSlots([]);
    
    try {
      const today = new Date();
      let searchDate = new Date(today);
      let foundSlots = false;
      let maxDays = mode === 'weekend' ? 30 : 14;
      
      while (!foundSlots && maxDays > 0) {
        if (mode === 'weekend') {
          const day = searchDate.getDay();
          if (day !== 0 && day !== 6) {
            searchDate.setDate(searchDate.getDate() + (6 - day));
          }
        }
        
        const dateStr = searchDate.toISOString().split('T')[0];
        const response = await fetch(`/api/availability/ghl?date=${dateStr}`);
        
        if (response.ok) {
          const data = await response.json();
          const slots = data.timeSlots?.filter((s: TimeSlot) => s.available) || [];
          
          if (slots.length > 0) {
            setAvailableSlots(slots);
            setSelectedDate(dateStr);
            foundSlots = true;
          }
        }
        
        searchDate.setDate(searchDate.getDate() + 1);
        maxDays--;
      }
      
      if (!foundSlots) {
        await showAlert({
          title: 'No Availability',
          description: 'No available slots found. Try Calendar Override.',
          variant: 'warning'
        });
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const fetchSlotsForDate = async (date: string) => {
    if (!date) return;
    
    setLoadingSlots(true);
    setSelectedDate(date);
    
    try {
      const response = await fetch(`/api/availability/ghl?date=${date}`);
      
      if (response.ok) {
        const data = await response.json();
        const existingTimesArray: string[] = data.timeSlots?.filter((s: TimeSlot) => !s.available).map((s: TimeSlot) => s.time) || [];
        const slots: TimeSlot[] = [];
        
        for (let hour = 9; hour <= 15; hour++) {
          const time = `${String(hour).padStart(2, '0')}:00`;
          const endTime = `${String(hour + 3).padStart(2, '0')}:00`;
          
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
          });
        }
        
        setAvailableSlots(slots);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateModeSelect = async (mode: DateSelectionMode) => {
    setDateSelectionMode(mode);
    
    if (mode === 'calendar-override') {
      return;
    }
    
    await fetchAvailableSlots(mode);
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
        notes: notes,
        status: 'new'
      };

      const ghlResponse = await fetch('/api/appointments/create-ghl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      });

      if (!ghlResponse.ok) {
        const errorData = await ghlResponse.json();
        throw new Error(errorData.error || 'Failed to create appointment');
      }

      const ghlResult = await ghlResponse.json();

      const ghlAppointmentId = ghlResult.appointment?.id || ghlResult.appointmentId || ghlResult.appointment?.event?.id || null;

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
        price: 0,
        depositPaid: false,
        depositMethod: null,
        depositAmount: 0,
        notes: notes,
        ghlContactId: ghlResult.contactId || null,
        ghlAppointmentId: ghlAppointmentId,
        createdAt: new Date(),
        createdBy: currentUser?.uid || null,
        bookedViaMobileFollowup: true
      };

      const docRef = await addDoc(collection(getDb(), 'bookings'), bookingData);

      // Send confirmation email with iCal attachment to client (BCC Victoria)
      try {
        await fetch('/api/bookings/followup-confirmation-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            booking: {
              ...bookingData,
              id: docRef.id
            }
          })
        });
      } catch (emailError) {
        console.error('Error sending confirmation email (non-fatal):', emailError);
      }

      // Trigger GHL appointment reminder workflow
      try {
        await fetch('/api/workflows/ghl-appointment-reminders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            booking: {
              ...bookingData,
              id: docRef.id,
              ghlContactId: ghlResult.contactId || null,
              ghlAppointmentId: ghlAppointmentId
            }
          })
        });
      } catch (workflowError) {
        console.error('Error triggering reminder workflow (non-fatal):', workflowError);
      }

      setBookingCreated(true);
      setCurrentStep('confirmation');
    } catch (error) {
      console.error('Error creating booking:', error);
      await showAlert({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create booking.',
        variant: 'destructive'
      });
    } finally {
      setCreatingBooking(false);
    }
  };

  const resetWizard = () => {
    setCurrentStep('client-type');
    setClientType(null);
    setSelectedClient(null);
    setClientSearch('');
    setNewClientForm({ firstName: '', lastName: '', email: '', phone: '' });
    setServiceName('');
    setDateSelectionMode(null);
    setAvailableSlots([]);
    setSelectedSlot(null);
    setSelectedDate('');
    setCalendarOverrideDate('');
    setNotes('');
    setBookingCreated(false);
  };

  const getStepNumber = () => {
    switch (currentStep) {
      case 'client-type': return 1;
      case 'client-selection':
      case 'new-client': return 2;
      case 'date-selection': return 3;
      case 'confirmation': return 4;
      default: return 1;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#AD6269]/10 to-white">
      {/* Header */}
      <div className="bg-[#AD6269] text-white px-4 py-4 sticky top-0 z-50 shadow-lg">
        <div className="flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-white/90 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </Link>
          <h1 className="text-lg font-semibold">Mobile Followup</h1>
          <div className="w-16"></div>
        </div>
        
        {/* Progress Bar — 4 steps (no Payment) */}
        <div className="mt-4 flex items-center gap-2">
          {[1, 2, 3, 4].map((step) => (
            <div 
              key={step}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                step <= getStepNumber() ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1 text-xs text-white/70">
          <span>Client</span>
          <span>Details</span>
          <span>Date</span>
          <span>Done</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-24">
        {/* Step 1: Client Type */}
        {currentStep === 'client-type' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#AD6269]/10 mb-4">
                <User className="w-8 h-8 text-[#AD6269]" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Who's booking?</h2>
              <p className="text-gray-500 mt-1 text-sm">Select client type to continue</p>
            </div>

            <button
              onClick={() => {
                setClientType('existing');
                setCurrentStep('client-selection');
              }}
              className="w-full p-5 bg-white rounded-2xl border-2 border-gray-200 hover:border-[#AD6269] hover:shadow-lg transition-all flex items-center gap-4"
            >
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                <Search className="w-7 h-7 text-blue-600" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">Existing Client</h3>
                <p className="text-sm text-gray-500">Search from your client list</p>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-400" />
            </button>

            {userRole === 'admin' && (
            <button
              onClick={() => {
                setClientType('new');
                setCurrentStep('new-client');
              }}
              className="w-full p-5 bg-white rounded-2xl border-2 border-gray-200 hover:border-[#AD6269] hover:shadow-lg transition-all flex items-center gap-4"
            >
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <UserPlus className="w-7 h-7 text-green-600" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">New Client</h3>
                <p className="text-sm text-gray-500">Quick add new client info</p>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-400" />
            </button>
            )}
          </div>
        )}

        {/* Step 2a: Client Selection */}
        {currentStep === 'client-selection' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                autoFocus
              />
            </div>

            {loadingClients ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#AD6269] mb-2" />
                <p className="text-gray-500 text-sm">Loading clients...</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {filteredClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => {
                      setSelectedClient(client);
                      setCurrentStep('date-selection');
                    }}
                    className="w-full p-4 bg-white rounded-xl border border-gray-200 hover:border-[#AD6269] hover:shadow-md transition-all flex items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#AD6269]/10 flex items-center justify-center">
                      <span className="text-[#AD6269] font-semibold text-lg">
                        {client.displayName?.charAt(0) || client.email?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{client.displayName || 'No Name'}</p>
                      <p className="text-sm text-gray-500 truncate">{client.email}</p>
                      {client.phone && (
                        <p className="text-xs text-gray-400">{client.phone}</p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </button>
                ))}
                {filteredClients.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No clients found</p>
                    {userRole === 'admin' && (
                      <Button 
                        onClick={() => setCurrentStep('new-client')}
                        className="mt-4 bg-[#AD6269] hover:bg-[#9d5860]"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add New Client
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setCurrentStep('client-type')}
              className="w-full py-3 text-gray-500 text-sm flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        )}

        {/* Step 2b: New Client Form */}
        {currentStep === 'new-client' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-3">
                <UserPlus className="w-7 h-7 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">New Client</h2>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <Input
                    value={newClientForm.firstName}
                    onChange={(e) => setNewClientForm({...newClientForm, firstName: e.target.value})}
                    placeholder="First"
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <Input
                    value={newClientForm.lastName}
                    onChange={(e) => setNewClientForm({...newClientForm, lastName: e.target.value})}
                    placeholder="Last"
                    className="h-12"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    value={newClientForm.email}
                    onChange={(e) => setNewClientForm({...newClientForm, email: e.target.value})}
                    placeholder="email@example.com"
                    className="h-12 pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="tel"
                    value={newClientForm.phone}
                    onChange={(e) => setNewClientForm({...newClientForm, phone: e.target.value})}
                    placeholder="(555) 123-4567"
                    className="h-12 pl-10"
                  />
                </div>
              </div>
            </div>

            <Button 
              onClick={handleCreateClient}
              disabled={creatingClient || !newClientForm.firstName || !newClientForm.lastName || !newClientForm.email}
              className="w-full h-14 bg-[#AD6269] hover:bg-[#9d5860] text-lg"
            >
              {creatingClient ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>

            <button
              onClick={() => setCurrentStep('client-type')}
              className="w-full py-3 text-gray-500 text-sm flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        )}

        {/* Step 3: Date Selection */}
        {currentStep === 'date-selection' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Client Info Card */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#AD6269]/10 flex items-center justify-center">
                <User className="w-6 h-6 text-[#AD6269]" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{selectedClient?.displayName}</p>
                <p className="text-sm text-gray-500">{selectedClient?.email}</p>
              </div>
            </div>

            {/* Service Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
              <select
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent bg-white text-gray-900"
                disabled={servicesLoading}
              >
                <option value="">Select a service...</option>
                {services?.map((service) => (
                  <option key={service.id} value={service.name}>
                    {service.name} - ${service.price}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selection Mode */}
            {!dateSelectionMode && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Select Date Option</p>
                
                <button
                  onClick={() => handleDateModeSelect('next-available')}
                  className="w-full p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-[#AD6269] transition-all flex items-center gap-3"
                >
                  <CalendarClock className="w-8 h-8 text-[#AD6269]" />
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900">Next Available</h4>
                    <p className="text-xs text-gray-500">First open slot</p>
                  </div>
                </button>

                <button
                  onClick={() => handleDateModeSelect('weekend')}
                  className="w-full p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-[#AD6269] transition-all flex items-center gap-3"
                >
                  <CalendarDays className="w-8 h-8 text-[#AD6269]" />
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900">Weekend</h4>
                    <p className="text-xs text-gray-500">Saturday or Sunday</p>
                  </div>
                </button>

                <button
                  onClick={() => handleDateModeSelect('calendar-override')}
                  className="w-full p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-[#AD6269] transition-all flex items-center gap-3"
                >
                  <CalendarRange className="w-8 h-8 text-[#AD6269]" />
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900">Pick a Date</h4>
                    <p className="text-xs text-gray-500">Choose any date</p>
                  </div>
                </button>
              </div>
            )}

            {/* Calendar Override Date Picker */}
            {dateSelectionMode === 'calendar-override' && !selectedDate && (
              <div className="space-y-3">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-800 text-sm">Pick any date (respects existing bookings)</p>
                </div>
                <Input
                  type="date"
                  value={calendarOverrideDate}
                  onChange={(e) => setCalendarOverrideDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="h-12"
                />
                <Button 
                  onClick={() => fetchSlotsForDate(calendarOverrideDate)}
                  disabled={!calendarOverrideDate}
                  className="w-full h-12 bg-[#AD6269] hover:bg-[#9d5860]"
                >
                  Find Times
                </Button>
              </div>
            )}

            {/* Loading */}
            {loadingSlots && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-[#AD6269] mb-2" />
                <p className="text-gray-500 text-sm">Finding available times...</p>
              </div>
            )}

            {/* Available Slots */}
            {selectedDate && availableSlots.length > 0 && !loadingSlots && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <button 
                    onClick={() => {
                      setDateSelectionMode(null);
                      setSelectedDate('');
                      setAvailableSlots([]);
                    }}
                    className="text-sm text-[#AD6269]"
                  >
                    Change
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {availableSlots.filter(s => s.available).map((slot, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedSlot?.time === slot.time
                          ? 'border-[#AD6269] bg-[#AD6269]/10'
                          : 'border-gray-200 bg-white hover:border-[#AD6269]'
                      }`}
                    >
                      <Clock className="w-5 h-5 mx-auto mb-1 text-[#AD6269]" />
                      <p className="font-semibold text-gray-900">{slot.time}</p>
                      <p className="text-xs text-gray-500">to {slot.endTime}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedSlot && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special notes..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none h-20"
                />
              </div>
            )}

            {/* Create Booking Button — goes directly to confirmation (no payment step) */}
            {selectedSlot && (
              <Button 
                onClick={createBooking}
                disabled={creatingBooking}
                className="w-full h-14 bg-[#AD6269] hover:bg-[#9d5860] text-lg"
              >
                {creatingBooking ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Confirm Booking
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            )}

            <button
              onClick={() => {
                if (dateSelectionMode) {
                  setDateSelectionMode(null);
                  setSelectedDate('');
                  setAvailableSlots([]);
                  setSelectedSlot(null);
                } else {
                  setCurrentStep(clientType === 'new' ? 'new-client' : 'client-selection');
                }
              }}
              className="w-full py-3 text-gray-500 text-sm flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        )}

        {/* Step 4: Confirmation (Done) */}
        {currentStep === 'confirmation' && (
          <div className="space-y-6 animate-fadeIn text-center py-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-4">
              <CheckCircle className="w-14 h-14 text-green-600" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Booking Created!</h2>
              <p className="text-gray-500 mt-2">The appointment has been added to the calendar.</p>
              <p className="text-gray-500 text-sm mt-1">A confirmation email with calendar invite has been sent to the client.</p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Client</span>
                <span className="font-medium">{selectedClient?.displayName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Service</span>
                <span className="font-medium">{serviceName || 'PMU Appointment'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date</span>
                <span className="font-medium">{new Date(selectedDate + 'T00:00:00').toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Time</span>
                <span className="font-medium">{selectedSlot?.time} – {selectedSlot?.endTime}</span>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <Button 
                onClick={resetWizard}
                className="w-full h-14 bg-[#AD6269] hover:bg-[#9d5860] text-lg"
              >
                Book Another
              </Button>
              
              <Link href="/admin/dashboard">
                <Button variant="outline" className="w-full h-14 text-lg">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {AlertDialogComponent}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
