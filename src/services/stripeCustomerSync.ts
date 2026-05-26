import Stripe from 'stripe';
import { getDb } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { User } from '@/types/user';

export interface StripeCustomerSync {
  customerId?: string;
  lastSyncAt?: Timestamp;
  syncStatus: 'pending' | 'synced' | 'error';
  syncError?: string;
  totalSpent?: number;
  transactionCount?: number;
  lastTransactionAt?: Timestamp;
}

export interface TransactionRecord {
  id: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
  description?: string;
  metadata?: Record<string, string>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class StripeCustomerSyncService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-08-27'
    });
  }

  /**
   * Sync a Firebase user with Stripe Customer
   */
  async syncUserWithStripe(user: User): Promise<StripeCustomerSync> {
    try {
      const userRef = doc(getDb(), 'users', user.id);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found in Firebase');
      }

      const userData = userDoc.data();
      let stripeCustomerId = userData.stripeCustomerId;

      // Create or update Stripe customer
      if (!stripeCustomerId) {
        const customer = await this.stripe.customers.create({
          email: user.profile.email,
          name: `${user.profile.firstName} ${user.profile.lastName}`,
          phone: user.profile.phone,
          address: {
            line1: user.profile.address,
            city: user.profile.city,
            state: user.profile.state,
            postal_code: user.profile.zipCode
          },
          metadata: {
            firebaseUserId: user.id,
            role: user.role,
            createdAt: user.profile.createdAt.toDate().toISOString()
          }
        });
        stripeCustomerId = customer.id;
      } else {
        // Update existing customer
        await this.stripe.customers.update(stripeCustomerId, {
          email: user.profile.email,
          name: `${user.profile.firstName} ${user.profile.lastName}`,
          phone: user.profile.phone,
          address: {
            line1: user.profile.address,
            city: user.profile.city,
            state: user.profile.state,
            postal_code: user.profile.zipCode
          }
        });
      }

      // Update Firebase user with Stripe customer ID
      await updateDoc(userRef, {
        stripeCustomerId,
        stripeSyncStatus: 'synced' as const,
        stripeLastSyncAt: Timestamp.now()
      });

      // Sync transaction history
      await this.syncCustomerTransactions(user.id, stripeCustomerId);

      return {
        customerId: stripeCustomerId,
        lastSyncAt: Timestamp.now(),
        syncStatus: 'synced'
      };

    } catch (error) {
      console.error('Error syncing user with Stripe:', error);
      
      // Update Firebase with error status
      await updateDoc(doc(getDb(), 'users', user.id), {
        stripeSyncStatus: 'error' as const,
        stripeSyncError: error instanceof Error ? error.message : 'Unknown error',
        stripeLastSyncAt: Timestamp.now()
      });

      return {
        syncStatus: 'error',
        syncError: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Sync transaction history from Stripe to Firebase
   */
  async syncCustomerTransactions(userId: string, stripeCustomerId: string): Promise<void> {
    try {
      // Get all charges for this customer
      const charges = await this.stripe.charges.list({
        customer: stripeCustomerId,
        limit: 100
      });

      const transactionsRef = collection(getDb(), 'users', userId, 'transactions');
      let totalSpent = 0;
      let transactionCount = 0;
      let lastTransactionAt: Timestamp | null = null;

      for (const charge of charges.data) {
        const transactionData: TransactionRecord = {
          id: charge.id,
          stripePaymentIntentId: charge.payment_intent as string,
          amount: charge.amount,
          currency: charge.currency,
          status: charge.status,
          description: charge.description,
          metadata: charge.metadata,
          createdAt: Timestamp.fromDate(new Date(charge.created * 1000)),
          updatedAt: Timestamp.now()
        };

        await setDoc(doc(transactionsRef, charge.id), transactionData, { merge: true });

        totalSpent += charge.amount;
        transactionCount++;
        
        const chargeDate = Timestamp.fromDate(new Date(charge.created * 1000));
        if (!lastTransactionAt || chargeDate > lastTransactionAt) {
          lastTransactionAt = chargeDate;
        }
      }

      // Update user's transaction summary
      await updateDoc(doc(getDb(), 'users', userId), {
        stripeTotalSpent: totalSpent,
        stripeTransactionCount: transactionCount,
        stripeLastTransactionAt: lastTransactionAt
      });

    } catch (error) {
      console.error('Error syncing transactions:', error);
      throw error;
    }
  }

  /**
   * Get transaction history for a user
   */
  async getUserTransactions(userId: string): Promise<TransactionRecord[]> {
    try {
      const transactionsRef = collection(getDb(), 'users', userId, 'transactions');
      const snapshot = await getDocs(transactionsRef);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TransactionRecord));
    } catch (error) {
      console.error('Error getting user transactions:', error);
      return [];
    }
  }

  /**
   * Handle Stripe webhook events for customer updates
   */
  async handleCustomerWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'customer.updated':
          await this.handleCustomerUpdated(event.data.object as Stripe.Customer);
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        case 'charge.succeeded':
          await this.handleChargeSucceeded(event.data.object as Stripe.Charge);
          break;
        default:
          console.log(`Unhandled webhook event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  private async handleCustomerUpdated(customer: Stripe.Customer): Promise<void> {
    const firebaseUserId = customer.metadata?.firebaseUserId;
    if (!firebaseUserId) return;

    const userRef = doc(getDb(), 'users', firebaseUserId);
    await updateDoc(userRef, {
      stripeCustomerId: customer.id,
      stripeEmail: customer.email,
      stripeName: customer.name,
      stripePhone: customer.phone,
      stripeLastSyncAt: Timestamp.now()
    });
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    if (!invoice.customer) return;
    
    const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer.id;
    
    // Find user by Stripe customer ID
    const usersRef = collection(getDb(), 'users');
    const q = query(usersRef, where('stripeCustomerId', '==', customerId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return;
    
    const userId = snapshot.docs[0].id;
    await this.syncCustomerTransactions(userId, customerId);
  }

  private async handleChargeSucceeded(charge: Stripe.Charge): Promise<void> {
    if (!charge.customer) return;
    
    const customerId = typeof charge.customer === 'string' ? charge.customer : charge.customer.id;
    
    // Find user by Stripe customer ID
    const usersRef = collection(getDb(), 'users');
    const q = query(usersRef, where('stripeCustomerId', '==', customerId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return;
    
    const userId = snapshot.docs[0].id;
    
    // Add transaction record
    const transactionData: TransactionRecord = {
      id: charge.id,
      stripePaymentIntentId: charge.payment_intent as string,
      amount: charge.amount,
      currency: charge.currency,
      status: charge.status,
      description: charge.description,
      metadata: charge.metadata,
      createdAt: Timestamp.fromDate(new Date(charge.created * 1000)),
      updatedAt: Timestamp.now()
    };

    await setDoc(doc(getDb(), 'users', userId, 'transactions', charge.id), transactionData);
    
    // Update user's transaction summary
    await updateDoc(doc(getDb(), 'users', userId), {
      stripeTotalSpent: charge.amount,
      stripeTransactionCount: 1,
      stripeLastTransactionAt: Timestamp.fromDate(new Date(charge.created * 1000))
    }, { merge: true });
  }

  /**
   * Bulk sync all users without Stripe customer IDs
   */
  async bulkSyncUsers(): Promise<{ synced: number; errors: number }> {
    const usersRef = collection(getDb(), 'users');
    const q = query(usersRef, where('role', '==', 'client'));
    const snapshot = await getDocs(q);
    
    let synced = 0;
    let errors = 0;

    for (const userDoc of snapshot.docs) {
      try {
        const user = {
          id: userDoc.id,
          ...userDoc.data()
        } as User;
        
        await this.syncUserWithStripe(user);
        synced++;
      } catch (error) {
        console.error(`Error syncing user ${userDoc.id}:`, error);
        errors++;
      }
    }

    return { synced, errors };
  }
}

export const stripeCustomerSyncService = new StripeCustomerSyncService();
