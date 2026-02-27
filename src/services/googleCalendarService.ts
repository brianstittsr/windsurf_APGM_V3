import { google } from 'googleapis';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '@/lib/firebase-config';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export class GoogleCalendarService {
  private calendar = google.calendar('v3');

  async getClient(artistId: string) {
    const docRef = doc(db, 'googleCalendarTokens', artistId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Google Calendar not connected for this artist');
    }

    const tokens = docSnap.data();
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken
    });

    return oauth2Client;
  }

  async syncEvents(artistId: string, events: any[]) {
    const auth = await this.getClient(artistId);
    
    // Implementation for syncing events to Google Calendar
    // This would create/update events in the connected calendar
  }

  async getAvailability(artistId: string, dateRange: { start: string; end: string }) {
    const auth = await this.getClient(artistId);
    
    const res = await this.calendar.events.list({
      auth,
      calendarId: 'primary',
      timeMin: dateRange.start,
      timeMax: dateRange.end,
      singleEvents: true,
      orderBy: 'startTime'
    });

    return res.data.items || [];
  }
}
