'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Timestamp } from 'firebase/firestore';
import { UserService } from '@/services/database';
import { ActivityService } from '@/services/activityService';
import { useAvailability } from '@/hooks/useAvailability';
import { useAuth } from '@/hooks/useAuth';
import { useAppointments } from '@/hooks/useAppointments';
import { useHealthForm } from '@/hooks/useHealthForm';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { useAvailabilitySystem } from '@/hooks/useAvailabilitySystem';
import { useNextAvailableDate } from '@/hooks/useNextAvailableDate';
import { useServices } from '@/hooks/useFirebase';
import ClientProfileWizard, { ClientProfileData } from '@/components/ClientProfileWizard';
import HealthFormWizard, { HealthFormData } from '@/components/HealthFormWizard';
import CheckoutCart from '@/components/CheckoutCart';
import MonthlyCalendar from '@/components/booking/MonthlyCalendar';
import TimeSlotSelector from '@/components/booking/TimeSlotSelector';

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  image: string;
}

interface CheckoutData {
  selectedDate: string;
  selectedTime: string;
  paymentMethod: string;
  specialRequests: string;
  giftCard: string;
  agreeToTerms: boolean;
  agreeToPolicy: boolean;
}
// Removed FormDataRecoveryBanner - form recovery feature disabled
// Removed unused service imports - using hooks instead
import { getServiceImagePath } from '@/utils/serviceImageUtils';
import { calculateTotalWithStripeFees } from '@/lib/stripe-fees';
import { useWorkflowTrigger } from '@/hooks/useWorkflowTrigger';
import { Button } from '@/components/ui/button';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import DatabaseSetup from '../../components/DatabaseSetup';
import ProfileConfirmation from '../../components/ProfileConfirmation';
// Email services moved to API routes to avoid client-side imports

// Helper function to convert 24-hour time to 12-hour format
function formatTimeTo12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12; // Convert 0 to 12 for midnight
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

