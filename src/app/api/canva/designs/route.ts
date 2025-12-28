import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

const CANVA_API_BASE = 'https://api.canva.com/rest/v1';

// Helper to get access token for user
async function getAccessToken(userId: string): Promise<string | null> {
  try {
    const docRef = doc(getDb(), 'canvaIntegration', userId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data();
    const tokenExpiry = data.tokenExpiry?.toDate?.() || new Date(data.tokenExpiry);
    
    // Check if token is expired
    if (tokenExpiry < new Date()) {
      // Token expired - would need to refresh
      // For now, return null to trigger re-auth
      console.log('Canva token expired for user:', userId);
      return null;
    }
    
    return data.accessToken;
  } catch (error) {
    console.error('Error getting Canva access token:', error);
    return null;
  }
}

// GET - List user's Canva designs
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const search = searchParams.get('search') || '';
  const limit = parseInt(searchParams.get('limit') || '20');
  const continuation = searchParams.get('continuation');

  if (!userId) {
    return NextResponse.json(
      { error: 'userId is required' },
      { status: 400 }
    );
  }

  const accessToken = await getAccessToken(userId);
  
  if (!accessToken) {
    return NextResponse.json(
      { error: 'Not connected to Canva', needsAuth: true },
      { status: 401 }
    );
  }

  try {
    // Build query params for Canva API
    const params = new URLSearchParams();
    params.set('ownership', 'owned');
    params.set('limit', limit.toString());
    
    if (search) {
      params.set('query', search);
    }
    
    if (continuation) {
      params.set('continuation', continuation);
    }

    const response = await fetch(`${CANVA_API_BASE}/designs?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Canva API error:', response.status, errorText);
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Canva session expired', needsAuth: true },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch designs from Canva' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      designs: data.items || [],
      continuation: data.continuation,
      hasMore: !!data.continuation
    });

  } catch (error) {
    console.error('Error fetching Canva designs:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch designs' },
      { status: 500 }
    );
  }
}
