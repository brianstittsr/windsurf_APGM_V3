import { OAuth2Client } from 'google-auth-library';
import { google, calendar_v3 } from 'googleapis';
import { getDb } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { GoogleAuthService } from './googleAuth';

type GoogleCalendarTokens = {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
  token_type?: string;
  scope?: string;
  userId: string;
  updatedAt: Date;
};

export class GoogleCalendarService {
  private static SCOPES = ['https://www.googleapis.com/auth/calendar'];

  static async getAuthUrl(userId: string): Promise<string> {
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    return client.generateAuthUrl({
      access_type: 'offline',
      scope: this.SCOPES,
      state: userId,
      prompt: 'consent'
    });
  }

  static async getTokens(code: string): Promise<GoogleCalendarTokens> {
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    const { tokens } = await client.getToken(code);
    return {
      ...tokens,
      userId: '', // Will be set by saveTokens
      updatedAt: new Date()
    } as GoogleCalendarTokens;
  }

  static async saveTokens(userId: string, tokens: Partial<GoogleCalendarTokens>): Promise<void> {
    const userRef = doc(getDb(), 'googleCalendarTokens', userId);
    await setDoc(userRef, {
      ...tokens,
      userId,
      updatedAt: new Date()
    }, { merge: true });
  }

  private static async getCalendarApi(userId: string): Promise<calendar_v3.Calendar> {
    const authClient = await GoogleAuthService.getClient(userId);
    return google.calendar({
      version: 'v3',
      auth: authClient
    });
  }

  static async listCalendars(userId: string): Promise<calendar_v3.Schema$CalendarListEntry[]> {
    const calendar = await this.getCalendarApi(userId);
    const res = await calendar.calendarList.list();
    return res.data.items || [];
  }

  static async createEvent(
    userId: string,
    calendarId: string,
    event: calendar_v3.Schema$Event
  ): Promise<calendar_v3.Schema$Event> {
    const calendar = await this.getCalendarApi(userId);
    const res = await calendar.events.insert({
      calendarId,
      requestBody: event
    });
    return res.data;
  }

  static async updateEvent(
    userId: string,
    calendarId: string,
    eventId: string,
    event: calendar_v3.Schema$Event
  ): Promise<calendar_v3.Schema$Event> {
    const calendar = await this.getCalendarApi(userId);
    const res = await calendar.events.update({
      calendarId,
      eventId,
      requestBody: event
    });
    return res.data;
  }

  static async deleteEvent(
    userId: string,
    calendarId: string,
    eventId: string
  ): Promise<void> {
    const calendar = await this.getCalendarApi(userId);
    await calendar.events.delete({
      calendarId,
      eventId
    });
  }
}
