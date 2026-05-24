/**
 * Google Reviews Firebase Service
 * Manages Google Reviews configuration and cached data in Firestore
 */

import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp,
  getDocs as firebaseGetDocs
} from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { 
  GoogleReviewsConfig, 
  CachedGoogleReviews, 
  GoogleReviewsSyncLog,
  GoogleReview,
  GoogleReviewsStats,
  defaultGoogleReviewsConfig 
} from '@/types/googleReviews';

// Collection names
const COLLECTIONS = {
  CONFIG: 'googleReviewsConfig',
  CACHED_REVIEWS: 'googleReviewsCache',
  SYNC_LOGS: 'googleReviewsSyncLogs'
};

// Document IDs
const DOCUMENTS = {
  CONFIG: 'main'
};

export class GoogleReviewsFirebaseService {
  
  // ============================================================================
  // Configuration Management
  // ============================================================================
  
  /**
   * Get the Google Reviews configuration from Firestore
   */
  static async getConfig(): Promise<GoogleReviewsConfig | null> {
    try {
      const db = getDb();
      if (!db) {
        console.error('Firebase not initialized');
        return null;
      }
      
      const docRef = doc(db, COLLECTIONS.CONFIG, DOCUMENTS.CONFIG);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as GoogleReviewsConfig;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting Google Reviews config:', error);
      return null;
    }
  }
  
