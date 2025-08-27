/**
 * Invoice Email Service
 * Sends professional invoices for semi-permanent makeup services
 */

import { SMTPEmailService, InvoiceEmailTemplate } from './gmailEmailService';
import { InvoiceData } from '../types/invoice';
import * as path from 'path';
import * as fs from 'fs';
export type { InvoiceEmailTemplate };

export class InvoiceEmailService {
  /**
   * Generate HTML email template with embedded logo
   */
  static generateHTMLTemplate(data: InvoiceData): string {
    const formatCurrency = (amount: number) => 
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${data.invoiceNumber}</title>
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
        .invoice-container {
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
        .logo {
            max-width: 200px;
            height: auto;
            margin-bottom: 15px;
            filter: brightness(0) invert(1);
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
            letter-spacing: 2px;
        }
        .header-info {
            background: #f8f9fa;
            padding: 20px;
            border-bottom: 1px solid #dee2e6;
        }
        .invoice-title {
            font-size: 24px;
            color: #333;
            margin: 20px 0 10px 0;
        }
        .invoice-number {
            font-size: 18px;
            color: #666;
            margin: 0;
        }
        .section {
            margin: 30px 0;
            padding: 0 30px;
        }
        .two-column {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
        }
        .column {
            flex: 1;
            min-width: 250px;
            margin-right: 20px;
        }
        .column:last-child {
            margin-right: 0;
        }
        .info-box {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
        }
        .service-details {
            background: #fff;
            border: 2px solid #AD6269;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .line-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .line-item:last-child {
            border-bottom: none;
        }
        .line-item.total {
            font-weight: bold;
            font-size: 18px;
            border-top: 2px solid #AD6269;
            margin-top: 10px;
            padding-top: 15px;
        }
        .deposit-highlight {
            background: #e8f5e8;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #28a745;
        }
        .remaining-highlight {
            background: #fff3cd;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #ffc107;
        }
        .payment-info {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            border-top: 1px solid #eee;
            color: #666;
            background: #f8f9fa;
        }
        .thank-you {
            color: #AD6269;
            font-size: 20px;
            font-weight: bold;
            text-align: center;
            margin: 30px 0;
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Header with Logo -->
        <div class="header">
            <img src="cid:logo" alt="${data.businessName}" class="logo" />
            <h1>${data.businessName}</h1>
            <p style="margin: 10px 0 0 0; font-size: 1.1em; opacity: 0.9;">Professional Permanent Makeup Services</p>
        </div>

        <!-- Invoice Info -->
        <div class="header-info">
            <div style="text-align: center;">
                ${data.businessAddress ? `<p style="margin: 5px 0; color: #666;">${data.businessAddress}</p>` : ''}
                <p style="margin: 5px 0; color: #666;">${data.businessPhone} • ${data.businessEmail}</p>
                <h2 class="invoice-title">INVOICE</h2>
                <p class="invoice-number">Invoice #${data.invoiceNumber}</p>
                <p style="margin: 5px 0; color: #666;">Date: ${currentDate}</p>
            </div>
        </div>

        <!-- Client and Service Info -->
        <div class="section">
            <div class="two-column">
                <div class="column">
                    <div class="info-box">
                        <h3 style="margin-top: 0; color: #AD6269;">Bill To:</h3>
                        <p style="margin: 5px 0;"><strong>${data.clientName}</strong></p>
                        <p style="margin: 5px 0; color: #666;">${data.clientEmail}</p>
                    </div>
                </div>
                <div class="column">
                    <div class="info-box">
                        <h3 style="margin-top: 0; color: #AD6269;">Appointment:</h3>
                        <p style="margin: 5px 0;"><strong>${data.appointmentDate}</strong></p>
                        <p style="margin: 5px 0; color: #666;">${data.appointmentTime}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Service Details -->
        <div class="section">
            <div class="service-details">
                <h3 style="margin-top: 0; color: #AD6269;">Service Details</h3>
                <div class="line-item">
                    <span>${data.serviceName}</span>
                    <span>${formatCurrency(data.servicePrice)}</span>
                </div>
                <div class="line-item">
                    <span>Sales Tax (7.75%)</span>
                    <span>${formatCurrency(data.tax)}</span>
                </div>
                <div class="line-item">
                    <span>Processing Fee (Stripe)</span>
                    <span>${formatCurrency(data.processingFee)}</span>
                </div>
                <div class="line-item total">
                    <span>Total</span>
                    <span>${formatCurrency(data.total)}</span>
                </div>
            </div>
        </div>

        <!-- Payment Status -->
        <div class="section">
            <div class="two-column">
                <div class="column">
                    <div class="deposit-highlight">
                        <h4 style="margin-top: 0; color: #28a745;">✅ Deposit Paid</h4>
                        <p style="margin: 5px 0; font-size: 18px; font-weight: bold;">${formatCurrency(data.depositPaid)}</p>
                        <p style="margin: 5px 0; font-size: 12px; color: #666;">Includes processing fee</p>
                    </div>
                </div>
                <div class="column">
                    <div class="remaining-highlight">
                        <h4 style="margin-top: 0; color: #856404;">💰 Remaining Balance</h4>
                        <p style="margin: 5px 0; font-size: 18px; font-weight: bold;">${formatCurrency(data.remainingBalance)}</p>
                        <p style="margin: 5px 0; font-size: 12px; color: #666;">Due at appointment</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Payment Information -->
        <div class="section">
            <div class="payment-info">
                <h4 style="margin-top: 0; color: #0c5460;">Payment Information</h4>
                <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${data.paymentIntentId}</p>
                <p style="margin: 5px 0;"><strong>Payment Method:</strong> Credit/Debit Card</p>
                <p style="margin: 5px 0;"><strong>Status:</strong> Deposit Confirmed ✅</p>
            </div>
        </div>

        <!-- Important Notes -->
        <div class="section">
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
                <h4 style="margin-top: 0; color: #856404;">Important Reminders</h4>
                <ul style="margin: 10px 0; padding-left: 20px; color: #856404;">
                    <li>Please arrive 15 minutes early for your appointment</li>
                    <li>Remaining balance of ${formatCurrency(data.remainingBalance)} is due at your appointment</li>
                    <li>We accept cash, credit, or debit for the remaining balance</li>
                    <li>Cancellations must be made 48 hours in advance</li>
                    <li>Please avoid caffeine and alcohol 24 hours before your appointment</li>
                </ul>
            </div>
        </div>

        <!-- Thank You -->
        <div class="thank-you">
            Thank you for choosing ${data.businessName}!
        </div>

        <!-- Footer -->
        <div class="footer">
            <p style="margin: 10px 0;">Questions about your appointment or invoice?</p>
            <p style="margin: 10px 0;"><strong>Contact us:</strong> ${data.businessPhone} | ${data.businessEmail}</p>
            <p style="margin: 10px 0; font-size: 12px; color: #999;">This is an automated invoice. Please save for your records.</p>
        </div>
    </div>
</body>
</html>
`;
  }

  /**
   * Generate text email template
   */
  static generateTextTemplate(data: InvoiceData): string {
    const formatCurrency = (amount: number) => 
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
INVOICE #${data.invoiceNumber}
${data.businessName}
${data.businessPhone} • ${data.businessEmail}

Date: ${currentDate}

BILL TO:
${data.clientName}
${data.clientEmail}

APPOINTMENT:
${data.appointmentDate} at ${data.appointmentTime}

SERVICE DETAILS:
${data.serviceName}: ${formatCurrency(data.servicePrice)}
Sales Tax (7.75%): ${formatCurrency(data.tax)}
Processing Fee (Stripe): ${formatCurrency(data.processingFee)}
Total: ${formatCurrency(data.total)}

PAYMENT STATUS:
✅ Deposit Paid: ${formatCurrency(data.depositPaid)} (includes processing fee)
💰 Remaining Balance: ${formatCurrency(data.remainingBalance)} (due at appointment)

PAYMENT INFORMATION:
Transaction ID: ${data.paymentIntentId}
Payment Method: Credit/Debit Card
Status: Deposit Confirmed ✅

IMPORTANT REMINDERS:
• Please arrive 15 minutes early for your appointment
• Remaining balance of ${formatCurrency(data.remainingBalance)} is due at your appointment
• We accept cash, credit, or debit for the remaining balance
• Cancellations must be made 48 hours in advance
• Please avoid caffeine and alcohol 24 hours before your appointment

Thank you for choosing ${data.businessName}!

Questions? Contact us: ${data.businessPhone} | ${data.businessEmail}
`;
  }

  /**
   * Generate complete invoice template with logo attachment
   */
  static generateInvoiceTemplate(data: InvoiceData): InvoiceEmailTemplate {
    const logoPath = path.join(process.cwd(), 'public', 'APRG_Text_Logo.png');
    const attachments = [];

    // Add logo as attachment if it exists
    if (fs.existsSync(logoPath)) {
      attachments.push({
        filename: 'logo.png',
        path: logoPath,
        cid: 'logo' // Referenced in HTML as cid:logo
      });
    }

    return {
      subject: `Invoice ${data.invoiceNumber} - ${data.serviceName} Deposit`,
      htmlContent: this.generateHTMLTemplate(data),
      textContent: this.generateTextTemplate(data),
      attachments: attachments
    };
  }

  /**
   * Send invoice email
   */
  static async sendInvoiceEmail(data: InvoiceData): Promise<boolean> {
    try {
      console.log('📧 Sending invoice email...');
      console.log(`   To: ${data.clientEmail}`);
      console.log(`   Invoice: ${data.invoiceNumber}`);
      console.log(`   Service: ${data.serviceName}`);
      console.log(`   Total: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.total)}`);

      const template = this.generateInvoiceTemplate(data);

      // Try SMTP first if configured
      const smtpHost = process.env.SMTP_HOST;
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      
      if (smtpHost && smtpUser && smtpPass) {
        console.log('📧 Using SMTP service...');
        // Use SMTP_USER as from email to avoid authentication issues
        const fromEmail = smtpUser || data.businessEmail;
        // Add CC to Victoria
        const ccEmails = ['victoria@aprettygirlmatter.com'];
        return await SMTPEmailService.sendEmailWithAttachments(data.clientEmail, template, fromEmail, ccEmails);
      }
      
      // Try external email service (SendGrid, etc.)
      const apiKey = process.env.NEXT_PUBLIC_EMAIL_API_KEY;
      const apiUrl = process.env.NEXT_PUBLIC_EMAIL_API_URL;
      
      if (apiKey && apiUrl) {
        console.log('📧 Using external email service...');
        // External email service implementation would go here
        // For now, just log the content
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
      console.log('📧 Attachments:', template.attachments?.length || 0);
      
      return true; // Return true in development mode
    } catch (error) {
      console.error('❌ Failed to send invoice email:', error);
      return false;
    }
  }

  /**
   * Generate invoice number
   */
  static generateInvoiceNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 9000) + 1000;
    
    return `INV-${year}${month}${day}-${random}`;
  }
}
