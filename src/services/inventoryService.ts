import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  unitCost: number;
  supplier: string;
  category: string;
  lastRestocked: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SupplyRequest {
  id: string;
  requestedBy: string;
  requestedByName: string;
  items: SupplyRequestItem[];
  status: 'pending' | 'approved' | 'picked_up' | 'cancelled';
  requestDate: Timestamp;
  approvedDate?: Timestamp;
  pickedUpDate?: Timestamp;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SupplyRequestItem {
  inventoryItemId: string;
  itemName: string;
  quantityRequested: number;
  quantityApproved?: number;
  unitMultiplier: number; // Extracted from description (e.g., box of 50)
  totalUnitsRequested: number; // quantityRequested * unitMultiplier
  totalUnitsApproved?: number; // quantityApproved * unitMultiplier
}

export interface InventoryTransaction {
  id: string;
  inventoryItemId: string;
  itemName: string;
  type: 'restock' | 'request' | 'adjustment' | 'waste';
  quantity: number; // Positive for additions, negative for subtractions
  previousStock: number;
  newStock: number;
  reason: string;
  performedBy: string;
  performedByName: string;
  relatedRequestId?: string;
  timestamp: Timestamp;
}

export class InventoryService {
  // Get all inventory items
  static async getInventoryItems(): Promise<InventoryItem[]> {
    try {
      const inventoryRef = collection(db, 'inventory');
      const q = query(inventoryRef, orderBy('name'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as InventoryItem));
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      return [];
    }
  }

  // Get inventory item by ID
  static async getInventoryItem(id: string): Promise<InventoryItem | null> {
    try {
      const items = await this.getInventoryItems();
      return items.find(item => item.id === id) || null;
    } catch (error) {
      console.error('Error fetching inventory item:', error);
      return null;
    }
  }

  // Add or update inventory item
  static async saveInventoryItem(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docId = item.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const docRef = doc(db, 'inventory', docId);
      
      const now = Timestamp.now();
      await setDoc(docRef, {
        ...item,
        id: docId,
        createdAt: now,
        updatedAt: now
      }, { merge: true });
      
      return docId;
    } catch (error) {
      console.error('Error saving inventory item:', error);
      throw error;
    }
  }

  // Update inventory stock
  static async updateStock(itemId: string, newStock: number, reason: string, performedBy: string, performedByName: string): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        const itemRef = doc(db, 'inventory', itemId);
        const itemDoc = await transaction.get(itemRef);
        
        if (!itemDoc.exists()) {
          throw new Error('Inventory item not found');
        }
        
        const currentItem = itemDoc.data() as InventoryItem;
        const previousStock = currentItem.currentStock;
        const quantity = newStock - previousStock;
        
        // Update inventory item
        transaction.update(itemRef, {
          currentStock: newStock,
          updatedAt: Timestamp.now()
        });
        
        // Create transaction record
        const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const transactionRef = doc(db, 'inventoryTransactions', transactionId);
        
        const inventoryTransaction: InventoryTransaction = {
          id: transactionId,
          inventoryItemId: itemId,
          itemName: currentItem.name,
          type: quantity > 0 ? 'restock' : 'adjustment',
          quantity,
          previousStock,
          newStock,
          reason,
          performedBy,
          performedByName,
          timestamp: Timestamp.now()
        };
        
        transaction.set(transactionRef, inventoryTransaction);
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  }

  // Create supply request
  static async createSupplyRequest(request: Omit<SupplyRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const docRef = doc(db, 'supplyRequests', requestId);
      
      const now = Timestamp.now();
      const supplyRequest: SupplyRequest = {
        ...request,
        id: requestId,
        createdAt: now,
        updatedAt: now
      };
      
      await setDoc(docRef, supplyRequest);
      return requestId;
    } catch (error) {
      console.error('Error creating supply request:', error);
      throw error;
    }
  }

  // Get supply requests
  static async getSupplyRequests(userId?: string): Promise<SupplyRequest[]> {
    try {
      const requestsRef = collection(db, 'supplyRequests');
      let q = query(requestsRef, orderBy('requestDate', 'desc'));
      
      if (userId) {
        q = query(requestsRef, where('requestedBy', '==', userId), orderBy('requestDate', 'desc'));
      }
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SupplyRequest));
    } catch (error) {
      console.error('Error fetching supply requests:', error);
      return [];
    }
  }

  // Process pickup (subtract from inventory)
  static async processPickup(requestId: string, performedBy: string, performedByName: string): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        // Get the supply request
        const requestRef = doc(db, 'supplyRequests', requestId);
        const requestDoc = await transaction.get(requestRef);
        
        if (!requestDoc.exists()) {
          throw new Error('Supply request not found');
        }
        
        const request = requestDoc.data() as SupplyRequest;
        
        if (request.status !== 'approved') {
          throw new Error('Request must be approved before pickup');
        }
        
        // Process each item in the request
        for (const item of request.items) {
          const inventoryRef = doc(db, 'inventory', item.inventoryItemId);
          const inventoryDoc = await transaction.get(inventoryRef);
          
          if (!inventoryDoc.exists()) {
            throw new Error(`Inventory item ${item.itemName} not found`);
          }
          
          const inventoryItem = inventoryDoc.data() as InventoryItem;
          const unitsToSubtract = item.totalUnitsApproved || item.totalUnitsRequested;
          const newStock = inventoryItem.currentStock - unitsToSubtract;
          
          if (newStock < 0) {
            throw new Error(`Insufficient stock for ${item.itemName}. Available: ${inventoryItem.currentStock}, Requested: ${unitsToSubtract}`);
          }
          
          // Update inventory
          transaction.update(inventoryRef, {
            currentStock: newStock,
            updatedAt: Timestamp.now()
          });
          
          // Create transaction record
          const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const transactionRef = doc(db, 'inventoryTransactions', transactionId);
          
          const inventoryTransaction: InventoryTransaction = {
            id: transactionId,
            inventoryItemId: item.inventoryItemId,
            itemName: item.itemName,
            type: 'request',
            quantity: -unitsToSubtract,
            previousStock: inventoryItem.currentStock,
            newStock,
            reason: `Supply pickup - Request #${requestId}`,
            performedBy,
            performedByName,
            relatedRequestId: requestId,
            timestamp: Timestamp.now()
          };
          
          transaction.set(transactionRef, inventoryTransaction);
        }
        
        // Update request status
        transaction.update(requestRef, {
          status: 'picked_up',
          pickedUpDate: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      });
    } catch (error) {
      console.error('Error processing pickup:', error);
      throw error;
    }
  }

  // Approve supply request
  static async approveSupplyRequest(requestId: string, approvedItems: SupplyRequestItem[], performedBy: string): Promise<void> {
    try {
      const requestRef = doc(db, 'supplyRequests', requestId);
      await updateDoc(requestRef, {
        status: 'approved',
        approvedDate: Timestamp.now(),
        updatedAt: Timestamp.now(),
        items: approvedItems
      });
    } catch (error) {
      console.error('Error approving supply request:', error);
      throw error;
    }
  }

  // Get inventory transactions
  static async getInventoryTransactions(itemId?: string): Promise<InventoryTransaction[]> {
    try {
      const transactionsRef = collection(db, 'inventoryTransactions');
      let q = query(transactionsRef, orderBy('timestamp', 'desc'));
      
      if (itemId) {
        q = query(transactionsRef, where('inventoryItemId', '==', itemId), orderBy('timestamp', 'desc'));
      }
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as InventoryTransaction));
    } catch (error) {
      console.error('Error fetching inventory transactions:', error);
      return [];
    }
  }

  // Get low stock items
  static async getLowStockItems(): Promise<InventoryItem[]> {
    try {
      const items = await this.getInventoryItems();
      return items.filter(item => item.currentStock <= item.minStockLevel);
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      return [];
    }
  }

  // Initialize sample inventory data
  static async initializeSampleData(): Promise<void> {
    try {
      const sampleItems: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          name: 'Premium Pigment Bottles',
          description: 'High-quality semi-permanent makeup pigments (Available: 12 per box)',
          currentStock: 144, // 12 boxes * 12 bottles
          minStockLevel: 24,
          maxStockLevel: 200,
          unitCost: 15.50,
          supplier: 'Beauty Supply Co.',
          category: 'Pigments',
          lastRestocked: Timestamp.now()
        },
        {
          name: 'Needle Cartridges',
          description: 'Sterilized needle cartridges (50 per box)',
          currentStock: 500, // 10 boxes * 50 cartridges
          minStockLevel: 100,
          maxStockLevel: 1000,
          unitCost: 2.25,
          supplier: 'Medical Supplies Inc.',
          category: 'Needles',
          lastRestocked: Timestamp.now()
        },
        {
          name: 'Anesthetic Cream Tubes',
          description: 'Topical anesthetic cream (8 tubes per package)',
          currentStock: 32, // 4 packages * 8 tubes
          minStockLevel: 16,
          maxStockLevel: 80,
          unitCost: 8.75,
          supplier: 'Pharma Direct',
          category: 'Anesthetics',
          lastRestocked: Timestamp.now()
        },
        {
          name: 'Disposable Gloves',
          description: 'Nitrile disposable gloves (100 per box)',
          currentStock: 1000, // 10 boxes * 100 gloves
          minStockLevel: 200,
          maxStockLevel: 2000,
          unitCost: 0.15,
          supplier: 'Safety First Supplies',
          category: 'Safety',
          lastRestocked: Timestamp.now()
        }
      ];

      for (const item of sampleItems) {
        await this.saveInventoryItem(item);
      }

      console.log('Sample inventory data initialized');
    } catch (error) {
      console.error('Error initializing sample data:', error);
      throw error;
    }
  }
}
