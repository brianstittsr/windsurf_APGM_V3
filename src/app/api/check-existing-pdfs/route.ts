import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking for existing PDF documents...');
    
    // Check if pdfDocuments collection exists and has any documents
    const pdfCollection = collection(db, 'pdfDocuments');
    const pdfQuery = query(pdfCollection, orderBy('generatedAt', 'desc'), limit(10));
    const pdfSnapshot = await getDocs(pdfQuery);
    
    const pdfs = [];
    pdfSnapshot.forEach((doc) => {
      const data = doc.data();
      pdfs.push({
        id: doc.id,
        ...data,
        generatedAt: data.generatedAt?.toDate?.() || data.generatedAt
      });
    });

    console.log(`📊 Found ${pdfs.length} PDF documents in database`);
    
    // Also check users collection to see if there are any users who might have PDFs
    const usersCollection = collection(db, 'users');
    const usersQuery = query(usersCollection, limit(5));
    const usersSnapshot = await getDocs(usersQuery);
    
    const users = [];
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        email: data.profile?.email || 'No email',
        firstName: data.profile?.firstName || 'Unknown',
        lastName: data.profile?.lastName || 'Unknown',
        role: data.role || 'Unknown'
      });
    });

    return NextResponse.json({
      success: true,
      summary: {
        totalPDFs: pdfs.length,
        totalUsers: users.length,
        hasPDFs: pdfs.length > 0,
        hasUsers: users.length > 0
      },
      pdfs: pdfs.map(pdf => ({
        id: pdf.id,
        clientId: pdf.clientId,
        appointmentId: pdf.appointmentId,
        formType: pdf.formType,
        filename: pdf.filename,
        generatedAt: pdf.generatedAt,
        fileSize: pdf.fileSize
      })),
      users: users,
      message: pdfs.length > 0 
        ? `Found ${pdfs.length} PDF documents` 
        : 'No PDF documents found in database'
    });

  } catch (error) {
    console.error('❌ Error checking existing PDFs:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : 'No stack trace available',
      message: 'Failed to check existing PDFs'
    }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({
    message: 'Use GET method to check existing PDFs',
    usage: 'GET /api/check-existing-pdfs'
  });
}
