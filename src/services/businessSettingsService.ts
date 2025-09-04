import { DatabaseService } from './database';
import { Timestamp } from 'firebase/firestore';

export interface BusinessSettings {
  id?: string;
  depositPercentage: number;
  taxRate: number;
  cancellationPolicy: string;
  rebookingFee: number;
  businessName: string;
  address: string;
  phone: string;
  email: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export class BusinessSettingsService {
  private static readonly COLLECTION = 'businessSettings';
  private static cachedSettings: BusinessSettings | null = null;
  private static cacheExpiry: number = 0;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get business settings with caching
   */
  static async getSettings(): Promise<BusinessSettings> {
    // Check cache first
    const now = Date.now();
    if (this.cachedSettings && now < this.cacheExpiry) {
      return this.cachedSettings;
    }

    try {
      const settings = await DatabaseService.getAll<BusinessSettings>(this.COLLECTION);
      
      if (settings.length > 0) {
        this.cachedSettings = settings[0];
        this.cacheExpiry = now + this.CACHE_DURATION;
        return this.cachedSettings;
      }
      
      // Return default settings if none exist
      const defaultSettings: BusinessSettings = {
        depositPercentage: 33.33, // Default 33.33% (equivalent to $200 on $600 service)
        taxRate: 7.75,
        cancellationPolicy: '24 hours notice required',
        rebookingFee: 50,
        businessName: 'A Pretty Girl Matter',
        address: '',
        phone: '',
        email: ''
      };
      
      this.cachedSettings = defaultSettings;
      this.cacheExpiry = now + this.CACHE_DURATION;
      return defaultSettings;
    } catch (error) {
      console.error('Error fetching business settings:', error);
      
      // Return default settings on error
      const defaultSettings: BusinessSettings = {
        depositPercentage: 33.33,
        taxRate: 7.75,
        cancellationPolicy: '24 hours notice required',
        rebookingFee: 50,
        businessName: 'A Pretty Girl Matter',
        address: '',
        phone: '',
        email: ''
      };
      
      return defaultSettings;
    }
  }

  /**
   * Get deposit percentage specifically
   */
  static async getDepositPercentage(): Promise<number> {
    const settings = await this.getSettings();
    return settings.depositPercentage;
  }

  /**
   * Get tax rate specifically
   */
  static async getTaxRate(): Promise<number> {
    const settings = await this.getSettings();
    return settings.taxRate / 100; // Convert percentage to decimal
  }

  /**
   * Calculate deposit amount based on service price and settings
   */
  static async calculateDepositAmount(servicePrice: number): Promise<number> {
    const settings = await this.getSettings();
    const depositPercentage = settings.depositPercentage;
    return Math.round((servicePrice * depositPercentage / 100) * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Update business settings
   */
  static async updateSettings(settings: Partial<BusinessSettings>): Promise<void> {
    try {
      const existingSettings = await DatabaseService.getAll<BusinessSettings>(this.COLLECTION);
      
      const settingsData = {
        ...settings,
        updatedAt: Timestamp.now()
      };

      if (existingSettings.length > 0) {
        await DatabaseService.update(this.COLLECTION, existingSettings[0].id!, settingsData);
      } else {
        // Create new business settings document in Firebase
        settingsData.createdAt = Timestamp.now();
        const id = await DatabaseService.create(this.COLLECTION, settingsData);
        console.log('New business settings created in Firebase with ID:', id);
      }

      // Clear cache to force refresh
      this.clearCache();
    } catch (error) {
      console.error('Error updating business settings:', error);
      throw error;
    }
  }

  /**
   * Clear cached settings
   */
  static clearCache(): void {
    this.cachedSettings = null;
    this.cacheExpiry = 0;
  }

  /**
   * Initialize default settings if none exist
   */
  static async initializeDefaultSettings(): Promise<void> {
    try {
      const existingSettings = await DatabaseService.getAll<BusinessSettings>(this.COLLECTION);
      
      if (existingSettings.length === 0) {
        const defaultSettings: BusinessSettings = {
          depositPercentage: 33.33,
          taxRate: 7.75,
          cancellationPolicy: '24 hours notice required',
          rebookingFee: 50,
          businessName: 'A Pretty Girl Matter',
          address: '',
          phone: '',
          email: '',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };

        // Create default business settings in Firebase
        await DatabaseService.create(this.COLLECTION, defaultSettings);
        console.log('Default business settings initialized in Firebase');
      }
    } catch (error) {
      console.error('Error initializing default settings:', error);
    }
  }
}
