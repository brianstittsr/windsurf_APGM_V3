'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TimeBlockSelector, { TimeBlock } from './TimeBlockSelector';
import ConversationalHealthForm from './ConversationalHealthForm';
import SignaturePad from './SignaturePad';
import { useServices } from '@/hooks/useFirebase';
import { useAvailabilitySystem } from '@/hooks/useAvailabilitySystem';
import { useAuth } from '@/hooks/useAuth';

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  image: string;
}

interface ClientProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

type BookingStep = 'service' | 'datetime' | 'profile' | 'health' | 'review' | 'payment' | 'confirmation';

export default function BookingFlow() {
  const [currentStep, setCurrentStep] = useState<BookingStep>('service');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeBlock, setSelectedTimeBlock] = useState<TimeBlock | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());
    return start;
  });
  const [clientProfile, setClientProfile] = useState<ClientProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });
  const [healthFormData, setHealthFormData] = useState<Record<string, string>>({});
  const [healthSignature, setHealthSignature] = useState('');
  const [prePostCareSignature, setPrePostCareSignature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const { services, loading: servicesLoading } = useServices();
  const { availability, loading: availabilityLoading, error: availabilityError } = useAvailabilitySystem(selectedDate);
  const { isAuthenticated, userProfile } = useAuth();

  // Auto-populate profile from authenticated user
  useEffect(() => {
    if (isAuthenticated && userProfile?.profile) {
      const profile = userProfile.profile as any;
      setClientProfile(prev => ({
        ...prev,
        firstName: profile.firstName || prev.firstName,
        lastName: profile.lastName || prev.lastName,
        email: profile.email || prev.email,
        phone: profile.phone || prev.phone,
        birthDate: profile.birthDate || prev.birthDate,
        emergencyContactName: profile.emergencyContactName || prev.emergencyContactName,
        emergencyContactPhone: profile.emergencyContactPhone || prev.emergencyContactPhone
      }));
    }
  }, [isAuthenticated, userProfile]);

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(currentWeekStart);
    day.setDate(currentWeekStart.getDate() + i);
    return day;
  });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const handleServiceSelect = (service: ServiceItem) => {
    setSelectedService(service);
    setCurrentStep('datetime');
  };

  const handleDateSelect = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    setSelectedDate(dateString);
    setSelectedTimeBlock(null);
  };

  const handleTimeBlockSelect = (block: TimeBlock) => {
    setSelectedTimeBlock(block);
  };

  const handleDateTimeConfirm = () => {
    if (selectedDate && selectedTimeBlock) {
      setCurrentStep('profile');
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientProfile.firstName && clientProfile.lastName && clientProfile.email && clientProfile.phone) {
      setCurrentStep('health');
    }
  };

  const handleHealthFormComplete = (data: Record<string, string>, signature: string) => {
    setHealthFormData(data);
    setHealthSignature(signature);
    setCurrentStep('review');
  };

  const handleBookingSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTimeBlock) return;

    setIsSubmitting(true);
    try {
      // Create booking via API
      const response = await fetch('/api/calendar/book-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: `${clientProfile.firstName} ${clientProfile.lastName}`,
          clientEmail: clientProfile.email,
          clientPhone: clientProfile.phone,
          serviceName: selectedService.name,
          serviceId: selectedService.id,
          date: selectedDate,
          startTime: selectedTimeBlock.startTime,
          endTime: selectedTimeBlock.endTime,
          artistId: selectedTimeBlock.artistId,
          artistName: selectedTimeBlock.artistName,
          price: selectedService.price,
          depositAmount: 200,
          notes: `Emergency Contact: ${clientProfile.emergencyContactName} (${clientProfile.emergencyContactPhone})`
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setBookingId(result.bookingId);
        
        // Save signed document
        await fetch('/api/documents/save-signed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateName: 'Health & Consent Form',
            clientId: userProfile?.id || 'guest',
            clientName: `${clientProfile.firstName} ${clientProfile.lastName}`,
            clientEmail: clientProfile.email,
            bookingId: result.bookingId,
            signatureData: healthSignature,
            formData: healthFormData
          })
        });

        setCurrentStep('confirmation');
      } else {
        alert(result.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps: { key: BookingStep; label: string; icon: string }[] = [
    { key: 'service', label: 'Service', icon: 'fa-spa' },
    { key: 'datetime', label: 'Date & Time', icon: 'fa-calendar' },
    { key: 'profile', label: 'Your Info', icon: 'fa-user' },
    { key: 'health', label: 'Health Form', icon: 'fa-heartbeat' },
    { key: 'review', label: 'Review', icon: 'fa-check-circle' }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);

  // Render progress bar
  const renderProgressBar = () => (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div className={`flex items-center ${index <= currentStepIndex ? 'text-[#AD6269]' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index < currentStepIndex 
                    ? 'bg-[#AD6269] text-white' 
                    : index === currentStepIndex 
                    ? 'bg-[#AD6269]/10 text-[#AD6269] border-2 border-[#AD6269]' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {index < currentStepIndex ? (
                    <i className="fas fa-check"></i>
                  ) : (
                    <i className={`fas ${step.icon}`}></i>
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium hidden sm:block ${
                  index <= currentStepIndex ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 sm:w-16 h-0.5 mx-2 ${
                  index < currentStepIndex ? 'bg-[#AD6269]' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render service selection
  const renderServiceSelection = () => (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Service</h1>
        <p className="text-gray-600">Select the permanent makeup service you'd like to book</p>
      </div>

      {servicesLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#AD6269]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services?.map((service: ServiceItem) => (
            <button
              key={service.id}
              onClick={() => handleServiceSelect(service)}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-[#AD6269] transition-all duration-300 text-left group"
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <Image
                  src={service.image || '/images/services/default.jpg'}
                  alt={service.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white">{service.name}</h3>
                </div>
              </div>
              <div className="p-5">
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-[#AD6269]">${service.price}</span>
                    <span className="text-gray-500 text-sm ml-2">{service.duration}</span>
                  </div>
                  <div className="w-10 h-10 bg-[#AD6269]/10 rounded-full flex items-center justify-center group-hover:bg-[#AD6269] transition-colors">
                    <i className="fas fa-arrow-right text-[#AD6269] group-hover:text-white transition-colors"></i>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Render date/time selection
  const renderDateTimeSelection = () => (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Date & Time</h1>
        <p className="text-gray-600">Choose your preferred appointment slot</p>
        {selectedService && (
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#AD6269]/10 rounded-full">
            <i className="fas fa-spa text-[#AD6269]"></i>
            <span className="font-medium text-[#AD6269]">{selectedService.name}</span>
          </div>
        )}
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={goToPreviousWeek}>
            <i className="fas fa-chevron-left"></i>
          </Button>
          <h2 className="text-xl font-bold text-gray-900">
            {currentWeekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <Button variant="outline" onClick={goToNextWeek}>
            <i className="fas fa-chevron-right"></i>
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => {
            const dateString = day.toISOString().split('T')[0];
            const isPast = day < today;
            const isSelected = selectedDate === dateString;
            const isToday = day.toDateString() === today.toDateString();

            return (
              <button
                key={dateString}
                onClick={() => !isPast && handleDateSelect(day)}
                disabled={isPast}
                className={`p-3 rounded-xl text-center transition-all ${
                  isPast
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isSelected
                    ? 'bg-[#AD6269] text-white shadow-lg'
                    : isToday
                    ? 'bg-amber-100 text-amber-800 border-2 border-amber-300'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                }`}
              >
                <div className="text-xs font-medium mb-1">{dayNames[index]}</div>
                <div className="text-lg font-bold">{day.getDate()}</div>
                {isToday && <div className="text-[10px]">Today</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Blocks */}
      {selectedDate && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <TimeBlockSelector
            date={selectedDate}
            timeSlots={availability?.timeSlots || []}
            selectedBlock={selectedTimeBlock}
            onSelectBlock={handleTimeBlockSelect}
            serviceDuration={3}
            loading={availabilityLoading}
            error={availabilityError}
          />
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => setCurrentStep('service')}>
          <i className="fas fa-arrow-left mr-2"></i>Back
        </Button>
        <Button
          onClick={handleDateTimeConfirm}
          disabled={!selectedDate || !selectedTimeBlock}
          className="bg-[#AD6269] hover:bg-[#9d5860]"
        >
          Continue<i className="fas fa-arrow-right ml-2"></i>
        </Button>
      </div>
    </div>
  );

  // Render profile form
  const renderProfileForm = () => (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Information</h1>
        <p className="text-gray-600">Please provide your contact details</p>
      </div>

      <form onSubmit={handleProfileSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={clientProfile.firstName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClientProfile({ ...clientProfile, firstName: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={clientProfile.lastName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClientProfile({ ...clientProfile, lastName: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={clientProfile.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClientProfile({ ...clientProfile, email: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            type="tel"
            value={clientProfile.phone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClientProfile({ ...clientProfile, phone: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthDate">Date of Birth</Label>
          <Input
            id="birthDate"
            type="date"
            value={clientProfile.birthDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClientProfile({ ...clientProfile, birthDate: e.target.value })}
          />
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyName">Name</Label>
              <Input
                id="emergencyName"
                value={clientProfile.emergencyContactName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClientProfile({ ...clientProfile, emergencyContactName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Phone</Label>
              <Input
                id="emergencyPhone"
                type="tel"
                value={clientProfile.emergencyContactPhone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClientProfile({ ...clientProfile, emergencyContactPhone: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={() => setCurrentStep('datetime')}>
            <i className="fas fa-arrow-left mr-2"></i>Back
          </Button>
          <Button type="submit" className="bg-[#AD6269] hover:bg-[#9d5860]">
            Continue<i className="fas fa-arrow-right ml-2"></i>
          </Button>
        </div>
      </form>
    </div>
  );

  // Render health form
  const renderHealthForm = () => (
    <ConversationalHealthForm
      onComplete={handleHealthFormComplete}
      onBack={() => setCurrentStep('profile')}
      initialData={healthFormData}
      initialSignature={healthSignature}
    />
  );

  // Render review
  const renderReview = () => (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Your Booking</h1>
        <p className="text-gray-600">Please confirm all details are correct</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Service */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Service</h3>
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">{selectedService?.name}</span>
            <span className="text-xl font-bold text-[#AD6269]">${selectedService?.price}</span>
          </div>
        </div>

        {/* Date & Time */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Date & Time</h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#AD6269]/10 rounded-full flex items-center justify-center">
              <i className="fas fa-calendar text-[#AD6269]"></i>
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {selectedDate && new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="text-gray-600">{selectedTimeBlock?.displayTime}</p>
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Your Information</h3>
          <div className="space-y-2">
            <p className="font-semibold text-gray-900">{clientProfile.firstName} {clientProfile.lastName}</p>
            <p className="text-gray-600">{clientProfile.email}</p>
            <p className="text-gray-600">{clientProfile.phone}</p>
          </div>
        </div>

        {/* Deposit Info */}
        <div className="p-6 bg-amber-50">
          <div className="flex items-start gap-3">
            <i className="fas fa-info-circle text-amber-600 mt-1"></i>
            <div>
              <p className="font-medium text-amber-800">Deposit Required</p>
              <p className="text-amber-700 text-sm">A $200 deposit is required to confirm your booking. The remaining balance will be due at your appointment.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => setCurrentStep('health')}>
          <i className="fas fa-arrow-left mr-2"></i>Back
        </Button>
        <Button
          onClick={handleBookingSubmit}
          disabled={isSubmitting}
          className="bg-[#AD6269] hover:bg-[#9d5860]"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              Confirm Booking<i className="fas fa-check ml-2"></i>
            </>
          )}
        </Button>
      </div>
    </div>
  );

  // Render confirmation
  const renderConfirmation = () => (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <i className="fas fa-check text-4xl text-green-600"></i>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Booking Confirmed!</h1>
      <p className="text-gray-600 mb-8">
        Your appointment has been successfully scheduled. A confirmation email has been sent to {clientProfile.email}.
      </p>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 text-left">
        <h3 className="font-semibold text-gray-900 mb-4">Appointment Details</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Service:</span>
            <span className="font-medium">{selectedService?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium">
              {selectedDate && new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Time:</span>
            <span className="font-medium">{selectedTimeBlock?.displayTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Booking ID:</span>
            <span className="font-mono text-sm">{bookingId}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={() => window.location.href = '/'}>
          Return Home
        </Button>
        <Button className="bg-[#AD6269] hover:bg-[#9d5860]" onClick={() => window.location.href = '/contact'}>
          Contact Us
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {currentStep !== 'confirmation' && renderProgressBar()}
      
      {currentStep === 'service' && renderServiceSelection()}
      {currentStep === 'datetime' && renderDateTimeSelection()}
      {currentStep === 'profile' && renderProfileForm()}
      {currentStep === 'health' && renderHealthForm()}
      {currentStep === 'review' && renderReview()}
      {currentStep === 'confirmation' && renderConfirmation()}
    </div>
  );
}
