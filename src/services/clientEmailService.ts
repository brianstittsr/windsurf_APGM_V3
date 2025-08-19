/**
 * Client Email Service
 * Sends login information and health form confirmation emails to clients
 */

import { SMTPEmailService, InvoiceEmailTemplate } from './gmailEmailService';

export interface ClientProfile {
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
  marketingSource: string;
}

export interface HealthFormData {
  [key: number]: string;
}

export interface LoginEmailData {
  clientName: string;
  clientEmail: string;
  temporaryPassword?: string;
  loginUrl: string;
  businessName: string;
  businessPhone: string;
  businessEmail: string;
}

export interface HealthFormEmailData {
  clientName: string;
  clientEmail: string;
  healthFormData: HealthFormData;
  clientSignature: string;
  submissionDate: string;
  businessName: string;
  businessPhone: string;
  businessEmail: string;
}

export class ClientEmailService {
  /**
   * Generate login information email template
   */
  static generateLoginEmailTemplate(data: LoginEmailData): InvoiceEmailTemplate {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Account Login Information</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .email-container {
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #AD6269 0%, #c8956d 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.2em;
            font-weight: 300;
            letter-spacing: 1px;
        }
        .content {
            padding: 30px;
        }
        .welcome-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #AD6269;
        }
        .login-info {
            background: #e3f2fd;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .login-button {
            display: inline-block;
            background: #AD6269;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
        }
        .features-list {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .features-list ul {
            margin: 0;
            padding-left: 20px;
        }
        .features-list li {
            margin: 8px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Welcome to ${data.businessName}</h1>
            <p>Your Client Portal Access</p>
        </div>
        
        <div class="content">
            <div class="welcome-box">
                <h3>Hello ${data.clientName}!</h3>
                <p>Thank you for choosing ${data.businessName} for your permanent makeup journey. We've created your personal client portal account to help you manage your appointments and stay connected with us.</p>
            </div>

            <div class="login-info">
                <h4><i class="fas fa-key"></i> Your Login Information</h4>
                <p><strong>Email:</strong> ${data.clientEmail}</p>
                ${data.temporaryPassword ? `<p><strong>Temporary Password:</strong> ${data.temporaryPassword}</p>` : ''}
                <p><em>Please change your password after your first login for security.</em></p>
                
                <a href="${data.loginUrl}" class="login-button">
                    <i class="fas fa-sign-in-alt"></i> Login to Your Portal
                </a>
            </div>

            <div class="features-list">
                <h4><i class="fas fa-star"></i> What You Can Do in Your Portal:</h4>
                <ul>
                    <li><strong>View Payment History:</strong> See all your payments and invoices</li>
                    <li><strong>Make Online Payments:</strong> Pay remaining balances securely</li>
                    <li><strong>Upcoming Appointments:</strong> View and manage your scheduled appointments</li>
                    <li><strong>Procedure Notes:</strong> Access your treatment records and aftercare instructions</li>

                    <li><strong>Contact Information:</strong> Update your details anytime</li>
                    <li><strong>Appointment History:</strong> Review all your past visits</li>
                </ul>
            </div>

            <div class="welcome-box">
                <h4><i class="fas fa-phone"></i> Need Help?</h4>
                <p>If you have any questions about accessing your account or using the portal, please don't hesitate to contact us:</p>
                <p><strong>Phone:</strong> ${data.businessPhone}<br>
                <strong>Email:</strong> ${data.businessEmail}</p>
            </div>
        </div>

        <div class="footer">
            <p>Thank you for choosing ${data.businessName}!</p>
            <p><small>This email was sent to ${data.clientEmail}</small></p>
        </div>
    </div>
</body>
</html>`;

    const textContent = `
Welcome to ${data.businessName}!

Hello ${data.clientName},

Thank you for choosing ${data.businessName} for your permanent makeup journey. We've created your personal client portal account to help you manage your appointments and stay connected with us.

YOUR LOGIN INFORMATION:
Email: ${data.clientEmail}
${data.temporaryPassword ? `Temporary Password: ${data.temporaryPassword}` : ''}
${data.temporaryPassword ? 'Please change your password after your first login for security.' : ''}

Login URL: ${data.loginUrl}

WHAT YOU CAN DO IN YOUR PORTAL:
• View Payment History - See all your payments and invoices
• Make Online Payments - Pay remaining balances securely
• Upcoming Appointments - View and manage your scheduled appointments
• Procedure Notes - Access your treatment records and aftercare instructions

• Contact Information - Update your details anytime
• Appointment History - Review all your past visits

NEED HELP?
If you have any questions about accessing your account or using the portal, please contact us:
Phone: ${data.businessPhone}
Email: ${data.businessEmail}

Thank you for choosing ${data.businessName}!
`;

    return {
      subject: `Welcome to ${data.businessName} - Your Client Portal Access`,
      htmlContent,
      textContent,
      attachments: []
    };
  }

  /**
   * Generate health form confirmation email template
   */
  static generateHealthFormEmailTemplate(data: HealthFormEmailData): InvoiceEmailTemplate {
    const healthQuestions = [
      "Are you currently pregnant or breastfeeding?",
      "Do you have any allergies to topical anesthetics, pigments, or latex?",
      "Are you currently taking any blood-thinning medications (aspirin, warfarin, etc.)?",
      "Do you have a history of keloid scarring or poor wound healing?",
      "Have you had any cosmetic procedures in the treatment area within the last 6 months?",
      "Do you have any active skin conditions (eczema, psoriasis, dermatitis) in the treatment area?",
      "Are you currently using Retin-A, Accutane, or other retinoid products?",
      "Do you have diabetes or any autoimmune disorders?",
      "Have you had Botox or fillers in the treatment area within the last 4 weeks?",
      "Do you have a history of cold sores or fever blisters?",
      "Are you currently taking any medications that affect blood clotting?",
      "Do you have any metal allergies or sensitivities?",
      "Have you consumed alcohol within the last 24 hours?",
      "Are you over 18 years of age?",

      "Do you understand that results may vary and touch-ups may be needed?"
    ];

    const formatResponse = (value: string) => {
      return value === 'yes' ? '✅ Yes' : value === 'no' ? '❌ No' : value;
    };

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Health & Consent Form Confirmation</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .email-container {
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #AD6269 0%, #c8956d 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.2em;
            font-weight: 300;
            letter-spacing: 1px;
        }
        .content {
            padding: 30px;
        }
        .confirmation-box {
            background: #e8f5e8;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #28a745;
        }
        .form-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .question-item {
            padding: 10px 0;
            border-bottom: 1px solid #dee2e6;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .question-item:last-child {
            border-bottom: none;
        }
        .question-text {
            flex: 1;
            margin-right: 20px;
        }
        .answer {
            font-weight: bold;
            min-width: 60px;
            text-align: right;
        }
        .signature-section {
            background: #e3f2fd;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Health & Consent Form</h1>
            <p>Confirmation Copy</p>
        </div>
        
        <div class="content">
            <div class="confirmation-box">
                <h3><i class="fas fa-check-circle"></i> Form Successfully Submitted</h3>
                <p><strong>Client:</strong> ${data.clientName}</p>
                <p><strong>Submission Date:</strong> ${data.submissionDate}</p>
                <p>Thank you for completing your Health & Consent Form. This is your confirmation copy for your records.</p>
            </div>

            <div class="form-section">
                <h4><i class="fas fa-clipboard-list"></i> Your Responses</h4>
                ${healthQuestions.map((question, index) => `
                <div class="question-item">
                    <div class="question-text">${index + 1}. ${question}</div>
                    <div class="answer">${formatResponse(data.healthFormData[index] || 'Not answered')}</div>
                </div>
                `).join('')}
            </div>

            <div class="signature-section">
                <h4><i class="fas fa-signature"></i> Electronic Signature</h4>
                <p><strong>Signature:</strong> ${data.clientSignature}</p>
                <p><strong>Date & Time:</strong> ${data.submissionDate}</p>
                <p><em>By providing your electronic signature, you acknowledge that you have read, understood, and agree to all the information provided in this form.</em></p>
            </div>

            <div class="confirmation-box">
                <h4><i class="fas fa-info-circle"></i> Important Information</h4>
                <p>Please keep this confirmation for your records. If you need to make any changes to your responses, please contact us immediately:</p>
                <p><strong>Phone:</strong> ${data.businessPhone}<br>
                <strong>Email:</strong> ${data.businessEmail}</p>
            </div>
        </div>

        <div class="footer">
            <p>Thank you for choosing ${data.businessName}!</p>
            <p><small>This confirmation was sent to ${data.clientEmail}</small></p>
        </div>
    </div>
</body>
</html>`;

    const textContent = `
HEALTH & CONSENT FORM CONFIRMATION

Client: ${data.clientName}
Submission Date: ${data.submissionDate}

Thank you for completing your Health & Consent Form. This is your confirmation copy for your records.

YOUR RESPONSES:
${healthQuestions.map((question, index) => `
${index + 1}. ${question}
   Answer: ${formatResponse(data.healthFormData[index] || 'Not answered')}
`).join('')}

ELECTRONIC SIGNATURE:
Signature: ${data.clientSignature}
Date & Time: ${data.submissionDate}

By providing your electronic signature, you acknowledge that you have read, understood, and agree to all the information provided in this form.

IMPORTANT INFORMATION:
Please keep this confirmation for your records. If you need to make any changes to your responses, please contact us immediately:

Phone: ${data.businessPhone}
Email: ${data.businessEmail}

Thank you for choosing ${data.businessName}!
`;

    return {
      subject: `Health & Consent Form Confirmation - ${data.clientName}`,
      htmlContent,
      textContent,
      attachments: []
    };
  }

  /**
   * Send login information email
   */
  static async sendLoginEmail(data: LoginEmailData): Promise<boolean> {
    try {
      console.log('📧 Sending login information email...');
      console.log(`   To: ${data.clientEmail}`);
      console.log(`   Client: ${data.clientName}`);

      const template = this.generateLoginEmailTemplate(data);
      return await this.sendEmail(data.clientEmail, template, data.businessEmail);
    } catch (error) {
      console.error('❌ Failed to send login email:', error);
      return false;
    }
  }

  /**
   * Send health form confirmation email
   */
  static async sendHealthFormEmail(data: HealthFormEmailData): Promise<boolean> {
    try {
      console.log('📧 Sending health form confirmation email...');
      console.log(`   To: ${data.clientEmail}`);
      console.log(`   Client: ${data.clientName}`);

      const template = this.generateHealthFormEmailTemplate(data);
      return await this.sendEmail(data.clientEmail, template, data.businessEmail);
    } catch (error) {
      console.error('❌ Failed to send health form email:', error);
      return false;
    }
  }

  /**
   * Send email using available service
   */
  private static async sendEmail(to: string, template: InvoiceEmailTemplate, fromEmail: string): Promise<boolean> {
    try {
      // Try SMTP first if configured
      const smtpHost = process.env.SMTP_HOST;
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      
      if (smtpHost && smtpUser && smtpPass) {
        console.log('📧 Using SMTP service...');
        const ccEmails = ['victoria@aprettygirlmatter.com'];
        return await SMTPEmailService.sendEmailWithAttachments(to, template, smtpUser, ccEmails);
      }
      
      // Try external email service
      const apiKey = process.env.NEXT_PUBLIC_EMAIL_API_KEY;
      const apiUrl = process.env.NEXT_PUBLIC_EMAIL_API_URL;
      
      if (apiKey && apiUrl) {
        console.log('📧 Using external email service...');
        console.log('⚠️ External email service not implemented yet');
        console.log('📧 Email content (HTML):', template.htmlContent.substring(0, 200) + '...');
        console.log('📧 Email content (Text):', template.textContent.substring(0, 200) + '...');
        return false;
      }
      
      // Development mode - just log the email content
      console.log('⚠️ No email service configured - logging content:');
      console.log('📧 Subject:', template.subject);
      console.log('📧 HTML Content:', template.htmlContent.substring(0, 500) + '...');
      console.log('📧 Text Content:', template.textContent.substring(0, 500) + '...');
      
      return true; // Return true in development mode
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }
}
