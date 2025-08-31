import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  onSnapshot,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  User,
  Service,
  Appointment,
  HealthForm,
  CandidateAssessment,
  Payment,
  GiftCard,
  ContactForm,
  DayAvailability,
  Artist,
  Review,
  Notification,
  BusinessSettings,
  DayAnalytics
} from '@/types/database';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  SERVICES: 'services',
  APPOINTMENTS: 'appointments',
  HEALTH_FORMS: 'healthForms',
  CANDIDATE_ASSESSMENTS: 'candidateAssessments',
  PAYMENTS: 'payments',
  GIFT_CARDS: 'giftCards',
  CONTACT_FORMS: 'contactForms',
  AVAILABILITY: 'availability',
  ARTISTS: 'artists',
  REVIEWS: 'reviews',
  NOTIFICATIONS: 'notifications',
  BUSINESS_SETTINGS: 'businessSettings',
  ANALYTICS: 'analytics',
  PDF_DOCUMENTS: 'pdfDocuments',
  USER_ACTIVITIES: 'userActivities'
} as const;

// Generic CRUD operations
export class DatabaseService {
  // Create
  static async create<T>(collectionName: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }

  // Read
  static async getById<T>(collectionName: string, id: string): Promise<T | null> {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  }

  // Update
  static async update<T>(collectionName: string, id: string, data: Partial<T>): Promise<void> {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  }

  // Delete
  static async delete(collectionName: string, id: string): Promise<void> {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  }

  // Get all documents
  static async getAll<T>(collectionName: string): Promise<T[]> {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  }

  // Query with conditions
  static async query<T>(
    collectionName: string,
    conditions: Array<{ field: string; operator: any; value: any }>,
    orderByField?: string,
    limitCount?: number
  ): Promise<T[]> {
    let q = query(collection(db, collectionName));
    
    // Add where conditions
    conditions.forEach(condition => {
      q = query(q, where(condition.field, condition.operator, condition.value));
    });
    
    // Add ordering
    if (orderByField) {
      q = query(q, orderBy(orderByField, 'desc'));
    }
    
    // Add limit
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  }

  // Real-time listener
  static onSnapshot<T>(
    collectionName: string,
    callback: (data: T[]) => void,
    conditions?: Array<{ field: string; operator: any; value: any }>
  ): () => void {
    let q = query(collection(db, collectionName));
    
    if (conditions) {
      conditions.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value));
      });
    }
    
    return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
      callback(data);
    });
  }
}

// Specific service methods
export class UserService {
  static async createUser(userData: Omit<User, 'id'>): Promise<string> {
    const { profile, ...userDataWithoutProfile } = userData;
    // Create profile without timestamps - they'll be added by the service
    const profileData = {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
      dateOfBirth: profile.dateOfBirth,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      zipCode: profile.zipCode,
      emergencyContactName: profile.emergencyContactName,
      emergencyContactPhone: profile.emergencyContactPhone,
      preferredContactMethod: profile.preferredContactMethod,
      hearAboutUs: profile.hearAboutUs
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.USERS), {
      ...userDataWithoutProfile,
      profile: {
        ...profileData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    });
    return docRef.id;
  }

  static async getUserById(id: string): Promise<User | null> {
    return DatabaseService.getById<User>(COLLECTIONS.USERS, id);
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const users = await DatabaseService.query<User>(
      COLLECTIONS.USERS,
      [{ field: 'profile.email', operator: '==', value: email }]
    );
    return users.length > 0 ? users[0] : null;
  }

  static async updateUser(id: string, userData: Partial<User>): Promise<void> {
    return DatabaseService.update<User>(COLLECTIONS.USERS, id, userData);
  }

