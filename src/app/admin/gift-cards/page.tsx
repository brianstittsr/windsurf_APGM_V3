'use client';

import React, { useState, useEffect } from 'react';
import { GiftCard } from '@/types/database';
import { GiftCardService } from '@/services/giftCardService';
import { useAuth } from '@/hooks/useAuth';

export default function AdminGiftCardsPage() {
  const { isAuthenticated, userProfile } = useAuth();
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'redeemed' | 'expired'>('all');

  useEffect(() => {
    if (isAuthenticated && userProfile?.role === 'admin') {
      fetchGiftCards();
    }
  }, [isAuthenticated, userProfile]);

  const fetchGiftCards = async () => {
    try {
      setLoading(true);
      const cards = await GiftCardService.getAllGiftCards();
      setGiftCards(cards);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch gift cards');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this gift card?')) return;
    
    try {
      await GiftCardService.deactivateGiftCard(id);
      await fetchGiftCards();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate gift card');
    }
  };

  const filteredGiftCards = giftCards.filter(card => {
    const matchesSearch = 
      card.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.purchaserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.purchaserEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (card.recipientName && card.recipientName.toLowerCase().includes(searchTerm.toLowerCase()));

    const now = new Date();
    const isExpired = card.expirationDate && card.expirationDate.toDate() < now;

    switch (filterStatus) {
      case 'active':
        return matchesSearch && card.isActive && !card.isRedeemed && !isExpired;
      case 'redeemed':
        return matchesSearch && card.isRedeemed;
      case 'expired':
        return matchesSearch && isExpired;
      default:
        return matchesSearch;
    }
  });

  if (!isAuthenticated || userProfile?.role !== 'admin') {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <h4>Access Denied</h4>
          <p>You must be logged in as an administrator to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-0">Gift Card Management</h1>
            <a href="/gift-cards" className="btn btn-primary">
              <i className="fas fa-plus me-2"></i>
              Create New Gift Card
            </a>
          </div>

          {/* Filters */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by code, name, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                  >
                    <option value="all">All Gift Cards</option>
                    <option value="active">Active</option>
                    <option value="redeemed">Redeemed</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <button className="btn btn-outline-secondary w-100" onClick={fetchGiftCards}>
                    <i className="fas fa-refresh me-2"></i>
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Gift Cards Table */}
          <div className="card">
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="alert alert-danger">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Code</th>
                        <th>Amount</th>
                        <th>Remaining</th>
                        <th>Purchaser</th>
                        <th>Recipient</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Expires</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGiftCards.map((card) => {
                        const now = new Date();
                        const isExpired = card.expirationDate && card.expirationDate.toDate() < now;
                        
                        return (
                          <tr key={card.id}>
                            <td>
                              <code className="fw-bold">{card.code}</code>
                            </td>
                            <td>${(card.originalAmount / 100).toFixed(2)}</td>
                            <td>
                              <span className={card.remainingAmount > 0 ? 'text-success' : 'text-muted'}>
                                ${(card.remainingAmount / 100).toFixed(2)}
                              </span>
                            </td>
                            <td>
                              <div>
                                <strong>{card.purchaserName}</strong>
                                <br />
                                <small className="text-muted">{card.purchaserEmail}</small>
                              </div>
                            </td>
                            <td>
                              {card.recipientName ? (
                                <div>
                                  <strong>{card.recipientName}</strong>
                                  <br />
                                  <small className="text-muted">{card.recipientEmail}</small>
                                </div>
                              ) : (
                                <span className="text-muted">Self-purchase</span>
                              )}
                            </td>
                            <td>
                              {!card.isActive ? (
                                <span className="badge bg-secondary">Inactive</span>
                              ) : isExpired ? (
                                <span className="badge bg-warning">Expired</span>
                              ) : card.isRedeemed ? (
                                <span className="badge bg-success">Redeemed</span>
                              ) : (
                                <span className="badge bg-primary">Active</span>
                              )}
                            </td>
                            <td>
                              {card.createdAt.toDate().toLocaleDateString()}
                            </td>
                            <td>
                              {card.expirationDate 
                                ? card.expirationDate.toDate().toLocaleDateString()
                                : 'Never'
                              }
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                {card.isActive && (
                                  <button
                                    className="btn btn-outline-danger"
                                    onClick={() => handleDeactivate(card.id)}
                                    title="Deactivate"
                                  >
                                    <i className="fas fa-ban"></i>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  
                  {filteredGiftCards.length === 0 && (
                    <div className="text-center py-5 text-muted">
                      <i className="fas fa-gift fa-3x mb-3"></i>
                      <p>No gift cards found matching your criteria.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="row mt-4">
            <div className="col-md-3">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h6 className="card-title mb-0">Total Gift Cards</h6>
                      <h3 className="mb-0">{giftCards.length}</h3>
                    </div>
                    <i className="fas fa-gift fa-2x opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-success text-white">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h6 className="card-title mb-0">Active Cards</h6>
                      <h3 className="mb-0">
                        {giftCards.filter(c => c.isActive && !c.isRedeemed).length}
                      </h3>
                    </div>
                    <i className="fas fa-check-circle fa-2x opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-info text-white">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h6 className="card-title mb-0">Total Value</h6>
                      <h3 className="mb-0">
                        ${(giftCards.reduce((sum, c) => sum + c.originalAmount, 0) / 100).toFixed(0)}
                      </h3>
                    </div>
                    <i className="fas fa-dollar-sign fa-2x opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-warning text-white">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h6 className="card-title mb-0">Remaining Value</h6>
                      <h3 className="mb-0">
                        ${(giftCards.reduce((sum, c) => sum + c.remainingAmount, 0) / 100).toFixed(0)}
                      </h3>
                    </div>
                    <i className="fas fa-coins fa-2x opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
