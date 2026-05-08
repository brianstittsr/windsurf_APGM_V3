import { NextRequest, NextResponse } from 'next/server';
import { SMTPEmailService } from '@/services/gmailEmailService';

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
  const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
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
    <title>Appointment Cancelled - A Pretty Girl Matter</title>
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
            background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
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
        .appointment-card {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 12px;
            padding: 24px;
            margin: 20px 0;
        }
        .appointment-card h3 {
            margin: 0 0 16px;
            color: #991B1B;
            font-size: 18px;
        }
        .appointment-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #fecaca;
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
        .rebook-box {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .rebook-box h4 {
            margin: 0 0 12px;
            color: #166534;
        }
        .rebook-box a {
            display: inline-block;
            background: linear-gradient(135deg, #AD6269 0%, #8B4A52 100%);
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin-top: 12px;
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
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Appointment Cancelled</h1>
            <p>Your appointment has been cancelled</p>
        </div>
        
        <div class="content">
            <p>Hi ${data.clientName},</p>
            <p>We're writing to confirm that your appointment has been cancelled. Here are the details of the cancelled appointment:</p>
            
            <div class="appointment-card">
                <h3>Cancelled Appointment Details</h3>
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
                    <span class="appointment-value">${data.time}</span>
                </div>
                ${data.artistName ? `
                <div class="appointment-row">
                    <span class="appointment-label">Artist</span>
                    <span class="appointment-value">${data.artistName}</span>
                </div>
                ` : ''}
            </div>
            
            <div class="rebook-box">
                <h4>Want to Reschedule?</h4>
                <p>We'd love to see you! Book a new appointment at your convenience.</p>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aprettygirlmatter.com'}/book-now">Book Again</a>
            </div>
            
            <p><strong>Questions?</strong> Feel free to reach out to us:</p>
            <p>Phone: 919-441-0932</p>
            <p>Email: victoria@aprettygirlmatter.com</p>
        </div>
        
        <div class="footer">
            <p style="font-weight: 600; color: #AD6269;">A Pretty Girl Matter</p>
            <p>Professional Permanent Makeup Services</p>
            <p>4040 Barrett Drive Suite 3, Raleigh, NC 27609</p>
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

    // 1. Update Firestore booking status to cancelled
    const db = await getFirebaseDb();
    if (db) {
      try {
        await db.collection('bookings').doc(bookingId).update({
          status: 'cancelled',
          cancelledAt: new Date(),
          updatedAt: new Date()
        });
        results.push({ step: 'firestore_update', success: true });
      } catch (firestoreError) {
        // Try appointments collection
        try {
          await db.collection('appointments').doc(bookingId).update({
            status: 'cancelled',
            cancelledAt: new Date(),
            updatedAt: new Date()
          });
          results.push({ step: 'firestore_update', success: true });
        } catch (e) {
          const errMsg = e instanceof Error ? e.message : 'Unknown error';
          console.error('Failed to update Firestore:', errMsg);
          results.push({ step: 'firestore_update', success: false, error: errMsg });
        }
      }
    }

    // 2. Delete from GHL calendar
    if (ghlAppointmentId) {
      const credentials = await getGHLCredentials();
      if (credentials.apiKey) {
        const ghlDeleted = await deleteGHLAppointment(credentials.apiKey, ghlAppointmentId);
        results.push({ step: 'ghl_delete', success: ghlDeleted, error: ghlDeleted ? undefined : 'Failed to delete from GHL' });
      } else {
        results.push({ step: 'ghl_delete', success: false, error: 'GHL credentials not configured' });
      }
    } else {
      results.push({ step: 'ghl_delete', success: true, error: 'No GHL appointment to delete' });
    }

    // 3. Send cancellation email to client with CC to Victoria
    if (clientEmail) {
      try {
        const emailHtml = generateCancellationEmailHtml({
          clientName: clientName || 'Client',
          serviceName: serviceName || 'Appointment',
          date: date || 'N/A',
          time: time || 'N/A',
          artistName: artistName
        });

        const emailText = `
Appointment Cancelled - A Pretty Girl Matter

Hi ${clientName || 'Client'},

Your appointment has been cancelled.

Cancelled Appointment Details:
Service: ${serviceName || 'Appointment'}
Date: ${date || 'N/A'}
Time: ${time || 'N/A'}
${artistName ? `Artist: ${artistName}` : ''}

Want to reschedule? Visit: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aprettygirlmatter.com'}/book-now

Questions? Contact us:
Phone: 919-441-0932
Email: victoria@aprettygirlmatter.com

A Pretty Girl Matter
4040 Barrett Drive Suite 3, Raleigh, NC 27609
        `;

        await SMTPEmailService.sendEmail(
          clientEmail,
          {
            subject: `Appointment Cancelled - ${serviceName || 'Your Appointment'} at A Pretty Girl Matter`,
            htmlContent: emailHtml,
            textContent: emailText
          },
          undefined, // fromEmail
          ['victoria@aprettygirlmatter.com'], // CC Victoria
          undefined // bcc
        );

        results.push({ step: 'send_email', success: true });
        console.log('✅ Cancellation email sent to', clientEmail, 'CC: victoria@aprettygirlmatter.com');
      } catch (emailError) {
        const errMsg = emailError instanceof Error ? emailError.message : 'Unknown error';
        console.error('Failed to send cancellation email:', errMsg);
        results.push({ step: 'send_email', success: false, error: errMsg });
      }
    } else {
      results.push({ step: 'send_email', success: false, error: 'No client email provided' });
    }

    const allSuccess = results.every(r => r.success);

    return NextResponse.json({
      success: allSuccess,
      message: allSuccess
        ? 'Booking cancelled successfully, GHL synced, and email sent'
        : 'Booking cancelled with some issues',
      results
    });

  } catch (error) {
    console.error('Error in cancellation process:', error);
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
