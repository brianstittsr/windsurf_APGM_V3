import { doc, getDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

export type CalendarProvider = 'gohighlevel' | 'google' | 'both' | 'none';

export interface CalendarSettings {
  primaryProvider: CalendarProvider;
  enableGHL: boolean;
  enableGoogle: boolean;
  syncBidirectional: boolean;
}

export class CalendarProviderService {
  private static instance: CalendarProviderService;
  private cachedSettings: CalendarSettings | null = null;
  private lastFetch: number = 0;
  private cacheDuration = 60000; // 1 minute cache

  static getInstance(): CalendarProviderService {
    if (!CalendarProviderService.instance) {
      CalendarProviderService.instance = new CalendarProviderService();
    }
    return CalendarProviderService.instance;
  }

  async getSettings(): Promise<CalendarSettings> {
    const now = Date.now();
    
    // Return cached settings if still valid
    if (this.cachedSettings && (now - this.lastFetch) < this.cacheDuration) {
      return this.cachedSettings;
    }

    try {
      const docRef = doc(getDb(), 'settings', 'calendarProvider');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        this.cachedSettings = docSnap.data() as CalendarSettings;
      } else {
        // Default settings
        this.cachedSettings = {
          primaryProvider: 'gohighlevel',
          enableGHL: true,
          enableGoogle: false,
          syncBidirectional: false
        };
      }
      
      this.lastFetch = now;
      return this.cachedSettings;
    } catch (error) {
      console.error('Error fetching calendar provider settings:', error);
      
      // Return default on error
      return {
        primaryProvider: 'gohighlevel',
        enableGHL: true,
        enableGoogle: false,
        syncBidirectional: false
      };
    }
  }

  async shouldSyncToGHL(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.enableGHL;
  }

  async shouldSyncToGoogle(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.enableGoogle;
  }

  async getPrimaryProvider(): Promise<CalendarProvider> {
    const settings = await this.getSettings();
    return settings.primaryProvider;
  }

  async isBidirectionalSyncEnabled(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.syncBidirectional;
  }

  // Clear cache to force refresh
  clearCache(): void {
    this.cachedSettings = null;
    this.lastFetch = 0;
  }
}

// Export singleton instance
export const calendarProviderService = CalendarProviderService.getInstance();