  static async createUserWithId(uid: string, userData: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: 'client' | 'admin' | 'artist';
    isActive: boolean;
    preferences: {
      emailNotifications: boolean;
      smsNotifications: boolean;
      marketingEmails: boolean;
    };
  }): Promise<void> {
    const userDoc = {
      role: userData.role,
      isActive: userData.isActive,
      preferences: userData.preferences,
      profile: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        dateOfBirth: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        preferredContactMethod: 'email',
        hearAboutUs: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    };
    
    await setDoc(doc(db, COLLECTIONS.USERS, uid), userDoc);
  }

  // Role management methods
  static async updateUserRole(userId: string, role: 'client' | 'admin' | 'artist'): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
      role: role,
      'profile.updatedAt': serverTimestamp()
    });
  }

  static async getUsersByRole(role: 'client' | 'admin' | 'artist'): Promise<User[]> {
    return DatabaseService.query<User>(
      COLLECTIONS.USERS,
      [{ field: 'role', operator: '==', value: role }],
      'profile.createdAt'
    );
  }

  static async getAdmins(): Promise<User[]> {
    return this.getUsersByRole('admin');
  }

  static async getArtists(): Promise<User[]> {
    return this.getUsersByRole('artist');
  }

  static async getClients(): Promise<User[]> {
    return this.getUsersByRole('client');
  }

  static async activateUser(userId: string): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
      isActive: true,
      'profile.updatedAt': serverTimestamp()
    });
  }

  static async deactivateUser(userId: string): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
      isActive: false,
      'profile.updatedAt': serverTimestamp()
    });
  }

  static async createAdminUser(email: string, profileData: {
    firstName: string;
    lastName: string;
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
  }): Promise<string> {
    // Check if user already exists
    const existingUser = await this.getUserByEmail(email);
    if (existingUser) {
      // If user exists, just update their role to admin
      await this.updateUserRole(existingUser.id, 'admin');
      return existingUser.id;
    }

    // Create new admin user
    const userData: Omit<User, 'id'> = {
      profile: {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: email,
        phone: profileData.phone,
        dateOfBirth: profileData.dateOfBirth,
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        zipCode: profileData.zipCode,
        emergencyContactName: profileData.emergencyContactName,
        emergencyContactPhone: profileData.emergencyContactPhone,
        preferredContactMethod: profileData.preferredContactMethod,
        hearAboutUs: profileData.hearAboutUs,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      role: 'admin',
      isActive: true
    };

    return this.createUser(userData);
  }
}

export class ServiceService {
  static async getAllServices(): Promise<Service[]> {
    const services = await DatabaseService.getAll<Service>(COLLECTIONS.SERVICES);
    
    // Sort by order field if it exists, otherwise by createdAt
    return services.sort((a, b) => {
      if ('order' in a && 'order' in b) {
        return (a as any).order - (b as any).order;
      }
      return a.createdAt.toMillis() - b.createdAt.toMillis();
    });
  }

  static async getActiveServices(): Promise<Service[]> {
    const services = await DatabaseService.query<Service>(
      COLLECTIONS.SERVICES,
      [{ field: 'isActive', operator: '==', value: true }]
    );
    
    // Sort by order field if it exists, otherwise by createdAt
    return services.sort((a, b) => {
      if ('order' in a && 'order' in b) {
        return (a as any).order - (b as any).order;
      }
      return a.createdAt.toMillis() - b.createdAt.toMillis();
    });
  }

  static async getServiceById(id: string): Promise<Service | null> {
    return DatabaseService.getById<Service>(COLLECTIONS.SERVICES, id);
  }

  static async createService(serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return DatabaseService.create<Service>(COLLECTIONS.SERVICES, serviceData);
  }

  static async updateService(id: string, serviceData: Partial<Service>): Promise<void> {
    return DatabaseService.update<Service>(COLLECTIONS.SERVICES, id, serviceData);
  }

  static async deleteService(id: string): Promise<void> {
    return DatabaseService.delete(COLLECTIONS.SERVICES, id);
  }

  static async deleteAllServices(): Promise<void> {
    const services = await DatabaseService.getAll<Service>(COLLECTIONS.SERVICES);
    for (const service of services) {
      await DatabaseService.delete(COLLECTIONS.SERVICES, service.id);
    }
  }

  static async deleteServicesByName(name: string): Promise<void> {
    const services = await DatabaseService.query<Service>(
      COLLECTIONS.SERVICES,
      [{ field: 'name', operator: '==', value: name }]
    );
    for (const service of services) {
      await DatabaseService.delete(COLLECTIONS.SERVICES, service.id);
    }
  }
}

export class AppointmentService {
  static async createAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return DatabaseService.create<Appointment>(COLLECTIONS.APPOINTMENTS, appointmentData);
  }

  static async getAppointmentById(id: string): Promise<Appointment | null> {
    return DatabaseService.getById<Appointment>(COLLECTIONS.APPOINTMENTS, id);
  }

  static async getAppointmentsByClient(clientId: string): Promise<Appointment[]> {
    return DatabaseService.query<Appointment>(
      COLLECTIONS.APPOINTMENTS,
      [{ field: 'clientId', operator: '==', value: clientId }],
      'scheduledDate'
    );
  }

  static async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    return DatabaseService.query<Appointment>(
      COLLECTIONS.APPOINTMENTS,
      [{ field: 'scheduledDate', operator: '==', value: date }],
      'scheduledTime'
    );
  }

  static async updateAppointmentStatus(id: string, status: Appointment['status']): Promise<void> {
    return DatabaseService.update<Appointment>(COLLECTIONS.APPOINTMENTS, id, { status });
  }

  static async cancelAppointment(id: string, reason: string): Promise<void> {
    return DatabaseService.update<Appointment>(COLLECTIONS.APPOINTMENTS, id, {
      status: 'cancelled',
      cancelledAt: Timestamp.now(),
      cancellationReason: reason
    });
  }
}

