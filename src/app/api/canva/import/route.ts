import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
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
    
    if (tokenExpiry < new Date()) {
      return null;
    }
    
    return data.accessToken;
  } catch (error) {
    console.error('Error getting Canva access token:', error);
    return null;
  }
}

// POST - Export and import a Canva design as image
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, designId, designName, format = 'png', destination } = body;

    if (!userId || !designId) {
      return NextResponse.json(
        { error: 'userId and designId are required' },
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

    // Step 1: Request export from Canva
    const exportResponse = await fetch(`${CANVA_API_BASE}/designs/${designId}/exports`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        format: format.toUpperCase(),
        quality: 'regular'
      })
    });

    if (!exportResponse.ok) {
      const errorText = await exportResponse.text();
      console.error('Canva export request failed:', exportResponse.status, errorText);
      
      if (exportResponse.status === 401) {
        return NextResponse.json(
          { error: 'Canva session expired', needsAuth: true },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to export design from Canva' },
        { status: exportResponse.status }
      );
    }

    const exportData = await exportResponse.json();
    const exportId = exportData.job?.id;

    if (!exportId) {
      return NextResponse.json(
        { error: 'No export job ID returned' },
        { status: 500 }
      );
    }

    // Step 2: Poll for export completion
    let exportResult = null;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(`${CANVA_API_BASE}/designs/${designId}/exports/${exportId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!statusResponse.ok) {
        attempts++;
        continue;
      }

      const statusData = await statusResponse.json();
      
      if (statusData.job?.status === 'completed') {
        exportResult = statusData.job;
        break;
      } else if (statusData.job?.status === 'failed') {
        return NextResponse.json(
          { error: 'Canva export failed: ' + (statusData.job?.error?.message || 'Unknown error') },
          { status: 500 }
        );
      }
      
      attempts++;
    }

    if (!exportResult || !exportResult.urls || exportResult.urls.length === 0) {
      return NextResponse.json(
        { error: 'Export timed out or no URLs returned' },
        { status: 500 }
      );
    }

    // Get the exported image URL
    const exportedUrl = exportResult.urls[0];

    // Step 3: Download the image and convert to base64
    const imageResponse = await fetch(exportedUrl);
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to download exported image' },
        { status: 500 }
      );
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const base64 = Buffer.from(imageBuffer).toString('base64');
    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Step 4: Save import record to Firestore
    const importRecord = {
      userId,
      canvaDesignId: designId,
      designName: designName || 'Untitled',
      importedUrl: dataUrl,
      originalUrl: exportedUrl,
      format,
      width: 0, // Would need to parse from image
      height: 0,
      usedIn: destination ? [destination] : [],
      importedAt: new Date()
    };

    const docRef = await addDoc(collection(getDb(), 'canvaImports'), importRecord);

    return NextResponse.json({
      success: true,
      url: dataUrl,
      importId: docRef.id,
      designId,
      designName: designName || 'Untitled',
      format
    });

  } catch (error) {
    console.error('Canva import error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Import failed' },
      { status: 500 }
    );
  }
}
