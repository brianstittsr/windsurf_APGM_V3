'use client';

import React, { useState, useEffect } from 'react';
import { InventoryService, InventoryItem, SupplyRequest } from '@/services/inventoryService';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function InventoryManagement() {
  const [user, setUser] = useState<User | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [supplyRequests, setSupplyRequests] = useState<SupplyRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'requests'>('inventory');

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Load data
  useEffect(() => {
    if (user) {
      loadInventoryData();
      loadSupplyRequests();
    }
  }, [user]);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      const items = await InventoryService.getInventoryItems();
      setInventoryItems(items);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSupplyRequests = async () => {
    try {
      const requests = await InventoryService.getSupplyRequests();
      setSupplyRequests(requests);
    } catch (error) {
      console.error('Error loading supply requests:', error);
    }
  };

  const initializeSampleData = async () => {
    try {
      setLoading(true);
      await InventoryService.initializeSampleInventory();
      await loadInventoryData();
      alert('Sample inventory data initialized successfully!');
    } catch (error) {
      console.error('Error initializing sample data:', error);
      alert('Failed to initialize sample data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (requestId: string) => {
    try {
      await InventoryService.approveSupplyRequest(requestId);
      await loadSupplyRequests();
      alert('Supply request approved!');
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request. Please try again.');
    }
  };

  const processPickup = async (requestId: string) => {
    try {
      await InventoryService.processSupplyPickup(requestId);
      await loadSupplyRequests();
      await loadInventoryData(); // Refresh inventory after pickup
      alert('Supply pickup processed! Inventory has been updated.');
    } catch (error) {
      console.error('Error processing pickup:', error);
      alert('Failed to process pickup. Please try again.');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning';
      case 'approved': return 'bg-success';
      case 'picked_up': return 'bg-info';
      case 'cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const getStockLevelClass = (current: number, min: number) => {
    if (current <= min) return 'text-danger';
    if (current <= min * 2) return 'text-warning';
    return 'text-success';
  };

  if (!user) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body text-center">
                <h5 className="card-title">Authentication Required</h5>
                <p className="card-text">Please log in to access inventory management.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 mb-1">
                <i className="fas fa-warehouse me-2 text-primary"></i>
                Inventory Management
              </h1>
              <p className="text-muted">Manage inventory items and supply requests</p>
            </div>
            <button
              className="btn btn-outline-primary"
              onClick={initializeSampleData}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Loading...
                </>
              ) : (
                <>
                  <i className="fas fa-database me-2"></i>
                  Initialize Sample Data
                </>
              )}
            </button>
          </div>

          {/* Navigation Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'inventory' ? 'active' : ''}`}
                onClick={() => setActiveTab('inventory')}
              >
                <i className="fas fa-boxes me-2"></i>
                Inventory Items ({inventoryItems.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'requests' ? 'active' : ''}`}
                onClick={() => setActiveTab('requests')}
              >
                <i className="fas fa-clipboard-list me-2"></i>
                Supply Requests ({supplyRequests.length})
              </button>
            </li>
          </ul>

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-inventory me-2"></i>
                  Current Inventory
                </h5>
              </div>
              <div className="card-body">
                {inventoryItems.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-box-open text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                    <h5 className="text-muted">No inventory items found</h5>
                    <p className="text-muted">Click "Initialize Sample Data" to get started.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Item Name</th>
                          <th>Description</th>
                          <th>Current Stock</th>
                          <th>Min Level</th>
                          <th>Status</th>
                          <th>Last Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventoryItems.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <strong>{item.name}</strong>
                            </td>
                            <td>{item.description}</td>
                            <td>
                              <span className={`fw-bold ${getStockLevelClass(item.currentStock, item.minStockLevel)}`}>
                                {item.currentStock}
                              </span>
                            </td>
                            <td>{item.minStockLevel}</td>
                            <td>
                              {item.currentStock <= item.minStockLevel ? (
                                <span className="badge bg-danger">Low Stock</span>
                              ) : item.currentStock <= item.minStockLevel * 2 ? (
                                <span className="badge bg-warning">Low</span>
                              ) : (
                                <span className="badge bg-success">Good</span>
                              )}
                            </td>
                            <td>
                              <small className="text-muted">
                                {item.updatedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                              </small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Supply Requests Tab */}
          {activeTab === 'requests' && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-clipboard-list me-2"></i>
                  Supply Requests
                </h5>
              </div>
              <div className="card-body">
                {supplyRequests.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-clipboard text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                    <h5 className="text-muted">No supply requests found</h5>
                    <p className="text-muted">Supply requests will appear here when submitted.</p>
                  </div>
                ) : (
                  <div className="row">
                    {supplyRequests.map((request) => (
                      <div key={request.id} className="col-md-6 col-lg-4 mb-4">
                        <div className="card h-100">
                          <div className="card-header d-flex justify-content-between align-items-center">
                            <small className="text-muted">#{request.id.slice(-8)}</small>
                            <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                              {request.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <div className="card-body">
                            <h6 className="card-title">{request.requestedByName}</h6>
                            <p className="card-text">
                              <small className="text-muted">
                                Requested: {request.requestDate?.toDate?.()?.toLocaleDateString() || 'N/A'}
                              </small>
                            </p>
                            
                            <div className="mb-3">
                              <strong>Items:</strong>
                              <ul className="list-unstyled mt-1">
                                {request.items.map((item, index) => (
                                  <li key={index} className="small">
                                    • {item.itemName} - {item.totalUnitsRequested} units
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {request.notes && (
                              <div className="mb-3">
                                <strong>Notes:</strong>
                                <p className="small text-muted">{request.notes}</p>
                              </div>
                            )}
                          </div>
                          <div className="card-footer">
                            {request.status === 'pending' && (
                              <button
                                className="btn btn-success btn-sm me-2"
                                onClick={() => approveRequest(request.id)}
                              >
                                <i className="fas fa-check me-1"></i>
                                Approve
                              </button>
                            )}
                            {request.status === 'approved' && (
                              <button
                                className="btn btn-info btn-sm"
                                onClick={() => processPickup(request.id)}
                              >
                                <i className="fas fa-truck me-1"></i>
                                Process Pickup
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
