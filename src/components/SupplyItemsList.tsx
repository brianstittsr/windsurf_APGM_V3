'use client';

import React, { useState, useEffect } from 'react';
import { InventoryService, InventoryItem, SupplyRequest, SupplyRequestItem } from '@/services/inventoryService';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface SupplyItem {
  id: string;
  inventoryItemId: string;
  name: string;
  description: string;
  quantity: number;
  availableCount: number; // Extracted from supply item field
  totalItems: number; // quantity * availableCount
  currentStock?: number; // From inventory
  minStockLevel?: number;
}

interface SupplyItemsListProps {
  items?: SupplyItem[];
  onItemsChange?: (items: SupplyItem[]) => void;
  showInventoryInfo?: boolean;
  allowRequests?: boolean;
}

// Function to extract available number from supply item field
const extractAvailableNumber = (description: string): number => {
  // Try different patterns to extract numbers
  const patterns = [
    /\b(\d+)\s*(?:count|pieces?|items?|pcs?|units?)\b/i,
    /\b(?:count|pieces?|items?|pcs?|units?)\s*(\d+)\b/i,
    /\b(\d+)\s*(?:per|in|available)\b/i,
    /\b(?:contains?|includes?)\s*(\d+)\b/i,
    /\((\d+)\)/,
    /\b(\d+)\b/
  ];

  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (num > 0 && num <= 1000) { // Reasonable range
        return num;
      }
    }
  }
  
  return 1; // Default to 1 if no number found
};

