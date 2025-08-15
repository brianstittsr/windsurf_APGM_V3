/**
 * Aftercare Email Service
 * Sends pre-post care instructions to clients
 */

import { SMTPEmailService, InvoiceEmailTemplate } from './gmailEmailService';

export interface AftercareEmailData {
  clientName: string;
  clientEmail: string;
  serviceType: string;
  appointmentDate: string;
  businessName: string;
  businessPhone: string;
  businessEmail: string;
}

export class AftercareEmailService {
  /**
   * Generate aftercare instructions email template
   */
  static generateAftercareEmailTemplate(data: AftercareEmailData): InvoiceEmailTemplate {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Pre & Post Care Instructions</title>
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
        .care-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #AD6269;
        }
        .care-section h3 {
            color: #AD6269;
            margin-top: 0;
        }
        .care-list {
            margin: 0;
            padding-left: 20px;
        }
        .care-list li {
            margin: 8px 0;
        }
        .warning-box {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .emergency-box {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            padding: 15px;
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
            <h1>Pre & Post Care Instructions</h1>
            <p>Your Guide to Beautiful Results</p>
        </div>
        
        <div class="content">
            <div class="care-section">
                <h3>Hello ${data.clientName}!</h3>
                <p>Thank you for choosing ${data.businessName} for your ${data.serviceType} procedure. Following these care instructions is essential for optimal healing and beautiful results.</p>
                <p><strong>Appointment Date:</strong> ${data.appointmentDate}</p>
            </div>

            <div class="care-section">
                <h3>🔹 Pre-Care Instructions (Before Your Appointment)</h3>
                <ul class="care-list">
                    <li><strong>24-48 hours before:</strong> Avoid alcohol, caffeine, and blood-thinning medications (aspirin, ibuprofen)</li>
                    <li><strong>No waxing or tinting:</strong> Avoid eyebrow waxing, threading, or tinting for 1 week prior</li>
                    <li><strong>No retinoids:</strong> Stop using Retin-A, retinol, or glycolic acid products 1 week before</li>
                    <li><strong>No sun exposure:</strong> Avoid tanning or excessive sun exposure for 2 weeks prior</li>
                    <li><strong>Stay hydrated:</strong> Drink plenty of water and get adequate sleep</li>
                    <li><strong>Eat before arrival:</strong> Have a good meal before your appointment</li>
                    <li><strong>Arrive with clean skin:</strong> No makeup on the treatment area</li>
                </ul>
            </div>

            <div class="care-section">
                <h3>🔹 Post-Care Instructions (After Your Appointment)</h3>
                
                <h4>First 24-48 Hours:</h4>
                <ul class="care-list">
                    <li><strong>Keep area dry:</strong> No water, cleansers, or makeup on treated area</li>
                    <li><strong>Gentle cleaning:</strong> Use provided aftercare wipes or dry cotton pad only</li>
                    <li><strong>Apply ointment:</strong> Use provided healing balm as directed (thin layer)</li>
                    <li><strong>Sleep elevated:</strong> Sleep with head slightly elevated to reduce swelling</li>
                </ul>

                <h4>Days 3-10 (Healing Phase):</h4>
                <ul class="care-list">
                    <li><strong>Gentle washing:</strong> Clean with mild, fragrance-free cleanser</li>
                    <li><strong>Pat dry:</strong> Never rub or scrub the area</li>
                    <li><strong>Continue ointment:</strong> Apply healing balm 2-3 times daily</li>
                    <li><strong>No picking:</strong> Let scabs fall off naturally</li>
                    <li><strong>Avoid makeup:</strong> No cosmetics on treated area until fully healed</li>
                </ul>

                <h4>Days 10+ (Maintenance):</h4>
                <ul class="care-list">
                    <li><strong>Sun protection:</strong> Use SPF 30+ sunscreen daily</li>
                    <li><strong>Gentle products:</strong> Use mild skincare products around the area</li>
                    <li><strong>Avoid harsh treatments:</strong> No chemical peels, microdermabrasion, or laser treatments</li>
                </ul>
            </div>

            <div class="warning-box">
                <h4>⚠️ Important: What to AVOID</h4>
                <ul class="care-list">
                    <li>Swimming, saunas, hot tubs, or excessive sweating for 2 weeks</li>
                    <li>Direct sun exposure or tanning for 4 weeks</li>
                    <li>Picking, scratching, or rubbing the treated area</li>
                    <li>Using makeup or skincare products with active ingredients</li>
                    <li>Sleeping face-down on the treated area</li>
                </ul>
            </div>

            <div class="emergency-box">
                <h4>🚨 When to Contact Us Immediately</h4>
                <ul class="care-list">
                    <li>Signs of infection (excessive redness, swelling, pus, fever)</li>
                    <li>Severe allergic reaction (difficulty breathing, widespread rash)</li>
                    <li>Unusual pain or discomfort that worsens after 48 hours</li>
                    <li>Any concerns about the healing process</li>
                </ul>
                <p><strong>24/7 Aftercare Line:</strong> ${data.businessPhone}</p>
            </div>

            <div class="care-section">
                <h3>📅 Follow-Up Care</h3>
                <p>Your touch-up appointment is typically scheduled 6-8 weeks after your initial procedure. This allows for complete healing and color settling.</p>
                <p>Remember: Initial results may appear darker than expected. The color will soften and lighten during the healing process.</p>
            </div>

            <div class="care-section">
                <h4>🤔 Questions?</h4>
                <p>If you have any questions or concerns during your healing process, please don't hesitate to contact us:</p>
                <p><strong>Phone:</strong> ${data.businessPhone}<br>
                <strong>Email:</strong> ${data.businessEmail}</p>
                <p>We're here to support you throughout your healing journey!</p>
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
PRE & POST CARE INSTRUCTIONS

Hello ${data.clientName}!

Thank you for choosing ${data.businessName} for your ${data.serviceType} procedure.
Appointment Date: ${data.appointmentDate}

PRE-CARE INSTRUCTIONS (Before Your Appointment):
• 24-48 hours before: Avoid alcohol, caffeine, and blood-thinning medications
• No waxing or tinting: Avoid eyebrow treatments for 1 week prior
• No retinoids: Stop using Retin-A, retinol, or glycolic acid products 1 week before
• No sun exposure: Avoid tanning for 2 weeks prior
• Stay hydrated and get adequate sleep
• Eat before arrival and arrive with clean skin (no makeup)

POST-CARE INSTRUCTIONS (After Your Appointment):

First 24-48 Hours:
• Keep area dry - no water, cleansers, or makeup
• Use provided aftercare wipes or dry cotton pad only
• Apply provided healing balm as directed (thin layer)
• Sleep with head slightly elevated

Days 3-10 (Healing Phase):
• Clean with mild, fragrance-free cleanser
• Pat dry - never rub or scrub
• Continue healing balm 2-3 times daily
• No picking - let scabs fall off naturally
• Avoid makeup until fully healed

Days 10+ (Maintenance):
• Use SPF 30+ sunscreen daily
• Use mild skincare products
• Avoid harsh treatments (chemical peels, microdermabrasion, laser)

IMPORTANT - WHAT TO AVOID:
• Swimming, saunas, hot tubs, excessive sweating (2 weeks)
• Direct sun exposure or tanning (4 weeks)
• Picking, scratching, or rubbing the area
• Makeup or active skincare ingredients
• Sleeping face-down on treated area

WHEN TO CONTACT US IMMEDIATELY:
• Signs of infection (redness, swelling, pus, fever)
• Severe allergic reaction
• Unusual pain that worsens after 48 hours
• Any healing concerns

24/7 Aftercare Line: ${data.businessPhone}

FOLLOW-UP CARE:
Your touch-up appointment is typically scheduled 6-8 weeks after initial procedure.
Remember: Initial results may appear darker - color will soften during healing.

Questions? Contact us:
Phone: ${data.businessPhone}
Email: ${data.businessEmail}

Thank you for choosing ${data.businessName}!
`;

    return {
      subject: `Your Pre & Post Care Instructions - ${data.serviceType}`,
      htmlContent,
      textContent,
      attachments: []
    };
  }

  /**
   * Send aftercare instructions email
   */
  static async sendAftercareEmail(data: AftercareEmailData): Promise<boolean> {
    try {
      console.log('📧 Sending aftercare instructions email...');
      console.log(`   To: ${data.clientEmail}`);
      console.log(`   Client: ${data.clientName}`);
      console.log(`   Service: ${data.serviceType}`);

      const template = this.generateAftercareEmailTemplate(data);
      return await this.sendEmail(data.clientEmail, template, data.businessEmail);
    } catch (error) {
      console.error('❌ Failed to send aftercare email:', error);
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
