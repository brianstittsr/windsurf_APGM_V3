import { useCallback } from 'react';

export interface WorkflowTriggerData {
  trigger: 'new_client' | 'appointment_booked' | 'appointment_completed' | 'no_show' | 'manual' | 'birthday' | 'follow_up';
  userId: string;
  userEmail: string;
  additionalData?: {
    appointmentId?: string;
    serviceType?: string;
    appointmentDate?: string;
    artistId?: string;
    [key: string]: any;
  };
}

export const useWorkflowTrigger = () => {
  const triggerWorkflow = useCallback(async (data: WorkflowTriggerData) => {
    try {
      const response = await fetch('/api/trigger-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to trigger workflow');
      }

      const result = await response.json();
      console.log('Workflow triggered successfully:', result);
      return result;
    } catch (error) {
      console.error('Error triggering workflow:', error);
      throw error;
    }
  }, []);

  const triggerNewClientWorkflow = useCallback(async (userId: string, userEmail: string) => {
    return triggerWorkflow({
      trigger: 'new_client',
      userId,
      userEmail,
    });
  }, [triggerWorkflow]);

  const triggerAppointmentBookedWorkflow = useCallback(async (
    userId: string, 
    userEmail: string, 
    appointmentData: {
      appointmentId: string;
      serviceType: string;
      appointmentDate: string;
      artistId: string;
    }
  ) => {
    return triggerWorkflow({
      trigger: 'appointment_booked',
      userId,
      userEmail,
      additionalData: appointmentData,
    });
  }, [triggerWorkflow]);

  const triggerAppointmentCompletedWorkflow = useCallback(async (
    userId: string, 
    userEmail: string, 
    appointmentData: {
      appointmentId: string;
      serviceType: string;
      completedDate: string;
      artistId: string;
    }
  ) => {
    return triggerWorkflow({
      trigger: 'appointment_completed',
      userId,
      userEmail,
      additionalData: appointmentData,
    });
  }, [triggerWorkflow]);

  const triggerNoShowWorkflow = useCallback(async (
    userId: string, 
    userEmail: string, 
    appointmentData: {
      appointmentId: string;
      serviceType: string;
      missedDate: string;
      artistId: string;
    }
  ) => {
    return triggerWorkflow({
      trigger: 'no_show',
      userId,
      userEmail,
      additionalData: appointmentData,
    });
  }, [triggerWorkflow]);

  const triggerBirthdayWorkflow = useCallback(async (userId: string, userEmail: string) => {
    return triggerWorkflow({
      trigger: 'birthday',
      userId,
      userEmail,
    });
  }, [triggerWorkflow]);

  const triggerFollowUpWorkflow = useCallback(async (
    userId: string, 
    userEmail: string, 
    followUpData?: {
      reason: string;
      lastContact: string;
      [key: string]: any;
    }
  ) => {
    return triggerWorkflow({
      trigger: 'follow_up',
      userId,
      userEmail,
      additionalData: followUpData,
    });
  }, [triggerWorkflow]);

  return {
    triggerWorkflow,
    triggerNewClientWorkflow,
    triggerAppointmentBookedWorkflow,
    triggerAppointmentCompletedWorkflow,
    triggerNoShowWorkflow,
    triggerBirthdayWorkflow,
    triggerFollowUpWorkflow,
  };
};
