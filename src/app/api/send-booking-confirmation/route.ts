import { NextRequest, NextResponse } from 'next/server';
import { SMTPEmailService } from '@/services/gmailEmailService';

export interface BookingConfirmationData {
  clientName: string;
  clientEmail: string;
  serviceName: string;
  servicePrice: number;
  depositAmount: number;
  remainingBalance: number;
  appointmentDate: string;
  appointmentTime: string;
  artistName?: string;
  couponCode?: string;
  couponDiscount?: number;
  giftCardApplied?: number;
  businessName: string;
  businessPhone: string;
  businessEmail: string;
  businessAddress: string;
}

function generateBookingConfirmationEmail(data: BookingConfirmationData): string {
  const formattedDate = new Date(data.appointmentDate).toLocaleDateString('en-US', {
    weekday: 'long',
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
    <title>Booking Confirmation - ${data.businessName}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .email-container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header-icon {
            width: 80px;
            height: 80px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 10px 0 0;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
        }
        .appointment-card {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 12px;
            padding: 24px;
            margin: 20px 0;
        }
        .appointment-card h3 {
            margin: 0 0 16px;
            color: #166534;
            font-size: 18px;
        }
        .appointment-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #dcfce7;
        }
        .appointment-row:last-child {
            border-bottom: none;
        }
        .appointment-label {
            color: #666;
            font-weight: 500;
        }
        .appointment-value {
            color: #333;
            font-weight: 600;
            text-align: right;
        }
        .receipt-card {
            background: #fafafa;
            border: 1px solid #e5e5e5;
            border-radius: 12px;
            padding: 24px;
            margin: 20px 0;
        }
        .receipt-card h3 {
            margin: 0 0 16px;
            color: #333;
            font-size: 18px;
        }
        .receipt-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .receipt-row:last-child {
            border-bottom: none;
        }
        .receipt-row.discount {
            color: #16a34a;
        }
        .receipt-row.total {
            font-size: 18px;
            font-weight: bold;
            padding-top: 16px;
            margin-top: 8px;
            border-top: 2px solid #333;
            border-bottom: none;
        }
        .receipt-row.paid {
            color: #16a34a;
        }
        .receipt-row.balance {
            color: #AD6269;
            font-weight: 600;
        }
        .reminder-box {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
        }
        .reminder-box h4 {
            margin: 0 0 12px;
            color: #1e40af;
            font-size: 16px;
        }
        .reminder-box ul {
            margin: 0;
            padding-left: 20px;
            color: #1e40af;
        }
        .reminder-box li {
            margin: 8px 0;
        }
        .contact-card {
            background: #fdf4ff;
            border: 1px solid #f5d0fe;
            border-radius: 12px;
            padding: 24px;
            margin: 20px 0;
            text-align: center;
        }
        .contact-card h3 {
            margin: 0 0 16px;
            color: #86198f;
            font-size: 18px;
        }
        .contact-info {
            margin: 12px 0;
        }
        .contact-info a {
            color: #AD6269;
            text-decoration: none;
            font-weight: 600;
        }
        .footer {
            text-align: center;
            padding: 24px 30px;
            background: #f8f9fa;
            border-top: 1px solid #eee;
        }
        .footer p {
            margin: 8px 0;
            color: #666;
            font-size: 14px;
        }
        .logo-text {
            font-size: 20px;
            font-weight: 600;
            color: #AD6269;
            margin-bottom: 8px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="header-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                    <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <h1>Booking Confirmed!</h1>
            <p>Your appointment has been successfully scheduled</p>
        </div>
        
        <div class="content">
            <p class="greeting">Hi ${data.clientName},</p>
            <p>Thank you for booking with ${data.businessName}! We're excited to see you. Here are your appointment details:</p>
            
            <div class="appointment-card">
                <h3>📅 Appointment Details</h3>
                <div class="appointment-row">
                    <span class="appointment-label">Service</span>
                    <span class="appointment-value">${data.serviceName}</span>
                </div>
                <div class="appointment-row">
                    <span class="appointment-label">Date</span>
                    <span class="appointment-value">${formattedDate}</span>
                </div>
                <div class="appointment-row">
                    <span class="appointment-label">Time</span>
                    <span class="appointment-value">${data.appointmentTime}</span>
                </div>
                ${data.artistName ? `
                <div class="appointment-row">
                    <span class="appointment-label">Artist</span>
                    <span class="appointment-value">${data.artistName}</span>
                </div>
                ` : ''}
            </div>
            
            <div class="receipt-card">
                <h3>🧾 Payment Receipt</h3>
                <div class="receipt-row">
                    <span>Service Price</span>
                    <span>$${data.servicePrice.toFixed(2)}</span>
                </div>
                ${data.couponCode && data.couponDiscount ? `
                <div class="receipt-row discount">
                    <span>Coupon (${data.couponCode})</span>
                    <span>-$${data.couponDiscount.toFixed(2)}</span>
                </div>
                ` : ''}
                ${data.giftCardApplied ? `
                <div class="receipt-row discount">
                    <span>Gift Card Applied</span>
                    <span>-$${data.giftCardApplied.toFixed(2)}</span>
                </div>
                ` : ''}
                <div class="receipt-row total">
                    <span>Total</span>
                    <span>$${(data.servicePrice - (data.couponDiscount || 0) - (data.giftCardApplied || 0)).toFixed(2)}</span>
                </div>
                <div class="receipt-row paid">
                    <span>Deposit Paid</span>
                    <span>$${data.depositAmount.toFixed(2)}</span>
                </div>
                ${data.remainingBalance > 0 ? `
                <div class="receipt-row balance">
                    <span>Remaining Balance (due at appointment)</span>
                    <span>$${data.remainingBalance.toFixed(2)}</span>
                </div>
                ` : ''}
            </div>
            
            <div class="reminder-box">
                <h4>📋 Important Reminders</h4>
                <ul>
                    <li>Please arrive 15 minutes early for your appointment</li>
                    <li>Avoid caffeine and alcohol 24 hours before your procedure</li>
                    <li>Do not take blood thinners or aspirin before your appointment</li>
                    <li>Bring a valid photo ID to your appointment</li>
                </ul>
            </div>
            
            <div class="contact-card">
                <h3>Questions? We're Here to Help!</h3>
                <div class="contact-info">
                    📞 <a href="tel:${data.businessPhone}">${data.businessPhone}</a>
                </div>
                <div class="contact-info">
                    ✉️ <a href="mailto:${data.businessEmail}">${data.businessEmail}</a>
                </div>
                <p style="margin-top: 16px; color: #666; font-size: 14px;">
                    ${data.businessAddress}
                </p>
            </div>
        </div>
        
        <div class="footer">
            <div class="logo-text">${data.businessName}</div>
            <p>Professional Permanent Makeup Services</p>
            <p style="font-size: 12px; color: #999;">
                This is an automated confirmation email. Please do not reply directly to this email.
            </p>
        </div>
    </div>
</body>
</html>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const data: BookingConfirmationData = await request.json();
    
    // Validate required fields
    if (!data.clientEmail || !data.clientName || !data.serviceName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: clientEmail, clientName, serviceName' },
        { status: 400 }
      );
    }

    // Generate the email HTML
    const htmlContent = generateBookingConfirmationEmail(data);

    // Create email template
    const emailTemplate = {
      subject: `Booking Confirmation - ${data.serviceName} at ${data.businessName}`,
      htmlContent: htmlContent,
      textContent: `
Booking Confirmation - ${data.businessName}

Hi ${data.clientName},

Your appointment has been confirmed!

Service: ${data.serviceName}
Date: ${data.appointmentDate}
Time: ${data.appointmentTime}
${data.artistName ? `Artist: ${data.artistName}` : ''}

Payment Receipt:
Service Price: $${data.servicePrice.toFixed(2)}
${data.couponDiscount ? `Coupon Discount: -$${data.couponDiscount.toFixed(2)}` : ''}
${data.giftCardApplied ? `Gift Card Applied: -$${data.giftCardApplied.toFixed(2)}` : ''}
Deposit Paid: $${data.depositAmount.toFixed(2)}
${data.remainingBalance > 0 ? `Remaining Balance: $${data.remainingBalance.toFixed(2)}` : ''}

Important Reminders:
- Please arrive 15 minutes early
- Avoid caffeine and alcohol 24 hours before
- Do not take blood thinners or aspirin
- Bring a valid photo ID

Questions? Contact us:
Phone: ${data.businessPhone}
Email: ${data.businessEmail}

${data.businessName}
${data.businessAddress}
      `
    };

    // Send the email
    const emailSent = await SMTPEmailService.sendEmail(data.clientEmail, emailTemplate);

    if (emailSent) {
      return NextResponse.json({ 
        success: true, 
        message: 'Booking confirmation email sent successfully' 
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to send email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