const SupplyItemsList: React.FC<SupplyItemsListProps> = ({ 
  items = [], 
  onItemsChange, 
  showInventoryInfo = false, 
  allowRequests = false 
}) => {
  const [supplyItems, setSupplyItems] = useState<SupplyItem[]>(items);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editQuantity, setEditQuantity] = useState(1);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestNote, setRequestNote] = useState('');

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Load inventory items if showing inventory info
  useEffect(() => {
    if (showInventoryInfo) {
      loadInventoryItems();
    }
  }, [showInventoryInfo]);

  // Update local state when props change
  useEffect(() => {
    setSupplyItems(items);
  }, [items]);

  // Calculate total items when items change
  useEffect(() => {
    const updatedItems = supplyItems.map(item => ({
      ...item,
      availableCount: extractAvailableNumber(item.description),
      totalItems: item.quantity * extractAvailableNumber(item.description)
    }));
    
    if (JSON.stringify(updatedItems) !== JSON.stringify(supplyItems)) {
      setSupplyItems(updatedItems);
      if (onItemsChange) {
        onItemsChange(updatedItems);
      }
    }
  }, [supplyItems, onItemsChange]);

  const loadInventoryItems = async () => {
    try {
      setLoading(true);
      const items = await InventoryService.getInventoryItems();
      setInventoryItems(items);
    } catch (error) {
      console.error('Error loading inventory items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    if (newItemName.trim() && newItemDescription.trim()) {
      const availableCount = extractAvailableNumber(newItemDescription);
      const newItem: SupplyItem = {
        id: Date.now().toString(),
        inventoryItemId: '', // Will be set when linked to inventory
        name: newItemName.trim(),
        description: newItemDescription.trim(),
        quantity: newItemQuantity,
        availableCount,
        totalItems: newItemQuantity * availableCount
      };
      
      const updatedItems = [...supplyItems, newItem];
      setSupplyItems(updatedItems);
      if (onItemsChange) {
        onItemsChange(updatedItems);
      }
      
      // Reset form
      setNewItemName('');
      setNewItemDescription('');
      setNewItemQuantity(1);
    }
  };

  const removeItem = (id: string) => {
    const updatedItems = supplyItems.filter(item => item.id !== id);
    setSupplyItems(updatedItems);
    if (onItemsChange) {
      onItemsChange(updatedItems);
    }
  };

  const startEdit = (item: SupplyItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditDescription(item.description);
    setEditQuantity(item.quantity);
  };

  const saveEdit = () => {
    if (editingId && editName.trim() && editDescription.trim()) {
      const availableCount = extractAvailableNumber(editDescription);
      const updatedItems = supplyItems.map(item => 
        item.id === editingId 
          ? {
              ...item,
              name: editName.trim(),
              description: editDescription.trim(),
              quantity: editQuantity,
              availableCount,
              totalItems: editQuantity * availableCount
            }
          : item
      );
      
      setSupplyItems(updatedItems);
      if (onItemsChange) {
        onItemsChange(updatedItems);
      }
      setEditingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditDescription('');
    setEditQuantity(1);
  };

  const submitSupplyRequest = async () => {
    if (!user || supplyItems.length === 0) return;

    try {
      setLoading(true);
      const requestItems: SupplyRequestItem[] = supplyItems.map(item => ({
        inventoryItemId: item.inventoryItemId || item.id,
        itemName: item.name,
        quantityRequested: item.quantity,
        unitMultiplier: item.availableCount,
        totalUnitsRequested: item.totalItems
      }));

      await InventoryService.createSupplyRequest({
        requestedBy: user.uid,
        requestedByName: user.displayName || user.email || 'Unknown User',
        items: requestItems,
        status: 'pending',
        requestDate: new Date() as any,
        notes: requestNote
      });

      alert('Supply request submitted successfully!');
      setShowRequestForm(false);
      setRequestNote('');
    } catch (error) {
      console.error('Error submitting supply request:', error);
      alert('Failed to submit supply request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getInventoryInfo = (item: SupplyItem) => {
    if (!showInventoryInfo) return null;
    const inventoryItem = inventoryItems.find(inv => 
      inv.id === item.inventoryItemId || inv.name.toLowerCase() === item.name.toLowerCase()
    );
    return inventoryItem;
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white border-0 pb-0">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="card-title text-primary fw-bold mb-1">
              <i className="fas fa-boxes me-2"></i>
              Requested Items List
            </h5>
            <p className="text-muted small mb-0">
              Manage supply items with automatic total calculation
            </p>
          </div>

        </div>
      </div>

      <div className="card-body">
        {supplyItems.length === 0 ? (
          <div className="text-center py-4">
            <i className="fas fa-box-open text-muted mb-3" style={{ fontSize: '3rem' }}></i>
            <p className="text-muted">No items added yet. Click "Add Item" to get started.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th scope="col">
                    <i className="fas fa-tag me-2"></i>
                    Item Name
                  </th>
                  <th scope="col">
                    <i className="fas fa-info-circle me-2"></i>
                    Supply Item Field
                  </th>
                  <th scope="col">
                    <i className="fas fa-calculator me-2"></i>
                    Quantity
                  </th>
                  <th scope="col">
                    <i className="fas fa-cubes me-2"></i>
                    Available Count
                  </th>
                  <th scope="col" className="bg-success bg-opacity-10">
                    <i className="fas fa-chart-bar me-2"></i>
                    Total Items
                  </th>
                  <th scope="col" style={{ width: '80px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {supplyItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={item.name}
                        onChange={(e) => {
                          const updatedItems = supplyItems.map(i => 
                            i.id === item.id ? { ...i, name: e.target.value } : i
                          );
                          setSupplyItems(updatedItems);
                          onItemsChange?.(updatedItems);
                        }}
                        placeholder="Enter item name"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={item.description}
                        onChange={(e) => {
                          const availableCount = extractAvailableNumber(e.target.value);
                          const updatedItems = supplyItems.map(i => 
                            i.id === item.id 
                              ? { ...i, description: e.target.value, availableCount, totalItems: i.quantity * availableCount }
                              : i
                          );
                          setSupplyItems(updatedItems);
                          if (onItemsChange) {
                            onItemsChange(updatedItems);
                          }
                        }}
                        placeholder="e.g., Available: 5, (3 available), Qty: 10"
                      />
                      <small className="text-muted">
                        Include available count in description
                      </small>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={item.quantity}
                        onChange={(e) => {
                          const quantity = parseInt(e.target.value) || 0;
                          const updatedItems = supplyItems.map(i => 
                            i.id === item.id 
                              ? { ...i, quantity, totalItems: quantity * i.availableCount }
                              : i
                          );
                          setSupplyItems(updatedItems);
                          if (onItemsChange) {
                            onItemsChange(updatedItems);
                          }
                        }}
                        min="0"
                        style={{ width: '80px' }}
                      />
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="badge bg-info rounded-pill me-2">
                          {item.availableCount}
                        </span>
                        <small className="text-muted">
                          (auto-extracted)
                        </small>
                      </div>
                    </td>
                    <td className="bg-success bg-opacity-10">
                      <div className="d-flex align-items-center">
                        <span className="badge bg-success rounded-pill fs-6 px-3 py-2">
                          {item.totalItems}
                        </span>
                        <small className="text-muted ms-2">
                          ({item.quantity} × {item.availableCount})
                        </small>
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => removeItem(item.id)}
                        title="Remove item"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add New Item Form */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card border-primary">
              <div className="card-header bg-primary text-white">
                <h6 className="mb-0">
                  <i className="fas fa-plus me-2"></i>
                  Add New Supply Item
                </h6>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label">Item Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="Enter item name"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Description (with count)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newItemDescription}
                      onChange={(e) => setNewItemDescription(e.target.value)}
                      placeholder="e.g., Box of 50 needles, Available: 10"
                    />
                    <small className="text-muted">Include count for auto-calculation</small>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Quantity</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newItemQuantity}
                      onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
                      min="1"
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">&nbsp;</label>
                    <div className="d-grid">
                      <button
                        className="btn btn-primary"
                        onClick={addItem}
                        disabled={!newItemName.trim() || !newItemDescription.trim()}
                      >
                        <i className="fas fa-plus me-2"></i>
                        Add Item
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        {supplyItems.length > 0 && (
          <div className="row mt-4">
            <div className="col-md-6 offset-md-6">
              <div className="card bg-light">
                <div className="card-body">
                  <h6 className="card-title text-primary">
                    <i className="fas fa-chart-pie me-2"></i>
                    Summary
                  </h6>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Total Items:</span>
                    <strong>{supplyItems.length}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Total Quantity:</span>
                    <strong>{supplyItems.reduce((sum, item) => sum + item.quantity, 0)}</strong>
                  </div>
                  <div className="d-flex justify-content-between border-top pt-2">
                    <span className="fw-bold">Grand Total:</span>
                    <strong className="text-success fs-5">
                      {supplyItems.reduce((sum, item) => sum + item.totalItems, 0)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Supply Request Section */}
        {allowRequests && user && supplyItems.length > 0 && (
          <div className="row mt-4">
            <div className="col-12">
              <div className="card border-success">
                <div className="card-header bg-success text-white">
                  <h6 className="mb-0">
                    <i className="fas fa-paper-plane me-2"></i>
                    Submit Supply Request
                  </h6>
                </div>
                <div className="card-body">
                  {!showRequestForm ? (
                    <div className="text-center">
                      <p className="mb-3">Ready to request these supplies?</p>
                      <button
                        className="btn btn-success"
                        onClick={() => setShowRequestForm(true)}
                      >
                        <i className="fas fa-paper-plane me-2"></i>
                        Create Supply Request
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-3">
                        <label className="form-label">Additional Notes</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={requestNote}
                          onChange={(e) => setRequestNote(e.target.value)}
                          placeholder="Any additional notes or special requirements..."
                        />
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-success"
                          onClick={submitSupplyRequest}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-check me-2"></i>
                              Submit Request
                            </>
                          )}
                        </button>
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => setShowRequestForm(false)}
                          disabled={loading}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplyItemsList;
export type { SupplyItem };
