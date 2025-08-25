import { Timestamp } from 'firebase/firestore';

export interface UserActivity {
  id: string;
  userId: string;
  activityType: 'appointment_created' | 'appointment_updated' | 'appointment_cancelled' | 
                'profile_updated' | 'health_form_submitted' | 'pdf_generated' | 
                'payment_completed' | 'login' | 'email_sent' | 'document_downloaded' |
                'booking_started' | 'booking_completed' | 'form_saved';
  title: string;
  description: string;
  metadata?: {
    appointmentId?: string;
    serviceType?: string;
    pdfType?: string;
    documentName?: string;
    amount?: number;
    formType?: string;
    [key: string]: any;
  };
  timestamp: Timestamp;
  status: 'success' | 'pending' | 'failed';
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

export interface ActivityFilters {
  activityTypes?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: 'success' | 'pending' | 'failed';
  limit?: number;
}
