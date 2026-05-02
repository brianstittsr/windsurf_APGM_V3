/**
 * Resend Email Service
 * Uses Resend API for sending emails instead of SMTP
 * More reliable, better deliverability, and easier to configure
 */

import { Resend } from 'resend';

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content?: string | Buffer;
  contentType?: string;
  // Nodemailer-style attachments (for backward compatibility)
  path?: string;
  cid?: string;
}

export class ResendEmailService {
  private static resend: Resend | null = null;
  private static fromEmail: string = process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'victoria@aprettygirlmatter.com';

  /**
   * Initialize Resend client
   */
  private static getClient(): Resend {
    if (!this.resend) {
      const apiKey = process.env.RESEND_API_KEY;
      
      if (!apiKey) {
        throw new Error('RESEND_API_KEY not configured. Add RESEND_API_KEY to your .env.local file.');
      }

      this.resend = new Resend(apiKey);
    }

    return this.resend;
  }

  /**
   * Send email via Resend API
   */
  static async sendEmail(
    to: string | string[],
    template: EmailTemplate,
    fromEmail?: string,
    cc?: string[],
    bcc?: string[],
    replyTo?: string
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const resend = this.getClient();
      const from = fromEmail || this.fromEmail;

      console.log('📧 Sending email via Resend...');
      console.log(`   From: ${from}`);
      console.log(`   To: ${Array.isArray(to) ? to.join(', ') : to}`);
      console.log(`   Subject: ${template.subject}`);
      if (cc) console.log(`   CC: ${cc.join(', ')}`);
      if (bcc) console.log(`   BCC: ${bcc.join(', ')}`);

      // Filter and convert attachments for Resend API
      const validAttachments = template.attachments
        ?.filter(att => {
          // Skip nodemailer-style attachments with path (they need file system access)
          if (att.path) {
            console.warn(`⚠️ Skipping attachment ${att.filename} - path-based attachments not supported by Resend. Convert to buffer first.`);
            return false;
          }
          return att.content !== undefined;
        })
        .map(att => ({
          filename: att.filename,
          content: att.content instanceof Buffer ? att.content.toString('base64') : att.content,
        }));

      const result = await resend.emails.send({
        from: `"A Pretty Girl Matter" <${from}>`,
        to,
        subject: template.subject,
        html: template.htmlContent,
        text: template.textContent,
        cc,
        bcc,
        replyTo,
        attachments: validAttachments,
      });

      if (result.error) {
        console.error('❌ Resend API error:', result.error);
        return { success: false, error: result.error.message };
      }

      console.log('✅ Email sent successfully!');
      console.log(`   Email ID: ${result.data?.id}`);

      return { success: true, id: result.data?.id };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Failed to send email via Resend:', errorMessage);
      
      if (errorMessage.includes('API key')) {
        console.log('💡 Tip: Check your RESEND_API_KEY environment variable');
      }
      if (errorMessage.includes('from')) {
        console.log('💡 Tip: Verify your sender email is verified in Resend dashboard');
      }
      
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send email with attachments
   */
  static async sendEmailWithAttachments(
    to: string,
    template: EmailTemplate,
    fromEmail?: string,
    cc?: string[]
  ): Promise<boolean> {
    const result = await this.sendEmail(to, template, fromEmail, cc);
    return result.success;
  }

  /**
   * Send batch emails
   */
  static async sendBatch(
    recipients: { to: string; template: EmailTemplate }[],
    fromEmail?: string
  ): Promise<{ success: boolean; sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const recipient of recipients) {
      const result = await this.sendEmail(recipient.to, recipient.template, fromEmail);
      if (result.success) {
        sent++;
      } else {
        failed++;
      }
    }

    return { success: failed === 0, sent, failed };
  }

  /**
   * Verify Resend configuration
   */
  static async verifyConfiguration(): Promise<{ valid: boolean; error?: string }> {
    try {
      const apiKey = process.env.RESEND_API_KEY;
      
      if (!apiKey) {
        return { valid: false, error: 'RESEND_API_KEY not configured' };
      }

      // Try to initialize the client
      this.getClient();
      
      return { valid: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { valid: false, error: errorMessage };
    }
  }
}
