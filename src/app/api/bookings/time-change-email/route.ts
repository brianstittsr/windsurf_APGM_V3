import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface TimeChangeEmailRequest {
  clientName: string;
  clientEmail: string;
  serviceName: string;
  oldDate: string;
  oldTime: string;
  newDate: string;
  newTime: string;
}

// Helper to format time to 12-hour format
function formatTimeTo12Hour(time24: string): string {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes?.toString().padStart(2, '0') || '00'} ${period}`;
}

// Helper to format date
function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export async function POST(req: NextRequest) {
  try {
    const body: TimeChangeEmailRequest = await req.json();
    const { clientName, clientEmail, serviceName, oldDate, oldTime, newDate, newTime } = body;

    if (!clientEmail || !clientName) {
      return NextResponse.json(
        { error: 'Client email and name are required' },
        { status: 400 }
      );
    }

    const formattedOldDate = formatDate(oldDate);
    const formattedOldTime = formatTimeTo12Hour(oldTime);
    const formattedNewDate = formatDate(newDate);
    const formattedNewTime = formatTimeTo12Hour(newTime);

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Time Change</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #AD6269 0%, #c17a80 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Appointment Update</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your appointment time has been changed</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Dear <strong>${clientName}</strong>,
              </p>
              
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                We wanted to let you know that your appointment for <strong>${serviceName}</strong> has been rescheduled.
              </p>
              
              <!-- Old Time -->
              <div style="background-color: #fee2e2; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <p style="color: #991b1b; font-size: 14px; font-weight: 600; margin: 0 0 10px 0; text-transform: uppercase;">
                  ❌ Previous Appointment
                </p>
                <p style="color: #7f1d1d; font-size: 18px; margin: 0;">
                  <strong>${formattedOldDate}</strong><br>
                  <span style="font-size: 16px;">${formattedOldTime}</span>
                </p>
              </div>
              
              <!-- New Time -->
              <div style="background-color: #dcfce7; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <p style="color: #166534; font-size: 14px; font-weight: 600; margin: 0 0 10px 0; text-transform: uppercase;">
                  ✅ New Appointment
                </p>
                <p style="color: #14532d; font-size: 18px; margin: 0;">
                  <strong>${formattedNewDate}</strong><br>
                  <span style="font-size: 16px;">${formattedNewTime}</span>
                </p>
              </div>
              
              <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                If you have any questions or need to make further changes, please don't hesitate to contact us.
              </p>
              
              <!-- Contact Info -->
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-top: 20px;">
                <p style="color: #333; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">Contact Us:</p>
                <p style="color: #666; font-size: 14px; margin: 0; line-height: 1.8;">
                  📞 (919) 441-9932<br>
                  ✉️ victoria@aprettygirlmatter.com<br>
                  📍 4040 Barrett Drive Suite 3, Raleigh, NC 27609
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #AD6269; font-size: 18px; font-weight: 600; margin: 0 0 10px 0;">A Pretty Girl Matter</p>
              <p style="color: #999; font-size: 12px; margin: 0;">
                Permanent Makeup & Beauty Services
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'A Pretty Girl Matter <noreply@aprettygirlmatter.com>',
      to: clientEmail,
      subject: `Appointment Time Change - ${serviceName}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Error sending email:', error);
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      emailId: data?.id
    });

  } catch (error) {
    console.error('Error in time-change-email API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
