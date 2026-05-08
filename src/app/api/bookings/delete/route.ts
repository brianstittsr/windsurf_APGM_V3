import { NextRequest, NextResponse } from 'next/server';
import { SMTPEmailService } from '@/services/gmailEmailService';

const ADMIN_EMAIL = 'victoria@aprettygirlmatter.com';

async function getFirebaseDb() {
  try {
    const { db } = await import('@/lib/firebase-admin');
    return db;
  } catch (error) {
    console.warn('Firebase Admin not available:', error);
    return null;
  }
}

async function getGHLCredentials() {
  const envApiKey = process.env.GHL_API_KEY || '';
  const envLocationId = process.env.GHL_LOCATION_ID || '';

  if (envApiKey && envLocationId) {
    return { apiKey: envApiKey, locationId: envLocationId };
  }

  try {
    const db = await getFirebaseDb();
    if (db) {
      const settingsSnapshot = await db.collection('crmSettings').limit(1).get();
      if (!settingsSnapshot.empty) {
        const data = settingsSnapshot.docs[0].data();
        return {
          apiKey: envApiKey || data?.apiKey || '',
          locationId: envLocationId || data?.locationId || ''
        };
      }
    }
  } catch (error) {
    console.error('Error fetching GHL credentials:', error);
  }

  return { apiKey: envApiKey, locationId: envLocationId };
}

async function deleteGHLAppointment(apiKey: string, appointmentId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://services.leadconnectorhq.com/calendars/events/appointments/${appointmentId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Version': '2021-07-28',
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GHL appointment deletion failed:', response.status, errorText);
      return false;
    }

    console.log('✅ GHL appointment deleted:', appointmentId);
    return true;
  } catch (error) {
    console.error('Error deleting GHL appointment:', error);
    return false;
  }
}