export class HealthFormService {
  static async createHealthForm(healthFormData: Omit<HealthForm, 'id'>): Promise<string> {
    // HealthForm doesn't have createdAt/updatedAt, so we use a different approach
    const docRef = await addDoc(collection(db, COLLECTIONS.HEALTH_FORMS), healthFormData);
    return docRef.id;
  }

  static async getHealthFormByAppointment(appointmentId: string): Promise<HealthForm | null> {
    const forms = await DatabaseService.query<HealthForm>(
      COLLECTIONS.HEALTH_FORMS,
      [{ field: 'appointmentId', operator: '==', value: appointmentId }]
    );
    return forms.length > 0 ? forms[0] : null;
  }

  static async updateHealthForm(id: string, data: Partial<HealthForm>): Promise<void> {
    return DatabaseService.update<HealthForm>(COLLECTIONS.HEALTH_FORMS, id, data);
  }
}

export class CandidateAssessmentService {
  static async createAssessment(assessmentData: Omit<CandidateAssessment, 'id'>): Promise<string> {
    // CandidateAssessment doesn't have createdAt/updatedAt, so we use a different approach
    const docRef = await addDoc(collection(db, COLLECTIONS.CANDIDATE_ASSESSMENTS), assessmentData);
    return docRef.id;
  }

  static async getAssessmentsByClient(clientId: string): Promise<CandidateAssessment[]> {
    return DatabaseService.query<CandidateAssessment>(
      COLLECTIONS.CANDIDATE_ASSESSMENTS,
      [{ field: 'clientId', operator: '==', value: clientId }],
      'completedAt'
    );
  }
}

export class PaymentService {
  static async createPayment(paymentData: Omit<Payment, 'id'>): Promise<string> {
    // Payment doesn't have createdAt/updatedAt, so we use a different approach
    const docRef = await addDoc(collection(db, COLLECTIONS.PAYMENTS), paymentData);
    return docRef.id;
  }

  static async getPaymentsByAppointment(appointmentId: string): Promise<Payment[]> {
    return DatabaseService.query<Payment>(
      COLLECTIONS.PAYMENTS,
      [{ field: 'appointmentId', operator: '==', value: appointmentId }],
      'processedAt'
    );
  }

  static async updatePaymentStatus(id: string, status: Payment['status']): Promise<void> {
    return DatabaseService.update<Payment>(COLLECTIONS.PAYMENTS, id, { status });
  }
}

export class GiftCardService {
  static async createGiftCard(giftCardData: Omit<GiftCard, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.GIFT_CARDS), {
      ...giftCardData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  }

  static async getGiftCardByCode(code: string): Promise<GiftCard | null> {
    const cards = await DatabaseService.query<GiftCard>(
      COLLECTIONS.GIFT_CARDS,
      [
        { field: 'code', operator: '==', value: code },
        { field: 'isActive', operator: '==', value: true }
      ]
    );
    return cards.length > 0 ? cards[0] : null;
  }

  static async useGiftCard(id: string, amountUsed: number, appointmentId: string): Promise<void> {
    const giftCard = await DatabaseService.getById<GiftCard>(COLLECTIONS.GIFT_CARDS, id);
    if (giftCard) {
      const newBalance = giftCard.remainingBalance - amountUsed;
      const usage = {
        id: Date.now().toString(),
        appointmentId,
        amountUsed,
        usedAt: Timestamp.now()
      };
      
      await DatabaseService.update<GiftCard>(COLLECTIONS.GIFT_CARDS, id, {
        remainingBalance: newBalance,
        usageHistory: [...giftCard.usageHistory, usage],
        isActive: newBalance > 0
      });
    }
  }
}

export class ContactFormService {
  static async createContactForm(contactData: Omit<ContactForm, 'id'>): Promise<string> {
    // ContactForm doesn't have createdAt/updatedAt, so we use a different approach
    const docRef = await addDoc(collection(db, COLLECTIONS.CONTACT_FORMS), contactData);
    return docRef.id;
  }

  static async getContactForms(status?: ContactForm['status']): Promise<ContactForm[]> {
    const conditions = status ? [{ field: 'status', operator: '==', value: status }] : [];
    return DatabaseService.query<ContactForm>(
      COLLECTIONS.CONTACT_FORMS,
      conditions,
      'submittedAt'
    );
  }

  static async updateContactFormStatus(id: string, status: ContactForm['status']): Promise<void> {
    return DatabaseService.update<ContactForm>(COLLECTIONS.CONTACT_FORMS, id, { status });
  }
}

