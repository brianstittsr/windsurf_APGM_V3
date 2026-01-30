import { getDb } from '@/lib/firebase';
import { doc, setDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

type SyncLog = {
  id?: string;
  userId: string;
  type: 'google_calendar' | 'ghl' | 'website';
  action: 'create' | 'update' | 'delete' | 'sync' | 'error';
  status: 'success' | 'failed' | 'partial';
  details: string;
  eventId?: string;
  error?: string;
  timestamp: Date;
};

export class SyncLogger {
  static async log(syncData: Omit<SyncLog, 'timestamp'>): Promise<void> {
    const db = getDb();
    const logsCollection = collection(db, 'syncLogs');
    const logDoc = doc(logsCollection);
    
    await setDoc(logDoc, {
      ...syncData,
      timestamp: new Date()
    });
  }

  static async getRecentLogs(userId: string, limitCount: number = 10): Promise<SyncLog[]> {
    const db = getDb();
    const logsCollection = collection(db, 'syncLogs');
    const q = query(
      logsCollection,
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as SyncLog[];
  }
}