function BookNowCustomContent() {
  const searchParams = useSearchParams();
  const isSetupMode = searchParams.get('setup') === 'true';
  
  const [currentStep, setCurrentStep] = useState<'services' | 'account-suggestion' | 'calendar' | 'profile' | 'health' | 'pre-post-care' | 'checkout' | 'confirmation'>('services');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Clear any localStorage data that might be persisting dates
  useEffect(() => {
    // Clear any potential form persistence data
    const keysToRemove = [
      'booking_form_main',
      'booking_form_calendar', 
      'booking_form_profile',
      'booking_form_health',
      'booking_form_checkout',
      'selectedDate',
      'bookingFormData'
    ];
    
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        // Ignore errors
      }
    });
    
    console.log('Cleared localStorage booking data');
  }, []); // Run once on mount

  // Simple validation - clear any past dates immediately
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate && selectedDate < today) {
      console.log('Clearing past date:', selectedDate);
      setSelectedDate('');
    }
  }, [selectedDate]);

  // Simple setter with validation
  const setValidatedSelectedDate = useCallback((dateString: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (dateString === '' || dateString >= today) {
      setSelectedDate(dateString);
    } else {
      console.log('Rejecting past date:', dateString);
      setSelectedDate('');
    }
  }, []);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedArtistId, setSelectedArtistId] = useState<string>('');
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const [currentWeekStart, setCurrentWeekStart] = useState<Date | null>(null);

  
  // Show database setup if setup parameter is present
  if (isSetupMode) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex justify-center">
            <div className="w-full max-w-3xl">
              <h1 className="text-center mb-8 text-3xl font-bold">Database Setup</h1>
              <DatabaseSetup />
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  // Firebase hooks
  const { services, loading: servicesLoading, error: servicesError } = useServices();
  const { createAppointment } = useAppointments();
  const { submitHealthForm } = useHealthForm();
  const { availability, bookTimeSlot } = useAvailability(selectedDate);
  const { timeSlots, loading, error } = useTimeSlots(selectedDate);
  const { availability: unifiedAvailability, loading: unifiedLoading, error: unifiedError, isUsingGHL } = useAvailabilitySystem(selectedDate);
  const { nextAvailable, findNextAvailableDate, findNextAvailableAfter, clearNextAvailable } = useNextAvailableDate();
  
  // Use unified availability system if available, otherwise fall back to original
  const activeTimeSlots = unifiedAvailability || timeSlots;
  const activeLoading = unifiedLoading || loading;
  const activeError = unifiedError || error;
  
  // Auth hook for user profile auto-population
  const { isAuthenticated, userProfile, getClientProfileData } = useAuth();
  
  // Workflow trigger hook
  const { triggerNewClientWorkflow, triggerAppointmentBookedWorkflow } = useWorkflowTrigger();
  
  const [clientProfile, setClientProfile] = useState<ClientProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    birthDate: '',
    age: 0,
    emergencyContactName: '',
    emergencyContactPhone: ''
  });
  
  const [healthFormData, setHealthFormData] = useState<HealthFormData>({});
  const [clientSignature, setClientSignature] = useState<string>('');
  const [prePostCareSignature, setPrePostCareSignature] = useState<string>('');
  
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    selectedDate: '',
    selectedTime: '',
    paymentMethod: '',
    specialRequests: '',
    giftCard: '',
    agreeToTerms: false,
    agreeToPolicy: false
  });

  const [showProfileConfirmation, setShowProfileConfirmation] = useState(false);

  // Form persistence feature removed

  // Handle URL parameters for returning from login/register and auto-populate user data
  useEffect(() => {
    const step = searchParams.get('step');
    const serviceParam = searchParams.get('service');
    
    // If user is returning from login/register with service info
    if (step === 'calendar' && serviceParam && services && services.length > 0) {
      // Find the service by ID
      const service = services.find((s: ServiceItem) => s.id === serviceParam);
      if (service) {
        setSelectedService(service);
        setCurrentStep('calendar');
      }
    }
    
    // Profile auto-population removed - users must manually enter their information
  }, [searchParams, services, isAuthenticated, userProfile, getClientProfileData]);

  // Initialize currentWeekStart on mount
  useEffect(() => {
    if (!currentWeekStart) {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
      setCurrentWeekStart(startOfWeek);
      console.log('Initialized currentWeekStart:', startOfWeek.toDateString());
    }
  }, [currentWeekStart]);

  // Auto-navigate to next available date when nextAvailable is found
  useEffect(() => {
    if (nextAvailable) {
      const today = new Date().toISOString().split('T')[0];
      
      if (nextAvailable.date >= today) {
        console.log('Setting calendar to next available date:', nextAvailable.date);
        const nextAvailableDate = new Date(nextAvailable.date);
        const nextWeekStart = new Date(nextAvailableDate);
        nextWeekStart.setDate(nextAvailableDate.getDate() - nextAvailableDate.getDay()); // Start from Sunday
        setCurrentWeekStart(nextWeekStart);
        setValidatedSelectedDate(nextAvailable.date);
      } else {
        console.log('Next available date is past, clearing...');
        clearNextAvailable();
        findNextAvailableDate();
      }
    }
  }, [nextAvailable, findNextAvailableDate, clearNextAvailable]);

  // Function to advance to next available date
  const advanceToNextAvailable = useCallback(async () => {
    console.log('🚀 Advance to next available date clicked');
    console.log('🔍 Current selectedDate:', selectedDate);
    
    // Clear current selection first
    setSelectedDate('');
    setSelectedTime('');
    setSelectedArtistId('');
    
    if (selectedDate) {
      // If we have a selected date, find the next available date after it
      console.log('🔍 Finding next available date after:', selectedDate);
      await findNextAvailableAfter(selectedDate);
    } else {
      // If no date selected, find the next available date from today
      console.log('🔍 Finding next available date from today');
      await findNextAvailableDate();
    }
  }, [selectedDate, findNextAvailableAfter, findNextAvailableDate]);

  // Initialize currentWeekStart to current week ONLY after we've checked for next available date
  useEffect(() => {
    // Only initialize to current week if:
    // 1. No currentWeekStart is set
    // 2. We've already tried to find next available date (nextAvailable is null, not undefined)
    // 3. We're on the calendar step
    if (!currentWeekStart && nextAvailable === null && currentStep === 'calendar') {
      console.log('No available dates found, initializing to current week starting from today');
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Start of current week (Sunday)
      
      // Ensure we don't start from a past week
      const todayString = today.toISOString().split('T')[0];
      const weekStartString = weekStart.toISOString().split('T')[0];
      
      if (weekStartString < todayString) {
        // If week start is in the past, advance to next week
        weekStart.setDate(weekStart.getDate() + 7);
        console.log('Week start was in past, advancing to next week:', weekStart.toDateString());
      }
      
      setCurrentWeekStart(weekStart);
    }
  }, [currentWeekStart, nextAvailable, currentStep]);

  // Find next available date when service is selected or calendar step is reached
  useEffect(() => {
    console.log('Service selection useEffect triggered:', { 
      selectedService: selectedService?.name, 
      selectedDate, 
      nextAvailable: nextAvailable?.date,
      currentStep 
    });
    if (selectedService && !selectedDate && !nextAvailable) {
      console.log('Calling findNextAvailableDate from service selection');
      findNextAvailableDate();
    }
  }, [selectedService, findNextAvailableDate, selectedDate, nextAvailable, currentStep]);

  // Force clear selected date on component mount and whenever it becomes a past date
  useEffect(() => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
    console.log('🔍 Date validation check - selectedDate:', selectedDate, 'today:', todayString, 'day:', dayOfWeek);
    
    // If selectedDate is in the past, force it to today
    if (selectedDate && selectedDate < todayString) {
      console.log('⚠️ Past date detected, forcing to today:', todayString);
      setSelectedDate(todayString);
    }
  }, [selectedDate]); // Run whenever selectedDate changes

  // Force refresh if we detect a past date in nextAvailable
  useEffect(() => {
    if (nextAvailable) {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      
      if (nextAvailable.date < todayString) {
        console.log('🚨 Detected past date in nextAvailable:', nextAvailable.date, 'forcing refresh...');
        setValidatedSelectedDate('');
        clearNextAvailable();
        findNextAvailableDate();
      }
    }
  }, [nextAvailable, findNextAvailableDate, clearNextAvailable]);

  // Auto-navigate to next available date when calendar step becomes active
  useEffect(() => {
    console.log('Calendar step useEffect triggered:', { 
      currentStep, 
      selectedService: selectedService?.name, 
      selectedDate,
      nextAvailable: nextAvailable?.date,
      currentWeekStart: currentWeekStart?.toDateString()
    });
    if (currentStep === 'calendar' && selectedService && !selectedDate && !nextAvailable) {
      console.log('Calling findNextAvailableDate from calendar step');
      findNextAvailableDate();
    }
  }, [currentStep, selectedService, selectedDate, findNextAvailableDate, nextAvailable, currentWeekStart]);

  // Services are now loaded from Firebase via useServices hook

  // Handle date selection from calendar
  const handleDateSelect = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    console.log('Date clicked:', dateString);
    
    setValidatedSelectedDate(dateString);
    setSelectedTime('');
    setSelectedArtistId('');
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (time: string, artistId: string) => {
    setSelectedTime(time);
    setSelectedArtistId(artistId);
  };

  const handleServiceSelect = (service: ServiceItem) => {
    setSelectedService(service);
    // Skip account suggestion step if user is already authenticated
    if (isAuthenticated) {
      setCurrentStep('calendar');
    } else {
      setCurrentStep('account-suggestion');
    }
  };

  const handleDateTimeSelect = (date: string, time: string) => {
    setValidatedSelectedDate(date);
    setSelectedTime(time);
    
    // Check if user is authenticated and has complete profile data
    if (isAuthenticated && userProfile) {
      const profile = userProfile.profile;
      if (profile && profile.firstName && profile.lastName && profile.email && profile.phone) {
        // User has complete profile, show confirmation
        setShowProfileConfirmation(true);
        setCurrentStep('profile');
      } else {
        // User needs to complete profile
        setShowProfileConfirmation(false);
        setCurrentStep('profile');
      }
    } else {
      // User not authenticated, go to profile step
      setShowProfileConfirmation(false);
      setCurrentStep('profile');
    }
  };

  const handleHealthFormSubmit = async () => {
    try {
      // Get user profile data for emails
      const profile = userProfile?.profile;
      if (!profile) {
        console.error('No user profile available for email sending');
        setCurrentStep('pre-post-care');
        return;
      }

      // Send login information email via API
      const loginEmailData = {
        clientName: `${profile.firstName} ${profile.lastName}`,
        clientEmail: profile.email,
        temporaryPassword: 'TempPass123!', // Generate a temporary password
        loginUrl: `${window.location.origin}/login`,
        businessName: 'A Pretty Girl Matter',
        businessPhone: '(919) 123-4567',
        businessEmail: 'victoria@aprettygirlmatter.com'
      };
      
      const loginResponse = await fetch('/api/send-login-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginEmailData,
          clientId: userProfile?.id || 'temp-client-id',
          appointmentId: `appointment-${Date.now()}`,
          generatePDF: true
        })
      });
      
      const loginResult = await loginResponse.json();
      console.log('Login email sent:', loginResponse.ok);
      
      if (loginResult.pdfGenerated) {
        console.log('✅ Login/Consent PDF created:', loginResult.pdfUrl);
        
        // Log consent PDF generation activity
        try {
          await ActivityService.logPDFActivity(
            userProfile?.id || 'temp-client-id',
            'consent',
            loginResult.pdfId,
            `appointment-${Date.now()}`
          );
        } catch (activityError) {
          console.error('Failed to log consent PDF activity:', activityError);
        }
      }
      
      // Send health form confirmation email via API
      const healthFormEmailData = {
        clientName: `${profile.firstName} ${profile.lastName}`,
        clientEmail: profile.email,
        healthFormData,
        clientSignature,
        submissionDate: new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short'
        }),
        businessName: 'A Pretty Girl Matter',
        businessPhone: '(919) 123-4567',
        businessEmail: 'victoria@aprettygirlmatter.com'
      };
      
      const healthFormResponse = await fetch('/api/send-health-form-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          healthFormEmailData,
          clientId: userProfile?.id || 'temp-client-id',
          appointmentId: `appointment-${Date.now()}`,
          generatePDF: true
        })
      });
      
      const healthFormResult = await healthFormResponse.json();
      console.log('Health form email sent:', healthFormResponse.ok);
      
      if (healthFormResult.pdfGenerated) {
        console.log('✅ Health form PDF created:', healthFormResult.pdfUrl);
        
        // Log health form submission activity
        try {
          await ActivityService.logFormActivity(
            userProfile?.id || 'temp-client-id',
            'health',
            `appointment-${Date.now()}`
          );
          
          // Log PDF generation activity
          await ActivityService.logPDFActivity(
            userProfile?.id || 'temp-client-id',
            'health',
            healthFormResult.pdfId,
            `appointment-${Date.now()}`
          );
        } catch (activityError) {
          console.error('Failed to log health form activity:', activityError);
        }
      }
      
      // Move to pre-post care step
      setCurrentStep('pre-post-care');
    } catch (error) {
      console.error('Failed to send emails:', error);
      // Still move to pre-post care even if emails fail
      setCurrentStep('pre-post-care');
    }
  };

  const handlePrePostCareComplete = () => {
    setCurrentStep('checkout');
  };

  // Update user profile when moving from profile to health step
  const updateUserProfile = async () => {
    console.log('🔍 updateUserProfile called - Auth state:', { isAuthenticated, userProfile: !!userProfile, userProfileId: userProfile?.id });
    
    if (!isAuthenticated || !userProfile?.id) {
      console.log('❌ User not authenticated, skipping profile update:', { isAuthenticated, userProfile: !!userProfile });
      return;
    }

    // For development mode with mock users, skip Firebase updates
    if (userProfile?.id?.includes('mock')) {
      console.log('🔧 Mock user detected - simulating profile update');
      console.log('Updated profile data:', clientProfile);
      return;
    }

    // For real Firebase users, ensure we have a valid user ID
    const userId = userProfile?.id;
    if (!userId) {
      console.log('❌ No valid user ID found, skipping profile update');
      return;
    }

    console.log('✅ Firebase user authenticated, proceeding with profile update');
    console.log('User ID:', userId);
    console.log('User email:', userProfile?.profile.email);

    // Check if emergency contact data has changed
    const currentProfile = userProfile?.profile;
    const hasChanges = !currentProfile || (
      currentProfile.emergencyContactName !== clientProfile.emergencyContactName ||
      currentProfile.emergencyContactPhone !== clientProfile.emergencyContactPhone
    );

    if (!hasChanges) {
      console.log('📝 No emergency contact changes detected, skipping update');
      return;
    }

    console.log('📝 Emergency contact changes detected, updating Firebase...');

    try {
      // Prepare updated profile data - only update emergency contact fields
      const updatedProfileData = {
        ...currentProfile, // Keep all existing profile data
        emergencyContactName: clientProfile.emergencyContactName,
        emergencyContactPhone: clientProfile.emergencyContactPhone,
        createdAt: currentProfile?.createdAt || Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      // Update user profile in Firebase
      if (currentProfile) {
        // Update existing profile
        await UserService.updateUser(userId, { profile: updatedProfileData });
        console.log('✅ Profile updated successfully in Firebase');
      } else {
        // Create new profile if it doesn't exist
        const newUser = {
          id: userId,
          profile: updatedProfileData,
          role: 'client' as const,
          isActive: true
        };
        await UserService.createUser(newUser);
        console.log('✅ New profile created successfully in Firebase');
      }
      
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      // Don't block navigation on profile update failure
    }
  };

  const handleProfileToHealth = async () => {
    await updateUserProfile();
    // Skip health and pre-post-care steps, go directly to checkout
    setCurrentStep('checkout');
  };

  const handleBookingComplete = async () => {
    if (!selectedService) return;
    
    try {
      // Update user profile in database if user is authenticated
      if (isAuthenticated && userProfile?.id) {
        try {
          const { UserService } = await import('@/services/userService');
          
          // Update the user's profile with the form data
          console.log('⚠️ Creating new profile for authenticated user - this is unexpected');
          const newProfileData = {
            ...userProfile.profile, // Keep existing profile data
            emergencyContactName: clientProfile.emergencyContactName,
            emergencyContactPhone: clientProfile.emergencyContactPhone,
            updatedAt: Timestamp.now()
          };
          
          await UserService.updateUser(userProfile.id, { profile: newProfileData });
          console.log('✅ User profile updated successfully in database');
        } catch (profileError) {
          console.error('❌ Failed to update user profile:', profileError);
          // Don't fail the booking if profile update fails
        }
      }
      
      // Create appointment in Firebase
      const profile = userProfile?.profile;
      const appointmentData = {
        clientId: userProfile?.id || 'temp-client-id', // Use authenticated user's ID if available
        clientName: profile ? `${profile.firstName} ${profile.lastName}` : 'Unknown Client',
        clientEmail: profile?.email || 'unknown@email.com',
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        artistId: selectedArtistId || 'default-artist',
        scheduledDate: selectedDate,
        scheduledTime: selectedTime,
        status: 'pending' as const,
        // Calculate amounts with Stripe fees (using default values since async not supported in object literal)
        totalAmount: selectedService.price * 1.0775 + 10, // Price + tax + estimated fee
        depositAmount: 200 + 10, // Deposit + estimated Stripe fee
        remainingAmount: selectedService.price * 1.0775 - 200, // Service + tax - deposit
        paymentStatus: 'pending' as const,
        paymentIntentId: '', // Will be set during payment processing
        specialRequests: checkoutData.specialRequests,
        ...(checkoutData.giftCard && { giftCardCode: checkoutData.giftCard }),
        rescheduleCount: 0,
        confirmationSent: false,
        reminderSent: false
      };
      
      const appointmentId = await createAppointment(appointmentData);
      
      // Submit health form
      if (Object.keys(healthFormData).length > 0) {
        // Convert HealthFormData to the expected format
        const responses: { [key: string]: string } = {};
        Object.entries(healthFormData).forEach(([key, value]) => {
          responses[key] = String(value);
        });
        
        await submitHealthForm({
          clientId: 'temp-client-id',
          appointmentId,
          responses,
          ipAddress: '',
          isValid: true,
          clearanceRequired: false
        }, clientSignature);
      }
      
      // Book the time slot
      await bookTimeSlot(selectedTime, appointmentId, 'default-artist');
      
      // Trigger marketing workflows
      try {
        const clientId = userProfile?.id || 'temp-client-id';
        const clientEmail = profile?.email;
        
        // Check if this is a new client (in production, you'd check if user exists in database)
        const isNewClient = true; // This would be determined by checking user history
        
        if (isNewClient && clientEmail) {
          // Trigger new client welcome workflow
          await triggerNewClientWorkflow(clientId, clientEmail);
        }
        
        if (clientEmail) {
          // Trigger appointment booked workflow
          await triggerAppointmentBookedWorkflow(clientId, clientEmail, {
            appointmentId,
            serviceType: selectedService.name,
            appointmentDate: selectedDate,
            artistId: selectedArtistId || 'default-artist'
          });
        }
        
        console.log('Marketing workflows triggered successfully');
      } catch (workflowError) {
        console.error('Failed to trigger marketing workflows:', workflowError);
        // Don't fail the booking if workflows fail
      }
      
      // Generate booking confirmation PDF
      try {
        console.log('📄 Generating booking confirmation PDF...');
        const bookingPDFResponse = await fetch('/api/generate-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: userProfile?.id || 'temp-client-id',
            appointmentId,
            formType: 'booking',
            formData: {
              clientProfile: profile,
              appointment: {
                id: appointmentId,
                serviceType: selectedService.name,
                appointmentDate: selectedDate,
                appointmentTime: selectedTime,
                artistId: selectedArtistId || 'default-artist'
              },
              service: selectedService,
              signatures: {
                clientSignature: clientSignature || 'Digital confirmation'
              }
            }
          })
        });
        
        const bookingPDFResult = await bookingPDFResponse.json();
        if (bookingPDFResult.success) {
          console.log('✅ Booking confirmation PDF created:', bookingPDFResult.pdfUrl);
          
          // Log booking completion and PDF generation activities
          try {
            await ActivityService.logAppointmentActivity(
              userProfile?.id || 'temp-client-id',
              'appointment_created',
              appointmentId,
              selectedService.name,
              {
                appointmentDate: selectedDate,
                appointmentTime: selectedTime,
                artistId: selectedArtistId || 'default-artist'
              }
            );
            
            await ActivityService.logPDFActivity(
              userProfile?.id || 'temp-client-id',
              'booking',
              bookingPDFResult.pdfId,
              appointmentId
            );
          } catch (activityError) {
            console.error('Failed to log booking activities:', activityError);
          }
        }
      } catch (pdfError) {
        console.error('⚠️ Failed to generate booking PDF (non-critical):', pdfError);
      }

      console.log('Booking completed successfully:', appointmentId);
      // Form persistence removed - no data to clear
      setCurrentStep('confirmation');
    } catch (error) {
      console.error('Failed to complete booking:', error);
      // You might want to show an error message to the user
    }
  };

  // Calendar navigation functions
  const goToPreviousWeek = () => {
    if (!currentWeekStart) return;
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
  };

  const goToNextWeek = () => {
    if (!currentWeekStart) return;
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
  };

  const renderCalendarSelection = () => {
    const handleSlotSelect = (slotId: string, startTime: string) => {
      setSelectedSlotId(slotId);
      setSelectedTime(startTime);
      setSelectedArtistId('victoria'); // Default artist
    };

    const handleDateSelectFromCalendar = (dateString: string) => {
      setValidatedSelectedDate(dateString);
      setSelectedSlotId(null);
      setSelectedTime('');
      setSelectedArtistId('');
    };

    return (
      <div className="w-full px-4 py-8">
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#AD6269] to-[#c17a80] text-center py-8 px-4">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Book Your Appointment
                </h1>
                <p className="text-white/90">Select your preferred date and time</p>
              </div>

              <div className="p-6 md:p-8">
                {/* Calendar Section */}
                <div className="mb-8">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      <i className="fas fa-calendar-alt text-[#AD6269] mr-2"></i>
                      Select a Date
                    </h2>
                    <p className="text-gray-500 text-sm">
                      Choose an available date from the calendar
                    </p>
                  </div>

                  <MonthlyCalendar
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelectFromCalendar}
                    maxBookingsPerDay={2}
                  />
                </div>

                {/* Time Slots Section - Shows when date is selected */}
                {selectedDate && (
                  <div className="border-t border-gray-200 pt-8">
                    <TimeSlotSelector
                      selectedDate={selectedDate}
                      selectedSlot={selectedSlotId}
                      onSlotSelect={handleSlotSelect}
                    />

                    {/* Continue Button */}
                    {selectedSlotId && selectedTime && (
                      <div className="text-center mt-8">
                        <Button
                          size="lg"
                          className="bg-[#AD6269] hover:bg-[#9d5860] px-8 py-3 text-lg"
                          onClick={() => {
                            console.log('Continue button clicked');
                            console.log('selectedDate:', selectedDate);
                            console.log('selectedTime:', selectedTime);
                            console.log('selectedSlotId:', selectedSlotId);
                            
                            // Update checkout data with selected date and time
                            setCheckoutData(prev => ({
                              ...prev,
                              selectedDate,
                              selectedTime
                            }));
                            
                            // Go to profile form
                            setCurrentStep('profile');
                          }}
                        >
                          Continue to Profile
                          <i className="fas fa-arrow-right ml-2"></i>
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Back Button */}
                <div className="text-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('services')}
                    className="text-gray-600"
                  >
                    <i className="fas fa-arrow-left mr-2"></i>
                    Back to Services
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProgressBar = () => {
    const stepLabels = [
      { key: 'services', label: 'Service' },
      { key: 'account-suggestion', label: 'Account' },
      { key: 'calendar', label: 'Date & Time' },
      { key: 'profile', label: 'Profile' },
      { key: 'checkout', label: 'Checkout' }
    ];
    // Map current step to the visible steps (health and pre-post-care map to checkout)
    const mappedStep = (currentStep === 'health' || currentStep === 'pre-post-care') ? 'checkout' : currentStep;
    const currentIndex = stepLabels.findIndex(s => s.key === mappedStep);
    const progress = ((currentIndex + 1) / stepLabels.length) * 100;

    return (
      <div className="w-full bg-[#AD6269] py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Step counter and progress percentage */}
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-white font-medium">Step {currentIndex + 1} of {stepLabels.length}</span>
            <span className="text-sm text-white font-medium">{Math.round(progress)}% Complete</span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-white/30 rounded-full h-2.5 overflow-hidden mb-4">
            <div 
              className="bg-gray-900 h-full rounded-full transition-all duration-300 ease-out" 
              role="progressbar" 
              style={{ width: `${progress}%` }}
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          
          {/* Step labels */}
          <div className="grid grid-cols-5 gap-1">
            {stepLabels.map((step, index) => (
              <div 
                key={step.key}
                className={`text-center ${
                  index === currentIndex 
                    ? 'text-white font-bold' 
                    : index < currentIndex 
                      ? 'text-white/90' 
                      : 'text-white/60'
                }`}
              >
                <span className="text-xs sm:text-sm whitespace-nowrap overflow-hidden text-ellipsis block">
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };



  const renderServiceSelection = () => (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-[#AD6269] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Choose Your Service</h1>
        <p className="text-gray-600 text-lg">Select the permanent makeup service you&apos;d like to book</p>
      </div>
          
      {servicesLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#AD6269] mx-auto" role="status">
            <span className="sr-only">Loading services...</span>
          </div>
          <p className="mt-4 text-gray-500">Loading services...</p>
        </div>
      )}
      
      {servicesError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <h4 className="font-bold text-lg">Error Loading Services</h4>
          <p>{servicesError}</p>
        </div>
      )}
          
      {!servicesLoading && !servicesError && (
        <>
          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.slice(0, 6).map((service: ServiceItem) => (
              <div 
                key={service.id}
                className={`bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  selectedService?.id === service.id 
                    ? 'ring-2 ring-[#AD6269] bg-[#AD6269]/5' 
                    : ''
                }`}
                onClick={() => handleServiceSelect(service)}
              >
                {/* Image Container - Fixed smaller height */}
                <div className="relative h-[160px] bg-gray-50 overflow-hidden">
                  <Image
                    src={getServiceImagePath(service)}
                    alt={service.name}
                    fill
                    className="object-contain p-4"
                  />
                </div>
                
                {/* Card Content */}
                <div className="p-5">
                  <h3 className="text-[#AD6269] font-semibold text-lg mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {service.name}
                  </h3>
                  
                  {/* Price and Duration Badges */}
                  <div className="flex gap-2 mb-3">
                    <span className="inline-block bg-[#AD6269] text-white px-3 py-1 rounded-full text-sm font-medium">
                      ${service.price}
                    </span>
                    <span className="inline-block bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {service.duration}
                    </span>
                  </div>
                  
                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {service.description}
                  </p>
                  
                  {/* Select Button */}
                  <Button
                    className="w-full bg-[#AD6269] hover:bg-[#9d5860] text-sm"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleServiceSelect(service);
                    }}
                  >
                    Select This Service
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  const renderAccountSuggestion = () => (
    <div className="container-fluid py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-lg border-0">
            <div className="card-header text-center py-4" style={{ backgroundColor: '#AD6269', color: 'white' }}>
              <i className="fas fa-user-plus fa-3x mb-3"></i>
              <h2 className="h3 mb-0">Create Your Account</h2>
              <p className="mb-0 opacity-75">Save your information for faster future bookings</p>
            </div>
            
            <div className="card-body p-5">
              <div className="row">
                <div className="col-md-6">
                  <div className="card h-100 border-0 shadow-sm bg-light">
                    <div className="card-body text-center p-4">
                      <div className="mb-4">
                        <i className="fas fa-check-circle text-success fa-3x mb-3"></i>
                        <h3 className="fw-bold text-primary mb-3">Benefits of Creating an Account</h3>
                      </div>
                      <ul className="list-unstyled text-start">
                        <li className="mb-3 d-flex align-items-center">
                          <i className="fas fa-check-circle text-success me-3 fs-5"></i>
                          <span className="fs-6 fw-medium">Save your profile information</span>
                        </li>
                        <li className="mb-3 d-flex align-items-center">
                          <i className="fas fa-check-circle text-success me-3 fs-5"></i>
                          <span className="fs-6 fw-medium">View appointment history</span>
                        </li>
                        <li className="mb-3 d-flex align-items-center">
                          <i className="fas fa-check-circle text-success me-3 fs-5"></i>
                          <span className="fs-6 fw-medium">Faster future bookings</span>
                        </li>
                        <li className="mb-3 d-flex align-items-center">
                          <i className="fas fa-check-circle text-success me-3 fs-5"></i>
                          <span className="fs-6 fw-medium">Receive appointment reminders</span>
                        </li>
                        <li className="mb-3 d-flex align-items-center">
                          <i className="fas fa-check-circle text-success me-3 fs-5"></i>
                          <span className="fs-6 fw-medium">Access exclusive offers</span>
                        </li>
                        <li className="mb-3 d-flex align-items-center">
                          <i className="fas fa-check-circle text-success me-3 fs-5"></i>
                          <span className="fs-6 fw-medium">Secure health form storage</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body text-center p-4">
                      <div className="mb-4">
                        <i className="fas fa-clock text-primary fa-3x mb-3"></i>
                        <h3 className="fw-bold text-primary mb-3">Quick & Easy Setup</h3>
                      </div>
                      <div className="mb-4">
                        <p className="fs-6 text-dark lh-lg mb-3">
                          <strong>Creating an account takes less than 2 minutes</strong> and will save you time on future visits.
                        </p>
                        <p className="fs-6 text-muted lh-lg">
                          Your information is securely stored and never shared with third parties.
                        </p>
                      </div>
                      
                      <div className="text-center mt-4">
                        <div className="mb-3">
                          <div className="d-flex align-items-center justify-content-center mb-3">
                            <i className="fas fa-star me-2 fs-4" style={{ color: '#AD6269' }}></i>
                            <span className="fw-bold fs-5" style={{ color: '#AD6269' }}>Your Selection</span>
                          </div>
                          
                          <div className="mb-3">
                            <div className="text-muted fs-6 mb-1">Service</div>
                            <div className="fw-bold fs-4 text-dark">{selectedService?.name}</div>
                          </div>
                          
                          <div>
                            <div className="text-muted fs-6 mb-1">Price</div>
                            <div className="fw-bold fs-2" style={{ color: '#AD6269' }}>${selectedService?.price}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-4">
                <div className="d-flex justify-content-center">
                  <Button
                    size="lg"
                    className="bg-[#AD6269] hover:bg-[#9d5860] px-5"
                    onClick={() => window.location.href = '/register?redirect=/book-now-custom&service=' + selectedService?.id}
                  >
                    <i className="fas fa-user-plus me-2"></i>
                    Create Account & Continue
                  </Button>
                </div>
                
                <div className="mt-4">
                  <div className="d-flex align-items-center justify-content-center gap-3">
                    <span className="fs-5 text-dark fw-medium">Already have an account?</span>
                    <Button 
                      asChild
                      className="bg-[#AD6269] hover:bg-[#9d5860] rounded-full px-4"
                    >
                      <a href={`/login?redirect=/book-now-custom&service=${selectedService?.id}`}>
                        Sign In
                      </a>
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button
                    variant="ghost"
                    className="text-gray-500"
                    onClick={() => setCurrentStep('services')}
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to Services
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="container-fluid py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-success text-white text-center py-4">
              <i className="fas fa-check-circle fa-3x mb-3"></i>
              <h2 className="h3 mb-0">Booking Confirmed!</h2>
              <p className="mb-0 opacity-75">Your appointment has been successfully scheduled</p>
            </div>
            
            <div className="card-body p-4 text-center">
              <div className="alert alert-success">
                <h5 className="fw-bold mb-3">Appointment Details</h5>
                <p className="mb-2"><strong>Service:</strong> {selectedService?.name}</p>
                <p className="mb-2"><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}</p>
                <p className="mb-2"><strong>Time:</strong> {selectedTime}</p>
                <p className="mb-0"><strong>Client:</strong> {userProfile?.profile ? `${userProfile.profile.firstName} ${userProfile.profile.lastName}` : 'Unknown Client'}</p>
              </div>
              
              <p className="text-muted mb-4">
                A confirmation email has been sent to {userProfile?.profile?.email || 'your email'}. 
                Please arrive 15 minutes early for your appointment.
              </p>
              
              <div className="d-flex gap-3 justify-content-center">
                <Button
                  className="bg-[#AD6269] hover:bg-[#9d5860] px-4"
                  onClick={() => window.location.href = '/'}
                >
                  Return to Home
                </Button>
                <Button
                  variant="outline"
                  className="px-4"
                  onClick={() => window.location.href = '/contact'}
                >
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Header />
      
      <div style={{ paddingTop: '140px' }}>
        {currentStep !== 'confirmation' && renderProgressBar()}
        
        {currentStep === 'services' && renderServiceSelection()}
        {currentStep === 'account-suggestion' && renderAccountSuggestion()}
        {currentStep === 'calendar' && renderCalendarSelection()}
        {currentStep === 'profile' && (
          showProfileConfirmation ? (
            <ProfileConfirmation
              data={clientProfile}
              onConfirm={handleProfileToHealth}
              onEdit={() => setShowProfileConfirmation(false)}
              onBack={() => setCurrentStep('calendar')}
            />
          ) : (
            <ClientProfileWizard
              data={clientProfile}
              onChange={setClientProfile}
              onNext={handleProfileToHealth}
              onBack={() => setCurrentStep('calendar')}
              hideHeader={true}
            />
          )
        )}
      {currentStep === 'health' && (
        <HealthFormWizard
          data={healthFormData}
          onChange={setHealthFormData}
          onNext={handleHealthFormSubmit}
          onBack={() => setCurrentStep('profile')}
          clientSignature={clientSignature}
          onSignatureChange={setClientSignature}
          hideHeader={true}
        />
      )}
      {currentStep === 'pre-post-care' && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-[#AD6269] text-white text-center py-6 px-4">
              <h2 className="text-2xl font-bold mb-2">Pre & Post Care Instructions</h2>
              <p className="text-white/80">Please read and acknowledge these important care instructions</p>
            </div>
            
            <div className="p-6 md:p-8 space-y-8">
              {/* Pre Care Instructions */}
              <div>
                <h3 className="text-lg font-bold text-[#AD6269] mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <span className="text-amber-600">⚠</span>
                  </span>
                  Pre Care Instructions
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <p className="text-gray-700"><span className="font-semibold">No excessive alcohol consumption</span> 24 hours before your procedure.</p>
                  <p className="text-gray-700"><span className="font-semibold">Avoid sun and tanning</span> one week prior to the procedure.</p>
                  <p className="text-gray-700"><span className="font-semibold">Do not take Aspirin, Niacin (Vitamin B3), Vitamin E or Advil/Ibuprofen</span> 24 hours before the procedure.</p>
                  <p className="text-gray-700"><span className="font-semibold">No brow waxing, tinting, microdermabrasion or chemical peels</span> 1-2 weeks prior.</p>
                  <p className="text-gray-700"><span className="font-semibold">Discontinue the use of Accutane/Retin-A or any other acne medication</span> at least 6 months prior to the procedure.</p>
                  <p className="text-gray-700"><span className="font-semibold">No Botox/filler around the brow area or forehead</span> 4 weeks prior.</p>
                  <p className="text-gray-700"><span className="font-semibold">Discontinue eyelash growth serums</span> 1 week prior to the procedure.</p>
                </div>
              </div>

              {/* Post Care Instructions */}
              <div>
                <h3 className="text-lg font-bold text-[#AD6269] mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                    <span className="text-pink-600">♥</span>
                  </span>
                  Post Care Instructions
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <p className="text-gray-700"><span className="font-semibold">No make-up application on the brows.</span></p>
                  <p className="text-gray-700"><span className="font-semibold">No sun tanning, swimming or excessive sweating.</span></p>
                  <p className="text-gray-700"><span className="font-semibold">No soap, moisturizer, make-up, creams or sunscreen on the brow area.</span></p>
                  <p className="text-gray-700"><span className="font-semibold">Do not rub or pick at the dry flaky skin/scab.</span></p>
                  <p className="text-gray-700"><span className="font-semibold">Do not touch the treated area unless it is for cleansing purposes.</span></p>
                  <p className="text-gray-700"><span className="font-semibold">Apply a grain size of MicroBlam 2-3 times a day for up to 14 days of recovery.</span></p>
                  <p className="text-gray-700"><span className="font-semibold">Should an infection occur, please seek medical attention.</span></p>
                  <p className="text-gray-700"><span className="font-semibold">Wash the eyebrow area very gently during the next 7–10 days as it heals.</span> Do not rub brows to dry them, please gently pat dry with a clean cloth or tissue.</p>
                </div>
              </div>

              {/* Healing Process */}
              <div>
                <h3 className="text-lg font-bold text-[#AD6269] mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600">📅</span>
                  </span>
                  Eyebrow Healing Process
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="border-2 border-[#AD6269] rounded-lg overflow-hidden">
                    <div className="bg-[#AD6269] text-white text-center py-2 font-semibold">Day 1-3</div>
                    <div className="p-3 text-sm space-y-2">
                      <p>• Brows will look darker and thicker as scabbing starts to form.</p>
                      <p>• Brows feel tender & sore and may look warm and/or reddish.</p>
                    </div>
                  </div>
                  <div className="border-2 border-amber-500 rounded-lg overflow-hidden">
                    <div className="bg-amber-500 text-white text-center py-2 font-semibold">Day 4-5</div>
                    <div className="p-3 text-sm space-y-2">
                      <p>• Redness should be reduced.</p>
                      <p>• Flaking and crusting of the eyebrows may occur.</p>
                      <p>• Eyebrows may feel dry and itchy.</p>
                    </div>
                  </div>
                  <div className="border-2 border-blue-500 rounded-lg overflow-hidden">
                    <div className="bg-blue-500 text-white text-center py-2 font-semibold">Day 6-12</div>
                    <div className="p-3 text-sm space-y-2">
                      <p>• Scabs peel off in random pieces and look patchy.</p>
                      <p>• Areas without scabs may look lighter in colour.</p>
                      <p>• 70-100% of scabs should fall off during this time.</p>
                    </div>
                  </div>
                  <div className="border-2 border-green-500 rounded-lg overflow-hidden">
                    <div className="bg-green-500 text-white text-center py-2 font-semibold">Day 13-21</div>
                    <div className="p-3 text-sm space-y-2">
                      <p>• Colour looks very light and shape may look thinner.</p>
                      <p>• Brow colour gradually darkens as skin fully heals.</p>
                      <p>• Fully healed colour will be 30-50% lighter.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signature Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-[#AD6269] mb-3">Client Acknowledgment</h3>
                <p className="text-gray-600 mb-4">
                  By signing below, I acknowledge that I have read and understand all pre-care and post-care instructions. 
                  I agree to follow these instructions to ensure the best possible results and healing process.
                </p>
                <div className="max-w-md">
                  <label htmlFor="prePostCareSignature" className="block text-sm font-semibold text-gray-700 mb-2">
                    Client Signature (Type your full name):
                  </label>
                  <input
                    type="text"
                    id="prePostCareSignature"
                    value={prePostCareSignature}
                    onChange={(e) => setPrePostCareSignature(e.target.value)}
                    placeholder="Type your full name here"
                    className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-[#AD6269] outline-none"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Date: {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  onClick={() => setCurrentStep('health')}
                >
                  <span>←</span>
                  Back to Health Form
                </Button>
                <Button
                  type="button"
                  size="lg"
                  className="bg-[#AD6269] hover:bg-[#9d5860] gap-2"
                  onClick={handlePrePostCareComplete}
                  disabled={!prePostCareSignature.trim()}
                >
                  I Acknowledge & Continue
                  <span>→</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {currentStep === 'checkout' && selectedService && (
        <CheckoutCart
          service={selectedService}
          appointmentDate={selectedDate}
          appointmentTime={selectedTime}
          clientName={userProfile?.profile ? `${userProfile.profile.firstName} ${userProfile.profile.lastName}` : 'Unknown Client'}
          clientId={userProfile?.id}
          data={checkoutData}
          onChange={setCheckoutData}
          onNext={handleBookingComplete}
          onBack={() => setCurrentStep('profile')}
        />
      )}
      {currentStep === 'confirmation' && renderConfirmation()}
      </div>
      
      <Footer />
    </>
  );
}

export default function BookNowCustom() {
  return (
    <Suspense fallback={
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    }>
      <BookNowCustomContent />
    </Suspense>
  );
}
