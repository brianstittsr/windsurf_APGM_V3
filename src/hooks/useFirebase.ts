import { useState, useEffect } from 'react';
import { 
  ServiceService, 
  AppointmentService, 
  UserService, 
  ContactFormService,
  CandidateAssessmentService,
  HealthFormService,
  AvailabilityService
} from '@/services/database';
import { AvailabilityService as ArtistAvailabilityService, ArtistAvailability } from '@/services/availabilityService';
import { TimeSlotService, DayTimeSlots, TimeSlot } from '@/services/timeSlotService';
import { 
  Service, 
  Appointment, 
  User, 
  ContactForm, 
  CandidateAssessment,
  HealthForm,
  DayAvailability 
} from '@/types/database';
import { isFirebaseConfigured } from '@/lib/firebase';

// Hook for services
export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        
        if (!isFirebaseConfigured()) {
          // Return mock data when Firebase is not configured
          setServices([
            {
              id: 'powder-brows',
              name: 'Powder Eyebrows',
              description: 'Powder brows offer a semi-permanent cosmetic tattoo solution that creates a soft, powdered makeup look.',
              price: 600,
              duration: '2-3 hours',
              category: 'eyebrows',
              isActive: true,
              image: '/images/services/POWDER.png',
              requirements: ['Age 18+', 'No recent Botox'],
              contraindications: ['Pregnancy', 'Blood thinners'],
              createdAt: new Date() as any,
              updatedAt: new Date() as any
            },
            {
              id: 'microblading',
              name: 'Strokes Eyebrows',
              description: 'Hair-stroke technique that creates natural-looking eyebrows with precise individual strokes.',
              price: 550,
              duration: '2-3 hours',
              category: 'eyebrows',
              isActive: true,
              image: '/images/services/STROKES.png',
              requirements: ['Age 18+', 'No recent Botox'],
              contraindications: ['Pregnancy', 'Blood thinners'],
              createdAt: new Date() as any,
              updatedAt: new Date() as any
            },
            {
              id: 'combo-eyebrows',
              name: 'Combo Eyebrows',
              description: 'Combination of microblading and powder technique for the most natural and full eyebrow look.',
              price: 650,
              duration: '2.5-3.5 hours',
              category: 'eyebrows',
              isActive: true,
              image: '/images/services/COMBO.png',
              requirements: ['Age 18+', 'No recent Botox'],
              contraindications: ['Pregnancy', 'Blood thinners'],
              createdAt: new Date() as any,
              updatedAt: new Date() as any
            },
            {
              id: 'ombre-eyebrows',
              name: 'Ombre Eyebrows',
              description: 'Gradient shading technique that creates a soft, natural ombre effect from light to dark.',
              price: 620,
              duration: '2.5-3 hours',
              category: 'eyebrows',
              isActive: true,
              image: '/images/services/OMBRE.png',
              requirements: ['Age 18+', 'No recent Botox'],
              contraindications: ['Pregnancy', 'Blood thinners'],
              createdAt: new Date() as any,
              updatedAt: new Date() as any
            },
            {
              id: 'blade-shade',
              name: 'Blade + Shade',
              description: 'Advanced technique combining precise blade strokes with soft shading for dimensional brows.',
              price: 680,
              duration: '3-3.5 hours',
              category: 'eyebrows',
              isActive: true,
              image: '/images/services/BLADE+SHADE.png',
              requirements: ['Age 18+', 'No recent Botox'],
              contraindications: ['Pregnancy', 'Blood thinners'],
              createdAt: new Date() as any,
              updatedAt: new Date() as any
            },
            {
              id: 'bold-combo',
              name: 'Bold Combo',
              description: 'Bold and defined eyebrows using advanced combo techniques for dramatic, full coverage.',
              price: 700,
              duration: '3-4 hours',
              category: 'eyebrows',
              isActive: true,
              image: '/images/services/BOLD-COMBO.png',
              requirements: ['Age 18+', 'No recent Botox'],
              contraindications: ['Pregnancy', 'Blood thinners'],
              createdAt: new Date() as any,
              updatedAt: new Date() as any
            }
          ]);
          setError('Firebase not configured - showing demo data');
          return;
        }
        
        const servicesData = await ServiceService.getAllServices();
        setServices(servicesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return { services, loading, error };
}