export class AvailabilityService {
  static async getAvailability(date: string): Promise<DayAvailability | null> {
    return DatabaseService.getById<DayAvailability>(COLLECTIONS.AVAILABILITY, date);
  }

  static async updateAvailability(date: string, availability: DayAvailability): Promise<void> {
    return DatabaseService.update<DayAvailability>(COLLECTIONS.AVAILABILITY, date, availability);
  }

  static async blockTimeSlot(date: string, time: string, reason: string): Promise<void> {
    const availability = await this.getAvailability(date) || {};
    availability[time] = {
      available: false,
      blockedReason: reason
    };
    await this.updateAvailability(date, availability);
  }

  static async bookTimeSlot(date: string, time: string, appointmentId: string, artistId: string): Promise<void> {
    try {
      const availability = await this.getAvailability(date) || {};
      availability[time] = {
        available: false,
        appointmentId,
        artistId
      };
      await this.updateAvailability(date, availability);
    } catch (error) {
      console.warn('Could not update availability document:', error);
      // Create the availability document if it doesn't exist
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        const availabilityDoc = {
          [time]: {
            available: false,
            appointmentId,
            artistId
          }
        };
        await setDoc(doc(db, COLLECTIONS.AVAILABILITY, date), availabilityDoc);
        console.log('Created new availability document for date:', date);
      } catch (createError) {
        console.error('Failed to create availability document:', createError);
        throw createError;
      }
    }
  }
}

export class NotificationService {
  static async createNotification(notificationData: Omit<Notification, 'id'>): Promise<string> {
    // Notification doesn't have createdAt/updatedAt, so we use a different approach
    const docRef = await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), notificationData);
    return docRef.id;
  }

  static async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return DatabaseService.query<Notification>(
      COLLECTIONS.NOTIFICATIONS,
      [{ field: 'userId', operator: '==', value: userId }],
      'sentAt'
    );
  }

  static async markAsRead(id: string): Promise<void> {
    return DatabaseService.update<Notification>(COLLECTIONS.NOTIFICATIONS, id, {
      isRead: true,
      readAt: Timestamp.now()
    });
  }
}

export class BusinessSettingsService {
  static async getSettings(): Promise<BusinessSettings | null> {
    return DatabaseService.getById<BusinessSettings>(COLLECTIONS.BUSINESS_SETTINGS, 'main');
  }

  static async updateSettings(settings: Partial<BusinessSettings>): Promise<void> {
    return DatabaseService.update<BusinessSettings>(COLLECTIONS.BUSINESS_SETTINGS, 'main', settings);
  }

  static async createOrUpdateSettings(settings: BusinessSettings): Promise<void> {
    const { db } = await import('@/lib/firebase');
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
    const docRef = doc(db, COLLECTIONS.BUSINESS_SETTINGS, 'main');
    await setDoc(docRef, {
      ...settings,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
  }
}

// PDF Document types
export interface PDFDocument {
  id: string;
  clientId: string;
  appointmentId: string;
  formType: 'booking' | 'health' | 'consent';
  filename: string;
  downloadURL: string;
  filePath: string;
  fileSize?: number;
  generatedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class PDFDocumentService {
  static async createPDFRecord(pdfData: Omit<PDFDocument, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return DatabaseService.create<PDFDocument>(COLLECTIONS.PDF_DOCUMENTS, pdfData);
  }

  static async getPDFsByAppointment(appointmentId: string): Promise<PDFDocument[]> {
    return DatabaseService.query<PDFDocument>(
      COLLECTIONS.PDF_DOCUMENTS,
      [{ field: 'appointmentId', operator: '==', value: appointmentId }],
      'generatedAt'
    );
  }

  static async getPDFsByClient(clientId: string): Promise<PDFDocument[]> {
    return DatabaseService.query<PDFDocument>(
      COLLECTIONS.PDF_DOCUMENTS,
      [{ field: 'clientId', operator: '==', value: clientId }],
      'generatedAt'
    );
  }

  static async getPDFsByType(formType: PDFDocument['formType']): Promise<PDFDocument[]> {
    return DatabaseService.query<PDFDocument>(
      COLLECTIONS.PDF_DOCUMENTS,
      [{ field: 'formType', operator: '==', value: formType }],
      'generatedAt'
    );
  }

  static async updatePDFRecord(id: string, data: Partial<PDFDocument>): Promise<void> {
    return DatabaseService.update<PDFDocument>(COLLECTIONS.PDF_DOCUMENTS, id, data);
  }

  static async deletePDFRecord(id: string): Promise<void> {
    return DatabaseService.delete(COLLECTIONS.PDF_DOCUMENTS, id);
  }
}
