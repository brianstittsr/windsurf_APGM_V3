/**
 * SMTP Email Service for sending invoices
 * Uses Nodemailer with configurable SMTP settings
 */

import nodemailer from 'nodemailer';

// Define interface locally to avoid circular imports
export interface InvoiceEmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
  attachments?: any[];
}

export class SMTPEmailService {
  private static transporter: nodemailer.Transporter | null = null;

  /**
   * Initialize SMTP transporter
   */
  private static async getTransporter() {
    if (this.transporter) {
      return this.transporter;
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      throw new Error('SMTP credentials not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in .env.local');
    }

    console.log(`📧 Configuring SMTP: ${smtpUser}@${smtpHost}:${smtpPort}`);

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: parseInt(smtpPort) === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      // Additional options for better compatibility
      tls: {
        rejectUnauthorized: false // Accept self-signed certificates
      }
    });

    return this.transporter;
  }

  /**
   * Send email via SMTP
   */
  static async sendEmail(
    to: string,
    template: InvoiceEmailTemplate,
    fromEmail: string = process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'victoria@aprettygirlmatter.com',
    cc?: string[],
    bcc?: string[]
  ): Promise<boolean> {
    try {
      console.log('📧 Sending email via SMTP...');
      console.log(`   From: ${fromEmail}`);
      console.log(`   To: ${to}`);
      console.log(`   Subject: ${template.subject}`);

      const transporter = await this.getTransporter();
      if (!transporter) {
        throw new Error('Failed to initialize SMTP transporter');
      }

      const mailOptions = {
        from: `"A Pretty Girl Matter" <${fromEmail}>`,
        to: to,
        cc: cc && cc.length > 0 ? cc.join(', ') : undefined,
        bcc: bcc && bcc.length > 0 ? bcc.join(', ') : undefined,
        subject: template.subject,
        text: template.textContent,
        html: template.htmlContent,
      };

      if (cc && cc.length > 0) {
        console.log(`   CC: ${cc.join(', ')}`);
      }
      if (bcc && bcc.length > 0) {
        console.log(`   BCC: ${bcc.join(', ')}`);
      }

      const result = await transporter.sendMail(mailOptions);
      
      console.log('✅ Email sent successfully!');
      console.log(`   Message ID: ${result.messageId}`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to send email via SMTP:', error);
      
      if (error instanceof Error) {
        console.log(`   Error details: ${error.message}`);
        
        if (error.message.includes('Invalid login') || error.message.includes('authentication')) {
          console.log('💡 Tip: Check your SMTP credentials (SMTP_USER and SMTP_PASS)');
        }
        if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
          console.log('💡 Tip: Check your SMTP host and port (SMTP_HOST and SMTP_PORT)');
        }
        if (error.message.includes('550') && error.message.includes('Message Rejected')) {
          console.log('💡 Tip: Email rejected by server. Possible causes:');
          console.log('   - From email address not authorized to send');
          console.log('   - Content flagged as spam');
          console.log('   - Domain authentication issues (SPF/DKIM)');
          console.log('   - Try using the same email as SMTP_USER for the from address');
        }
        if (error.message.includes('535')) {
          console.log('💡 Tip: Authentication failed. Check username/password');
        }
        if (error.message.includes('554')) {
          console.log('💡 Tip: Transaction failed. Check email format and content');
        }
      }
      
      return false;
    }
  }

  /**
   * Send email with attachments via SMTP
   */
  static async sendEmailWithAttachments(
    to: string,
    template: InvoiceEmailTemplate,
    fromEmail: string = process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'victoria@aprettygirlmatter.com',
    cc?: string[]
  ): Promise<boolean> {
    try {
      console.log('📧 Sending email with attachments via SMTP...');
      console.log(`   From: ${fromEmail}`);
      console.log(`   To: ${to}`);
      console.log(`   Subject: ${template.subject}`);
      console.log(`   Attachments: ${template.attachments?.length || 0}`);

      const transporter = await this.getTransporter();
      if (!transporter) {
        throw new Error('Failed to initialize SMTP transporter');
      }

      const mailOptions = {
        from: `"A Pretty Girl Matter" <${fromEmail}>`,
        to: to,
        cc: cc && cc.length > 0 ? cc.join(', ') : undefined,
        subject: template.subject,
        text: template.textContent,
        html: template.htmlContent,
        attachments: template.attachments || []
      };

      if (cc && cc.length > 0) {
        console.log(`   CC: ${cc.join(', ')}`);
      }

      const result = await transporter.sendMail(mailOptions);
      
      console.log('✅ Email with attachments sent successfully!');
      console.log(`   Message ID: ${result.messageId}`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to send email with attachments via SMTP:', error);
      
      if (error instanceof Error) {
        console.log(`   Error details: ${error.message}`);
        
        if (error.message.includes('Invalid login') || error.message.includes('authentication')) {
          console.log('💡 Tip: Check your SMTP credentials (SMTP_USER and SMTP_PASS)');
        }
        if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
          console.log('💡 Tip: Check your SMTP host and port (SMTP_HOST and SMTP_PORT)');
        }
        if (error.message.includes('550') && error.message.includes('Message Rejected')) {
          console.log('💡 Tip: Email rejected by server. Possible causes:');
          console.log('   - From email address not authorized to send');
          console.log('   - Content flagged as spam');
          console.log('   - Domain authentication issues (SPF/DKIM)');
          console.log('   - Try using the same email as SMTP_USER for the from address');
        }
        if (error.message.includes('535')) {
          console.log('💡 Tip: Authentication failed. Check username/password');
        }
        if (error.message.includes('554')) {
          console.log('💡 Tip: Transaction failed. Check email format and content');
        }
      }
      
      return false;
    }
  }

  /**
   * Test SMTP configuration
   */
  static async testConfiguration(): Promise<boolean> {
    try {
      const transporter = await this.getTransporter();
      if (!transporter) {
        throw new Error('Failed to initialize SMTP transporter');
      }
      await transporter.verify();
      console.log('✅ SMTP configuration is valid');
      return true;
    } catch (error) {
      console.error('❌ SMTP configuration test failed:', error);
      return false;
    }
  }
}
