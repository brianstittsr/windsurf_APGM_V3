import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      giftCard,
      purchaserName,
      purchaserEmail,
      recipientName,
      recipientEmail,
      message
    } = body;

    // Create transporter
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    const amount = (giftCard.originalAmount / 100).toFixed(2);
    const expirationDate = giftCard.expirationDate.toDate().toLocaleDateString();

    // Email to recipient (or purchaser if no recipient)
    const recipientEmailAddress = recipientEmail || purchaserEmail;
    const recipientEmailName = recipientName || purchaserName;

    const giftCardEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
        <div style="background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #AD6269, #8B4B52); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🎁 Gift Card</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">A Pretty Girl Matter</p>
          </div>

          <!-- Gift Card Display -->
          <div style="padding: 40px; text-align: center; background: linear-gradient(45deg, #f8f9fa, #e9ecef);">
            <h2 style="color: #AD6269; margin: 0 0 20px 0;">You've Received a Gift Card!</h2>
            
            ${recipientName && recipientName !== purchaserName ? 
              `<p style="font-size: 16px; color: #666; margin-bottom: 20px;">From: <strong>${purchaserName}</strong></p>` : 
              ''}
            
            ${message ? 
              `<div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #AD6269;">
                <p style="font-style: italic; color: #555; margin: 0;">"${message}"</p>
              </div>` : 
              ''}

            <!-- Gift Card Code -->
            <div style="background: white; border: 3px dashed #AD6269; border-radius: 10px; padding: 30px; margin: 20px 0;">
              <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;">Gift Card Code</p>
              <div style="font-size: 32px; font-weight: bold; color: #AD6269; font-family: monospace; letter-spacing: 2px;">
                ${giftCard.code}
              </div>
              <p style="font-size: 18px; color: #333; margin: 15px 0 0 0;">Value: <strong>$${amount}</strong></p>
            </div>

            <p style="color: #666; font-size: 14px; margin: 20px 0;">
              Valid until: ${expirationDate}
            </p>
          </div>

          <!-- How to Use -->
          <div style="padding: 30px; background: #f8f9fa;">
            <h3 style="color: #AD6269; margin: 0 0 15px 0;">How to Use Your Gift Card</h3>
            <ol style="color: #666; line-height: 1.6;">
              <li>Visit our website and select your desired service</li>
              <li>Proceed to checkout</li>
              <li>Enter your gift card code: <strong>${giftCard.code}</strong></li>
              <li>Your gift card balance will be applied to your purchase</li>
            </ol>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/book-now-custom" 
                 style="background: #AD6269; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Book Your Appointment
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #333; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">
              A Pretty Girl Matter<br>
              <a href="mailto:victoria@aprettygirlmatter.com" style="color: #AD6269;">victoria@aprettygirlmatter.com</a>
            </p>
          </div>
        </div>
      </div>
    `;

    // Send gift card email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipientEmailAddress,
      subject: `🎁 You've Received a Gift Card from A Pretty Girl Matter!`,
      html: giftCardEmailHtml,
    });

    // Send confirmation email to purchaser (if different from recipient)
    if (recipientEmail && recipientEmail !== purchaserEmail) {
      const confirmationEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #AD6269;">Gift Card Purchase Confirmation</h2>
          <p>Thank you for your gift card purchase!</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Purchase Details:</h3>
            <p><strong>Amount:</strong> $${amount}</p>
            <p><strong>Gift Card Code:</strong> ${giftCard.code}</p>
            <p><strong>Recipient:</strong> ${recipientName} (${recipientEmail})</p>
            <p><strong>Expiration Date:</strong> ${expirationDate}</p>
          </div>
          
          <p>The gift card has been sent to ${recipientName} at ${recipientEmail}.</p>
          <p>Thank you for choosing A Pretty Girl Matter!</p>
        </div>
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: purchaserEmail,
        subject: 'Gift Card Purchase Confirmation - A Pretty Girl Matter',
        html: confirmationEmailHtml,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending gift card email:', error);
    return NextResponse.json(
      { error: 'Failed to send gift card email' },
      { status: 500 }
    );
  }
}
