/**
 * Gmail/Email Service using Resend API
 * Replaces SMTP with Resend for better reliability and deliverability
 */

import { ResendEmailService, EmailTemplate } from './resendEmailService';

// Re-export the template interface for backward compatibility
export interface InvoiceEmailTemplate extends EmailTemplate {}

// Alias for backward compatibility
export { ResendEmailService as SMTPEmailService };
export { ResendEmailService };

// For direct imports - delegates to ResendEmailService
export class GmailEmailService {
  /**
   * Send email via Resend
   */
  static async sendEmail(
    to: string,
    template: InvoiceEmailTemplate,
    fromEmail?: string,
    cc?: string[],
    bcc?: string[]
  ): Promise<boolean> {
    const result = await ResendEmailService.sendEmail(to, template, fromEmail, cc, bcc);
    return result.success;
  }

  /**
   * Send email with attachments via Resend
   */
  static async sendEmailWithAttachments(
    to: string,
    template: InvoiceEmailTemplate,
    fromEmail?: string,
    cc?: string[]
  ): Promise<boolean> {
    return await ResendEmailService.sendEmailWithAttachments(to, template, fromEmail, cc);
  }

  /**
   * Test Resend configuration
   */
  static async testConfiguration(): Promise<boolean> {
    const result = await ResendEmailService.verifyConfiguration();
    return result.valid;
  }
}
