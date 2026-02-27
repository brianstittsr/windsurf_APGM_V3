import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

interface TryOnSession {
  sessionId: string;
  clientId?: string;
  uploadedPhoto: string;
  tryOnHistory: Array<{
    styleId: string;
    timestamp: string;
    customizations: Record<string, any>;
    notes?: string;
  }>;
  selectedStyle?: string;
  bookingIntent: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SaveSessionRequest {
  sessionId?: string;
  clientId?: string;
  uploadedPhoto: string;
  tryOnHistory?: Array<{
    styleId: string;
    timestamp: string;
    customizations: Record<string, any>;
    notes?: string;
  }>;
  selectedStyle?: string;
  bookingIntent?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: SaveSessionRequest = await request.json();
    const { sessionId, clientId, uploadedPhoto, tryOnHistory, selectedStyle, bookingIntent } = body;

    if (!uploadedPhoto) {
      return NextResponse.json(
        { error: 'Missing required parameter: uploadedPhoto' },
        { status: 400 }
      );
    }

    const sessionData: TryOnSession = {
      sessionId: sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      clientId: clientId || null,
      uploadedPhoto,
      tryOnHistory: tryOnHistory || [],
      selectedStyle: selectedStyle || null,
      bookingIntent: bookingIntent || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save session to Firestore
    const docRef = await addDoc(collection(db, 'tryon_sessions'), sessionData);

    return NextResponse.json({
      success: true,
      sessionId: sessionData.sessionId,
      documentId: docRef.id,
      message: 'Try-on session saved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Session save error:', error);
    return NextResponse.json(
      { error: 'Failed to save try-on session' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const clientId = searchParams.get('clientId');
    const limitSessions = parseInt(searchParams.get('limit') || '10');

    if (!sessionId && !clientId) {
      return NextResponse.json(
        { error: 'Either sessionId or clientId is required' },
        { status: 400 }
      );
    }

    let q;
    if (sessionId) {
      q = query(
        collection(db, 'tryon_sessions'),
        where('sessionId', '==', sessionId),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
    } else {
      q = query(
        collection(db, 'tryon_sessions'),
        where('clientId', '==', clientId),
        orderBy('createdAt', 'desc'),
        limit(limitSessions)
      );
    }

    const querySnapshot = await getDocs(q);
    const sessions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      sessions,
      count: sessions.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Session fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch try-on sessions' },
      { status: 500 }
    );
  }
}