// Hook for appointments
export function useAppointments(clientId?: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) return;

    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const appointmentsData = await AppointmentService.getAppointmentsByClient(clientId);
        setAppointments(appointmentsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [clientId]);

  const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const id = await AppointmentService.createAppointment(appointmentData);
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create appointment');
      throw err;
    }
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    try {
      await AppointmentService.updateAppointmentStatus(id, status);
      // Refresh appointments
      if (clientId) {
        const appointmentsData = await AppointmentService.getAppointmentsByClient(clientId);
        setAppointments(appointmentsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update appointment');
      throw err;
    }
  };

  return { 
    appointments, 
    loading, 
    error, 
    createAppointment, 
    updateAppointmentStatus 
  };
}

// Hook for user management
export function useUser(userId?: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await UserService.getUserById(userId);
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const createUser = async (userData: Omit<User, 'id'>) => {
    try {
      const id = await UserService.createUser(userData);
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
      throw err;
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!userId) throw new Error('No user ID provided');
    
    try {
      await UserService.updateUser(userId, userData);
      // Refresh user data
      const updatedUser = await UserService.getUserById(userId);
      setUser(updatedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      throw err;
    }
  };

  return { user, loading, error, createUser, updateUser };
}

// Hook for contact forms
export function useContactForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submitContactForm = async (formData: {
    name: string;
    email: string;
    phone: string;
    service: string;
    message: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const contactFormData: Omit<ContactForm, 'id'> = {
        ...formData,
        submittedAt: new Date() as any, // Will be converted to Timestamp in service
        status: 'new',
        ipAddress: '', // You might want to get this from a service
        source: 'contact_page'
      };

      await ContactFormService.createContactForm(contactFormData);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit contact form');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submitContactForm, loading, error, success };
}

// Hook for candidate assessment
export function useCandidateAssessment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CandidateAssessment['result'] | null>(null);

  const submitAssessment = async (
    responses: CandidateAssessment['responses'], 
    clientId?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Import the calculation function
      const { calculateAssessmentScore } = await import('@/scripts/initializeDatabase');
      const assessmentResult = calculateAssessmentScore(responses);

      const assessmentData: Omit<CandidateAssessment, 'id'> = {
        clientId,
        responses,
        result: assessmentResult,
        completedAt: new Date() as any, // Will be converted to Timestamp
        ipAddress: '' // You might want to get this from a service
      };

      await CandidateAssessmentService.createAssessment(assessmentData);
      setResult(assessmentResult);
      
      return assessmentResult;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit assessment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submitAssessment, loading, error, result };
}

// Hook for health forms
export function useHealthForm(appointmentId?: string) {
  const [healthForm, setHealthForm] = useState<HealthForm | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!appointmentId) return;

    const fetchHealthForm = async () => {
      try {
        setLoading(true);
        const form = await HealthFormService.getHealthFormByAppointment(appointmentId);
        setHealthForm(form);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch health form');
      } finally {
        setLoading(false);
      }
    };

    fetchHealthForm();
  }, [appointmentId]);

  const submitHealthForm = async (
    formData: {
      clientId: string;
      appointmentId: string;
      responses: { [key: string]: string };
      ipAddress: string;
      isValid: boolean;
      clearanceRequired: boolean;
    },
    signature: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const healthFormData: Omit<HealthForm, 'id'> = {
        ...formData,
        signature,
        signedAt: new Date() as any, // Will be converted to Timestamp
      };

      const id = await HealthFormService.createHealthForm(healthFormData);
      
      // Refresh health form data
      const newForm = await HealthFormService.getHealthFormByAppointment(formData.appointmentId);
      setHealthForm(newForm);
      
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit health form');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { healthForm, submitHealthForm, loading, error };
}

