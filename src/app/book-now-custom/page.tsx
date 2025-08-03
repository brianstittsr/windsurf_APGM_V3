'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ClientProfileWizard, { ClientProfileData } from '../../components/ClientProfileWizard';
import HealthFormWizard, { HealthFormData } from '../../components/HealthFormWizard';
import CheckoutCart, { CheckoutData, ServiceItem } from '../../components/CheckoutCart';
import DatabaseSetup from '../../components/DatabaseSetup';
import { useServices, useAppointments, useHealthForm, useAvailability } from '@/hooks/useFirebase';
import { Timestamp } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';
import { getServiceImagePath } from '@/utils/serviceImageUtils';
import { calculateTotalWithStripeFees } from '@/lib/stripe-fees';
import { ClientEmailService, LoginEmailData, HealthFormEmailData } from '@/services/clientEmailService';

function BookNowCustomContent() {
  const searchParams = useSearchParams();
  const isSetupMode = searchParams.get('setup') === 'true';
  
  const [currentStep, setCurrentStep] = useState<'services' | 'calendar' | 'profile' | 'health' | 'checkout' | 'confirmation'>('services');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of current week (Sunday)
    return weekStart;
  });
  
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
  
  const [clientProfile, setClientProfile] = useState<ClientProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    preferredContactMethod: '',
    hearAboutUs: ''
  });
  
  const [healthFormData, setHealthFormData] = useState<HealthFormData>({});
  const [clientSignature, setClientSignature] = useState<string>('');
  
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    selectedDate: '',
    selectedTime: '',
    paymentMethod: '',
    specialRequests: '',
    giftCard: '',
    agreeToTerms: false,
    agreeToPolicy: false
  });

  // Services are now loaded from Firebase via useServices hook

  const timeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
    "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM"
  ];

  const handleServiceSelect = (service: ServiceItem) => {
    setSelectedService(service);
    setCurrentStep('calendar');
  };

  const handleDateTimeSelect = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setCurrentStep('profile');
  };

  const handleHealthFormSubmit = async () => {
    try {
      // Send login information email
      const loginEmailData: LoginEmailData = {
        clientName: `${clientProfile.firstName} ${clientProfile.lastName}`,
        clientEmail: clientProfile.email,
        temporaryPassword: 'TempPass123!', // Generate a temporary password
        loginUrl: `${window.location.origin}/login`,
        businessName: 'A Pretty Girl Matter',
        businessPhone: '(919) 123-4567',
        businessEmail: 'victoria@aprettygirlmatter.com'
      };
      
      const loginEmailSent = await ClientEmailService.sendLoginEmail(loginEmailData);
      console.log('Login email sent:', loginEmailSent);
      
      // Send health form confirmation email
      const healthFormEmailData: HealthFormEmailData = {
        clientName: `${clientProfile.firstName} ${clientProfile.lastName}`,
        clientEmail: clientProfile.email,
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
      
      const healthFormEmailSent = await ClientEmailService.sendHealthFormEmail(healthFormEmailData);
      console.log('Health form email sent:', healthFormEmailSent);
      
      // Move to checkout step
      setCurrentStep('checkout');
    } catch (error) {
      console.error('Failed to send emails:', error);
      // Still move to checkout even if emails fail
      setCurrentStep('checkout');
    }
  };

  const handleBookingComplete = async () => {
    if (!selectedService) return;
    
    try {
      // Create appointment in Firebase
      const appointmentData = {
        clientId: 'temp-client-id', // In a real app, this would be the authenticated user's ID
        serviceId: selectedService.id,
        artistId: 'default-artist', // You might want to implement artist selection
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
        specialRequests: checkoutData.specialRequests,
        giftCardCode: checkoutData.giftCard || undefined,
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
      
      console.log('Booking completed successfully:', appointmentId);
      setCurrentStep('confirmation');
    } catch (error) {
      console.error('Failed to complete booking:', error);
      // You might want to show an error message to the user
    }
  };

  // Calendar navigation functions
  const goToPreviousWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
  };

  const goToNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
  };

  const renderProgressBar = () => {
    const steps = ['services', 'calendar', 'profile', 'health', 'checkout'];
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
                <small className={currentStep === 'calendar' ? 'text-white fw-bold' : 'text-white opacity-75'}>Date & Time</small>
                <small className={currentStep === 'profile' ? 'text-white fw-bold' : 'text-white opacity-75'}>Profile</small>
                <small className={currentStep === 'health' ? 'text-white fw-bold' : 'text-white opacity-75'}>Health Form</small>
                <small className={currentStep === 'checkout' ? 'text-white fw-bold' : 'text-white opacity-75'}>Checkout</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCalendarSelection = () => {
    const currentDate = new Date();
    
    // Generate week days based on the current week state
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(currentWeekStart.getDate() + i);
      weekDays.push(day);
    }

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    // Navigation functions
    const goToPreviousWeek = () => {
      const newWeekStart = new Date(currentWeekStart);
      newWeekStart.setDate(currentWeekStart.getDate() - 7);
      setCurrentWeekStart(newWeekStart);
    };

    const goToNextWeek = () => {
      const newWeekStart = new Date(currentWeekStart);
      newWeekStart.setDate(currentWeekStart.getDate() + 7);
      setCurrentWeekStart(newWeekStart);
    };

    // Determine if we're showing current week or another week
    const today = new Date();
    const todayWeekStart = new Date(today);
    todayWeekStart.setDate(today.getDate() - today.getDay());
    const isCurrentWeek = currentWeekStart.getTime() === todayWeekStart.getTime();
    
    // Get the primary month for the week (month of the first day)
    const weekMonth = monthNames[weekDays[0].getMonth()];
    const weekYear = weekDays[0].getFullYear();
    
    // Check if week spans multiple months
    const lastDayMonth = weekDays[6].getMonth();
    const spansMonths = weekDays[0].getMonth() !== lastDayMonth;

    return (
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow-lg border-0">
              {/* Add Service Button */}
              <div className="card-header bg-white border-0 pt-4 pb-2">
                <div className="d-flex justify-content-start">
                  <button className="btn btn-primary rounded-pill px-4 py-2">
                    <i className="fas fa-plus me-2"></i>
                    Add Service
                  </button>
                </div>
              </div>

              {/* Selected Service Display */}
              {selectedService && (
                <div className="card-body border-bottom bg-light px-4 py-3">
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <h5 className="mb-1 text-primary fw-bold">{selectedService.name}</h5>
                      <p className="mb-0 text-muted small">{selectedService.description}</p>
                    </div>
                    <div className="col-md-4 text-md-end">
                      <div className="d-flex flex-column align-items-md-end">
                        <span className="badge bg-primary mb-1">${selectedService.price}</span>
                        <span className="badge bg-secondary">{selectedService.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="card-body px-4 pb-4">
                {/* Month and Week Header */}
                <div className="text-center mb-4">
                  <h2 className="h1 fw-bold text-dark mb-1">
                    {weekMonth} {weekYear} <span className="text-muted fs-4">{isCurrentWeek ? 'This Week' : 'Week View'}</span>
                  </h2>
                  {spansMonths && (
                    <small className="text-muted">
                      {monthNames[weekDays[0].getMonth()]} {weekDays[0].getDate()} - {monthNames[lastDayMonth]} {weekDays[6].getDate()}
                    </small>
                  )}
                </div>

                {/* Calendar Week View */}
                <div className="d-flex align-items-center justify-content-center mb-5">
                  {/* Previous Week Arrow */}
                  <button 
                    className="btn btn-dark p-2 me-3"
                    onClick={goToPreviousWeek}
                    title="Previous Week"
                    style={{ zIndex: 10, position: 'relative' }}
                  >
                    <i className="fas fa-angle-double-left fs-4"></i>
                  </button>

                  {/* Week Days */}
                  <div className="d-flex gap-0">
                    {weekDays.map((day, index) => {
                      const isToday = day.toDateString() === currentDate.toDateString();
                      const isSelected = index === 5; // Friday is selected in the image
                      
                      return (
                        <div
                          key={index}
                          className={`text-center p-3 ${
                            isSelected 
                              ? 'bg-primary text-white' 
                              : 'bg-light text-dark'
                          } ${index === 0 ? 'rounded-start' : ''} ${
                            index === 6 ? 'rounded-end' : ''
                          }`}
                          style={{ 
                            minWidth: '100px',
                            cursor: 'pointer',
                            border: isSelected ? '2px solid #e11d48' : '1px solid #e9ecef'
                          }}
                        >
                          <div className="fw-semibold small mb-1">
                            {dayNames[index]}
                          </div>
                          <div className="h3 fw-bold mb-0">
                            {day.getDate()}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Next Week Arrow */}
                  <button 
                    className="btn btn-dark p-2 ms-3"
                    onClick={goToNextWeek}
                    title="Next Week"
                    style={{ zIndex: 10, position: 'relative' }}
                  >
                    <i className="fas fa-angle-double-right fs-4"></i>
                  </button>
                </div>

                {/* No Availability Message */}
                <div className="text-center py-5">
                  <div className="mb-4">
                    <i className="fas fa-calendar-times text-muted" style={{ fontSize: '4rem' }}></i>
                  </div>
                  
                  <h3 className="fw-bold text-dark mb-3">Sorry, they're booked</h3>
                  
                  <p className="text-muted mb-4">
                    They don't have any appointments available, but call to<br />
                    see if there are any last minute openings: <a href="tel:(919) 441-0932" className="text-primary text-decoration-none fw-semibold">(919) 441-0932</a>
                  </p>

                  <div className="mb-4">
                    <span className="text-muted">or</span>
                  </div>

                  <div className="mb-4">
                    <h4 className="fw-bold text-dark mb-2">Next available date:</h4>
                    <h4 className="text-dark">Sun, Aug 3, 2025</h4>
                  </div>

                  <button 
                    className="btn btn-primary btn-lg px-5 py-3 rounded-3"
                    onClick={() => {
                      // Set date to Aug 3, 2025 and continue
                      setSelectedDate('2025-08-03');
                      setSelectedTime('10:00 AM'); // Set a default time
                      handleDateTimeSelect('2025-08-03', '10:00 AM');
                    }}
                  >
                    Go to Sun, Aug 3, 2025
                  </button>
                </div>
              </div>

              <div className="card-footer bg-light d-flex justify-content-between py-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={() => setCurrentStep('services')}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Back to Services
                </button>
                <button
                  type="button"
                  className="btn btn-primary px-4"
                  onClick={() => handleDateTimeSelect(selectedDate, selectedTime)}
                  disabled={!selectedDate || !selectedTime}
                >
                  Continue to Profile
                  <i className="fas fa-arrow-right ms-2"></i>
                </button>
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
            <p className="lead text-muted">Select the permanent makeup service you&apos;d like to book</p>
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
            <div className="row g-4">
              {services.map((service) => (
              <div key={service.id} className="col-lg-4 col-md-6">
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
          )}
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
                <p className="mb-0"><strong>Client:</strong> {clientProfile.firstName} {clientProfile.lastName}</p>
              </div>
              
              <p className="text-muted mb-4">
                A confirmation email has been sent to {clientProfile.email}. 
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
        {currentStep === 'calendar' && renderCalendarSelection()}
        {currentStep === 'profile' && (
        <ClientProfileWizard
          data={clientProfile}
          onChange={setClientProfile}
          onNext={() => setCurrentStep('health')}
          onBack={() => setCurrentStep('calendar')}
        />
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
      {currentStep === 'checkout' && selectedService && (
        <CheckoutCart
          service={selectedService}
          appointmentDate={selectedDate}
          appointmentTime={selectedTime}
          clientName={`${clientProfile.firstName} ${clientProfile.lastName}`}
          data={checkoutData}
          onChange={setCheckoutData}
          onNext={handleBookingComplete}
          onBack={() => setCurrentStep('health')}
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
