/**
 * Google Reviews Types and Interfaces
 * Comprehensive type definitions for Google Reviews integration
 */

// ============================================================================
// Google Review Data Types
// ============================================================================

export interface GoogleReview {
  authorName: string;
  authorUrl?: string;
  profilePhotoUrl?: string;
  rating: number;
  text: string;
  relativeTimeDescription: string;
  time: number; // Unix timestamp
  language?: string;
  isTranslated?: boolean;
  originalLanguage?: string;
}

export interface GoogleReviewAuthor {
  displayName: string;
  uri?: string;
  photoUri?: string;
}

export interface GoogleReviewFromAPI {
  name?: string;
  authorAttribution?: GoogleReviewAuthor;
  rating: number;
  text?: {
    text: string;
    languageCode: string;
  };
  originalText?: {
    text: string;
    languageCode: string;
  };
  publishTime: string;
  relativePublishTimeDescription: string;
  reviewReply?: {
    publishTime: string;
    text: {
      text: string;
    };
  };
}

// ============================================================================
// Place Details Types
// ============================================================================

export interface GooglePlaceDetails {
  placeId: string;
  name: string;
  formattedAddress: string;
  rating: number;
  userRatingsTotal: number;
  reviews: GoogleReview[];
  url?: string;
  website?: string;
  formattedPhoneNumber?: string;
  internationalPhoneNumber?: string;
  editorialSummary?: {
    text: string;
    languageCode: string;
  };
  businessStatus?: 'OPERATIONAL' | 'CLOSED_TEMPORARILY' | 'CLOSED_PERMANENTLY';
  primaryType?: string;
  types?: string[];
  openingHours?: {
    openNow: boolean;
    periods: Array<{
      open: { day: number; hour: number; minute: number };
      close?: { day: number; hour: number; minute: number };
    }>;
    weekdayDescriptions: string[];
  };
  photos?: Array<{
    name: string;
    widthPx: number;
    heightPx: number;
    authorAttributions: GoogleReviewAuthor[];
  }>;
  priceLevel?: 'PRICE_LEVEL_UNSPECIFIED' | 'FREE' | 'INEXPENSIVE' | 'MODERATE' | 'EXPENSIVE' | 'VERY_EXPENSIVE';
  utcOffsetMinutes?: number;
  viewport?: {
    low: { latitude: number; longitude: number };
    high: { latitude: number; longitude: number };
  };
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface GoogleReviewsConfig {
  // API Configuration
  placeId: string;
  apiKey?: string; // Optional: can be stored in environment variables
  
  // Business Information (cached from Google)
  businessName: string;
  formattedAddress?: string;
  formattedPhoneNumber?: string;
  website?: string;
  googleMapsUrl?: string;
  primaryType?: string;
  
  // Settings
  isActive: boolean;
  autoSync: boolean;
  syncIntervalMinutes: number;
  minimumRatingToDisplay: number;
  maxReviewsToDisplay: number;
  sortOrder: 'newest' | 'highest' | 'relevant';
  
  // Display Settings
  showBusinessName: boolean;
  showOverallRating: boolean;
  showReviewCount: boolean;
  showAuthorPhotos: boolean;
  showAuthorNames: boolean;
  showTimestamps: boolean;
  
  // Last Sync Information
  lastSyncAt?: string;
  lastSyncStatus?: 'success' | 'error' | 'pending';
  lastSyncError?: string;
  lastSuccessfulReviews?: GoogleReview[];
  
  // Statistics (cached)
  cachedRating?: number;
  cachedUserRatingsTotal?: number;
  cachedReviewCount?: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Cached Review Data
// ============================================================================

export interface CachedGoogleReviews {
  id: string;
  placeId: string;
  businessName: string;
  rating: number;
  userRatingsTotal: number;
  reviews: GoogleReview[];
  reviewStats: {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: { [key: number]: number };
  };
  fetchedAt: string;
  expiresAt: string;
  isStale: boolean;
}

// ============================================================================
// Sync Log Types
// ============================================================================

export interface GoogleReviewsSyncLog {
  id: string;
  placeId: string;
  status: 'success' | 'error' | 'partial';
  reviewsFetched: number;
  reviewsAdded: number;
  reviewsUpdated: number;
  reviewsRemoved: number;
  errorMessage?: string;
  errorDetails?: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
}

// ============================================================================
// Search Result Types
// ============================================================================

export interface GooglePlaceSearchResult {
  placeId: string;
  name: string;
  formattedAddress: string;
  rating?: number;
  userRatingsTotal?: number;
  types?: string[];
  primaryType?: string;
  businessStatus?: string;
}

// ============================================================================
// Form Data Types
// ============================================================================

export interface GoogleReviewsSettingsFormData {
  placeId: string;
  businessName: string;
  isActive: boolean;
  autoSync: boolean;
  syncIntervalMinutes: number;
  minimumRatingToDisplay: number;
  maxReviewsToDisplay: number;
  sortOrder: 'newest' | 'highest' | 'relevant';
  showBusinessName: boolean;
  showOverallRating: boolean;
  showReviewCount: boolean;
  showAuthorPhotos: boolean;
  showAuthorNames: boolean;
  showTimestamps: boolean;
}

// ============================================================================
// Default Values
// ============================================================================

export const defaultGoogleReviewsConfig: Omit<GoogleReviewsConfig, 'placeId' | 'businessName' | 'createdAt' | 'updatedAt'> = {
  isActive: true,
  autoSync: true,
  syncIntervalMinutes: 60,
  minimumRatingToDisplay: 4,
  maxReviewsToDisplay: 10,
  sortOrder: 'newest',
  showBusinessName: true,
  showOverallRating: true,
  showReviewCount: true,
  showAuthorPhotos: true,
  showAuthorNames: true,
  showTimestamps: true,
};

export const defaultGoogleReviewsSettingsFormData: GoogleReviewsSettingsFormData = {
  placeId: '',
  businessName: '',
  isActive: true,
  autoSync: true,
  syncIntervalMinutes: 60,
  minimumRatingToDisplay: 4,
  maxReviewsToDisplay: 10,
  sortOrder: 'newest',
  showBusinessName: true,
  showOverallRating: true,
  showReviewCount: true,
  showAuthorPhotos: true,
  showAuthorNames: true,
  showTimestamps: true,
};

// ============================================================================
// API Response Types
// ============================================================================

export interface GoogleReviewsApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  notConfigured?: boolean;
  setup?: {
    message: string;
    variables: string[];
    instructions: string[];
  };
}

export interface GoogleReviewsStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number };
  fiveStarPercentage: number;
  fourStarPercentage: number;
  responseRate?: number;
  averageResponseTime?: string;
}