// Hook for availability
export function useAvailability(date?: string) {
  const [availability, setAvailability] = useState<DayAvailability | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date) return;

    const fetchAvailability = async () => {
      try {
        setLoading(true);
        const availabilityData = await AvailabilityService.getAvailability(date);
        setAvailability(availabilityData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch availability');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [date]);

  const bookTimeSlot = async (time: string, appointmentId: string, artistId: string = 'default') => {
    if (!date) throw new Error('No date provided');
    
    try {
      await AvailabilityService.bookTimeSlot(date, time, appointmentId, artistId);
      // Refresh availability
      const availabilityData = await AvailabilityService.getAvailability(date);
      setAvailability(availabilityData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book time slot');
      throw err;
    }
  };

  return { availability, bookTimeSlot, loading, error };
}

// Hook for artist availability management
export function useArtistAvailability(artistId?: string) {
  const [availability, setAvailability] = useState<ArtistAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!artistId) return;

    const fetchAvailability = async () => {
      try {
        setLoading(true);
        const data = await ArtistAvailabilityService.getArtistAvailability(artistId);
        setAvailability(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch artist availability');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [artistId]);

  const updateDayAvailability = async (
    dayOfWeek: string, 
    availabilityData: Partial<ArtistAvailability>
  ) => {
    if (!artistId) throw new Error('No artist ID provided');
    
    try {
      setError(null);
      await ArtistAvailabilityService.updateDayAvailability(artistId, dayOfWeek, availabilityData);
      // Refresh data
      const data = await ArtistAvailabilityService.getArtistAvailability(artistId);
      setAvailability(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update availability');
      throw err;
    }
  };

  const toggleDayAvailability = async (dayOfWeek: string, isEnabled: boolean) => {
    if (!artistId) throw new Error('No artist ID provided');
    
    try {
      setError(null);
      await ArtistAvailabilityService.toggleDayAvailability(artistId, dayOfWeek, isEnabled);
      // Refresh data
      const data = await ArtistAvailabilityService.getArtistAvailability(artistId);
      setAvailability(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle day availability');
      throw err;
    }
  };

  const initializeAvailability = async () => {
    if (!artistId) throw new Error('No artist ID provided');
    
    try {
      setError(null);
      await ArtistAvailabilityService.initializeArtistAvailability(artistId);
      // Refresh data
      const data = await ArtistAvailabilityService.getArtistAvailability(artistId);
      setAvailability(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize availability');
      throw err;
    }
  };

  return { 
    availability, 
    updateDayAvailability, 
    toggleDayAvailability, 
    initializeAvailability,
    loading, 
    error 
  };
}

// Hook for time slot availability
export function useTimeSlots(date?: string) {
  const [timeSlots, setTimeSlots] = useState<DayTimeSlots | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date) {
      setTimeSlots(null);
      return;
    }

    const fetchTimeSlots = async () => {
      try {
        setLoading(true);
        setError(null);
        const slots = await TimeSlotService.getAvailableTimeSlots(date);
        setTimeSlots(slots);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch time slots');
      } finally {
        setLoading(false);
      }
    };

    fetchTimeSlots();
  }, [date]);

  const refreshTimeSlots = async () => {
    if (!date) return;
    
    try {
      setLoading(true);
      setError(null);
      const slots = await TimeSlotService.getAvailableTimeSlots(date);
      setTimeSlots(slots);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh time slots');
    } finally {
      setLoading(false);
    }
  };

  const checkTimeSlotAvailability = async (time: string, artistId: string): Promise<boolean> => {
    if (!date) return false;
    
    try {
      return await TimeSlotService.isTimeSlotAvailable(date, time, artistId);
    } catch (err) {
      console.error('Error checking time slot availability:', err);
      return false;
    }
  };

  return { 
    timeSlots, 
    loading, 
    error, 
    refreshTimeSlots,
    checkTimeSlotAvailability
  };
}

// Hook for getting next available date
export function useNextAvailableDate() {
  const [nextAvailable, setNextAvailable] = useState<{ date: string; timeSlots: TimeSlot[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findNextAvailableDate = async (fromDate?: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await TimeSlotService.getNextAvailableDate(fromDate);
      setNextAvailable(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find next available date');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { 
    nextAvailable, 
    loading, 
    error, 
    findNextAvailableDate
  };
}
