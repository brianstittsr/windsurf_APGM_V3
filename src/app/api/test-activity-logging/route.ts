import { NextRequest, NextResponse } from 'next/server';
import { ActivityService } from '@/services/activityService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, activityType, testData } = body;

    if (!userId || !activityType) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: userId and activityType'
      }, { status: 400 });
    }

    let result;

    switch (activityType) {
      case 'appointment':
        result = await ActivityService.logAppointmentActivity(
          userId,
          'appointment_created',
          testData.appointmentId,
          testData.serviceType,
          {
            appointmentDate: testData.appointmentDate,
            artistId: testData.artistId
          }
        );
        break;

      case 'pdf':
        result = await ActivityService.logPDFActivity(
          userId,
          testData.pdfType,
          testData.pdfId,
          testData.appointmentId
        );
        break;

      case 'login':
        result = await ActivityService.logLoginActivity(userId);
        break;

      case 'payment':
        result = await ActivityService.logPaymentActivity(
          userId,
          testData.paymentMethod,
          testData.amount,
          testData.appointmentId
        );
        break;

      case 'document':
        result = await ActivityService.logDocumentActivity(
          userId,
          testData.action,
          testData.documentType,
          testData.documentId,
          testData.appointmentId
        );
        break;

      case 'profile':
        result = await ActivityService.logProfileActivity(
          userId,
          testData.updatedFields
        );
        break;

      default:
        return NextResponse.json({
          success: false,
          message: `Unknown activity type: ${activityType}`
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `${activityType} activity logged successfully`,
      activityId: result
    });

  } catch (error) {
    console.error('Error testing activity logging:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: false,
    message: 'This endpoint only supports POST requests'
  }, { status: 405 });
}
