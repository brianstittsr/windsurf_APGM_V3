/**
 * Centralized API Configuration
 * Replaces hardcoded API endpoints and URLs throughout the platform
 */

export interface ApiConfig {
  ghlBaseUrl: string;
  ghlApiVersion: string;
  whatsappBaseUrl: string;
  openclawBaseUrl: string;
  googleReviewsBaseUrl: string;
  googlePlacesBaseUrl: string;
  googleMapsBaseUrl: string;
  pageSpeedBaseUrl: string;
  facebookGraphBaseUrl: string;
}

export class ApiConfigService {
  private static config: ApiConfig = {
    // GoHighLevel API
    ghlBaseUrl: process.env.NEXT_PUBLIC_GHL_BASE_URL || 'https://services.leadconnectorhq.com',
    ghlApiVersion: process.env.NEXT_PUBLIC_GHL_API_VERSION || '2021-07-28',
    
    // WhatsApp Business API
    whatsappBaseUrl: process.env.NEXT_PUBLIC_WHATSAPP_BASE_URL || 'https://graph.facebook.com/v18.0',
    
    // OpenClaw API
    openclawBaseUrl: process.env.NEXT_PUBLIC_OPENCLAW_BASE_URL || 'https://api.openclaw.ai/v1',
    
    // Google APIs
    googleReviewsBaseUrl: process.env.NEXT_PUBLIC_GOOGLE_REVIEWS_BASE_URL || 'https://mybusiness.googleapis.com/v4',
    googlePlacesBaseUrl: process.env.NEXT_PUBLIC_GOOGLE_PLACES_BASE_URL || 'https://places.googleapis.com/v1',
    googleMapsBaseUrl: process.env.NEXT_PUBLIC_GOOGLE_MAPS_BASE_URL || 'https://maps.googleapis.com/maps/api',
    
    // PageSpeed Insights
    pageSpeedBaseUrl: process.env.NEXT_PUBLIC_PAGESPEED_BASE_URL || 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed',
    
    // Facebook Graph API
    facebookGraphBaseUrl: process.env.NEXT_PUBLIC_FACEBOOK_GRAPH_BASE_URL || 'https://graph.facebook.com/v18.0'
  };

  static getApiConfig(): ApiConfig {
    return { ...this.config };
  }

  // GoHighLevel API
  static getGhlBaseUrl(): string {
    return this.config.ghlBaseUrl;
  }

  static getGhlApiVersion(): string {
    return this.config.ghlApiVersion;
  }

  static getGhlFullUrl(endpoint: string = ''): string {
    return `${this.config.ghlBaseUrl}${endpoint}`;
  }

  // WhatsApp Business API
  static getWhatsappBaseUrl(): string {
    return this.config.whatsappBaseUrl;
  }

  // OpenClaw API
  static getOpenclawBaseUrl(): string {
    return this.config.openclawBaseUrl;
  }

  // Google Reviews API
  static getGoogleReviewsBaseUrl(): string {
    return this.config.googleReviewsBaseUrl;
  }

  static getGoogleReviewsUrl(accountId: string, locationId: string, endpoint: string = ''): string {
    return `${this.config.googleReviewsBaseUrl}/${accountId}/${locationId}${endpoint}`;
  }

  // Google Places API
  static getGooglePlacesBaseUrl(): string {
    return this.config.googlePlacesBaseUrl;
  }

  // Google Maps API
  static getGoogleMapsBaseUrl(): string {
    return this.config.googleMapsBaseUrl;
  }

  static getGoogleMapsEndpoint(service: string, endpoint: string = ''): string {
    return `${this.config.googleMapsBaseUrl}/${service}/${endpoint}`;
  }

  // PageSpeed Insights
  static getPageSpeedBaseUrl(): string {
    return this.config.pageSpeedBaseUrl;
  }

  // Facebook Graph API
  static getFacebookGraphBaseUrl(): string {
    return this.config.facebookGraphBaseUrl;
  }

  static validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!this.config.ghlBaseUrl) {
      errors.push('GHL Base URL is required');
    }
    
    if (!this.config.whatsappBaseUrl) {
      errors.push('WhatsApp Base URL is required');
    }
    
    if (!this.config.googleMapsBaseUrl) {
      errors.push('Google Maps Base URL is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static getEnvironmentInfo(): { environment: string; config: Partial<ApiConfig> } {
    const environment = process.env.NODE_ENV || 'development';
    const config: Partial<ApiConfig> = {};
    
    // Only log non-sensitive config info
    if (this.config.ghlBaseUrl) {
      config.ghlBaseUrl = this.config.ghlBaseUrl.includes('localhost') ? 'localhost' : 'production';
    }
    
    if (this.config.whatsappBaseUrl) {
      config.whatsappBaseUrl = this.config.whatsappBaseUrl.includes('localhost') ? 'localhost' : 'production';
    }
    
    return { environment, config };
  }
}