  /**
   * Save or update the Google Reviews configuration
   */
  static async saveConfig(config: Partial<GoogleReviewsConfig>): Promise<boolean> {
    try {
      const db = getDb();
      if (!db) {
        console.error('Firebase not initialized');
        return false;
      }
      
      const docRef = doc(db, COLLECTIONS.CONFIG, DOCUMENTS.CONFIG);
      const docSnap = await getDoc(docRef);
      
      const now = new Date().toISOString();
      
      if (docSnap.exists()) {
        // Update existing
        await updateDoc(docRef, {
          ...config,
          updatedAt: now
        });
      } else {
        // Create new
        await setDoc(docRef, {
          ...defaultGoogleReviewsConfig,
          ...config,
          createdAt: now,
          updatedAt: now
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error saving Google Reviews config:', error);
      return false;
    }
  }
  
  /**
   * Initialize configuration with Place ID and business details
   */
  static async initializeConfig(
    placeId: string, 
    businessInfo: {
      businessName: string;
      formattedAddress?: string;
      formattedPhoneNumber?: string;
      website?: string;
      googleMapsUrl?: string;
      primaryType?: string;
    }
  ): Promise<boolean> {
    try {
      const db = getDb();
      if (!db) {
        console.error('Firebase not initialized');
        return false;
      }
      
      const now = new Date().toISOString();
      const docRef = doc(db, COLLECTIONS.CONFIG, DOCUMENTS.CONFIG);
      
      await setDoc(docRef, {
        ...defaultGoogleReviewsConfig,
        placeId,
        ...businessInfo,
        isActive: true,
        createdAt: now,
        updatedAt: now
      });
      
      console.log('✅ Google Reviews configuration initialized:', { placeId, businessName: businessInfo.businessName });
      return true;
    } catch (error) {
      console.error('Error initializing Google Reviews config:', error);
      return false;
    }
  }
  
  /**
   * Update the last sync information
   */
  static async updateLastSync(
    status: 'success' | 'error' | 'pending',
    reviews?: GoogleReview[],
    errorMessage?: string,
    stats?: { rating: number; userRatingsTotal: number }
  ): Promise<boolean> {
    try {
      const db = getDb();
      if (!db) return false;
      
      const docRef = doc(db, COLLECTIONS.CONFIG, DOCUMENTS.CONFIG);
      const updateData: any = {
        lastSyncAt: new Date().toISOString(),
        lastSyncStatus: status
      };
      
      if (status === 'success' && reviews) {
        updateData.lastSuccessfulReviews = reviews.slice(0, 20); // Keep last 20
      }
      
      if (errorMessage) {
        updateData.lastSyncError = errorMessage;
      } else {
        updateData.lastSyncError = null;
      }
      
      if (stats) {
        updateData.cachedRating = stats.rating;
        updateData.cachedUserRatingsTotal = stats.userRatingsTotal;
        updateData.cachedReviewCount = reviews?.length || 0;
      }
      
      await updateDoc(docRef, updateData);
      return true;
    } catch (error) {
      console.error('Error updating last sync:', error);
      return false;
    }
  }
  
  // ============================================================================
  // Cached Reviews Management
  // ============================================================================
  
  /**
   * Cache reviews data
   */
  static async cacheReviews(
    placeId: string,
    businessName: string,
    rating: number,
    userRatingsTotal: number,
    reviews: GoogleReview[],
    ttlMinutes: number = 60
  ): Promise<boolean> {
    try {
      const db = getDb();
      if (!db) return false;
      
      const now = new Date();
      const expiresAt = new Date(now.getTime() + ttlMinutes * 60000);
      
      // Calculate stats
      const stats = this.calculateStats(reviews);
      
      const cacheData: CachedGoogleReviews = {
        id: placeId,
        placeId,
        businessName,
        rating,
        userRatingsTotal,
        reviews,
        reviewStats: stats,
        fetchedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        isStale: false
      };
      
      const docRef = doc(db, COLLECTIONS.CACHED_REVIEWS, placeId);
      await setDoc(docRef, cacheData);
      
      return true;
    } catch (error) {
      console.error('Error caching reviews:', error);
      return false;
    }
  }
  
  /**
   * Get cached reviews
   */
  static async getCachedReviews(placeId: string): Promise<CachedGoogleReviews | null> {
    try {
      const db = getDb();
      if (!db) return null;
      
      const docRef = doc(db, COLLECTIONS.CACHED_REVIEWS, placeId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as CachedGoogleReviews;
        
        // Check if stale
        const expiresAt = new Date(data.expiresAt);
        const isStale = new Date() > expiresAt;
        
        return { ...data, isStale };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cached reviews:', error);
      return null;
    }
  }
  
  /**
   * Mark cached reviews as stale
   */
  static async markCacheStale(placeId: string): Promise<boolean> {
    try {
      const db = getDb();
      if (!db) return false;
      
      const docRef = doc(db, COLLECTIONS.CACHED_REVIEWS, placeId);
      await updateDoc(docRef, { isStale: true });
      
      return true;
    } catch (error) {
      console.error('Error marking cache stale:', error);
      return false;
    }
  }
  
  // ============================================================================
  // Sync Logs
  // ============================================================================
  
  /**
   * Log a sync operation
   */
  static async logSync(
    placeId: string,
    status: 'success' | 'error' | 'partial',
    details: {
      reviewsFetched: number;
      reviewsAdded?: number;
      reviewsUpdated?: number;
      reviewsRemoved?: number;
      errorMessage?: string;
      errorDetails?: string;
      startedAt: string;
      completedAt: string;
    }
  ): Promise<boolean> {
    try {
      const db = getDb();
      if (!db) return false;
      
      const startedAt = new Date(details.startedAt);
      const completedAt = new Date(details.completedAt);
      const durationMs = completedAt.getTime() - startedAt.getTime();
      
      const logData: Omit<GoogleReviewsSyncLog, 'id'> = {
        placeId,
        status,
        reviewsFetched: details.reviewsFetched,
        reviewsAdded: details.reviewsAdded || 0,
        reviewsUpdated: details.reviewsUpdated || 0,
        reviewsRemoved: details.reviewsRemoved || 0,
        errorMessage: details.errorMessage,
        errorDetails: details.errorDetails,
        startedAt: details.startedAt,
        completedAt: details.completedAt,
        durationMs
      };
      
      await addDoc(collection(db, COLLECTIONS.SYNC_LOGS), logData);
      
      return true;
    } catch (error) {
      console.error('Error logging sync:', error);
      return false;
    }
  }
  
  /**
   * Get recent sync logs
   */
  static async getRecentSyncLogs(
    placeId: string, 
    maxLogs: number = 10
  ): Promise<GoogleReviewsSyncLog[]> {
    try {
      const db = getDb();
      if (!db) return [];
      
      const q = query(
        collection(db, COLLECTIONS.SYNC_LOGS),
        where('placeId', '==', placeId),
        orderBy('startedAt', 'desc'),
        limit(maxLogs)
      );
      
      // Note: This requires a composite index in Firestore
      // If index doesn't exist, query will fail
      const querySnapshot = await firebaseGetDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          placeId: data.placeId,
          status: data.status,
          reviewsFetched: data.reviewsFetched,
          reviewsAdded: data.reviewsAdded,
          reviewsUpdated: data.reviewsUpdated,
          reviewsRemoved: data.reviewsRemoved,
          errorMessage: data.errorMessage,
          errorDetails: data.errorDetails,
          startedAt: data.startedAt,
          completedAt: data.completedAt,
          durationMs: data.durationMs
        } as GoogleReviewsSyncLog;
      });
    } catch (error) {
      console.error('Error getting sync logs:', error);
      return [];
    }
  }
  
  // ============================================================================
  // Helper Methods
  // ============================================================================
  
  /**
   * Calculate review statistics
   */
  private static calculateStats(reviews: GoogleReview[]): CachedGoogleReviews['reviewStats'] {
    const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;
    
    reviews.forEach(review => {
      const rating = Math.round(review.rating);
      if (rating >= 1 && rating <= 5) {
        distribution[rating]++;
      }
      totalRating += review.rating;
    });
    
    return {
      totalReviews: reviews.length,
      averageRating: reviews.length > 0 ? totalRating / reviews.length : 0,
      ratingDistribution: distribution
    };
  }
  
  /**
   * Check if configuration is valid and active
   */
  static async isConfigured(): Promise<{ 
    configured: boolean; 
    active: boolean; 
    placeId?: string;
    error?: string;
  }> {
    try {
      const config = await this.getConfig();
      
      if (!config) {
        return { configured: false, active: false, error: 'Configuration not found' };
      }
      
      if (!config.placeId) {
        return { configured: false, active: false, error: 'Place ID not set' };
      }
      
      if (!config.isActive) {
        return { configured: true, active: false, placeId: config.placeId, error: 'Integration is inactive' };
      }
      
      return { configured: true, active: true, placeId: config.placeId };
    } catch (error) {
      return { configured: false, active: false, error: 'Error checking configuration' };
    }
  }
  
  /**
   * Get formatted stats for display
   */
  static async getStats(): Promise<GoogleReviewsStats | null> {
    try {
      const config = await this.getConfig();
      if (!config || !config.placeId) return null;
      
      const cached = await this.getCachedReviews(config.placeId);
      if (!cached) return null;
      
      const { reviewStats } = cached;
      const total = reviewStats.totalReviews;
      
      return {
        totalReviews: total,
        averageRating: reviewStats.averageRating,
        ratingDistribution: reviewStats.ratingDistribution,
        fiveStarPercentage: total > 0 ? (reviewStats.ratingDistribution[5] / total) * 100 : 0,
        fourStarPercentage: total > 0 ? (reviewStats.ratingDistribution[4] / total) * 100 : 0
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return null;
    }
  }
  
  /**
   * Delete all Google Reviews data (for cleanup)
   */
  static async deleteAllData(): Promise<boolean> {
    try {
      const db = getDb();
      if (!db) return false;
      
      // Delete config
      await setDoc(doc(db, COLLECTIONS.CONFIG, DOCUMENTS.CONFIG), {});
      
      // Note: Deleting collections requires admin SDK
      // For now, just mark as deleted
      console.log('⚠️ To fully delete cached reviews and logs, use Firebase Console or Admin SDK');
      
      return true;
    } catch (error) {
      console.error('Error deleting data:', error);
      return false;
    }
  }
}

export default GoogleReviewsFirebaseService;
