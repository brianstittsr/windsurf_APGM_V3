import { OAuth2Client } from 'google-auth-library';
import { getDb } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

type GoogleAuthTokens = {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
  token_type?: string;
  scope?: string;
  userId: string;
  updatedAt: Date;
};

export class GoogleAuthService {
  private static client: OAuth2Client;
  private static SCOPES = ['https://www.googleapis.com/auth/calendar'];

  static async initialize(): Promise<OAuth2Client> {
    if (!this.client) {
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
        throw new Error('Missing Google OAuth configuration');
      }
      
      this.client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );
    }
    return this.client;
  }

  static async getAuthUrl(userId: string): Promise<string> {
    const client = await this.initialize();
    return client.generateAuthUrl({
      access_type: 'offline',
      scope: this.SCOPES,
      state: userId,
      prompt: 'consent'
    });
  }

  static async getTokens(code: string): Promise<GoogleAuthTokens> {
    const client = await this.initialize();
    const { tokens } = await client.getToken(code);
    return {
      ...tokens,
      userId: '', // Will be set by saveTokens
      updatedAt: new Date()
    } as GoogleAuthTokens;
  }

  static async saveTokens(userId: string, tokens: Partial<GoogleAuthTokens>): Promise<void> {
    const userRef = doc(getDb(), 'googleCalendarTokens', userId);
    await setDoc(userRef, {
      ...tokens,
      userId,
      updatedAt: new Date()
    }, { merge: true });
  }

  static async getClient(userId: string): Promise<OAuth2Client> {
    const client = await this.initialize();
    const userRef = doc(getDb(), 'googleCalendarTokens', userId);
    const docSnap = await getDoc(userRef);
    
    if (!docSnap.exists()) {
      throw new Error('No Google Calendar tokens found');
    }
    
    const tokens = docSnap.data() as GoogleAuthTokens;
    client.setCredentials(tokens);
    return client;
  }
}
