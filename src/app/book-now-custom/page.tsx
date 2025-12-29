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

      // Send booking confirmation email with receipt
      try {
        console.log('📧 Sending booking confirmation email...');
        const depositAmount = 200; // Default deposit amount
        const totalWithTax = selectedService.price * 1.0775;
        const emailResponse = await fetch('/api/send-booking-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientName: profile ? `${profile.firstName} ${profile.lastName}` : 'Valued Customer',
            clientEmail: profile?.email || '',
            serviceName: selectedService.name,
            servicePrice: selectedService.price,
            depositAmount: depositAmount,
            remainingBalance: totalWithTax - depositAmount,
            appointmentDate: selectedDate,
            appointmentTime: selectedTime,
            artistName: selectedArtistId || undefined,
            businessName: 'A Pretty Girl Matter',
            businessPhone: '(919) 441-0932',
            businessEmail: 'victoria@aprettygirlmatter.com',
            businessAddress: '4040 Barrett Drive Suite 3, Raleigh, NC 27609'
          })
        });
        
        const emailResult = await emailResponse.json();
        if (emailResult.success) {
          console.log('✅ Booking confirmation email sent successfully');
        } else {
          console.error('⚠️ Failed to send confirmation email:', emailResult.error);
        }
      } catch (emailError) {
        console.error('⚠️ Failed to send confirmation email (non-critical):', emailError);
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
    <div className="min-h-screen bg-gradient-to-b from-[#AD6269]/5 via-white to-[#AD6269]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#AD6269]/10 mb-6">
            <svg className="w-8 h-8 text-[#AD6269]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Choose Your <span className="text-[#AD6269]">Service</span>
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
            Select the permanent makeup service you&apos;d like to book
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Free consultation included</span>
            <span className="mx-2">•</span>
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Touch-up included</span>
          </div>
        </div>
          
        {servicesLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#AD6269]/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[#AD6269] rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-6 text-gray-500 font-medium">Loading services...</p>
          </div>
        )}
      
        {servicesError && (
          <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h4 className="font-bold text-lg text-red-800 mb-2">Error Loading Services</h4>
            <p className="text-red-600">{servicesError}</p>
          </div>
        )}
          
        {!servicesLoading && !servicesError && (
          <>
            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {services.map((service: ServiceItem) => (
                <div 
                  key={service.id}
                  className={`group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-[#AD6269]/30 ${
                    selectedService?.id === service.id 
                      ? 'ring-2 ring-[#AD6269] border-[#AD6269] shadow-lg shadow-[#AD6269]/10' 
                      : ''
                  }`}
                  onClick={() => handleServiceSelect(service)}
                >
                  {/* Selected Badge */}
                  {selectedService?.id === service.id && (
                    <div className="absolute top-4 right-4 z-10 bg-[#AD6269] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Selected
                    </div>
                  )}
                  
                  {/* Image Container */}
                  <div className="relative h-[180px] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    <div className="absolute inset-0 bg-[#AD6269]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Image
                      src={getServiceImagePath(service)}
                      alt={service.name}
                      fill
                      className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                
                  {/* Card Content */}
                  <div className="p-6">
                    {/* Category Tag */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#AD6269]/10 text-[#AD6269]">
                        Permanent Makeup
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#AD6269] transition-colors" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {service.name}
                    </h3>
                  
                    {/* Price and Duration */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="inline-flex items-center bg-gradient-to-r from-[#AD6269] to-[#c17a80] text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
                        ${service.price}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-gray-500 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {service.duration}
                      </span>
                    </div>
                  
                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-5 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>
                  
                    {/* Select Button */}
                    <Button
                      className={`w-full font-semibold transition-all duration-300 ${
                        selectedService?.id === service.id
                          ? 'bg-[#AD6269] hover:bg-[#9d5860] text-white'
                          : 'bg-gray-900 hover:bg-[#AD6269] text-white'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleServiceSelect(service);
                      }}
                    >
                      {selectedService?.id === service.id ? (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Selected
                        </>
                      ) : (
                        'Select This Service'
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Bottom CTA for selected service */}
            {selectedService && (
              <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-2xl z-50 p-4 md:hidden">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Selected</p>
                    <p className="font-bold text-gray-900">{selectedService.name}</p>
                  </div>
                  <Button 
                    className="bg-[#AD6269] hover:bg-[#9d5860] px-6"
                    onClick={() => handleServiceSelect(selectedService)}
                  >
                    Continue
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  const renderAccountSuggestion = () => (
    <div className="min-h-screen bg-gradient-to-b from-[#AD6269]/5 via-white to-[#AD6269]/5 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#AD6269] to-[#c17a80] text-white text-center py-10 px-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Create Your Account</h2>
            <p className="text-white/80 text-lg">Save your information for faster future bookings</p>
          </div>
          
          {/* Content */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Benefits Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Account Benefits</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    'Save your profile information',
                    'View appointment history',
                    'Faster future bookings',
                    'Receive appointment reminders',
                    'Access exclusive offers',
                    'Secure health form storage'
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 font-medium">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Selection Card */}
              <div className="bg-gradient-to-br from-[#AD6269]/5 to-[#AD6269]/10 rounded-2xl p-6 border border-[#AD6269]/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[#AD6269]/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#AD6269]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Your Selection</h3>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Service</p>
                    <p className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>{selectedService?.name}</p>
                    <p className="text-sm text-gray-500 mb-1">Price</p>
                    <p className="text-4xl font-bold text-[#AD6269]">${selectedService?.price}</p>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-blue-700">
                      <strong>Quick setup!</strong> Creating an account takes less than 2 minutes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-8 space-y-4">
              <Button
                size="lg"
                className="w-full bg-[#AD6269] hover:bg-[#9d5860] text-lg py-6 rounded-xl shadow-lg shadow-[#AD6269]/20"
                onClick={() => window.location.href = '/register?redirect=/book-now-custom&service=' + selectedService?.id}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Create Account & Continue
              </Button>
              
              <div className="flex items-center justify-center gap-4 py-4">
                <span className="text-gray-600 font-medium">Already have an account?</span>
                <Button 
                  asChild
                  variant="outline"
                  className="border-[#AD6269] text-[#AD6269] hover:bg-[#AD6269] hover:text-white rounded-full px-6"
                >
                  <a href={`/login?redirect=/book-now-custom&service=${selectedService?.id}`}>
                    Sign In
                  </a>
                </Button>
              </div>
              
              <div className="text-center pt-4 border-t border-gray-100">
                <Button
                  variant="ghost"
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setCurrentStep('services')}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Services
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center py-10 px-6">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-2">Booking Confirmed!</h2>
          <p className="text-white/80">Your appointment has been successfully scheduled</p>
        </div>
        
        {/* Appointment Details */}
        <div className="p-8">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-green-800 text-lg mb-4 text-center">Appointment Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-green-200">
                <span className="text-gray-600 font-medium">Service</span>
                <span className="text-gray-900 font-semibold">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-green-200">
                <span className="text-gray-600 font-medium">Date</span>
                <span className="text-gray-900 font-semibold">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-green-200">
                <span className="text-gray-600 font-medium">Time</span>
                <span className="text-gray-900 font-semibold">{selectedTime}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 font-medium">Client</span>
                <span className="text-gray-900 font-semibold">{userProfile?.profile ? `${userProfile.profile.firstName} ${userProfile.profile.lastName}` : 'Guest'}</span>
              </div>
            </div>
          </div>
          
          {/* Email Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-blue-800 font-medium">Confirmation email sent!</p>
              <p className="text-blue-600 text-sm">
                A confirmation has been sent to {userProfile?.profile?.email || 'your email'}. 
                Please arrive 15 minutes early for your appointment.
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              className="bg-[#AD6269] hover:bg-[#9d5860] px-8 py-6 text-lg gap-2"
              onClick={() => window.location.href = '/'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Return to Home
            </Button>
            <Button
              variant="outline"
              className="px-8 py-6 text-lg border-[#AD6269] text-[#AD6269] hover:bg-[#AD6269]/10 gap-2"
              onClick={() => window.location.href = '/contact'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Contact Us
            </Button>
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
