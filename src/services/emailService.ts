// Email service for sending appointment notifications
export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface AppointmentEmailData {
  clientName: string;
  clientEmail: string;
  serviceName: string;
  originalDate?: string;
  originalTime?: string;
  newDate: string;
  newTime: string;
  status: string;
  adminName: string;
  businessName: string;
  businessPhone: string;
  businessEmail: string;
  cancellationReason?: string;
  rescheduleReason?: string;
}

export class EmailService {
  private static apiKey = process.env.NEXT_PUBLIC_EMAIL_API_KEY || '';
  private static apiUrl = process.env.NEXT_PUBLIC_EMAIL_API_URL || '';

  // Email templates for different appointment changes
  static getEmailTemplate(type: 'confirmation' | 'reschedule' | 'cancellation' | 'status_update', data: AppointmentEmailData): EmailTemplate {
    const { clientName, serviceName, newDate, newTime, businessName, businessPhone, businessEmail, adminName } = data;

    switch (type) {
      case 'confirmation':
        return {
          subject: `Appointment Confirmed - ${serviceName}`,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #e11d48;">Appointment Confirmed</h2>
              <p>Dear ${clientName},</p>
              <p>Your appointment has been confirmed by our admin team.</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Appointment Details</h3>
                <p><strong>Service:</strong> ${serviceName}</p>
                <p><strong>Date:</strong> ${newDate}</p>
                <p><strong>Time:</strong> ${newTime}</p>
                <p><strong>Status:</strong> Confirmed</p>
              </div>

              <p><strong>Important Reminders:</strong></p>
              <ul>
                <li>Please arrive 15 minutes early</li>
                <li>Bring a valid ID</li>
                <li>Follow pre-appointment care instructions</li>
              </ul>

              <p>If you need to make any changes, please contact us at least 48 hours in advance.</p>
              
              <p>Best regards,<br/>
              ${adminName}<br/>
              ${businessName}<br/>
              ${businessPhone}<br/>
              ${businessEmail}</p>
            </div>
          `,
          textContent: `
Appointment Confirmed

Dear ${clientName},

Your appointment has been confirmed by our admin team.

Appointment Details:
- Service: ${serviceName}
- Date: ${newDate}
- Time: ${newTime}
- Status: Confirmed

Important Reminders:
- Please arrive 15 minutes early
- Bring a valid ID
- Follow pre-appointment care instructions

If you need to make any changes, please contact us at least 48 hours in advance.

Best regards,
${adminName}
${businessName}
${businessPhone}
${businessEmail}
          `
        };

      case 'reschedule':
        return {
          subject: `Appointment Rescheduled - ${serviceName}`,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f59e0b;">Appointment Rescheduled</h2>
              <p>Dear ${clientName},</p>
              <p>Your appointment has been rescheduled by our admin team.</p>
              
              ${data.originalDate ? `
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #92400e;">Previous Appointment</h4>
                <p><strong>Date:</strong> ${data.originalDate}</p>
                <p><strong>Time:</strong> ${data.originalTime}</p>
              </div>
              ` : ''}

              <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #065f46;">New Appointment Details</h3>
                <p><strong>Service:</strong> ${serviceName}</p>
                <p><strong>Date:</strong> ${newDate}</p>
                <p><strong>Time:</strong> ${newTime}</p>
                <p><strong>Status:</strong> Confirmed</p>
              </div>

              ${data.rescheduleReason ? `
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin-top: 0;">Reason for Reschedule</h4>
                <p>${data.rescheduleReason}</p>
              </div>
              ` : ''}

              <p>We apologize for any inconvenience. Please confirm your availability for the new time slot.</p>
              
              <p>Best regards,<br/>
              ${adminName}<br/>
              ${businessName}<br/>
              ${businessPhone}<br/>
              ${businessEmail}</p>
            </div>
          `,
          textContent: `
Appointment Rescheduled

Dear ${clientName},

Your appointment has been rescheduled by our admin team.

${data.originalDate ? `Previous Appointment:
- Date: ${data.originalDate}
- Time: ${data.originalTime}

` : ''}New Appointment Details:
- Service: ${serviceName}
- Date: ${newDate}
- Time: ${newTime}
- Status: Confirmed

${data.rescheduleReason ? `Reason for Reschedule: ${data.rescheduleReason}

` : ''}We apologize for any inconvenience. Please confirm your availability for the new time slot.

Best regards,
${adminName}
${businessName}
${businessPhone}
${businessEmail}
          `
        };

      case 'cancellation':
        return {
          subject: `Appointment Cancelled - ${serviceName}`,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Appointment Cancelled</h2>
              <p>Dear ${clientName},</p>
              <p>We regret to inform you that your appointment has been cancelled.</p>
              
              <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #991b1b;">Cancelled Appointment</h3>
                <p><strong>Service:</strong> ${serviceName}</p>
                <p><strong>Date:</strong> ${newDate}</p>
                <p><strong>Time:</strong> ${newTime}</p>
              </div>

              ${data.cancellationReason ? `
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin-top: 0;">Reason for Cancellation</h4>
                <p>${data.cancellationReason}</p>
              </div>
              ` : ''}

              <p>If you would like to reschedule, please contact us and we'll be happy to find a new time that works for you.</p>
              
              <p>We apologize for any inconvenience caused.</p>
              
              <p>Best regards,<br/>
              ${adminName}<br/>
              ${businessName}<br/>
              ${businessPhone}<br/>
              ${businessEmail}</p>
            </div>
          `,
          textContent: `
Appointment Cancelled

Dear ${clientName},

We regret to inform you that your appointment has been cancelled.

Cancelled Appointment:
- Service: ${serviceName}
- Date: ${newDate}
- Time: ${newTime}

${data.cancellationReason ? `Reason for Cancellation: ${data.cancellationReason}

` : ''}If you would like to reschedule, please contact us and we'll be happy to find a new time that works for you.

We apologize for any inconvenience caused.

Best regards,
${adminName}
${businessName}
${businessPhone}
${businessEmail}
          `
        };

      case 'status_update':
        return {
          subject: `Appointment Update - ${serviceName}`,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #3b82f6;">Appointment Update</h2>
              <p>Dear ${clientName},</p>
              <p>There has been an update to your appointment status.</p>
              
              <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1e40af;">Appointment Details</h3>
                <p><strong>Service:</strong> ${serviceName}</p>
                <p><strong>Date:</strong> ${newDate}</p>
                <p><strong>Time:</strong> ${newTime}</p>
                <p><strong>Status:</strong> ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}</p>
              </div>

              <p>If you have any questions about this update, please don't hesitate to contact us.</p>
              
              <p>Best regards,<br/>
              ${adminName}<br/>
              ${businessName}<br/>
              ${businessPhone}<br/>
              ${businessEmail}</p>
            </div>
          `,
          textContent: `
Appointment Update

Dear ${clientName},

There has been an update to your appointment status.

Appointment Details:
- Service: ${serviceName}
- Date: ${newDate}
- Time: ${newTime}
- Status: ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}

If you have any questions about this update, please don't hesitate to contact us.

Best regards,
${adminName}
${businessName}
${businessPhone}
${businessEmail}
          `
        };

      default:
        throw new Error(`Unknown email template type: ${type}`);
    }
  }

  // Send email using external service (placeholder for actual implementation)
  static async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    try {
      // In a real implementation, you would integrate with services like:
      // - SendGrid
      // - Mailgun
      // - AWS SES
      // - Nodemailer with SMTP
      
      console.log('📧 Email would be sent to:', to);
      console.log('📧 Subject:', template.subject);
      console.log('📧 Content:', template.textContent);

      // Simulate API call
      if (this.apiKey && this.apiUrl) {
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            to,
            subject: template.subject,
            html: template.htmlContent,
            text: template.textContent
          })
        });

        return response.ok;
      }

      // For development, just log and return true
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  // Send appointment notification
  static async sendAppointmentNotification(
    type: 'confirmation' | 'reschedule' | 'cancellation' | 'status_update',
    data: AppointmentEmailData
  ): Promise<boolean> {
    try {
      const template = this.getEmailTemplate(type, data);
      const success = await this.sendEmail(data.clientEmail, template);
      
      if (success) {
        console.log(`✅ ${type} email sent successfully to ${data.clientEmail}`);
      } else {
        console.error(`❌ Failed to send ${type} email to ${data.clientEmail}`);
      }
      
      return success;
    } catch (error) {
      console.error('Error sending appointment notification:', error);
      return false;
    }
  }
}
