import { NextRequest, NextResponse } from 'next/server';
import { ConfidentialClientApplication } from '@azure/msal-node';

export async function GET(req: NextRequest) {
  // Check if Microsoft credentials are configured
  if (!process.env.MICROSOFT_CLIENT_ID || !process.env.MICROSOFT_CLIENT_SECRET || !process.env.MICROSOFT_TENANT_ID) {
    return NextResponse.json(
      { error: 'Microsoft Calendar integration is not configured. Please set up the required environment variables.' },
      { status: 503 }
    );
  }

  const msalConfig = {
    auth: {
      clientId: process.env.MICROSOFT_CLIENT_ID,
      authority: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}`,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    },
  };

  const cca = new ConfidentialClientApplication(msalConfig);
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (code) {
    try {
      const tokenRequest = {
        code: code,
        scopes: ['https://graph.microsoft.com/.default'],
        redirectUri: process.env.MICROSOFT_REDIRECT_URI!,
      };

      const response = await cca.acquireTokenByCode(tokenRequest);
      // In a real application, you would save the tokens to the database
      // associated with the user.
      console.log('Microsoft tokens acquired:', response.accessToken);
      return NextResponse.redirect('/dashboard');
    } catch (error) {
      console.error('Error getting Microsoft tokens:', error);
      return NextResponse.json({ error: 'Error getting Microsoft tokens' }, { status: 500 });
    }
  } else {
    const authCodeUrlParameters = {
      scopes: ['Calendars.ReadWrite'],
      redirectUri: process.env.MICROSOFT_REDIRECT_URI!,
    };

    const url = await cca.getAuthCodeUrl(authCodeUrlParameters);
    return NextResponse.redirect(url);
  }
}
