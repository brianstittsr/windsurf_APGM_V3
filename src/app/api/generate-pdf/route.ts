import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { storage } from 'firebase-admin/storage';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

export async function POST(request: NextRequest) {
  try {
    const { formData, clientId, appointmentId, formType } = await request.json();

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Letter size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let yPosition = 750;
    const leftMargin = 50;
    const lineHeight = 20;

    // Helper function to add text
    const addText = (text: string, fontSize = 12, isBold = false) => {
      page.drawText(text, {
        x: leftMargin,
        y: yPosition,
        size: fontSize,
        font: isBold ? boldFont : font,
        color: rgb(0, 0, 0),
      });
      yPosition -= lineHeight;
    };

    // Header
    addText('A Pretty Girl Matter - Booking Form', 20, true);
    addText(`Date: ${new Date().toLocaleDateString()}`, 12);
    yPosition -= 10;

    // Service Information
    addText('Service Information', 16, true);
    if (formData.service) {
      addText(`Service: ${formData.service.name || 'N/A'}`);
      addText(`Price: $${formData.service.price || 'N/A'}`);
      addText(`Duration: ${formData.service.duration || 'N/A'}`);
    }
    yPosition -= 10;

    // Appointment Details
    addText('Appointment Details', 16, true);
    if (formData.appointment) {
      addText(`Date: ${formData.appointment.date || 'N/A'}`);
      addText(`Time: ${formData.appointment.time || 'N/A'}`);
      addText(`Artist: ${formData.appointment.artist || 'N/A'}`);
    }
    yPosition -= 10;

    // Client Information
    addText('Client Information', 16, true);
    if (formData.clientProfile) {
      const profile = formData.clientProfile;
      addText(`Name: ${profile.firstName || ''} ${profile.lastName || ''}`);
      addText(`Email: ${profile.email || 'N/A'}`);
      addText(`Phone: ${profile.phone || 'N/A'}`);
      
      if (profile.address) {
        addText(`Address: ${profile.address}`);
      }
      
      if (profile.emergencyContactName) {
        addText(`Emergency Contact: ${profile.emergencyContactName}`);
        addText(`Emergency Phone: ${profile.emergencyContactPhone || 'N/A'}`);
      }
    }
    yPosition -= 10;

    // Health Information
    if (formData.healthForm) {
      addText('Health Information', 16, true);
      const health = formData.healthForm;
      
      if (health.medicalConditions && health.medicalConditions.length > 0) {
        addText('Medical Conditions:');
        health.medicalConditions.forEach((condition: string) => {
          addText(`• ${condition}`, 10);
        });
      }

      if (health.medications) {
        addText(`Medications: ${health.medications}`);
      }

      if (health.allergies) {
        addText(`Allergies: ${health.allergies}`);
      }

      if (health.isPregnant !== undefined) {
        addText(`Pregnant: ${health.isPregnant ? 'Yes' : 'No'}`);
      }

      if (health.skinConditions) {
        addText(`Skin Conditions: ${health.skinConditions}`);
      }
    }

    // Signatures
    if (formData.signatures) {
      yPosition -= 10;
      addText('Signatures & Consent', 16, true);
      
      if (formData.signatures.clientSignature) {
        addText('Client Signature: [Signed Electronically]');
        addText(`Date: ${formData.signatures.clientSignatureDate || new Date().toLocaleDateString()}`);
      }

      if (formData.signatures.consentGiven) {
        addText('✓ Consent to treatment given');
      }

      if (formData.signatures.termsAccepted) {
        addText('✓ Terms and conditions accepted');
      }
    }

    // Footer
    yPosition = 50;
    addText('A Pretty Girl Matter LLC - Professional Permanent Makeup Services', 10);
    addText('Generated electronically - no physical signature required', 10);

    // Serialize the PDF
    const pdfBytes = await pdfDoc.save();

    // Upload to Firebase Storage
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${formType}-form-${timestamp}-${appointmentId}.pdf`;
    const filePath = `client-forms/${clientId}/${filename}`;
    
    const bucket = storage.bucket();
    const file = bucket.file(filePath);
    
    await file.save(Buffer.from(pdfBytes), {
      metadata: {
        contentType: 'application/pdf',
        metadata: {
          clientId,
          appointmentId,
          formType,
          generatedAt: new Date().toISOString()
        }
      }
    });

    // Make file publicly accessible (optional)
    await file.makePublic();

    const downloadURL = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    return NextResponse.json({
      success: true,
      downloadURL,
      filename,
      filePath
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
