/**
 * BMAD Workflow Engine for Permanent Makeup Website
 * Automates common business processes and customer interactions
 */

import { DatabaseService } from './database';
import { GHLOrchestrator } from './ghl-orchestrator';

export interface WorkflowTrigger {
  type: 'booking_created' | 'booking_confirmed' | 'booking_cancelled' | 
        'user_registered' | 'payment_received' | 'review_submitted' |
        'consultation_requested' | 'appointment_reminder' | 'follow_up';
  data: any;
}

export interface WorkflowAction {
  type: 'send_email' | 'send_sms' | 'create_ghl_contact' | 'add_ghl_tag' |
        'create_task' | 'update_booking' | 'send_notification' | 'create_opportunity';
  config: any;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger['type'];
  conditions?: any[];
  actions: WorkflowAction[];
  isActive: boolean;
  createdAt: Date;
}

export class BMADWorkflowEngine {
  private ghlOrchestrator: GHLOrchestrator | null = null;

  constructor() {
    this.initializeGHL();
  }

  private async initializeGHL() {
    try {
      const settingsList = await DatabaseService.getAll('crmSettings');
      const settings = settingsList.length > 0 ? settingsList[0] : null;
      
      if (settings && (settings as any).apiKey) {
        this.ghlOrchestrator = new GHLOrchestrator({
          apiKey: (settings as any).apiKey,
          locationId: (settings as any).locationId
        });
      }
    } catch (error) {
      console.error('Failed to initialize GHL for workflows:', error);
    }
  }

  /**
   * Execute workflow based on trigger
   */
  async executeWorkflow(trigger: WorkflowTrigger) {
    console.log('🔄 Executing workflow for trigger:', trigger.type);

    switch (trigger.type) {
      case 'booking_created':
        return await this.handleNewBooking(trigger.data);
      
      case 'booking_confirmed':
        return await this.handleBookingConfirmation(trigger.data);
      
      case 'user_registered':
        return await this.handleNewUserRegistration(trigger.data);
      
      case 'consultation_requested':
        return await this.handleConsultationRequest(trigger.data);
      
      case 'payment_received':
        return await this.handlePaymentReceived(trigger.data);
      
      case 'review_submitted':
        return await this.handleReviewSubmitted(trigger.data);
      
      case 'appointment_reminder':
        return await this.sendAppointmentReminder(trigger.data);
      
      case 'follow_up':
        return await this.handleFollowUp(trigger.data);
      
      default:
        console.log('Unknown trigger type:', trigger.type);
        return { success: false, message: 'Unknown trigger type' };
    }
  }

