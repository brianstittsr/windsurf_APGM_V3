import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { UserActivity, ActivityFilters } from '@/types/activity';

export class ActivityService {
  private static readonly COLLECTION = 'userActivities';

  /**
   * Log a new user activity
   */
  static async logActivity(activity: Omit<UserActivity, 'id' | 'timestamp'>): Promise<string> {
    try {
      const activityData = {
        ...activity,
        timestamp: serverTimestamp()
      };

      const docRef = await addDoc(collection(getDb(), this.COLLECTION), activityData);
      console.log(`📝 Activity logged: ${activity.activityType} for user ${activity.userId}`);
      return docRef.id;
    } catch (error) {
      console.error('❌ Failed to log activity:', error);
      throw error;
    }
  }

  /**
   * Get user activities with optional filters
   */
  static async getUserActivities(
    userId: string, 
    filters: ActivityFilters = {}
  ): Promise<UserActivity[]> {
    try {
      let q = query(
        collection(getDb(), this.COLLECTION),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );

      // Apply limit
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      const activities: UserActivity[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp
        } as UserActivity);
      });

      // Apply client-side filters
      let filteredActivities = activities;

      if (filters.activityTypes && filters.activityTypes.length > 0) {
        filteredActivities = filteredActivities.filter(activity => 
          filters.activityTypes!.includes(activity.activityType)
        );
      }

      if (filters.status) {
        filteredActivities = filteredActivities.filter(activity => 
          activity.status === filters.status
        );
      }

      if (filters.dateRange) {
        filteredActivities = filteredActivities.filter(activity => {
          const activityDate = activity.timestamp.toDate();
          return activityDate >= filters.dateRange!.start && 
                 activityDate <= filters.dateRange!.end;
        });
      }

      return filteredActivities;
    } catch (error) {
      console.error('❌ Failed to get user activities:', error);
      return [];
    }
  }

  /**
   * Log appointment-related activity
   */
  static async logAppointmentActivity(
    userId: string,
    activityType: 'appointment_created' | 'appointment_updated' | 'appointment_cancelled',
    appointmentId: string,
    serviceType: string,
    additionalData?: any
  ): Promise<string> {
    const titles = {
      appointment_created: 'Appointment Booked',
      appointment_updated: 'Appointment Updated',
      appointment_cancelled: 'Appointment Cancelled'
    };

    const descriptions = {
      appointment_created: `Successfully booked ${serviceType} appointment`,
      appointment_updated: `Updated ${serviceType} appointment details`,
      appointment_cancelled: `Cancelled ${serviceType} appointment`
    };

    const colors = {
      appointment_created: 'success' as const,
      appointment_updated: 'info' as const,
      appointment_cancelled: 'warning' as const
    };

    return this.logActivity({
      userId,
      activityType,
      title: titles[activityType],
      description: descriptions[activityType],
      metadata: {
        appointmentId,
        serviceType,
        ...additionalData
      },
      status: 'success',
      icon: 'fas fa-calendar-check',
      color: colors[activityType]
    });
  }

  /**
   * Log PDF generation activity
   */
  static async logPDFActivity(
    userId: string,
    pdfType: 'health' | 'consent' | 'booking',
    pdfId: string,
    appointmentId?: string
  ): Promise<string> {
    const titles = {
      health: 'Health Form PDF Generated',
      consent: 'Consent Form PDF Generated',
      booking: 'Booking Confirmation PDF Generated'
    };

    const descriptions = {
      health: 'Health questionnaire PDF created and stored',
      consent: 'Consent form PDF created and stored',
      booking: 'Booking confirmation PDF created and stored'
    };

    return this.logActivity({
      userId,
      activityType: 'pdf_generated',
      title: titles[pdfType],
      description: descriptions[pdfType],
      metadata: {
        pdfType,
        pdfId,
        appointmentId
      },
      status: 'success',
      icon: 'fas fa-file-pdf',
      color: 'info'
    });
  }

  /**
   * Log payment activity
   */
  static async logPaymentActivity(
    userId: string,
    paymentMethod: string,
    amount: number,
    appointmentId?: string
  ): Promise<void> {
    await this.logActivity({
      userId,
      activityType: 'payment_completed',
      title: 'Payment Completed',
      description: `Payment processed via ${paymentMethod}`,
      metadata: {
        paymentMethod,
        amount,
        appointmentId
      },
      status: 'success',
      icon: 'fas fa-credit-card',
      color: 'success'
    });
  }

  /**
   * Log document activity
   */
  static async logDocumentActivity(
    userId: string,
    action: 'download' | 'view' | 'generate',
    documentType: string,
    documentId: string,
    appointmentId?: string
  ): Promise<void> {
    await this.logActivity({
      userId,
      activityType: 'document_downloaded',
      title: `Document ${action}`,
      description: `Document ${action}: ${documentType} form`,
      metadata: {
        action,
        documentType,
        documentId,
        appointmentId
      },
      status: 'success',
      icon: 'fas fa-download',
      color: 'info'
    });
  }

  /**
   * Log profile update activity
   */
  static async logProfileActivity(
    userId: string,
    updatedFields: string[]
  ): Promise<string> {
    return this.logActivity({
      userId,
      activityType: 'profile_updated',
      title: 'Profile Updated',
      description: `Updated profile information: ${updatedFields.join(', ')}`,
      metadata: {
        updatedFields
      },
      status: 'success',
      icon: 'fas fa-user-edit',
      color: 'info'
    });
  }

  /**
   * Log form submission activity
   */
  static async logFormActivity(
    userId: string,
    formType: 'health' | 'profile' | 'booking',
    appointmentId?: string
  ): Promise<string> {
    const titles = {
      health: 'Health Form Submitted',
      profile: 'Profile Information Saved',
      booking: 'Booking Form Completed'
    };

    const descriptions = {
      health: 'Health questionnaire completed and submitted',
      profile: 'Profile information updated and saved',
      booking: 'Booking process completed successfully'
    };

    return this.logActivity({
      userId,
      activityType: 'health_form_submitted',
      title: titles[formType],
      description: descriptions[formType],
      metadata: {
        formType,
        appointmentId
      },
      status: 'success',
      icon: 'fas fa-clipboard-check',
      color: 'success'
    });
  }

  /**
   * Log login activity
   */
  static async logLoginActivity(userId: string): Promise<string> {
    return this.logActivity({
      userId,
      activityType: 'login',
      title: 'Logged In',
      description: 'Successfully logged into your account',
      status: 'success',
      icon: 'fas fa-sign-in-alt',
      color: 'primary'
    });
  }

  /**
   * Log document download activity
   */
  static async logDocumentDownload(
    userId: string,
    documentName: string,
    documentType: string
  ): Promise<string> {
    return this.logActivity({
      userId,
      activityType: 'document_downloaded',
      title: 'Document Downloaded',
      description: `Downloaded ${documentName}`,
      metadata: {
        documentName,
        documentType
      },
      status: 'success',
      icon: 'fas fa-download',
      color: 'info'
    });
  }
}
