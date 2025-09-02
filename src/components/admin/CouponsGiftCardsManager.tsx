'use client';

import { useState, useEffect } from 'react';
import { GiftCardService, DatabaseService } from '@/services/database';
import { GiftCard } from '@/types/database';
import { Timestamp } from 'firebase/firestore';

interface CouponCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  usageLimit?: number;
  usageCount: number;
  expirationDate?: any;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
  description: string;
}

export default function CouponsGiftCardsManager() {
  const [activeSection, setActiveSection] = useState<'coupons' | 'giftcards'>('coupons');
  const [coupons, setCoupons] = useState<CouponCode[]>([]);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [showGiftCardForm, setShowGiftCardForm] = useState(false);

  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    minOrderAmount: 0,
    maxUses: 0,
    expiresAt: '',
    isActive: true
  });

  const [giftCardForm, setGiftCardForm] = useState({
    code: '',
    initialAmount: 0,
    purchaserEmail: '',
    recipientEmail: '',
    recipientName: '',
    message: '',
    expiresAt: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load coupons and gift cards from database
      const [couponData, giftCardData] = await Promise.all([
        DatabaseService.getAll<CouponCode>('coupons'),
        DatabaseService.getAll<GiftCard>('giftCards')
      ]);
      setCoupons(couponData);
      setGiftCards(giftCardData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await DatabaseService.create('coupons', {
        ...couponForm,
        expirationDate: couponForm.expiresAt ? Timestamp.fromDate(new Date(couponForm.expiresAt)) : null,
        type: couponForm.discountType,
        value: couponForm.discountValue,
        description: `${couponForm.code} - ${couponForm.discountType === 'percentage' ? couponForm.discountValue + '%' : '$' + couponForm.discountValue} off`,
        isActive: couponForm.isActive,
        usageLimit: couponForm.maxUses || null,
        usageCount: 0,
        minOrderAmount: couponForm.minOrderAmount || 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      setShowCouponForm(false);
      setCouponForm({
        code: '',
        discountType: 'percentage',
        discountValue: 0,
        minOrderAmount: 0,
        maxUses: 0,
        expiresAt: '',
        isActive: true
      });
      loadData();
    } catch (error) {
      console.error('Error creating coupon:', error);
    }
  };

  const handleCreateGiftCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await DatabaseService.create('giftCards', {
        code: giftCardForm.code,
        amount: giftCardForm.initialAmount,
        remainingBalance: giftCardForm.initialAmount,
        purchasedBy: giftCardForm.purchaserEmail,
        purchasedFor: giftCardForm.recipientEmail,
        expiresAt: giftCardForm.expiresAt ? Timestamp.fromDate(new Date(giftCardForm.expiresAt)) : undefined,
        isActive: true,
        usageHistory: []
      });
      setShowGiftCardForm(false);
      setGiftCardForm({
        code: '',
        initialAmount: 0,
        purchaserEmail: '',
        recipientEmail: '',
        recipientName: '',
        message: '',
        expiresAt: ''
      });
      loadData();
    } catch (error) {
      console.error('Error creating gift card:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading coupons and gift cards...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm bg-gradient" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="card-body text-white p-4">
              <h2 className="card-title mb-2 fw-bold">
                <i className="fas fa-gift me-3"></i>
                Coupons & Gift Cards Management
              </h2>
              <p className="card-text mb-0 opacity-75">
                Create and manage discount coupons and gift cards for your customers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section Toggle */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="btn-group w-100" role="group">
                <button
                  type="button"
                  className={`btn btn-lg py-3 ${activeSection === 'coupons' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setActiveSection('coupons')}
                >
                  <i className="fas fa-percentage me-2"></i>
                  Discount Coupons ({coupons.length})
                </button>
                <button
                  type="button"
                  className={`btn btn-lg py-3 ${activeSection === 'giftcards' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setActiveSection('giftcards')}
                >
                  <i className="fas fa-credit-card me-2"></i>
                  Gift Cards ({giftCards.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons Section */}
      {activeSection === 'coupons' && (
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-primary text-white border-0">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold">
                    <i className="fas fa-percentage me-2"></i>
                    Discount Coupons
                  </h5>
                  <button
                    className="btn btn-light btn-sm rounded-pill"
                    onClick={() => setShowCouponForm(true)}
                  >
                    <i className="fas fa-plus me-1"></i>
                    Add Coupon
                  </button>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Code</th>
                        <th>Discount</th>
                        <th>Usage</th>
                        <th>Expires</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map((coupon) => (
                        <tr key={coupon.id}>
                          <td>
                            <span className="badge bg-dark fs-6">{coupon.code}</span>
                          </td>
                          <td>
                            {coupon.type === 'percentage' 
                              ? `${coupon.value}%` 
                              : `$${coupon.value}`}
                          </td>
                          <td>
                            <span className="text-muted">
                              {coupon.usageCount}/{coupon.usageLimit || '∞'}
                            </span>
                          </td>
                          <td>
                            {coupon.expirationDate 
                              ? coupon.expirationDate.toDate().toLocaleDateString()
                              : 'No expiry'}
                          </td>
                          <td>
                            <span className={`badge ${coupon.isActive ? 'bg-success' : 'bg-secondary'}`}>
                              {coupon.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary me-1">
                              <i className="fas fa-edit"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-danger">
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gift Cards Section */}
      {activeSection === 'giftcards' && (
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-success text-white border-0">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold">
                    <i className="fas fa-credit-card me-2"></i>
                    Gift Cards
                  </h5>
                  <button
                    className="btn btn-light btn-sm rounded-pill"
                    onClick={() => setShowGiftCardForm(true)}
                  >
                    <i className="fas fa-plus me-1"></i>
                    Add Gift Card
                  </button>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Code</th>
                        <th>Balance</th>
                        <th>Recipient</th>
                        <th>Expires</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {giftCards.map((card) => (
                        <tr key={card.id}>
                          <td>
                            <span className="badge bg-success fs-6">{card.code}</span>
                          </td>
                          <td>
                            <strong>${card.remainingBalance}</strong>
                            <small className="text-muted">/${card.amount}</small>
                          </td>
                          <td>
                            <div>
                              <div className="fw-semibold">{card.recipientName}</div>
                              <small className="text-muted">{card.recipientEmail}</small>
                            </div>
                          </td>
                          <td>
                            {card.expiresAt 
                              ? card.expiresAt.toDate().toLocaleDateString()
                              : 'No expiry'}
                          </td>
                          <td>
                            <span className={`badge ${card.isActive ? 'bg-success' : 'bg-secondary'}`}>
                              {card.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary me-1">
                              <i className="fas fa-edit"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-danger">
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Form Modal */}
      {showCouponForm && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white border-0">
                <h5 className="modal-title fw-bold">
                  <i className="fas fa-percentage me-2"></i>
                  Create New Coupon
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowCouponForm(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateCoupon}>
                <div className="modal-body bg-light">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        <i className="fas fa-tag me-1 text-primary"></i>
                        Coupon Code *
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg border-2"
                        value={couponForm.code}
                        onChange={(e) => setCouponForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        placeholder="SAVE20"
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label fw-semibold">
                        <i className="fas fa-calculator me-1 text-info"></i>
                        Discount Type
                      </label>
                      <select
                        className="form-select form-select-lg border-2"
                        value={couponForm.discountType}
                        onChange={(e) => setCouponForm(prev => ({ ...prev, discountType: e.target.value as 'percentage' | 'fixed' }))}
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount ($)</option>
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label fw-semibold">
                        <i className="fas fa-dollar-sign me-1 text-success"></i>
                        Value *
                      </label>
                      <input
                        type="number"
                        className="form-control form-control-lg border-2"
                        value={couponForm.discountValue}
                        onChange={(e) => setCouponForm(prev => ({ ...prev, discountValue: Number(e.target.value) }))}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                  <div className="row g-3 mt-2">
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">
                        <i className="fas fa-shopping-cart me-1 text-warning"></i>
                        Min Order Amount
                      </label>
                      <input
                        type="number"
                        className="form-control form-control-lg border-2"
                        value={couponForm.minOrderAmount}
                        onChange={(e) => setCouponForm(prev => ({ ...prev, minOrderAmount: Number(e.target.value) }))}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">
                        <i className="fas fa-users me-1 text-secondary"></i>
                        Max Uses
                      </label>
                      <input
                        type="number"
                        className="form-control form-control-lg border-2"
                        value={couponForm.maxUses}
                        onChange={(e) => setCouponForm(prev => ({ ...prev, maxUses: Number(e.target.value) }))}
                        min="0"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">
                        <i className="fas fa-calendar me-1 text-danger"></i>
                        Expires At
                      </label>
                      <input
                        type="date"
                        className="form-control form-control-lg border-2"
                        value={couponForm.expiresAt}
                        onChange={(e) => setCouponForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="card border-primary border-2">
                      <div className="card-body bg-primary bg-opacity-10">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            checked={couponForm.isActive}
                            onChange={(e) => setCouponForm(prev => ({ ...prev, isActive: e.target.checked }))}
                            style={{ transform: 'scale(1.5)' }}
                          />
                          <label className="form-check-label fw-semibold text-dark ms-2">
                            <i className="fas fa-toggle-on me-1 text-primary"></i>
                            Active (available for use)
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light border-0 p-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-lg rounded-pill px-4 me-3"
                    onClick={() => setShowCouponForm(false)}
                  >
                    <i className="fas fa-times me-2"></i>Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg rounded-pill px-4 shadow"
                  >
                    <i className="fas fa-plus me-2"></i>Create Coupon
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Gift Card Form Modal */}
      {showGiftCardForm && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-success text-white border-0">
                <h5 className="modal-title fw-bold">
                  <i className="fas fa-credit-card me-2"></i>
                  Create New Gift Card
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowGiftCardForm(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateGiftCard}>
                <div className="modal-body bg-light">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        <i className="fas fa-barcode me-1 text-success"></i>
                        Gift Card Code *
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg border-2"
                        value={giftCardForm.code}
                        onChange={(e) => setGiftCardForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        placeholder="GC-XXXX-XXXX"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        <i className="fas fa-dollar-sign me-1 text-success"></i>
                        Amount *
                      </label>
                      <input
                        type="number"
                        className="form-control form-control-lg border-2"
                        value={giftCardForm.initialAmount}
                        onChange={(e) => setGiftCardForm(prev => ({ ...prev, initialAmount: Number(e.target.value) }))}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                  <div className="row g-3 mt-2">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        <i className="fas fa-user me-1 text-primary"></i>
                        Purchaser Email *
                      </label>
                      <input
                        type="email"
                        className="form-control form-control-lg border-2"
                        value={giftCardForm.purchaserEmail}
                        onChange={(e) => setGiftCardForm(prev => ({ ...prev, purchaserEmail: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        <i className="fas fa-gift me-1 text-info"></i>
                        Recipient Email *
                      </label>
                      <input
                        type="email"
                        className="form-control form-control-lg border-2"
                        value={giftCardForm.recipientEmail}
                        onChange={(e) => setGiftCardForm(prev => ({ ...prev, recipientEmail: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="row g-3 mt-2">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        <i className="fas fa-user-tag me-1 text-secondary"></i>
                        Recipient Name *
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg border-2"
                        value={giftCardForm.recipientName}
                        onChange={(e) => setGiftCardForm(prev => ({ ...prev, recipientName: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        <i className="fas fa-calendar me-1 text-danger"></i>
                        Expires At
                      </label>
                      <input
                        type="date"
                        className="form-control form-control-lg border-2"
                        value={giftCardForm.expiresAt}
                        onChange={(e) => setGiftCardForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-comment me-1 text-warning"></i>
                      Personal Message
                    </label>
                    <textarea
                      className="form-control form-control-lg border-2"
                      rows={3}
                      value={giftCardForm.message}
                      onChange={(e) => setGiftCardForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Add a personal message for the recipient..."
                    />
                  </div>
                </div>
                <div className="modal-footer bg-light border-0 p-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-lg rounded-pill px-4 me-3"
                    onClick={() => setShowGiftCardForm(false)}
                  >
                    <i className="fas fa-times me-2"></i>Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success btn-lg rounded-pill px-4 shadow"
                  >
                    <i className="fas fa-credit-card me-2"></i>Create Gift Card
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