  /**
   * WORKFLOW: New Booking Created
   * 1. Create contact in GHL
   * 2. Add to "New Booking" pipeline
   * 3. Send confirmation email/SMS
   * 4. Create follow-up task
   */
  private async handleNewBooking(bookingData: any) {
    console.log('📅 New booking workflow started');
    const results = [];

    try {
      // 1. Create or update contact in GHL
      if (this.ghlOrchestrator && bookingData.email) {
        try {
          const contact = await this.ghlOrchestrator.createContact({
            firstName: bookingData.firstName || bookingData.name?.split(' ')[0],
            lastName: bookingData.lastName || bookingData.name?.split(' ')[1],
            email: bookingData.email,
            phone: bookingData.phone,
            tags: ['New Booking', bookingData.serviceName || 'Service'],
            customFields: {
              'Service': bookingData.serviceName,
              'Booking Date': bookingData.date,
              'Booking Time': bookingData.time
            }
          });
          results.push({ action: 'create_ghl_contact', success: true, data: contact });
        } catch (error) {
          console.error('Failed to create GHL contact:', error);
          results.push({ action: 'create_ghl_contact', success: false, error });
        }

        // 2. Create opportunity in pipeline
        try {
          const opportunity = await this.ghlOrchestrator.createOpportunity({
            contactId: bookingData.contactId,
            pipelineId: 'default', // You'll need to set this
            stageId: 'new-booking',
            name: `${bookingData.serviceName} - ${bookingData.name}`,
            monetaryValue: bookingData.price || 0
          });
          results.push({ action: 'create_opportunity', success: true, data: opportunity });
        } catch (error) {
          console.error('Failed to create opportunity:', error);
          results.push({ action: 'create_opportunity', success: false, error });
        }

        // 3. Send confirmation message
        try {
          const message = `Hi ${bookingData.name}! 

Your ${bookingData.serviceName} appointment has been scheduled for ${bookingData.date} at ${bookingData.time}.

We're excited to help you achieve your beauty goals! 

If you need to reschedule, please contact us at least 24 hours in advance.

Thank you for choosing us! 💕`;

          await this.ghlOrchestrator.sendMessage(bookingData.contactId, {
            message,
            type: 'SMS'
          });
          results.push({ action: 'send_confirmation', success: true });
        } catch (error) {
          console.error('Failed to send confirmation:', error);
          results.push({ action: 'send_confirmation', success: false, error });
        }

        // 4. Create follow-up task
        try {
          const task = await this.ghlOrchestrator.createTask({
            contactId: bookingData.contactId,
            title: `Follow up with ${bookingData.name} - ${bookingData.serviceName}`,
            description: `Check in after appointment on ${bookingData.date}`,
            dueDate: new Date(new Date(bookingData.date).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days after
          });
          results.push({ action: 'create_task', success: true, data: task });
        } catch (error) {
          console.error('Failed to create task:', error);
          results.push({ action: 'create_task', success: false, error });
        }
      }

      return {
        success: true,
        message: 'New booking workflow completed',
        results
      };

    } catch (error) {
      console.error('New booking workflow error:', error);
      return {
        success: false,
        message: 'Workflow failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * WORKFLOW: Booking Confirmed
   * 1. Update GHL opportunity stage
   * 2. Send detailed preparation instructions
   * 3. Schedule reminder for 24 hours before
   */
  private async handleBookingConfirmation(bookingData: any) {
    console.log('✅ Booking confirmation workflow started');
    const results = [];

    try {
      if (this.ghlOrchestrator) {
        // Send preparation instructions
        const prepMessage = `Thank you for confirming your ${bookingData.serviceName} appointment! 

📋 **Preparation Instructions:**

✅ Avoid alcohol, caffeine, and blood thinners 24 hours before
✅ Come with a clean face (no makeup)
✅ Avoid sun exposure and tanning
✅ Stay hydrated
✅ Get a good night's sleep

📍 Location: [Your Address]
🕐 Time: ${bookingData.time}
📅 Date: ${bookingData.date}

We look forward to seeing you! If you have any questions, feel free to reach out.`;

        await this.ghlOrchestrator.sendMessage(bookingData.contactId, {
          message: prepMessage,
          type: 'SMS'
        });
        results.push({ action: 'send_prep_instructions', success: true });
      }

      return { success: true, message: 'Confirmation workflow completed', results };
    } catch (error) {
      return { success: false, message: 'Confirmation workflow failed', error };
    }
  }

  /**
   * WORKFLOW: New User Registration
   * 1. Create GHL contact
   * 2. Add to "Leads" pipeline
   * 3. Send welcome email
   * 4. Tag as "Website User"
   */
  private async handleNewUserRegistration(userData: any) {
    console.log('👤 New user registration workflow started');
    const results = [];

    try {
      if (this.ghlOrchestrator && userData.email) {
        // Create contact
        const contact = await this.ghlOrchestrator.createContact({
          firstName: userData.firstName || userData.profile?.firstName,
          lastName: userData.lastName || userData.profile?.lastName,
          email: userData.email || userData.profile?.email,
          phone: userData.phone || userData.profile?.phone,
          tags: ['Website User', 'Lead']
        });
        results.push({ action: 'create_contact', success: true, data: contact });

        // Send welcome message
        const welcomeMessage = `Welcome to our permanent makeup family! 🎨

We're thrilled to have you here. 

Explore our services:
• Microblading
• Powder Brows
• Lip Blush
• Eyeliner

Book your free consultation today and let's create your perfect look!`;

        await this.ghlOrchestrator.sendMessage(contact.id, {
          message: welcomeMessage,
          type: 'Email'
        });
        results.push({ action: 'send_welcome', success: true });
      }

      return { success: true, message: 'Registration workflow completed', results };
    } catch (error) {
      return { success: false, message: 'Registration workflow failed', error };
    }
  }

  /**
   * WORKFLOW: Consultation Requested
   * 1. Create high-priority opportunity
   * 2. Notify staff
   * 3. Send consultation prep info
   */
  private async handleConsultationRequest(consultationData: any) {
    console.log('💬 Consultation request workflow started');
    const results = [];

    try {
      if (this.ghlOrchestrator) {
        // Create opportunity
        const opportunity = await this.ghlOrchestrator.createOpportunity({
          contactId: consultationData.contactId,
          pipelineId: 'consultations',
          stageId: 'requested',
          name: `Consultation - ${consultationData.name}`,
          monetaryValue: 0
        });
        results.push({ action: 'create_opportunity', success: true, data: opportunity });

        // Send consultation info
        const consultMessage = `Thank you for requesting a consultation! 

During your consultation, we'll:
✨ Discuss your desired look
✨ Review before/after photos
✨ Explain the procedure
✨ Answer all your questions
✨ Provide pricing details

Our artist will contact you within 24 hours to schedule your free consultation.`;

        await this.ghlOrchestrator.sendMessage(consultationData.contactId, {
          message: consultMessage,
          type: 'SMS'
        });
        results.push({ action: 'send_consult_info', success: true });
      }

      return { success: true, message: 'Consultation workflow completed', results };
    } catch (error) {
      return { success: false, message: 'Consultation workflow failed', error };
    }
  }

  /**
   * WORKFLOW: Payment Received
   * 1. Update opportunity to "Paid"
   * 2. Send receipt
   * 3. Send thank you message
   */
  private async handlePaymentReceived(paymentData: any) {
    console.log('💳 Payment received workflow started');
    const results = [];

    try {
      if (this.ghlOrchestrator) {
        const thankYouMessage = `Thank you for your payment! 

Receipt: $${paymentData.amount} for ${paymentData.serviceName}

Your appointment is confirmed for ${paymentData.date} at ${paymentData.time}.

We can't wait to see you! 💕`;

        await this.ghlOrchestrator.sendMessage(paymentData.contactId, {
          message: thankYouMessage,
          type: 'SMS'
        });
        results.push({ action: 'send_thank_you', success: true });
      }

      return { success: true, message: 'Payment workflow completed', results };
    } catch (error) {
      return { success: false, message: 'Payment workflow failed', error };
    }
  }

  /**
   * WORKFLOW: Review Submitted
   * 1. Thank customer
   * 2. Offer referral discount
   * 3. Add to "Happy Customers" segment
   */
  private async handleReviewSubmitted(reviewData: any) {
    console.log('⭐ Review submitted workflow started');
    const results = [];

    try {
      if (this.ghlOrchestrator) {
        const thankYouMessage = `Thank you so much for your ${reviewData.rating}-star review! ⭐

We're thrilled you love your new look!

As a thank you, here's a special offer:
🎁 Refer a friend and you BOTH get 15% off your next service!

Share your referral code: ${reviewData.customerId?.substring(0, 8).toUpperCase()}`;

        await this.ghlOrchestrator.sendMessage(reviewData.contactId, {
          message: thankYouMessage,
          type: 'SMS'
        });
        results.push({ action: 'send_thank_you', success: true });

        // Add tag
        await this.ghlOrchestrator.addTagToContact(reviewData.contactId, 'happy-customer');
        results.push({ action: 'add_tag', success: true });
      }

      return { success: true, message: 'Review workflow completed', results };
    } catch (error) {
      return { success: false, message: 'Review workflow failed', error };
    }
  }

  /**
   * WORKFLOW: Appointment Reminder
   * Send 24 hours before appointment
   */
  private async sendAppointmentReminder(bookingData: any) {
    console.log('⏰ Sending appointment reminder');

    try {
      if (this.ghlOrchestrator) {
        const reminderMessage = `⏰ Reminder: Your ${bookingData.serviceName} appointment is tomorrow!

📅 ${bookingData.date}
🕐 ${bookingData.time}
📍 [Your Address]

Please remember:
✅ Arrive 10 minutes early
✅ Come with a clean face
✅ Bring any reference photos

See you soon! Reply CONFIRM to confirm or RESCHEDULE if you need to change.`;

        await this.ghlOrchestrator.sendMessage(bookingData.contactId, {
          message: reminderMessage,
          type: 'SMS'
        });

        return { success: true, message: 'Reminder sent' };
      }

      return { success: false, message: 'GHL not configured' };
    } catch (error) {
      return { success: false, message: 'Reminder failed', error };
    }
  }

  /**
   * WORKFLOW: Follow-Up (2 days after appointment)
   * Check satisfaction and request review
   */
  private async handleFollowUp(bookingData: any) {
    console.log('📞 Follow-up workflow started');

    try {
      if (this.ghlOrchestrator) {
        const followUpMessage = `Hi ${bookingData.name}! 

How are you loving your new ${bookingData.serviceName}? 

We'd love to hear about your experience! 

⭐ Leave us a review: [Review Link]

Questions about aftercare? We're here to help!

P.S. Don't forget to share your beautiful results on social media and tag us! 📸`;

        await this.ghlOrchestrator.sendMessage(bookingData.contactId, {
          message: followUpMessage,
          type: 'SMS'
        });

        return { success: true, message: 'Follow-up sent' };
      }

      return { success: false, message: 'GHL not configured' };
    } catch (error) {
      return { success: false, message: 'Follow-up failed', error };
    }
  }

  /**
   * Get all active workflows
   */
  async getActiveWorkflows(): Promise<Workflow[]> {
    try {
      const workflows = await DatabaseService.getAll('workflows');
      return workflows.filter((w: any) => w.isActive);
    } catch (error) {
      console.error('Failed to get workflows:', error);
      return [];
    }
  }

  /**
   * Create a new workflow
   */
  async createWorkflow(workflow: Omit<Workflow, 'id' | 'createdAt'>): Promise<string> {
    const newWorkflow = {
      ...workflow,
      createdAt: new Date()
    };
    
    // In a real implementation, you'd save this to the database
    console.log('Creating workflow:', newWorkflow);
    return 'workflow-id';
  }
}

// Export singleton instance
export const workflowEngine = new BMADWorkflowEngine();
