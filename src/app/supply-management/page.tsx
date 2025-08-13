'use client';

import React, { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import SupplyItemsList, { SupplyItem } from '../../components/SupplyItemsList';

export default function SupplyManagement() {
  const [sampleItems, setSampleItems] = useState<SupplyItem[]>([
    {
      id: '1',
      inventoryItemId: 'inv_needles_001',
      name: 'Disposable Needles',
      description: 'Box of 50 sterile needles',
      quantity: 2,
      availableCount: 50,
      totalItems: 100
    },
    {
      id: '2',
      inventoryItemId: 'inv_pigment_001',
      name: 'Pigment Bottles',
      description: 'Available: 12 bottles',
      quantity: 3,
      availableCount: 12,
      totalItems: 36
    },
    {
      id: '3',
      inventoryItemId: 'inv_gloves_001',
      name: 'Gloves',
      description: 'Pack contains 100 pieces',
      quantity: 1,
      availableCount: 100,
      totalItems: 100
    }
  ]);

  const handleItemsChange = (items: SupplyItem[]) => {
    setSampleItems(items);
    // Here you could save to database or perform other actions
    console.log('Supply items updated:', items);
  };

  return (
    <>
      <Header />
      <div className="container-fluid" style={{ paddingTop: '140px', minHeight: '100vh' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12">
              {/* Page Header */}
              <div className="text-center mb-5">
                <h1 className="display-5 fw-bold text-primary mb-3">
                  <i className="fas fa-warehouse me-3"></i>
                  Supply Management
                </h1>
                <p className="lead text-muted">
                  Manage your supply items with automatic total calculation based on available quantities
                </p>
              </div>

              {/* How It Works Section */}
              <div className="row mb-5">
                <div className="col-lg-12">
                  <div className="card border-0 shadow-sm bg-light">
                    <div className="card-body">
                      <h5 className="text-primary fw-bold mb-3">
                        <i className="fas fa-info-circle me-2"></i>
                        How It Works
                      </h5>
                      <div className="row">
                        <div className="col-md-4">
                          <div className="d-flex align-items-start">
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                                 style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}>
                              1
                            </div>
                            <div>
                              <h6 className="fw-bold">Enter Supply Item Field</h6>
                              <p className="small text-muted mb-0">
                                Include available count in description like "Available: 5", "(10 available)", or "Qty: 8"
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="d-flex align-items-start">
                            <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                                 style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}>
                              2
                            </div>
                            <div>
                              <h6 className="fw-bold">Auto-Extract Number</h6>
                              <p className="small text-muted mb-0">
                                The system automatically extracts the available count from your description
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="d-flex align-items-start">
                            <div className="bg-info text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                                 style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}>
                              3
                            </div>
                            <div>
                              <h6 className="fw-bold">Calculate Total</h6>
                              <p className="small text-muted mb-0">
                                Total items = Quantity × Available Count (automatically calculated)
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Supply Items List */}
              <SupplyItemsList
                items={sampleItems}
                onItemsChange={handleItemsChange}
                showInventoryInfo={true}
                allowRequests={true}
              />

              {/* Example Patterns */}
              <div className="row mt-5">
                <div className="col-lg-8 offset-lg-2">
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-0">
                      <h6 className="text-primary fw-bold mb-0">
                        <i className="fas fa-lightbulb me-2"></i>
                        Supported Description Patterns
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <h6 className="fw-bold text-success">✅ Recognized Patterns:</h6>
                          <ul className="list-unstyled small">
                            <li><code>Available: 5</code></li>
                            <li><code>(10 available)</code></li>
                            <li><code>Qty: 8</code></li>
                            <li><code>Quantity: 15</code></li>
                            <li><code>Stock: 20</code></li>
                            <li><code>Count: 12</code></li>
                            <li><code>(25)</code> - number in parentheses</li>
                          </ul>
                        </div>
                        <div className="col-md-6">
                          <h6 className="fw-bold text-info">💡 Examples:</h6>
                          <ul className="list-unstyled small">
                            <li>"Premium pigment bottles (Available: 12)"</li>
                            <li>"Needle cartridges - Box contains (50) units"</li>
                            <li>"Anesthetic cream tubes Qty: 8"</li>
                            <li>"Disposable gloves Stock: 100"</li>
                            <li>"Sterilization pouches Count: 25"</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