function generateCancellationEmailHtml(data: {
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  artistName?: string;
}): string {
  const formattedDate = data.date && data.date !== 'N/A'
    ? new Date(data.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : data.date;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Cancelled - A Pretty Girl Matter</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
    <div style="background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%); color: white; padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Appointment Cancelled</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">Your appointment has been cancelled</p>
        </div>
        
        <div style="padding: 30px;">
            <p>Hi ${data.clientName},</p>
            <p>We're writing to confirm that your appointment has been cancelled. Here are the details of the cancelled appointment:</p>
            
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 24px; margin: 20px 0;">
                <h3 style="margin: 0 0 16px; color: #991B1B; font-size: 18px;">Cancelled Appointment Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #fecaca;">
                        <td style="padding: 12px 0; color: #666; font-weight: 500;">Service</td>
                        <td style="padding: 12px 0; color: #333; font-weight: 600; text-align: right;">${data.serviceName}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #fecaca;">
                        <td style="padding: 12px 0; color: #666; font-weight: 500;">Date</td>
                        <td style="padding: 12px 0; color: #333; font-weight: 600; text-align: right;">${formattedDate}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #fecaca;">
                        <td style="padding: 12px 0; color: #666; font-weight: 500;">Time</td>
                        <td style="padding: 12px 0; color: #333; font-weight: 600; text-align: right;">${data.time}</td>
                    </tr>
                    ${data.artistName ? `
                    <tr>
                        <td style="padding: 12px 0; color: #666; font-weight: 500;">Artist</td>
                        <td style="padding: 12px 0; color: #333; font-weight: 600; text-align: right;">${data.artistName}</td>
                    </tr>
                    ` : ''}
                </table>
            </div>
            
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
                <h4 style="margin: 0 0 12px; color: #166534;">Want to Reschedule?</h4>
                <p style="margin: 0 0 12px;">We'd love to see you! Book a new appointment at your convenience.</p>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aprettygirlmatter.com'}/book-now" style="display: inline-block; background: linear-gradient(135deg, #AD6269 0%, #8B4A52 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Book Again</a>
            </div>
            
            <p><strong>Questions?</strong> Feel free to reach out to us:</p>
            <p>Phone: 919-441-0932</p>
            <p>Email: victoria@aprettygirlmatter.com</p>
        </div>
        
        <div style="text-align: center; padding: 24px 30px; background: #f8f9fa; border-top: 1px solid #eee;">
            <p style="margin: 8px 0; color: #AD6269; font-weight: 600;">A Pretty Girl Matter</p>
            <p style="margin: 8px 0; color: #666; font-size: 14px;">Professional Permanent Makeup Services</p>
            <p style="margin: 8px 0; color: #666; font-size: 14px;">4040 Barrett Drive Suite 3, Raleigh, NC 27609</p>
        </div>
    </div>
</body>
</html>`;
}

function generateAdminFailureEmailHtml(data: {
  bookingId: string;
  clientName: string;
  clientEmail?: string;
  serviceName?: string;
  date?: string;
  time?: string;
  failures: { step: string; error?: string }[];
}): string {
  const failureRows = data.failures
    .map(f => `<tr><td style="padding: 8px; border: 1px solid #fecaca;">${f.step}</td><td style="padding: 8px; border: 1px solid #fecaca; color: #DC2626;">${f.error || 'Unknown error'}</td></tr>`)
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="font-family: 'Segoe UI', sans-serif; padding: 20px; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: #DC2626; color: white; padding: 24px; text-align: center;">
            <h2 style="margin: 0;">⚠️ Booking Deletion - Partial Failure</h2>
        </div>
        <div style="padding: 24px;">
            <p>The following booking deletion encountered issues that require attention:</p>
            
            <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 16px 0;">
                <p><strong>Booking ID:</strong> ${data.bookingId}</p>
                <p><strong>Client:</strong> ${data.clientName} (${data.clientEmail || 'No email'})</p>
                <p><strong>Service:</strong> ${data.serviceName || 'N/A'}</p>
                <p><strong>Date/Time:</strong> ${data.date || 'N/A'} at ${data.time || 'N/A'}</p>
            </div>

            <h3 style="color: #DC2626;">Failed Steps:</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 12px 0;">
                <thead>
                    <tr style="background: #fef2f2;">
                        <th style="padding: 8px; border: 1px solid #fecaca; text-align: left;">Step</th>
                        <th style="padding: 8px; border: 1px solid #fecaca; text-align: left;">Error</th>
                    </tr>
                </thead>
                <tbody>
                    ${failureRows}
                </tbody>
            </table>

            <p style="margin-top: 20px; color: #666;">Please check the GHL calendar and contact the client manually if needed.</p>
        </div>
    </div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const { bookingId, clientName, clientEmail, serviceName, date, time, artistName, ghlAppointmentId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ success: false, error: 'bookingId is required' }, { status: 400 });
    }

    const results: { step: string; success: boolean; error?: string }[] = [];

    // 1. Send cancellation email to client with CC to Victoria
    if (clientEmail) {
      try {
        const emailHtml = generateCancellationEmailHtml({
          clientName: clientName || 'Client',
          serviceName: serviceName || 'Appointment',
          date: date || 'N/A',
          time: time || 'N/A',
          artistName: artistName
        });

        const emailText = `Appointment Cancelled - A Pretty Girl Matter\n\nHi ${clientName || 'Client'},\n\nYour appointment has been cancelled.\n\nService: ${serviceName || 'Appointment'}\nDate: ${date || 'N/A'}\nTime: ${time || 'N/A'}\n${artistName ? `Artist: ${artistName}\n` : ''}\nWant to reschedule? Visit: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aprettygirlmatter.com'}/book-now\n\nA Pretty Girl Matter\n919-441-0932`;

        await SMTPEmailService.sendEmail(
          clientEmail,
          {
            subject: `Appointment Cancelled - ${serviceName || 'Your Appointment'} at A Pretty Girl Matter`,
            htmlContent: emailHtml,
            textContent: emailText
          },
          undefined,
          [ADMIN_EMAIL], // CC Victoria
          undefined
        );

        results.push({ step: 'cancellation_email', success: true });
        console.log('✅ Cancellation email sent to', clientEmail, 'CC:', ADMIN_EMAIL);
      } catch (emailError) {
        const errMsg = emailError instanceof Error ? emailError.message : 'Unknown error';
        console.error('Failed to send cancellation email:', errMsg);
        results.push({ step: 'cancellation_email', success: false, error: errMsg });
      }
    } else {
      results.push({ step: 'cancellation_email', success: false, error: 'No client email provided' });
    }

    // 2. Delete from GHL calendar
    if (ghlAppointmentId) {
      const credentials = await getGHLCredentials();
      if (credentials.apiKey) {
        const ghlDeleted = await deleteGHLAppointment(credentials.apiKey, ghlAppointmentId);
        results.push({ step: 'ghl_delete', success: ghlDeleted, error: ghlDeleted ? undefined : 'Failed to delete from GHL calendar' });
      } else {
        results.push({ step: 'ghl_delete', success: false, error: 'GHL credentials not configured' });
      }
    } else {
      results.push({ step: 'ghl_delete', success: true, error: 'No GHL appointment to delete' });
    }

    // 3. Delete from Firestore
    const db = await getFirebaseDb();
    if (db) {
      try {
        await db.collection('bookings').doc(bookingId).delete();
        results.push({ step: 'firestore_delete', success: true });
        console.log('✅ Booking deleted from Firestore:', bookingId);
      } catch (firestoreError) {
        // Try appointments collection
        try {
          await db.collection('appointments').doc(bookingId).delete();
          results.push({ step: 'firestore_delete', success: true });
        } catch (e) {
          const errMsg = e instanceof Error ? e.message : 'Unknown error';
          console.error('Failed to delete from Firestore:', errMsg);
          results.push({ step: 'firestore_delete', success: false, error: errMsg });
        }
      }
    } else {
      results.push({ step: 'firestore_delete', success: false, error: 'Firebase not available' });
    }

    // 4. If any step failed, send admin notification email
    const failures = results.filter(r => !r.success);
    if (failures.length > 0) {
      try {
        const adminEmailHtml = generateAdminFailureEmailHtml({
          bookingId,
          clientName: clientName || 'Unknown',
          clientEmail,
          serviceName,
          date,
          time,
          failures
        });

        await SMTPEmailService.sendEmail(
          ADMIN_EMAIL,
          {
            subject: `⚠️ Booking Deletion Issue - ${clientName || bookingId}`,
            htmlContent: adminEmailHtml,
            textContent: `Booking deletion for ${clientName} (ID: ${bookingId}) had failures:\n${failures.map(f => `- ${f.step}: ${f.error}`).join('\n')}`
          }
        );
        console.log('📧 Admin failure notification sent to', ADMIN_EMAIL);
      } catch (adminEmailError) {
        console.error('Failed to send admin notification:', adminEmailError);
      }
    }

    const allSuccess = results.every(r => r.success);

    return NextResponse.json({
      success: allSuccess,
      message: allSuccess
        ? 'Booking deleted successfully, GHL synced, and cancellation email sent'
        : 'Booking deleted with some issues - admin notified',
      results
    });

  } catch (error) {
    console.error('Error in booking deletion process:', error);
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
