'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ============================================================================
// Types
// ============================================================================

interface LoyaltyMember {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  referralCode: string;
  qrCodeUrl?: string;
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalSpent: number;
  totalReferrals: number;
  successfulReferrals: number;
  rewards: Reward[];
}

interface Reward {
  id: string;
  type: string;
  name: string;
  description: string;
  pointsCost: number;
  value: number;
  code?: string;
  redeemed: boolean;
  redeemedAt?: Date;
  expiresAt?: Date;
}

interface LoyaltyStats {
  totalMembers: number;
  activeMembers: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  totalReferrals: number;
  successfulReferrals: number;
  conversionRate: number;
  topReferrers: Array<{ name: string; referrals: number; points: number }>;
  tierDistribution: Record<string, number>;
}

interface LoyaltyTier {
  name: string;
  minPoints: number;
  pointsMultiplier: number;
  perks: string[];
  color: string;
}

interface RewardCatalogItem {
  type: string;
  name: string;
  description: string;
  pointsCost: number;
  value: number;
}

// ============================================================================
// Component
// ============================================================================

export default function LoyaltyDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'rewards' | 'settings'>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Data
  const [stats, setStats] = useState<LoyaltyStats | null>(null);
  const [members, setMembers] = useState<LoyaltyMember[]>([]);
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [rewardsCatalog, setRewardsCatalog] = useState<RewardCatalogItem[]>([]);

  // Selected member for details
  const [selectedMember, setSelectedMember] = useState<LoyaltyMember | null>(null);

  // New member form
  const [newMemberForm, setNewMemberForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: ''
  });

  // --------------------------------------------------------------------------
  // Load Data
  // --------------------------------------------------------------------------

  useEffect(() => {
    loadTiers();
    loadRewardsCatalog();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/loyalty?action=stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/loyalty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list_members' })
      });
      const data = await res.json();
      if (data.success) {
        setMembers(data.members);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTiers = async () => {
    try {
      const res = await fetch('/api/loyalty?action=tiers');
      const data = await res.json();
      if (data.success) {
        setTiers(data.tiers);
      }
    } catch (err) {
      console.error('Error loading tiers:', err);
    }
  };

  const loadRewardsCatalog = async () => {
    try {
      const res = await fetch('/api/loyalty?action=rewards');
      const data = await res.json();
      if (data.success) {
        setRewardsCatalog(data.rewards);
      }
    } catch (err) {
      console.error('Error loading rewards:', err);
    }
  };

  // --------------------------------------------------------------------------
  // Actions
  // --------------------------------------------------------------------------

  const createMember = async () => {
    if (!newMemberForm.clientName || !newMemberForm.clientEmail) {
      setError('Name and email are required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/loyalty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_member',
          clientId: `client_${Date.now()}`,
          ...newMemberForm
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Member created successfully!');
        setNewMemberForm({ clientName: '', clientEmail: '', clientPhone: '' });
        loadMembers();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addPoints = async (memberId: string, points: number) => {
    try {
      const res = await fetch('/api/loyalty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_points',
          memberId,
          points,
          reason: 'Manual adjustment'
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Added ${points} points!`);
        loadMembers();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const downloadCard = async (memberId: string, type: 'loyalty' | 'referral') => {
    try {
      const res = await fetch('/api/loyalty/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: type === 'loyalty' ? 'generate_loyalty_card' : 'generate_referral_card',
          memberId
        })
      });

      if (!res.ok) throw new Error('Failed to generate card');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-card.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const downloadAllCards = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/loyalty/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_all' })
      });

      if (!res.ok) throw new Error('Failed to generate cards');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'all-loyalty-cards.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
      setSuccess('Cards downloaded!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------

  const getTierColor = (tier: string): string => {
    const colors: Record<string, string> = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2'
    };
    return colors[tier] || '#666';
  };

  const getTierBadgeClass = (tier: string): string => {
    const classes: Record<string, string> = {
      bronze: 'bg-amber-100 text-amber-800',
      silver: 'bg-gray-200 text-gray-800',
      gold: 'bg-yellow-100 text-yellow-800',
      platinum: 'bg-slate-100 text-slate-800 border border-slate-300'
    };
    return classes[tier] || 'bg-gray-100 text-gray-800';
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <div className="loyalty-dashboard">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="fas fa-gift me-2 text-primary"></i>
          Loyalty Program
        </h2>
        <div>
          <button 
            className="btn btn-outline-primary me-2"
            onClick={() => { loadStats(); loadMembers(); }}
          >
            <i className="fas fa-sync-alt me-2"></i>
            Refresh
          </button>
          <button 
            className="btn btn-primary"
            onClick={downloadAllCards}
            disabled={loading}
          >
            <i className="fas fa-download me-2"></i>
            Download All Cards
          </button>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => { setActiveTab('overview'); loadStats(); }}
          >
            <i className="fas fa-chart-pie me-2"></i>
            Overview
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => { setActiveTab('members'); loadMembers(); }}
          >
            <i className="fas fa-users me-2"></i>
            Members
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'rewards' ? 'active' : ''}`}
            onClick={() => setActiveTab('rewards')}
          >
            <i className="fas fa-star me-2"></i>
            Rewards
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <i className="fas fa-cog me-2"></i>
            Settings
          </button>
        </li>
      </ul>

      {/* Alerts */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}
      {success && (
        <div className="alert alert-success alert-dismissible fade show">
          <i className="fas fa-check-circle me-2"></i>
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess(null)}></button>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : stats ? (
            <>
              {/* Stats Cards */}
              <div className="row mb-4">
                <div className="col-md-3">
                  <div className="card bg-primary text-white h-100">
                    <div className="card-body text-center">
                      <div className="display-4">{stats.totalMembers}</div>
                      <p className="mb-0">Total Members</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-success text-white h-100">
                    <div className="card-body text-center">
                      <div className="display-4">{stats.activeMembers}</div>
                      <p className="mb-0">Active (30 days)</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-info text-white h-100">
                    <div className="card-body text-center">
                      <div className="display-4">{stats.totalPointsIssued.toLocaleString()}</div>
                      <p className="mb-0">Points Issued</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-warning text-dark h-100">
                    <div className="card-body text-center">
                      <div className="display-4">{stats.conversionRate.toFixed(1)}%</div>
                      <p className="mb-0">Referral Conversion</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                {/* Tier Distribution */}
                <div className="col-md-6 mb-4">
                  <div className="card h-100">
                    <div className="card-header">
                      <h5 className="mb-0">Tier Distribution</h5>
                    </div>
                    <div className="card-body">
                      {Object.entries(stats.tierDistribution).map(([tier, count]) => (
                        <div key={tier} className="d-flex align-items-center mb-3">
                          <span 
                            className="badge me-3" 
                            style={{ 
                              backgroundColor: getTierColor(tier),
                              width: '80px'
                            }}
                          >
                            {tier.toUpperCase()}
                          </span>
                          <div className="progress flex-grow-1" style={{ height: '25px' }}>
                            <div
                              className="progress-bar"
                              style={{ 
                                width: `${stats.totalMembers > 0 ? (count / stats.totalMembers) * 100 : 0}%`,
                                backgroundColor: getTierColor(tier)
                              }}
                            >
                              {count} members
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top Referrers */}
                <div className="col-md-6 mb-4">
                  <div className="card h-100">
                    <div className="card-header">
                      <h5 className="mb-0">Top Referrers</h5>
                    </div>
                    <div className="card-body p-0">
                      {stats.topReferrers.length > 0 ? (
                        <table className="table table-hover mb-0">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Name</th>
                              <th>Referrals</th>
                              <th>Points</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats.topReferrers.map((referrer, idx) => (
                              <tr key={idx}>
                                <td>
                                  {idx === 0 && <i className="fas fa-trophy text-warning"></i>}
                                  {idx === 1 && <i className="fas fa-medal text-secondary"></i>}
                                  {idx === 2 && <i className="fas fa-award text-warning"></i>}
                                  {idx > 2 && idx + 1}
                                </td>
                                <td>{referrer.name}</td>
                                <td>{referrer.referrals}</td>
                                <td>{referrer.points.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-muted text-center py-4">No referrals yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Referral Stats */}
              <div className="row">
                <div className="col-md-4">
                  <div className="card">
                    <div className="card-body text-center">
                      <h3>{stats.totalReferrals}</h3>
                      <p className="text-muted mb-0">Total Referrals</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card">
                    <div className="card-body text-center">
                      <h3>{stats.successfulReferrals}</h3>
                      <p className="text-muted mb-0">Successful Referrals</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card">
                    <div className="card-body text-center">
                      <h3>{stats.totalPointsRedeemed.toLocaleString()}</h3>
                      <p className="text-muted mb-0">Points Redeemed</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-5">
              <button className="btn btn-primary" onClick={loadStats}>
                Load Statistics
              </button>
            </div>
          )}
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div>
          {/* Add Member Form */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Add New Member</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Name"
                    value={newMemberForm.clientName}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, clientName: e.target.value })}
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Email"
                    value={newMemberForm.clientEmail}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, clientEmail: e.target.value })}
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="Phone (optional)"
                    value={newMemberForm.clientPhone}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, clientPhone: e.target.value })}
                  />
                </div>
                <div className="col-md-3">
                  <button 
                    className="btn btn-primary w-100"
                    onClick={createMember}
                    disabled={loading}
                  >
                    <i className="fas fa-plus me-2"></i>
                    Add Member
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Members List */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : members.length > 0 ? (
            <div className="card">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Member</th>
                        <th>Tier</th>
                        <th>Points</th>
                        <th>Referral Code</th>
                        <th>Referrals</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map(member => (
                        <tr key={member.id}>
                          <td>
                            <strong>{member.clientName}</strong>
                            <br />
                            <small className="text-muted">{member.clientEmail}</small>
                          </td>
                          <td>
                            <span className={`badge ${getTierBadgeClass(member.tier)}`}>
                              {member.tier.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <strong>{member.points.toLocaleString()}</strong>
                          </td>
                          <td>
                            <code>{member.referralCode}</code>
                          </td>
                          <td>
                            {member.successfulReferrals} / {member.totalReferrals}
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => setSelectedMember(member)}
                                title="View Details"
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <button
                                className="btn btn-outline-success"
                                onClick={() => addPoints(member.id, 50)}
                                title="Add 50 Points"
                              >
                                <i className="fas fa-plus"></i>
                              </button>
                              <button
                                className="btn btn-outline-info"
                                onClick={() => downloadCard(member.id, 'loyalty')}
                                title="Download Loyalty Card"
                              >
                                <i className="fas fa-id-card"></i>
                              </button>
                              <button
                                className="btn btn-outline-warning"
                                onClick={() => downloadCard(member.id, 'referral')}
                                title="Download Referral Card"
                              >
                                <i className="fas fa-share-alt"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-users fa-3x text-muted mb-3"></i>
              <p>No members yet</p>
              <button className="btn btn-primary" onClick={loadMembers}>
                Load Members
              </button>
            </div>
          )}
        </div>
      )}

      {/* Rewards Tab */}
      {activeTab === 'rewards' && (
        <div>
          <div className="row">
            {rewardsCatalog.map((reward, idx) => (
              <div key={idx} className="col-md-4 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="card-title mb-0">{reward.name}</h5>
                      <span className={`badge bg-${reward.type === 'discount' ? 'success' : reward.type === 'free_service' ? 'primary' : 'info'}`}>
                        {reward.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="card-text text-muted">{reward.description}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-primary fw-bold">
                        <i className="fas fa-coins me-1"></i>
                        {reward.pointsCost} points
                      </span>
                      <span className="text-success">
                        Value: ${reward.value}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div>
          {/* Tiers */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Loyalty Tiers</h5>
            </div>
            <div className="card-body">
              <div className="row">
                {tiers.map(tier => (
                  <div key={tier.name} className="col-md-3 mb-3">
                    <div 
                      className="card h-100"
                      style={{ borderColor: tier.color, borderWidth: '2px' }}
                    >
                      <div 
                        className="card-header text-white text-center"
                        style={{ backgroundColor: tier.color }}
                      >
                        <h6 className="mb-0">{tier.name.toUpperCase()}</h6>
                      </div>
                      <div className="card-body">
                        <p className="mb-2">
                          <strong>Min Points:</strong> {tier.minPoints.toLocaleString()}
                        </p>
                        <p className="mb-2">
                          <strong>Multiplier:</strong> {tier.pointsMultiplier}x
                        </p>
                        <p className="mb-1"><strong>Perks:</strong></p>
                        <ul className="small mb-0">
                          {tier.perks.map((perk, idx) => (
                            <li key={idx}>{perk}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Points Configuration */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Points Configuration</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <div className="border rounded p-3 text-center">
                    <h4>1 point</h4>
                    <p className="text-muted mb-0">per $1 spent</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="border rounded p-3 text-center">
                    <h4>100 points</h4>
                    <p className="text-muted mb-0">Referral bonus</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="border rounded p-3 text-center">
                    <h4>50 points</h4>
                    <p className="text-muted mb-0">First visit bonus</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Member Details Modal */}
      {selectedMember && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedMember.clientName}
                  <span className={`badge ms-2 ${getTierBadgeClass(selectedMember.tier)}`}>
                    {selectedMember.tier.toUpperCase()}
                  </span>
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setSelectedMember(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Contact Info</h6>
                    <p>
                      <i className="fas fa-envelope me-2"></i>
                      {selectedMember.clientEmail}
                    </p>
                    {selectedMember.clientPhone && (
                      <p>
                        <i className="fas fa-phone me-2"></i>
                        {selectedMember.clientPhone}
                      </p>
                    )}
                    <p>
                      <i className="fas fa-tag me-2"></i>
                      Referral Code: <code>{selectedMember.referralCode}</code>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h6>Stats</h6>
                    <p><strong>Points:</strong> {selectedMember.points.toLocaleString()}</p>
                    <p><strong>Total Spent:</strong> ${selectedMember.totalSpent.toLocaleString()}</p>
                    <p><strong>Referrals:</strong> {selectedMember.successfulReferrals} / {selectedMember.totalReferrals}</p>
                  </div>
                </div>

                {selectedMember.qrCodeUrl && (
                  <div className="text-center mt-3">
                    <img 
                      src={selectedMember.qrCodeUrl} 
                      alt="QR Code" 
                      style={{ width: '150px', height: '150px' }}
                    />
                    <p className="text-muted small mt-2">Scan to use referral code</p>
                  </div>
                )}

                {selectedMember.rewards.length > 0 && (
                  <div className="mt-3">
                    <h6>Rewards</h6>
                    <ul className="list-group">
                      {selectedMember.rewards.map(reward => (
                        <li key={reward.id} className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{reward.name}</strong>
                            {reward.code && <code className="ms-2">{reward.code}</code>}
                          </div>
                          <span className={`badge bg-${reward.redeemed ? 'secondary' : 'success'}`}>
                            {reward.redeemed ? 'Used' : 'Available'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => downloadCard(selectedMember.id, 'loyalty')}
                >
                  <i className="fas fa-download me-2"></i>
                  Download Loyalty Card
                </button>
                <button 
                  className="btn btn-outline-warning"
                  onClick={() => downloadCard(selectedMember.id, 'referral')}
                >
                  <i className="fas fa-share-alt me-2"></i>
                  Download Referral Card
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setSelectedMember(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
