/**
 * Centralized Business Configuration
 * Replaces hardcoded business values throughout the platform
 */

export interface BusinessConfig {
  businessName: string;
  businessEmail: string;
  supportEmail: string;
  adminEmails: string[];
  businessPhone: string;
  supportPhone: string;
  websiteUrl: string;
  depositUrl: string;
  bookingUrl: string;
  reviewsUrl: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export class ConfigService {
  private static config: BusinessConfig = {
    businessName: process.env.NEXT_PUBLIC_BUSINESS_NAME || 'A Pretty Girl Matter',
    businessEmail: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'victoria@aprettygirlmatter.com',
    supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'info@atlantaglamourpmu.com',
    adminEmails: process.env.ADMIN_EMAILS?.split(',') || [
      'victoria@aprettygirlmatter.com',
      'admin@atlantaglamourpmu.com',
      'brianstittsr@gmail.com'
    ],
    businessPhone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || '(919) 441-0932',
    supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || '(404) 555-1234',
    websiteUrl: process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://atlantaglamourpmu.com',
    depositUrl: process.env.NEXT_PUBLIC_DEPOSIT_URL || 'https://atlantaglamourpmu.com/deposit',
    bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL || 'https://atlantaglamourpmu.com/book',
    reviewsUrl: process.env.NEXT_PUBLIC_REVIEWS_URL || 'https://g.page/r/atlantaglamourpmu/review',
    address: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || '123 Beauty Lane',
    city: process.env.NEXT_PUBLIC_BUSINESS_CITY || 'Raleigh',
    state: process.env.NEXT_PUBLIC_BUSINESS_STATE || 'NC',
    zipCode: process.env.NEXT_PUBLIC_BUSINESS_ZIP || '27601'
  };

  static getBusinessConfig(): BusinessConfig {
    return { ...this.config };
  }

  static getBusinessName(): string {
    return this.config.businessName;
  }

  static getBusinessEmail(): string {
    return this.config.businessEmail;
  }

  static getSupportEmail(): string {
    return this.config.supportEmail;
  }

  static getAdminEmails(): string[] {
    return [...this.config.adminEmails];
  }

  static getBusinessPhone(): string {
    return this.config.businessPhone;
  }

  static getSupportPhone(): string {
    return this.config.supportPhone;
  }

  static getWebsiteUrl(): string {
    return this.config.websiteUrl;
  }

  static getDepositUrl(): string {
    return this.config.depositUrl;
  }

  static getBookingUrl(): string {
    return this.config.bookingUrl;
  }

  static getReviewsUrl(): string {
    return this.config.reviewsUrl;
  }

  static getFullAddress(): string {
    return `${this.config.address}, ${this.config.city}, ${this.config.state} ${this.config.zipCode}`;
  }

  static isAdminEmail(email: string): boolean {
    return this.config.adminEmails.includes(email.toLowerCase());
  }

  static validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!this.config.businessName) {
      errors.push('Business name is required');
    }
    
    if (!this.config.businessEmail || !this.config.businessEmail.includes('@')) {
      errors.push('Valid business email is required');
    }
    
    if (!this.config.websiteUrl) {
      errors.push('Website URL is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
