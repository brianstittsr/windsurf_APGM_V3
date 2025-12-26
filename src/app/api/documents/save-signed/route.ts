import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

interface SaveSignedDocumentRequest {
  templateName: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  bookingId?: string;
  signatureData: string;
  formData?: Record<string, string>;
}

export async function POST(request: NextRequest) {
  try {
    const data: SaveSignedDocumentRequest = await request.json();
    
    if (!data.clientName || !data.clientEmail || !data.signatureData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = getDb();
    
    // Save signed document to Firestore
    const signedDocData = {
      templateId: 'health-consent', // Default template
      templateName: data.templateName || 'Health & Consent Form',
      clientId: data.clientId || 'guest',
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      bookingId: data.bookingId || null,
      signatureData: data.signatureData,
      formData: data.formData || {},
      signedAt: Timestamp.now(),
      pdfUrl: null, // Will be generated later if needed
      emailSent: false,
      emailSentAt: null
    };

    const docRef = await addDoc(collection(db, 'signedDocuments'), signedDocData);

    return NextResponse.json({
      success: true,
      documentId: docRef.id,
      message: 'Document saved successfully'
    });

  } catch (error) {
    console.error('Error saving signed document:', error);
    return NextResponse.json(
      { error: 'Failed to save document' },
      { status: 500 }
    );
  }
}
