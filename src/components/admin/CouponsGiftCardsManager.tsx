'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { CouponService } from '../../services/couponService';
import { GiftCardService } from '../../services/giftCardService';
import { GiftCard, CouponCode } from '../../types/coupons';

interface CouponFormData {
  code: string;
  description: string;
  type: 'percentage' | 'fixed' | 'free_service' | 'exact_amount';
  value: number;
  exactAmount?: number;
  minOrderAmount?: number;
  usageLimit?: number;
  expirationDate: string; // YYYY-MM-DD format for input
  applicableServices: string;
  isActive: boolean;
  removeDepositOption?: boolean;
  depositReduction?: number;
}

interface GiftCardFormData {
  initialAmount: number;
  recipientEmail: string;
  recipientName: string;
  purchaserEmail: string;
  purchaserName: string;
  message: string;
  expirationDate: string; // YYYY-MM-DD format for input
  isActive: boolean;
}

export default function CouponsGiftCardsManager() {
  const [coupons, setCoupons] = useState<CouponCode[]>([]);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'coupons' | 'giftcards'>('coupons');

  // Coupon form states
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponCode | null>(null);
  const [couponFormData, setCouponFormData] = useState<CouponFormData>({
    code: '',
    description: '',
    type: 'percentage',
    value: 0,
    exactAmount: 0,
    minOrderAmount: 0,
    usageLimit: 0,
    expirationDate: '',
    applicableServices: '',
    isActive: true,
    removeDepositOption: false,
    depositReduction: 0
  });

  // Gift card form states
  const [showGiftCardModal, setShowGiftCardModal] = useState(false);
  const [editingGiftCard, setEditingGiftCard] = useState<GiftCard | null>(null);
  const [giftCardFormData, setGiftCardFormData] = useState<GiftCardFormData>({
    initialAmount: 0,
    recipientEmail: '',
    recipientName: '',
    purchaserEmail: '',
    purchaserName: '',
    message: '',
    expirationDate: '',
    isActive: true
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([fetchCoupons(), fetchGiftCards()]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      const couponsList = await CouponService.getAllCoupons();
      setCoupons(couponsList);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

  const fetchGiftCards = async () => {
    try {
      const giftCardsList = await GiftCardService.getAllGiftCards();
      setGiftCards(giftCardsList);
    } catch (error) {
      console.error('Error fetching gift cards:', error);
    }
  };

  // Coupon CRUD operations
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponFormData.code || !couponFormData.description) {
      alert('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const couponData = {
        code: couponFormData.code.toUpperCase(),
        description: couponFormData.description,
        type: couponFormData.type,
        value: couponFormData.type === 'free_service' ? 100 : couponFormData.value,
        exactAmount: couponFormData.exactAmount || 0,
        minOrderAmount: couponFormData.minOrderAmount || 0,
        usageLimit: couponFormData.usageLimit || 0,
        expirationDate: new Date(couponFormData.expirationDate),
        applicableServices: couponFormData.applicableServices ? couponFormData.applicableServices.split(',').map(s => s.trim()) : [],
        isActive: couponFormData.isActive,
        removeDepositOption: couponFormData.removeDepositOption || false,
        depositReduction: couponFormData.depositReduction || 0
      };

      await CouponService.createCoupon(couponData);
      alert('Coupon created successfully!');
      closeCouponModal();
      fetchCoupons();
    } catch (error) {
      console.error('Error creating coupon:', error);
      alert('Error creating coupon. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;

    setSubmitting(true);
    try {
      const updateData = {
        description: couponFormData.description,
        type: couponFormData.type,
        value: couponFormData.type === 'free_service' ? 100 : couponFormData.value,
        exactAmount: couponFormData.exactAmount || 0,
        minOrderAmount: couponFormData.minOrderAmount || 0,
        usageLimit: couponFormData.usageLimit || 0,
        expirationDate: new Date(couponFormData.expirationDate),
        applicableServices: couponFormData.applicableServices ? couponFormData.applicableServices.split(',').map(s => s.trim()) : [],
        isActive: couponFormData.isActive,
        removeDepositOption: couponFormData.removeDepositOption || false,
        depositReduction: couponFormData.depositReduction || 0
      };

      await CouponService.updateCoupon(editingCoupon.id, updateData);
      alert('Coupon updated successfully!');
      closeCouponModal();
      fetchCoupons();
    } catch (error) {
      console.error('Error updating coupon:', error);
      alert('Error updating coupon. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (couponId: string, couponCode: string) => {
    if (!confirm(`Are you sure you want to delete the coupon "${couponCode}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await CouponService.deleteCoupon(couponId);
      alert('Coupon deleted successfully!');
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('Error deleting coupon. Please try again.');
    }
  };

  // Gift Card CRUD operations
  const handleCreateGiftCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftCardFormData.recipientEmail || !giftCardFormData.recipientName) {
      alert('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const giftCardData = {
        initialAmount: giftCardFormData.initialAmount,
        remainingAmount: giftCardFormData.initialAmount,
        recipientEmail: giftCardFormData.recipientEmail,
        recipientName: giftCardFormData.recipientName,
        purchaserEmail: giftCardFormData.purchaserEmail,
        purchaserName: giftCardFormData.purchaserName,
        message: giftCardFormData.message,
        expirationDate: new Date(giftCardFormData.expirationDate),
        isRedeemed: false,
        isActive: giftCardFormData.isActive
      };

      await GiftCardService.createGiftCard(giftCardData);
      alert('Gift card created successfully!');
      closeGiftCardModal();
      fetchGiftCards();
    } catch (error) {
      console.error('Error creating gift card:', error);
      alert('Error creating gift card. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditGiftCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGiftCard) return;

    setSubmitting(true);
    try {
      const updateData = {
        recipientEmail: giftCardFormData.recipientEmail,
        recipientName: giftCardFormData.recipientName,
        purchaserEmail: giftCardFormData.purchaserEmail,
        purchaserName: giftCardFormData.purchaserName,
        message: giftCardFormData.message,
        expirationDate: new Date(giftCardFormData.expirationDate),
        isActive: giftCardFormData.isActive
      };

      await GiftCardService.updateGiftCard(editingGiftCard.id, updateData);
      alert('Gift card updated successfully!');
      closeGiftCardModal();
      fetchGiftCards();
    } catch (error) {
      console.error('Error updating gift card:', error);
      alert('Error updating gift card. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGiftCard = async (giftCardId: string, giftCardCode: string) => {
    if (!confirm(`Are you sure you want to delete the gift card "${giftCardCode}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await GiftCardService.deleteGiftCard(giftCardId);
      alert('Gift card deleted successfully!');
      fetchGiftCards();
    } catch (error) {
      console.error('Error deleting gift card:', error);
      alert('Error deleting gift card. Please try again.');
    }
  };

  // Modal handlers
  const openCreateCouponModal = () => {
    setEditingCoupon(null);
    setCouponFormData({
      code: '',
      description: '',
      type: 'percentage',
      value: 0,
      exactAmount: 0,
      minOrderAmount: 0,
      usageLimit: 0,
      expirationDate: '',
      applicableServices: '',
      isActive: true,
      removeDepositOption: false,
      depositReduction: 0
    });
    setShowCouponModal(true);
  };

  const openEditCouponModal = (coupon: CouponCode) => {
    setEditingCoupon(coupon);
    setCouponFormData({
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
      exactAmount: coupon.exactAmount || 0,
      minOrderAmount: coupon.minOrderAmount || 0,
      usageLimit: coupon.usageLimit || 0,
      expirationDate: coupon.expirationDate ? (coupon.expirationDate as any).toDate().toISOString().split('T')[0] : '',
      applicableServices: coupon.applicableServices?.join(', ') || '',
      isActive: coupon.isActive,
      removeDepositOption: coupon.removeDepositOption || false,
      depositReduction: coupon.depositReduction || 0
    });
    setShowCouponModal(true);
  };

  const openCreateGiftCardModal = () => {
    setEditingGiftCard(null);
    setGiftCardFormData({
      initialAmount: 0,
      recipientEmail: '',
      recipientName: '',
      purchaserEmail: '',
      purchaserName: '',
      message: '',
      expirationDate: '',
      isActive: true
    });
    setShowGiftCardModal(true);
  };

  const openEditGiftCardModal = (giftCard: GiftCard) => {
    setEditingGiftCard(giftCard);
    setGiftCardFormData({
      initialAmount: giftCard.initialAmount,
      recipientEmail: giftCard.recipientEmail,
      recipientName: giftCard.recipientName,
      purchaserEmail: giftCard.purchaserEmail,
      purchaserName: giftCard.purchaserName,
      message: giftCard.message || '',
      expirationDate: giftCard.expirationDate ? (giftCard.expirationDate as any).toDate().toISOString().split('T')[0] : '',
      isActive: giftCard.isActive
    });
    setShowGiftCardModal(true);
  };

  const closeCouponModal = () => {
    setShowCouponModal(false);
    setEditingCoupon(null);
  };

  const closeGiftCardModal = () => {
    setShowGiftCardModal(false);
    setEditingGiftCard(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getCouponTypeBadge = (type: string) => {
    switch (type) {
      case 'percentage': return 'badge bg-primary';
      case 'fixed': return 'badge bg-success';
      case 'free_service': return 'badge bg-warning';
      case 'exact_amount': return 'badge bg-info';
      default: return 'badge bg-secondary';
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
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h4>Coupons & Gift Cards Management</h4>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-tabs" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'coupons' ? 'active' : ''}`}
                onClick={() => setActiveTab('coupons')}
              >
                <i className="fas fa-tags me-2"></i>Coupons ({coupons.length})
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'giftcards' ? 'active' : ''}`}
                onClick={() => setActiveTab('giftcards')}
              >
                <i className="fas fa-gift me-2"></i>Gift Cards ({giftCards.length})
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Coupons Tab */}
      {activeTab === 'coupons' && (
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Coupon Codes</h5>
              <button
                className="btn btn-primary"
                onClick={openCreateCouponModal}
              >
                <i className="fas fa-plus me-2"></i>Add Coupon
              </button>
            </div>

            <div className="card">
              <div className="card-body">
                {coupons.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-tags fa-3x text-muted mb-3"></i>
                    <p className="text-muted">No coupons found.</p>
                    <button
                      className="btn btn-primary"
                      onClick={openCreateCouponModal}
                    >
                      Add First Coupon
                    </button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Description</th>
                          <th>Type</th>
                          <th>Value</th>
                          <th>Usage</th>
                          <th>Expires</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coupons.map((coupon) => (
                          <tr key={coupon.id}>
                            <td><code>{coupon.code}</code></td>
                            <td>{coupon.description}</td>
                            <td>
                              <span className={getCouponTypeBadge(coupon.type)}>
                                {coupon.type.replace('_', ' ').toUpperCase()}
                              </span>
                            </td>
                            <td>
                              {coupon.type === 'percentage' ? `${coupon.value}%` :
                               coupon.type === 'fixed' ? formatCurrency(coupon.value) :
                               coupon.type === 'free_service' ? 'FREE SERVICE' :
                               formatCurrency(coupon.exactAmount || 0)}
                            </td>
                            <td>{coupon.usageCount}/{coupon.usageLimit || '∞'}</td>
                            <td>{coupon.expirationDate ? (coupon.expirationDate as any).toDate().toLocaleDateString() : ''}</td>
                            <td>
                              <span className={`badge ${coupon.isActive ? 'bg-success' : 'bg-warning'}`}>
                                {coupon.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group" role="group">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => openEditCouponModal(coupon)}
                                  title="Edit Coupon"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                                  title="Delete Coupon"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gift Cards Tab */}
      {activeTab === 'giftcards' && (
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Gift Cards</h5>
              <button
                className="btn btn-success"
                onClick={openCreateGiftCardModal}
              >
                <i className="fas fa-plus me-2"></i>Add Gift Card
              </button>
            </div>

            <div className="card">
              <div className="card-body">
                {giftCards.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-gift fa-3x text-muted mb-3"></i>
                    <p className="text-muted">No gift cards found.</p>
                    <button
                      className="btn btn-success"
                      onClick={openCreateGiftCardModal}
                    >
                      Add First Gift Card
                    </button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Recipient</th>
                          <th>Initial Amount</th>
                          <th>Remaining</th>
                          <th>Expires</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {giftCards.map((giftCard) => (
                          <tr key={giftCard.id}>
                            <td><code>{giftCard.code}</code></td>
                            <td>
                              <div>
                                <strong>{giftCard.recipientName}</strong><br />
                                <small className="text-muted">{giftCard.recipientEmail}</small>
                              </div>
                            </td>
                            <td>{formatCurrency(giftCard.initialAmount)}</td>
                            <td>{formatCurrency(giftCard.remainingAmount)}</td>
                            <td>{giftCard.expirationDate ? (giftCard.expirationDate as any).toDate().toLocaleDateString() : ''}</td>
                            <td>
                              <span className={`badge ${giftCard.isRedeemed ? 'bg-warning' : giftCard.isActive ? 'bg-success' : 'bg-danger'}`}>
                                {giftCard.isRedeemed ? 'Redeemed' : giftCard.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group" role="group">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => openEditGiftCardModal(giftCard)}
                                  title="Edit Gift Card"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteGiftCard(giftCard.id, giftCard.code)}
                                  title="Delete Gift Card"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                </h5>
                <button type="button" className="btn-close" onClick={closeCouponModal}></button>
              </div>
              <form onSubmit={editingCoupon ? handleEditCoupon : handleCreateCoupon}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="couponCode" className="form-label">
                          Code <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="couponCode"
                          value={couponFormData.code}
                          onChange={(e) => setCouponFormData({ ...couponFormData, code: e.target.value.toUpperCase() })}
                          required
                          disabled={!!editingCoupon}
                          placeholder="SUMMER2024"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="couponType" className="form-label">Type</label>
                        <select
                          className="form-select"
                          id="couponType"
                          value={couponFormData.type}
                          onChange={(e) => setCouponFormData({ ...couponFormData, type: e.target.value as any })}
                        >
                          <option value="percentage">Percentage Discount</option>
                          <option value="fixed">Fixed Amount</option>
                          <option value="free_service">Free Service</option>
                          <option value="exact_amount">Exact Amount</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="couponDescription" className="form-label">
                      Description <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="couponDescription"
                      value={couponFormData.description}
                      onChange={(e) => setCouponFormData({ ...couponFormData, description: e.target.value })}
                      required
                      placeholder="Summer sale discount"
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="couponValue" className="form-label">
                          {couponFormData.type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="couponValue"
                          value={couponFormData.value}
                          onChange={(e) => setCouponFormData({ ...couponFormData, value: parseFloat(e.target.value) || 0 })}
                          disabled={couponFormData.type === 'free_service'}
                          min="0"
                          step={couponFormData.type === 'percentage' ? '1' : '0.01'}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="expirationDate" className="form-label">
                          Expiration Date <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          id="expirationDate"
                          value={couponFormData.expirationDate}
                          onChange={(e) => setCouponFormData({ ...couponFormData, expirationDate: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="usageLimit" className="form-label">Usage Limit</label>
                        <input
                          type="number"
                          className="form-control"
                          id="usageLimit"
                          value={couponFormData.usageLimit}
                          onChange={(e) => setCouponFormData({ ...couponFormData, usageLimit: parseInt(e.target.value) || 0 })}
                          min="0"
                          placeholder="Leave empty for unlimited"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="minOrderAmount" className="form-label">Minimum Order Amount ($)</label>
                        <input
                          type="number"
                          className="form-control"
                          id="minOrderAmount"
                          value={couponFormData.minOrderAmount}
                          onChange={(e) => setCouponFormData({ ...couponFormData, minOrderAmount: parseFloat(e.target.value) || 0 })}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="applicableServices" className="form-label">
                      Applicable Services (comma-separated)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="applicableServices"
                      value={couponFormData.applicableServices}
                      onChange={(e) => setCouponFormData({ ...couponFormData, applicableServices: e.target.value })}
                      placeholder="eyeliner, microblading, lips"
                    />
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="isActive"
                        checked={couponFormData.isActive}
                        onChange={(e) => setCouponFormData({ ...couponFormData, isActive: e.target.checked })}
                      />
                      <label className="form-check-label" htmlFor="isActive">
                        Active
                      </label>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="removeDepositOption"
                        checked={couponFormData.removeDepositOption || false}
                        onChange={(e) => setCouponFormData({ ...couponFormData, removeDepositOption: e.target.checked })}
                      />
                      <label className="form-check-label" htmlFor="removeDepositOption">
                        Remove $50 Deposit Option
                      </label>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="depositReduction" className="form-label">Deposit Reduction ($)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="depositReduction"
                      value={couponFormData.depositReduction || 0}
                      onChange={(e) => setCouponFormData({ ...couponFormData, depositReduction: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                      placeholder="Amount to subtract from deposit"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeCouponModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        {editingCoupon ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      editingCoupon ? 'Update Coupon' : 'Create Coupon'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Gift Card Modal */}
      {showGiftCardModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingGiftCard ? 'Edit Gift Card' : 'Create New Gift Card'}
                </h5>
                <button type="button" className="btn-close" onClick={closeGiftCardModal}></button>
              </div>
              <form onSubmit={editingGiftCard ? handleEditGiftCard : handleCreateGiftCard}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="initialAmount" className="form-label">
                          Initial Amount ($) <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="initialAmount"
                          value={giftCardFormData.initialAmount}
                          onChange={(e) => setGiftCardFormData({ ...giftCardFormData, initialAmount: parseFloat(e.target.value) || 0 })}
                          required
                          min="0"
                          step="0.01"
                          disabled={!!editingGiftCard}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="expirationDate" className="form-label">
                          Expiration Date <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          id="expirationDate"
                          value={giftCardFormData.expirationDate}
                          onChange={(e) => setGiftCardFormData({ ...giftCardFormData, expirationDate: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="recipientName" className="form-label">
                          Recipient Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="recipientName"
                          value={giftCardFormData.recipientName}
                          onChange={(e) => setGiftCardFormData({ ...giftCardFormData, recipientName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="recipientEmail" className="form-label">
                          Recipient Email <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="recipientEmail"
                          value={giftCardFormData.recipientEmail}
                          onChange={(e) => setGiftCardFormData({ ...giftCardFormData, recipientEmail: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="purchaserName" className="form-label">Purchaser Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="purchaserName"
                          value={giftCardFormData.purchaserName}
                          onChange={(e) => setGiftCardFormData({ ...giftCardFormData, purchaserName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="purchaserEmail" className="form-label">Purchaser Email</label>
                        <input
                          type="email"
                          className="form-control"
                          id="purchaserEmail"
                          value={giftCardFormData.purchaserEmail}
                          onChange={(e) => setGiftCardFormData({ ...giftCardFormData, purchaserEmail: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="message" className="form-label">Personal Message</label>
                    <textarea
                      className="form-control"
                      id="message"
                      value={giftCardFormData.message}
                      onChange={(e) => setGiftCardFormData({ ...giftCardFormData, message: e.target.value })}
                      rows={3}
                      placeholder="Add a personal message for the recipient..."
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeGiftCardModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success" disabled={submitting}>
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        {editingGiftCard ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      editingGiftCard ? 'Update Gift Card' : 'Create Gift Card'
                    )}
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
