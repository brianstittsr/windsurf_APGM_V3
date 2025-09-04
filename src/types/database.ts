import { Timestamp } from 'firebase/firestore';

// User Types
export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  preferredContactMethod: string;
  hearAboutUs: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface User {
  id: string;
  profile: UserProfile;
  role: 'client' | 'admin' | 'artist';
  isActive: boolean;
}

// Service Types
export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  category: 'eyebrows' | 'eyeliner' | 'lips' | 'correction';
  image: string;
  isActive: boolean;
  requirements: string[];
  contraindications: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Gift Card Types
export interface GiftCard {
  id: string;
  code: string;
  amount: number;
  remainingBalance: number;
  purchasedBy?: string;
  purchasedFor?: string;
  recipientName?: string;
  recipientEmail?: string;
  message?: string;
  isActive: boolean;
  expiresAt?: Timestamp;
  createdAt: Timestamp;
  usageHistory: GiftCardUsage[];
}

// Coupon Code Types
export interface CouponCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_service' | 'exact_amount';
  value: number; // percentage (0-100) or fixed amount in cents
  exactAmount?: number; // Override service price with this exact amount
  description: string;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  expirationDate?: Timestamp;
  applicableServices?: string[]; // service IDs, empty means all services
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Appointment Types
export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  serviceId: string;
  serviceName: string;
  artistId: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  totalAmount: number;
  depositAmount: number;
  remainingAmount: number;
  paymentStatus: 'pending' | 'deposit_paid' | 'paid_in_full' | 'refunded';
  paymentIntentId: string;
  specialRequests: string;
  giftCardCode?: string;
  giftCardAmount?: number;
  couponCode?: string;
  couponDiscount?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  cancelledAt?: Timestamp;
  cancellationReason?: string;
  rescheduleCount: number;
  confirmationSent: boolean;
  reminderSent: boolean;
}

// Health Form Types
export interface HealthForm {
  id: string;
  clientId: string;
  appointmentId: string;
  responses: { [key: string]: string };
  signature: string;
  signedAt: Timestamp;
  ipAddress: string;
  isValid: boolean;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  notes?: string;
  clearanceRequired: boolean;
  doctorClearance?: {
    required: boolean;
    received: boolean;
    document?: string;
    expiresAt?: Timestamp;
  };
}

// Candidate Assessment Types
export interface CandidateAssessment {
  id: string;
  clientId?: string;
  responses: {
    basic_health: string[];
    medical_treatments: string[];
    diabetes: string;
    medical_history: string[];
    recent_treatments: string[];
    brow_irritation: string;
    skin_type: string;
    pore_texture: string;
    previous_work: string;
  };
  result: {
    isGoodCandidate: boolean;
    score: number;
    recommendations: string[];
    warnings: string[];
    requiresConsultation: boolean;
  };
  completedAt: Timestamp;
  ipAddress: string;
}

// Payment Types
export interface Payment {
  id: string;
  appointmentId: string;
  clientId: string;
  amount: number;
  type: 'deposit' | 'full_payment' | 'refund';
  method: 'card' | 'cash' | 'cherry' | 'klarna' | 'paypal';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  stripePaymentIntentId?: string;
  processedAt?: Timestamp;
  refundedAt?: Timestamp;
  refundAmount?: number;
  fees: number;
  netAmount: number;
}

// Gift Card Types
export interface GiftCard {
  id: string;
  code: string;
  amount: number;
  remainingBalance: number;
  purchasedBy?: string;
  purchasedFor?: string;
  isActive: boolean;
  expiresAt?: Timestamp;
  createdAt: Timestamp;
  usageHistory: GiftCardUsage[];
}

export interface GiftCardUsage {
  id: string;
  appointmentId: string;
  amountUsed: number;
  usedAt: Timestamp;
}

// Contact Form Types
export interface ContactForm {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  status: 'new' | 'responded' | 'closed';
  respondedAt?: Timestamp;
  respondedBy?: string;
  submittedAt: Timestamp;
  ipAddress: string;
  source: 'contact_page' | 'consultation_form' | 'other';
}

// Availability Types
export interface TimeSlot {
  available: boolean;
  artistId?: string;
  appointmentId?: string;
  blockedReason?: string;
}

export interface DayAvailability {
  [time: string]: TimeSlot;
}

// Artist Types
export interface Artist {
  id: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  image: string;
  specialties: string[];
  isActive: boolean;
  workingHours: {
    [day: string]: {
      start: string;
      end: string;
      isWorking: boolean;
    };
  };
  certifications: string[];
  experience: string;
}

// Review Types
export interface Review {
  id: string;
  clientId: string;
  appointmentId: string;
  rating: number;
  comment: string;
  isPublic: boolean;
  isVerified: boolean;
  submittedAt: Timestamp;
  moderatedBy?: string;
  moderatedAt?: Timestamp;
  status: 'pending' | 'approved' | 'rejected';
  beforePhoto?: string;
  afterPhoto?: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'appointment_confirmation' | 'appointment_reminder' | 'payment_received' | 'cancellation';
  title: string;
  message: string;
  isRead: boolean;
  sentAt: Timestamp;
  readAt?: Timestamp;
  appointmentId?: string;
  emailSent: boolean;
  smsSent: boolean;
}

// Business Settings Types
export interface BusinessSettings {
  general: {
    businessName: string;
    address: string;
    phone: string;
    email: string;
    workingHours: { [day: string]: { start: string; end: string; isWorking: boolean } };
    timezone: string;
    depositPercentage: number;
    cancellationPolicy: string;
    rebookingFee: number;
  };
  booking: {
    advanceBookingDays: number;
    minNoticeHours: number;
    maxReschedules: number;
    autoConfirm: boolean;
    requireDeposit: boolean;
  };
  payments: {
    stripePublicKey: string;
    acceptedMethods: string[];
    taxRate: number;
    currency: string;
  };
}

// Analytics Types
export interface DayAnalytics {
  appointments: {
    total: number;
    confirmed: number;
    cancelled: number;
    completed: number;
  };
  revenue: {
    total: number;
    deposits: number;
    fullPayments: number;
  };
  services: {
    [serviceId: string]: {
      bookings: number;
      revenue: number;
    };
  };
  traffic: {
    pageViews: number;
    uniqueVisitors: number;
    contactForms: number;
    assessments: number;
  };
}

