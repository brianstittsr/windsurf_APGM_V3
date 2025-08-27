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
import { useNextAvailableDate } from '@/hooks/useNextAvailableDate';
import { useServices } from '@/hooks/useFirebase';
import ClientProfileWizard, { ClientProfileData } from '@/components/ClientProfileWizard';
import HealthFormWizard, { HealthFormData } from '@/components/HealthFormWizard';
import CheckoutCart from '@/components/CheckoutCart';

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
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import DatabaseSetup from '../../components/DatabaseSetup';
import ProfileConfirmation from '../../components/ProfileConfirmation';
// Email services moved to API routes to avoid client-side imports

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

  const [currentWeekStart, setCurrentWeekStart] = useState<Date | null>(null);

  
  // Show database setup if setup parameter is present
  if (isSetupMode) {
    return (
      <>
        <Header />
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <h1 className="text-center mb-4">Database Setup</h1>
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
  const { nextAvailable, findNextAvailableDate, findNextAvailableAfter, clearNextAvailable } = useNextAvailableDate();
  
  // Auth hook for user profile auto-population
  const { isAuthenticated, userProfile, getClientProfileData } = useAuth();
  
  // Workflow trigger hook
  const { triggerNewClientWorkflow, triggerAppointmentBookedWorkflow } = useWorkflowTrigger();
  
  const [clientProfile, setClientProfile] = useState<ClientProfileData>({
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

  // Auto-navigate to next available date when nextAvailable is found
  useEffect(() => {
    if (nextAvailable) {
      const today = new Date().toISOString().split('T')[0];
      
      if (nextAvailable.date >= today) {
        console.log('Setting calendar to next available date:', nextAvailable.date);
        const nextAvailableDate = new Date(nextAvailable.date);
        const nextWeekStart = new Date(nextAvailableDate);
        nextWeekStart.setDate(nextAvailableDate.getDate() - nextAvailableDate.getDay());
        
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
    setCurrentStep('health');
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
        // Calculate amounts with Stripe fees
        ...(() => {
          const feeCalculation = calculateTotalWithStripeFees(selectedService.price, 0.0775, 200);
          return {
            totalAmount: feeCalculation.total, // Including tax and Stripe fees
            depositAmount: feeCalculation.deposit + feeCalculation.stripeFee, // Deposit + Stripe fee
            remainingAmount: feeCalculation.remaining, // Service + tax - deposit (fee already paid)
          };
        })(),
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
    const now = new Date();
    const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Normalize to midnight
    
    // Don't render calendar if currentWeekStart is not set yet
    if (!currentWeekStart) {
      return (
        <div className="container-fluid py-5">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading calendar...</span>
                </div>
                <p className="mt-3 text-muted">Finding next available date...</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Generate week days based on the current week state
    const weekDays = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight for comparison
    
    // Always generate all 7 days of the week
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(currentWeekStart.getDate() + i);
      day.setHours(0, 0, 0, 0); // Normalize to midnight
      weekDays.push(day);
    }
    
    // Check if we have any future dates in this week
    const hasFutureDates = weekDays.some(day => day >= today);
    
    // If no valid days in current week, advance to next week
    if (!hasFutureDates) {
      const nextWeek = new Date(currentWeekStart);
      nextWeek.setDate(currentWeekStart.getDate() + 7);
      setCurrentWeekStart(nextWeek);
      return (
        <div className="container-fluid py-5">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Advancing calendar...</span>
                </div>
                <p className="mt-3 text-muted">Moving to next available week...</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Get the month and year for the week
    const firstDay = weekDays[0];
    const lastDay = weekDays[6];
    const weekMonth = monthNames[firstDay.getMonth()];
    const weekYear = firstDay.getFullYear();
    const lastDayMonth = lastDay.getMonth();
    const spansMonths = firstDay.getMonth() !== lastDay.getMonth();
    const isCurrentWeek = weekDays.some(day => day.toDateString() === currentDate.toDateString());

    return (
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card border-0 shadow-lg">
              {/* Form Recovery Banner removed */}
              
              {/* Header */}
              <div className="card-header bg-white border-0 text-center py-4">
                <h1 className="h2 fw-bold text-dark mb-2">Book Your Appointment</h1>
                <p className="text-muted mb-0">Select your preferred date and time</p>
              </div>

              <div className="card-body px-3 px-md-4 pb-4">
                {/* Step Indicator */}
                <div className="text-center mb-4">
                  <h2 className="h4 fw-bold text-dark mb-2">
                    Select a Date
                  </h2>
                  <p className="text-muted mb-0">
                    Pick an available date from the calendar below
                  </p>
                </div>

                {/* Month and Week Header */}
                <div className="text-center mb-4">
                  <h3 className="h5 fw-bold text-dark mb-1">
                    {weekMonth} {weekYear}
                  </h3>
                  <div className="text-muted fs-6">
                    {isCurrentWeek ? 'This Week' : 'Week View'}
                  </div>
                  {spansMonths && (
                    <small className="text-muted d-block mt-1">
                      {monthNames[weekDays[0].getMonth()]} {weekDays[0].getDate()} - {monthNames[lastDayMonth]} {weekDays[6].getDate()}
                    </small>
                  )}
                </div>

                {/* Next Available Date Button */}
                <div className="text-center mb-4">
                  <button 
                    className="btn btn-success btn-sm px-4 py-2"
                    onClick={advanceToNextAvailable}
                    title="Find Next Available Date"
                  >
                    <i className="fas fa-calendar-plus me-2"></i>
                    Next Available Date
                  </button>
                  <div className="small text-muted mt-1">
                    Click to find the next available booking day
                  </div>
                </div>

                {/* Calendar Week View - Desktop */}
                <div className="d-none d-md-flex align-items-center justify-content-center mb-4">
                  {/* Previous Week Arrow */}
                  <button 
                    className="btn btn-outline-primary p-2 me-3"
                    onClick={goToPreviousWeek}
                    title="Previous Week"
                  >
                    <i className="fas fa-less-than"></i>
                  </button>

                  {/* Week Days */}
                  <div className="d-flex gap-2">
                    {weekDays.map((day, index) => {
                      const normalizedDay = new Date(day.getFullYear(), day.getMonth(), day.getDate());
                      const isToday = normalizedDay.toDateString() === currentDate.toDateString();
                      const isPast = normalizedDay < currentDate && !isToday;
                      const dateString = day.toISOString().split('T')[0];
                      const isSelectedDate = selectedDate === dateString;
                      const isNextAvailable = nextAvailable?.date === dateString;
                      
                      return (
                        <div
                          key={index}
                          className={`text-center p-3 rounded cursor-pointer position-relative ${
                            isPast
                              ? 'bg-light text-muted'
                              : isSelectedDate
                              ? 'bg-primary text-white'
                              : isNextAvailable
                              ? 'bg-success text-white'
                              : isToday
                              ? 'bg-warning text-dark'
                              : 'bg-light text-dark'
                          }`}
                          style={{ 
                            minWidth: '100px',
                            cursor: isPast ? 'not-allowed' : 'pointer',
                            border: isSelectedDate ? '2px solid #0d6efd' : isNextAvailable ? '2px solid #198754' : '1px solid #e9ecef',
                            opacity: isPast ? 0.5 : 1
                          }}
                          onClick={() => !isPast && handleDateSelect(day)}
                        >
                          <div className="fw-semibold small mb-1">
                            {dayNames[index]}
                          </div>
                          <div className="h4 fw-bold mb-0">
                            {day.getDate()}
                          </div>
                          {isToday && (
                            <div className="small mt-1">
                              Today
                            </div>
                          )}
                          {isNextAvailable && !isSelectedDate && (
                            <div className="small mt-1">
                              <i className="fas fa-star" style={{ fontSize: '0.7rem' }}></i>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Next Week Arrow */}
                  <button 
                    className="btn btn-outline-primary p-2 ms-3"
                    onClick={goToNextWeek}
                    title="Next Week"
                  >
                    <i className="fas fa-greater-than"></i>
                  </button>
                </div>

                {/* Calendar Week View - Mobile/Tablet */}
                <div className="d-md-none mb-4">
                  {/* Next Available Date Button - Mobile */}
                  <div className="text-center mb-3">
                    <button 
                      className="btn btn-success btn-sm px-3 py-2"
                      onClick={advanceToNextAvailable}
                      title="Find Next Available Date"
                    >
                      <i className="fas fa-calendar-plus me-1"></i>
                      Next Available
                    </button>
                  </div>
                  
                  {/* Week Navigation */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={goToPreviousWeek}
                      title="Previous Week"
                    >
                      <i className="fas fa-less-than"></i>
                    </button>
                    <h5 className="mb-0 fw-bold">
                      {weekMonth} {weekYear}
                    </h5>
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={goToNextWeek}
                      title="Next Week"
                    >
                      <i className="fas fa-greater-than"></i>
                    </button>
                  </div>

                  {/* Week Days Grid */}
                  <div className="row g-2">
                    {weekDays.map((day, index) => {
                      const normalizedDay = new Date(day.getFullYear(), day.getMonth(), day.getDate());
                      const isToday = normalizedDay.toDateString() === currentDate.toDateString();
                      const isPast = normalizedDay < currentDate && !isToday;
                      const dateString = day.toISOString().split('T')[0];
                      const isSelectedDate = selectedDate === dateString;
                      const isNextAvailable = nextAvailable?.date === dateString;
                      
                      return (
                        <div key={`${dateString}-${index}`} className="col">
                          <button
                            type="button"
                            className={`btn w-100 text-center p-2 rounded position-relative border ${
                              isPast
                                ? 'btn-light text-muted border-light'
                                : isSelectedDate
                                ? 'btn-primary text-white border-primary'
                                : isNextAvailable
                                ? 'btn-success text-white border-success'
                                : isToday
                                ? 'btn-warning text-dark border-warning'
                                : 'btn-outline-secondary'
                            }`}
                            style={{ 
                              cursor: isPast ? 'not-allowed' : 'pointer',
                              opacity: isPast ? 0.5 : 1,
                              minHeight: '70px'
                            }}
                            onClick={() => !isPast && handleDateSelect(day)}
                            disabled={isPast}
                          >
                            <div className="fw-semibold small mb-1">
                              {dayNames[index].substring(0, 3)}
                            </div>
                            <div className="h6 fw-bold mb-0">
                              {day.getDate()}
                            </div>
                            {isToday && (
                              <div className="small" style={{ fontSize: '0.7rem' }}>
                                Today
                              </div>
                            )}
                            {isNextAvailable && !isSelectedDate && (
                              <div className="small mt-1">
                                <i className="fas fa-star" style={{ fontSize: '0.6rem' }}></i>
                              </div>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Available Time Slots Section - Shows when date is selected */}
                {selectedDate && (
                  <div className="mt-4">
                    <div className="border-top pt-4">
                      <div className="text-center mb-4">
                        <h4 className="h5 fw-bold text-dark mb-2">
                          Available Times for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </h4>
                        <p className="text-muted mb-0">
                          Select a 4-hour time slot to continue
                        </p>
                      </div>

                      {/* Time Slots Loading/Error States */}
                      {loading && (
                        <div className="text-center py-4">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mt-3 text-muted">Loading available time slots...</p>
                        </div>
                      )}

                      {error && (
                        <div className="alert alert-danger text-center">
                          <i className="fas fa-exclamation-triangle me-2"></i>
                          Error loading time slots: {error}
                        </div>
                      )}

                      {/* Artist Selection Instruction */}
                      <div className="text-center mb-4">
                        <div className="d-inline-flex align-items-center bg-light rounded-pill px-4 py-2 mb-3">
                          <i className="fas fa-user-friends text-primary me-2 fs-5"></i>
                          <span className="fw-medium text-dark">Choose your preferred artist for this appointment</span>
                        </div>
                      </div>

                      {/* Time Slots Display */}
                      {timeSlots && !loading && (
                        <>
                          {timeSlots.hasAvailability ? (
                            <div className="row justify-content-center g-4">
                              {timeSlots.timeSlots
                                .filter(slot => slot.available && slot.artistName !== 'Admin')
                                .map((slot, index) => (
                                  <div key={index} className="col-12 col-sm-6 col-md-5 col-lg-4 col-xl-3">
                                    <div
                                      className={`card h-100 cursor-pointer shadow-sm ${
                                        selectedTime === slot.time && selectedArtistId === slot.artistId
                                          ? 'border-primary border-3 bg-primary bg-opacity-10'
                                          : 'border-2 border-light hover-card'
                                      }`}
                                      style={{ 
                                        transition: 'all 0.3s ease',
                                        transform: selectedTime === slot.time && selectedArtistId === slot.artistId ? 'scale(1.05)' : 'scale(1)'
                                      }}
                                      onClick={() => handleTimeSlotSelect(slot.time, slot.artistId)}
                                      onMouseEnter={(e) => {
                                        if (!(selectedTime === slot.time && selectedArtistId === slot.artistId)) {
                                          e.currentTarget.style.transform = 'translateY(-3px)';
                                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                                          e.currentTarget.style.borderColor = '#AD6269';
                                        }
                                      }}
                                      onMouseLeave={(e) => {
                                        if (!(selectedTime === slot.time && selectedArtistId === slot.artistId)) {
                                          e.currentTarget.style.transform = 'translateY(0)';
                                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                          e.currentTarget.style.borderColor = '#e9ecef';
                                        }
                                      }}
                                    >
                                      <div className="card-body text-center py-4 px-3">
                                        {/* Time Display */}
                                        <div className="mb-3">
                                          <i className={`fas fa-clock mb-2 fs-4 ${
                                            selectedTime === slot.time && selectedArtistId === slot.artistId 
                                              ? 'text-white' 
                                              : 'text-primary'
                                          }`}></i>
                                          <h5 className="card-title mb-0 fw-bold" style={{ 
                                            color: selectedTime === slot.time && selectedArtistId === slot.artistId 
                                              ? 'white' 
                                              : '#AD6269', 
                                            fontSize: '1.1rem' 
                                          }}>
                                            {slot.time}
                                          </h5>
                                        </div>
                                        
                                        {/* Artist Info with Avatar */}
                                        <div className="mb-3">
                                          {/* Artist Avatar */}
                                          <div className="mb-3">
                                            <div className="position-relative d-inline-block">
                                              {slot.artistName === 'Victoria' ? (
                                                <Image
                                                  src="/images/VictoriaEscobar.jpeg"
                                                  alt="Victoria - Permanent Makeup Artist"
                                                  width={60}
                                                  height={60}
                                                  className="rounded-circle border border-3"
                                                  style={{ 
                                                    objectFit: 'cover',
                                                    borderColor: selectedTime === slot.time && selectedArtistId === slot.artistId 
                                                      ? 'white' 
                                                      : '#AD6269'
                                                  }}
                                                />
                                              ) : slot.artistName === 'Admin' ? (
                                                <div 
                                                  className="rounded-circle border border-3 d-flex align-items-center justify-content-center"
                                                  style={{ 
                                                    width: '60px', 
                                                    height: '60px',
                                                    backgroundColor: selectedTime === slot.time && selectedArtistId === slot.artistId 
                                                      ? 'rgba(255,255,255,0.3)' 
                                                      : 'rgba(173, 98, 105, 0.3)',
                                                    borderColor: selectedTime === slot.time && selectedArtistId === slot.artistId 
                                                      ? 'white' 
                                                      : '#AD6269'
                                                  }}
                                                >
                                                  <i className="fas fa-shield-alt" style={{ 
                                                    fontSize: '1.6rem',
                                                    color: selectedTime === slot.time && selectedArtistId === slot.artistId 
                                                      ? 'white' 
                                                      : '#AD6269',
                                                    fontWeight: 'bold'
                                                  }}></i>
                                                </div>
                                              ) : (
                                                <div 
                                                  className="rounded-circle border border-3 d-flex align-items-center justify-content-center"
                                                  style={{ 
                                                    width: '60px', 
                                                    height: '60px',
                                                    backgroundColor: selectedTime === slot.time && selectedArtistId === slot.artistId 
                                                      ? 'rgba(255,255,255,0.3)' 
                                                      : 'rgba(173, 98, 105, 0.2)',
                                                    borderColor: selectedTime === slot.time && selectedArtistId === slot.artistId 
                                                      ? 'white' 
                                                      : '#AD6269'
                                                  }}
                                                >
                                                  <i className={`fas fa-user-tie ${
                                                    selectedTime === slot.time && selectedArtistId === slot.artistId 
                                                      ? 'text-white' 
                                                      : ''
                                                  }`} style={{ 
                                                    fontSize: '1.4rem',
                                                    color: selectedTime === slot.time && selectedArtistId === slot.artistId 
                                                      ? 'white' 
                                                      : '#AD6269'
                                                  }}></i>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          
                                          {/* Artist Label and Name */}
                                          <div className="d-flex align-items-center justify-content-center mb-2">
                                            <i className={`fas fa-palette me-2 ${
                                              selectedTime === slot.time && selectedArtistId === slot.artistId 
                                                ? 'text-white' 
                                                : 'text-primary'
                                            }`} style={{ fontSize: '1rem' }}></i>
                                            <span className={`fw-medium ${
                                              selectedTime === slot.time && selectedArtistId === slot.artistId 
                                                ? 'text-white' 
                                                : 'text-dark'
                                            }`}>Artist</span>
                                          </div>
                                          <p className="card-text mb-0 fw-bold" style={{ 
                                            color: selectedTime === slot.time && selectedArtistId === slot.artistId 
                                              ? 'white' 
                                              : '#AD6269', 
                                            fontSize: '1rem' 
                                          }}>
                                            {slot.artistName}
                                          </p>
                                        </div>

                                        {/* Duration Badge */}
                                        <div className="mb-3">
                                          <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: '#AD6269', color: 'white' }}>
                                            <i className="fas fa-hourglass-half me-1"></i>
                                            4 Hours
                                          </span>
                                        </div>

                                        {/* Selection Indicator */}
                                        {selectedTime === slot.time && selectedArtistId === slot.artistId ? (
                                          <div className="mt-3">
                                            <div className="d-flex align-items-center justify-content-center">
                                              <i className="fas fa-check-circle text-white me-2 fs-4"></i>
                                              <span className="fw-bold text-white" style={{ fontSize: '1.1rem' }}>SELECTED</span>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="mt-3">
                                            <small className="text-muted">
                                              <i className="fas fa-mouse-pointer me-1"></i>
                                              Click to select
                                            </small>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))
                              }
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <i className="fas fa-calendar-times text-muted mb-3" style={{ fontSize: '2.5rem' }}></i>
                              <h5 className="text-muted">No Available Time Slots</h5>
                              <p className="text-muted mb-0">
                                Sorry, there are no available 4-hour time slots on this date.
                                Please select a different date.
                              </p>
                            </div>
                          )}

                          {/* Continue Button */}
                          {selectedTime && selectedArtistId && (
                            <div className="text-center mt-4">
                              <button
                                className="btn btn-primary btn-lg"
                                onClick={() => {
                                  console.log('Continue button clicked - selectedTime:', selectedTime, 'selectedArtistId:', selectedArtistId);
                                  console.log('isAuthenticated:', isAuthenticated, 'userProfile:', userProfile);
                                  console.log('clientProfile:', clientProfile);
                                  
                                  // Update checkout data with selected date and time
                                  setCheckoutData(prev => ({
                                    ...prev,
                                    selectedDate,
                                    selectedTime
                                  }));
                                  
                                  // For authenticated users with complete profile, skip to health form
                                  const profile = userProfile?.profile;
                                  if (isAuthenticated && userProfile && profile &&
                                      profile.firstName && profile.lastName && 
                                      profile.email && profile.phone) {
                                    console.log('Going to health form for authenticated user');
                                    setCurrentStep('health');
                                  } else {
                                    console.log('Going to profile form');
                                    setCurrentStep('profile');
                                  }
                                }}
                              >
                                {isAuthenticated && userProfile && userProfile.profile &&
                                 userProfile.profile.firstName && userProfile.profile.lastName && 
                                 userProfile.profile.email && userProfile.profile.phone 
                                  ? 'Continue to Health Form' 
                                  : 'Continue to Profile'}
                                <i className="fas fa-arrow-right ms-2"></i>
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProgressBar = () => {
    const steps = ['services', 'account-suggestion', 'calendar', 'profile', 'health', 'pre-post-care', 'checkout'];
    const currentIndex = steps.indexOf(currentStep);
    const progress = ((currentIndex + 1) / steps.length) * 100;

    return (
      <div className="container-fluid py-3" style={{ backgroundColor: '#AD6269' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <small className="text-white">Step {currentIndex + 1} of {steps.length}</small>
                <small className="text-white">{Math.round(progress)}% Complete</small>
              </div>
              <div className="progress" style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.3)' }}>
                <div 
                  className="progress-bar" 
                  role="progressbar" 
                  style={{ width: `${progress}%`, backgroundColor: '#000000' }}
                ></div>
              </div>
              <div className="d-flex justify-content-between mt-2">
                <small className={currentStep === 'services' ? 'text-white fw-bold' : 'text-white opacity-75'}>Service</small>
                <small className={currentStep === 'account-suggestion' ? 'text-white fw-bold' : 'text-white opacity-75'}>Account</small>
                <small className={currentStep === 'calendar' ? 'text-white fw-bold' : 'text-white opacity-75'}>Date & Time</small>
                <small className={currentStep === 'profile' ? 'text-white fw-bold' : 'text-white opacity-75'}>Profile</small>
                <small className={currentStep === 'health' ? 'text-white fw-bold' : 'text-white opacity-75'}>Health Form</small>
                <small className={currentStep === 'pre-post-care' ? 'text-white fw-bold' : 'text-white opacity-75'}>Care Instructions</small>
                <small className={currentStep === 'checkout' ? 'text-white fw-bold' : 'text-white opacity-75'}>Checkout</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };



  const renderServiceSelection = () => (
    <div className="container-fluid py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold text-primary mb-3">Choose Your Service</h1>
            <p className="lead text-muted">Select the semi-permanent makeup service you&apos;d like to book</p>
          </div>
          
          {servicesLoading && (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading services...</span>
              </div>
              <p className="mt-2 text-muted">Loading services...</p>
            </div>
          )}
          
          {servicesError && (
            <div className="alert alert-danger">
              <h4 className="alert-heading">Error Loading Services</h4>
              <p>{servicesError}</p>
            </div>
          )}
          
          {!servicesLoading && !servicesError && (
            <>
              {/* Row 1: Services 1, 2, 3 */}
              <div className="row g-4 mb-4">
                {services.slice(0, 3).map((service: ServiceItem) => (
                <div key={service.id} className="col-lg-4 col-md-4">
                <div 
                  className={`card h-100 shadow-sm service-card ${
                    selectedService?.id === service.id ? 'border-primary border-2' : 'border-0'
                  }`}
                  style={{ 
                    cursor: 'pointer', 
                    transition: 'all 0.3s ease',
                    backgroundColor: selectedService?.id === service.id 
                      ? 'rgba(173, 98, 105, 0.15)' 
                      : 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                    e.currentTarget.style.backgroundColor = 'rgba(173, 98, 105, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    e.currentTarget.style.backgroundColor = selectedService?.id === service.id 
                      ? 'rgba(173, 98, 105, 0.15)' 
                      : 'white';
                  }}
                  onClick={() => handleServiceSelect(service)}
                >
                  <div className="position-relative" style={{ height: '250px', overflow: 'hidden' }}>
                    <Image
                      src={getServiceImagePath(service)}
                      alt={service.name}
                      fill
                      className="card-img-top"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title text-primary fw-bold mb-3">{service.name}</h5>
                    <div className="mb-3">
                      <span className="badge bg-primary me-2 fs-6">${service.price}</span>
                      <span className="badge bg-secondary fs-6">{service.duration}</span>
                    </div>
                    <p className="card-text text-muted mb-4 flex-grow-1">{service.description}</p>
                    <button
                      className="btn btn-primary w-100 mt-auto"
                      onClick={() => handleServiceSelect(service)}
                    >
                      Select This Service
                    </button>
                  </div>
                </div>
                </div>
                ))}
              </div>
              
              {/* Row 2: Services 4, 5, 6 */}
              <div className="row g-4">
                {services.slice(3, 6).map((service: ServiceItem) => (
                <div key={service.id} className="col-lg-4 col-md-4">
                <div 
                  className={`card h-100 shadow-sm service-card ${
                    selectedService?.id === service.id ? 'border-primary border-2' : 'border-0'
                  }`}
                  style={{ 
                    cursor: 'pointer', 
                    transition: 'all 0.3s ease',
                    backgroundColor: selectedService?.id === service.id 
                      ? 'rgba(173, 98, 105, 0.15)' 
                      : 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                    e.currentTarget.style.backgroundColor = 'rgba(173, 98, 105, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    e.currentTarget.style.backgroundColor = selectedService?.id === service.id 
                      ? 'rgba(173, 98, 105, 0.15)' 
                      : 'white';
                  }}
                  onClick={() => handleServiceSelect(service)}
                >
                  <div className="position-relative" style={{ height: '250px', overflow: 'hidden' }}>
                    <Image
                      src={getServiceImagePath(service)}
                      alt={service.name}
                      fill
                      className="card-img-top"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title text-primary fw-bold mb-3">{service.name}</h5>
                    <div className="mb-3">
                      <span className="badge bg-primary me-2 fs-6">${service.price}</span>
                      <span className="badge bg-secondary fs-6">{service.duration}</span>
                    </div>
                    <p className="card-text text-muted mb-4 flex-grow-1">{service.description}</p>
                    <button
                      className="btn btn-primary w-100 mt-auto"
                      onClick={() => handleServiceSelect(service)}
                    >
                      Select This Service
                    </button>
                  </div>
                </div>
                </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
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
                  <button
                    className="btn btn-primary btn-lg px-5"
                    style={{ backgroundColor: '#AD6269', borderColor: '#AD6269' }}
                    onClick={() => window.location.href = '/register?redirect=/book-now-custom&service=' + selectedService?.id}
                  >
                    <i className="fas fa-user-plus me-2"></i>
                    Create Account & Continue
                  </button>
                </div>
                
                <div className="mt-4">
                  <div className="d-flex align-items-center justify-content-center gap-3">
                    <span className="fs-5 text-dark fw-medium">Already have an account?</span>
                    <a 
                      href={`/login?redirect=/book-now-custom&service=${selectedService?.id}`}
                      className="btn btn-primary rounded-pill px-4"
                      style={{ backgroundColor: '#AD6269', borderColor: '#AD6269' }}
                    >
                      Sign In
                    </a>
                  </div>
                </div>
                
                <div className="mt-4">
                  <button
                    className="btn btn-link text-muted"
                    onClick={() => setCurrentStep('services')}
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to Service Selection
                  </button>
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
                <button
                  className="btn btn-primary px-4"
                  onClick={() => window.location.href = '/'}
                >
                  Return to Home
                </button>
                <button
                  className="btn btn-outline-primary px-4"
                  onClick={() => window.location.href = '/contact'}
                >
                  Contact Us
                </button>
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
        />
      )}
      {currentStep === 'pre-post-care' && (
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card border-0 shadow-lg">
                <div className="card-header bg-primary text-white text-center py-4">
                  <h2 className="mb-0">
                    <i className="fas fa-clipboard-list me-3"></i>
                    Pre & Post Care Instructions
                  </h2>
                  <p className="mb-0 mt-2">Please read and acknowledge these important care instructions</p>
                </div>
                <div className="card-body p-5">
                  {/* Pre Care Instructions */}
                  <div className="mb-5">
                    <h4 className="text-primary mb-4">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      Pre Care Instructions
                    </h4>
                    <div className="bg-light p-4 rounded">
                      <ul className="list-unstyled mb-0">
                        <li className="mb-3">
                          <i className="fas fa-wine-glass text-danger me-2"></i>
                          <strong>No excessive alcohol consumption</strong> 24 hours before your procedure.
                        </li>
                        <li className="mb-3">
                          <i className="fas fa-sun text-warning me-2"></i>
                          <strong>Avoid sun and tanning</strong> one week prior to the procedure.
                        </li>
                        <li className="mb-3">
                          <i className="fas fa-pills text-info me-2"></i>
                          <strong>Do not take Aspirin, Niacin (Vitamin B3), Vitamin E or Advil/Ibuprofen</strong> 24 hours before the procedure.
                        </li>
                        <li className="mb-3">
                          <i className="fas fa-spa text-success me-2"></i>
                          <strong>No brow waxing, tinting, microdermabrasion or chemical peels</strong> 1-2 weeks prior.
                        </li>
                        <li className="mb-3">
                          <i className="fas fa-prescription-bottle text-primary me-2"></i>
                          <strong>Discontinue the use of Accutane/Retin-A or any other acne medication</strong> at least 6 months prior to the procedure.
                        </li>
                        <li className="mb-3">
                          <i className="fas fa-syringe text-secondary me-2"></i>
                          <strong>No Botox/filler around the brow area or forehead</strong> 4 weeks prior.
                        </li>
                        <li className="mb-0">
                          <i className="fas fa-eye text-dark me-2"></i>
                          <strong>Discontinue eyelash growth serums</strong> 1 week prior to the procedure.
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Post Care Instructions */}
                  <div className="mb-5">
                    <h4 className="text-primary mb-4">
                      <i className="fas fa-heart me-2"></i>
                      Post Care Instructions
                    </h4>
                    <div className="bg-light p-4 rounded">
                      <ul className="list-unstyled mb-0">
                        <li className="mb-3">
                          <i className="fas fa-makeup text-danger me-2"></i>
                          <strong>No make-up application on the brows.</strong>
                        </li>
                        <li className="mb-3">
                          <i className="fas fa-swimming-pool text-info me-2"></i>
                          <strong>No sun tanning, swimming or excessive sweating.</strong>
                        </li>
                        <li className="mb-3">
                          <i className="fas fa-soap text-warning me-2"></i>
                          <strong>No soap, moisturizer, make-up, creams or sunscreen on the brow area.</strong>
                        </li>
                        <li className="mb-3">
                          <i className="fas fa-hand-paper text-danger me-2"></i>
                          <strong>Do not rub or pick at the dry flaky skin/scab.</strong>
                        </li>
                        <li className="mb-3">
                          <i className="fas fa-hand-sparkles text-success me-2"></i>
                          <strong>Do not touch the treated area unless it is for cleansing purposes.</strong>
                        </li>
                        <li className="mb-3">
                          <i className="fas fa-prescription-bottle-alt text-primary me-2"></i>
                          <strong>Apply a grain size of MicroBlam 2-3 times a day for up to 14 days of recovery.</strong>
                        </li>
                        <li className="mb-3">
                          <i className="fas fa-stethoscope text-danger me-2"></i>
                          <strong>Should an infection occur, please seek medical attention.</strong>
                        </li>
                        <li className="mb-0">
                          <i className="fas fa-water text-info me-2"></i>
                          <strong>It is very important that you wash the eyebrow area very gently during the next 7–10 days as it heals. Do not rub brows to dry them, please gently pat dry with a clean cloth or tissue.</strong>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Healing Process */}
                  <div className="mb-5">
                    <h4 className="text-primary mb-4">
                      <i className="fas fa-calendar-alt me-2"></i>
                      Eyebrow Healing Process
                    </h4>
                    <div className="row">
                      <div className="col-md-4 mb-4">
                        <div className="card h-100 border-primary">
                          <div className="card-header bg-primary text-white text-center">
                            <h6 className="mb-0">Day 1-3</h6>
                          </div>
                          <div className="card-body">
                            <ul className="list-unstyled small mb-0">
                              <li className="mb-2">• Brows will look darker and thicker as scabbing starts to form.</li>
                              <li className="mb-0">• Brows feel tender & sore and may look warm and/or reddish.</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4 mb-4">
                        <div className="card h-100 border-warning">
                          <div className="card-header bg-warning text-dark text-center">
                            <h6 className="mb-0">Day 4-5</h6>
                          </div>
                          <div className="card-body">
                            <ul className="list-unstyled small mb-0">
                              <li className="mb-2">• Redness should be reduced.</li>
                              <li className="mb-2">• Flaking and crusting of the eyebrows may occur.</li>
                              <li className="mb-0">• Eyebrows may feel dry and itchy.</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4 mb-4">
                        <div className="card h-100 border-info">
                          <div className="card-header bg-info text-white text-center">
                            <h6 className="mb-0">Day 6-12</h6>
                          </div>
                          <div className="card-body">
                            <ul className="list-unstyled small mb-0">
                              <li className="mb-2">• Scabs peel off in random pieces and look patchy.</li>
                              <li className="mb-2">• The areas without the scabs may look lighter in colour.</li>
                              <li className="mb-2">• Scabs continue to peel off in random pieces.</li>
                              <li className="mb-0">• 70-100% of scabs should fall off during this time.</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row justify-content-center">
                      <div className="col-md-6">
                        <div className="card border-success">
                          <div className="card-header bg-success text-white text-center">
                            <h6 className="mb-0">Day 13-21</h6>
                          </div>
                          <div className="card-body">
                            <ul className="list-unstyled small mb-0">
                              <li className="mb-2">• Colour looks very light and the shape may look thinner.</li>
                              <li className="mb-2">• Some areas may have lost more colour compared to other areas.</li>
                              <li className="mb-2">• Colour can look uneven.</li>
                              <li className="mb-2">• Brow colour gradually darkens as the skin fully heals.</li>
                              <li className="mb-0">• The fully healed colour will be 30-50% lighter from the initial appointment and retention can vary according to skin type.</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Signature Section */}
                  <div className="border-top pt-4">
                    <div className="row align-items-center">
                      <div className="col-md-8">
                        <h5 className="text-primary mb-3">
                          <i className="fas fa-signature me-2"></i>
                          Client Acknowledgment
                        </h5>
                        <p className="mb-3">
                          By signing below, I acknowledge that I have read and understand all pre-care and post-care instructions. 
                          I agree to follow these instructions to ensure the best possible results and healing process.
                        </p>
                        <div className="mb-3">
                          <label htmlFor="prePostCareSignature" className="form-label fw-bold">
                            Client Signature (Type your full name):
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-lg"
                            id="prePostCareSignature"
                            value={prePostCareSignature}
                            onChange={(e) => setPrePostCareSignature(e.target.value)}
                            placeholder="Type your full name here"
                            required
                          />
                        </div>
                        <p className="small text-muted mb-0">
                          <i className="fas fa-calendar me-1"></i>
                          Date: {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="d-flex justify-content-between mt-5">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-lg px-4"
                      onClick={() => setCurrentStep('health')}
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      Back to Health Form
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-lg px-4"
                      onClick={handlePrePostCareComplete}
                      disabled={!prePostCareSignature.trim()}
                    >
                      I Acknowledge & Continue
                      <i className="fas fa-arrow-right ms-2"></i>
                    </button>
                  </div>
                </div>
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
          onBack={() => setCurrentStep('pre-post-care')}
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
