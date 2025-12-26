import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailRequest {
  documentId: string;
  clientEmail: string;
  clientName: string;
  templateName: string;
  pdfUrl?: string;
  signatureData?: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: SendEmailRequest = await request.json();
    
    if (!data.clientEmail || !data.clientName || !data.templateName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Build email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Signed Document - A Pretty Girl Matter</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #AD6269 0%, #c4848a 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                A Pretty Girl Matter
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">
                Permanent Makeup Studio
              </p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0; font-size: 22px;">
                Hello ${data.clientName}! 👋
              </h2>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for completing your <strong>${data.templateName}</strong>. 
                A copy of your signed document is attached to this email for your records.
              </p>
              
              <div style="background-color: #f8f9fa; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #AD6269; margin: 0 0 15px 0; font-size: 18px;">
                  📋 Document Details
                </h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Document:</td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${data.templateName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Signed By:</td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${data.clientName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Date:</td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                  </tr>
                </table>
              </div>
              
              ${data.pdfUrl ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.pdfUrl}" 
                   style="display: inline-block; background-color: #AD6269; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  📄 View Document
                </a>
              </div>
              ` : ''}
              
              <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 25px 0 0 0;">
                If you have any questions about your appointment or the document, please don't hesitate to contact us.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #AD6269; font-weight: 600; margin: 0 0 10px 0; font-size: 16px;">
                A Pretty Girl Matter
              </p>
              <p style="color: #999; font-size: 13px; margin: 0 0 5px 0;">
                📍 Raleigh, NC
              </p>
              <p style="color: #999; font-size: 13px; margin: 0 0 5px 0;">
                📞 (919) 123-4567
              </p>
              <p style="color: #999; font-size: 13px; margin: 0;">
                ✉️ victoria@aprettygirlmatter.com
              </p>
              
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #bbb; font-size: 11px; margin: 0;">
                  This email contains confidential information. Please keep it for your records.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email via Resend
    const { data: emailResult, error } = await resend.emails.send({
      from: 'A Pretty Girl Matter <noreply@aprettygirlmatter.com>',
      to: data.clientEmail,
      subject: `Your Signed ${data.templateName} - A Pretty Girl Matter`,
      html: emailHtml,
      // If we have a PDF URL, we could potentially attach it
      // For now, we include a link in the email
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      emailId: emailResult?.id,
      message: 'Email sent successfully'
    });

  } catch (error) {
    console.error('Error sending document email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
