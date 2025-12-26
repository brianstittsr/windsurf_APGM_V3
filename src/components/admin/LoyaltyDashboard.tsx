'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Heart, 
  RefreshCw, 
  Download, 
  PieChart, 
  Users, 
  Star, 
  Settings, 
  X, 
  Plus, 
  Eye, 
  CreditCard, 
  Share2,
  Trophy,
  Medal,
  Award,
  Mail,
  Phone,
  Tag,
  AlertCircle,
  CheckCircle,
  Coins
} from 'lucide-react';

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
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Heart className="w-6 h-6 text-[#AD6269]" />
          Loyalty Program
        </h2>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => { loadStats(); loadMembers(); }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={downloadAllCards}
            disabled={loading}
            className="bg-[#AD6269] hover:bg-[#9d5860] text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Download All Cards
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-[#AD6269] text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
          onClick={() => { setActiveTab('overview'); loadStats(); }}
        >
          <PieChart className="w-4 h-4" />
          Overview
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'members'
              ? 'bg-[#AD6269] text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
          onClick={() => { setActiveTab('members'); loadMembers(); }}
        >
          <Users className="w-4 h-4" />
          Members
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'rewards'
              ? 'bg-[#AD6269] text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('rewards')}
        >
          <Star className="w-4 h-4" />
          Rewards
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'settings'
              ? 'bg-[#AD6269] text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      {success && (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
          <button onClick={() => setSuccess(null)} className="text-green-500 hover:text-green-700">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#AD6269]"></div>
            </div>
          ) : stats ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#AD6269] text-white rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold">{stats.totalMembers}</div>
                  <p className="text-white/80 mt-1">Total Members</p>
                </div>
                <div className="bg-green-500 text-white rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold">{stats.activeMembers}</div>
                  <p className="text-white/80 mt-1">Active (30 days)</p>
                </div>
                <div className="bg-blue-500 text-white rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold">{stats.totalPointsIssued.toLocaleString()}</div>
                  <p className="text-white/80 mt-1">Points Issued</p>
                </div>
                <div className="bg-yellow-500 text-gray-900 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
                  <p className="text-gray-700 mt-1">Referral Conversion</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Tier Distribution */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Tier Distribution</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {Object.entries(stats.tierDistribution).map(([tier, count]) => (
                      <div key={tier} className="flex items-center gap-3">
                        <span 
                          className="px-3 py-1 rounded text-white text-xs font-semibold w-20 text-center" 
                          style={{ backgroundColor: getTierColor(tier) }}
                        >
                          {tier.toUpperCase()}
                        </span>
                        <div className="flex-grow bg-gray-200 rounded-full h-6 overflow-hidden">
                          <div
                            className="h-full flex items-center justify-center text-white text-xs font-medium"
                            style={{ 
                              width: `${stats.totalMembers > 0 ? Math.max((count / stats.totalMembers) * 100, 15) : 15}%`,
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

                {/* Top Referrers */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Top Referrers</h3>
                  </div>
                  <div className="overflow-x-auto">
                    {stats.topReferrers.length > 0 ? (
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Referrals</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Points</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {stats.topReferrers.map((referrer, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                {idx === 0 && <Trophy className="w-5 h-5 text-yellow-500" />}
                                {idx === 1 && <Medal className="w-5 h-5 text-gray-400" />}
                                {idx === 2 && <Award className="w-5 h-5 text-amber-600" />}
                                {idx > 2 && <span className="text-gray-500">{idx + 1}</span>}
                              </td>
                              <td className="px-4 py-3 text-gray-900">{referrer.name}</td>
                              <td className="px-4 py-3 text-gray-700">{referrer.referrals}</td>
                              <td className="px-4 py-3 text-gray-700">{referrer.points.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No referrals yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Referral Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                  <h3 className="text-3xl font-bold text-gray-900">{stats.totalReferrals}</h3>
                  <p className="text-gray-500 mt-1">Total Referrals</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                  <h3 className="text-3xl font-bold text-gray-900">{stats.successfulReferrals}</h3>
                  <p className="text-gray-500 mt-1">Successful Referrals</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                  <h3 className="text-3xl font-bold text-gray-900">{stats.totalPointsRedeemed.toLocaleString()}</h3>
                  <p className="text-gray-500 mt-1">Points Redeemed</p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Button onClick={loadStats} className="bg-[#AD6269] hover:bg-[#9d5860] text-white">
                Load Statistics
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div>
          {/* Add Member Form */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add New Member</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  type="text"
                  placeholder="Name"
                  value={newMemberForm.clientName}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, clientName: e.target.value })}
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={newMemberForm.clientEmail}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, clientEmail: e.target.value })}
                />
                <Input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={newMemberForm.clientPhone}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, clientPhone: e.target.value })}
                />
                <Button 
                  onClick={createMember}
                  disabled={loading}
                  className="bg-[#AD6269] hover:bg-[#9d5860] text-white w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
              </div>
            </div>
          </div>

          {/* Members List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#AD6269]"></div>
            </div>
          ) : members.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Member</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tier</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Points</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Referral Code</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Referrals</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {members.map(member => (
                      <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{member.clientName}</p>
                          <p className="text-sm text-gray-500">{member.clientEmail}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getTierBadgeClass(member.tier)}`}>
                            {member.tier.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-gray-900">{member.points.toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-3">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-[#AD6269]">{member.referralCode}</code>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {member.successfulReferrals} / {member.totalReferrals}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              onClick={() => setSelectedMember(member)}
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              onClick={() => addPoints(member.id, 50)}
                              title="Add 50 Points"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                              onClick={() => downloadCard(member.id, 'loyalty')}
                              title="Download Loyalty Card"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                              onClick={() => downloadCard(member.id, 'referral')}
                              title="Download Referral Card"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No members yet</p>
              <Button onClick={loadMembers} className="bg-[#AD6269] hover:bg-[#9d5860] text-white">
                Load Members
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Rewards Tab */}
      {activeTab === 'rewards' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rewardsCatalog.map((reward, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{reward.name}</h3>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  reward.type === 'discount' 
                    ? 'bg-green-100 text-green-800' 
                    : reward.type === 'free_service' 
                      ? 'bg-[#AD6269]/10 text-[#AD6269]' 
                      : 'bg-blue-100 text-blue-800'
                }`}>
                  {reward.type.replace('_', ' ')}
                </span>
              </div>
              <p className="text-gray-500 mb-4">{reward.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-[#AD6269] font-semibold flex items-center gap-1">
                  <Coins className="w-4 h-4" />
                  {reward.pointsCost} points
                </span>
                <span className="text-green-600 font-medium">
                  Value: ${reward.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Tiers */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Loyalty Tiers</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {tiers.map(tier => (
                  <div 
                    key={tier.name} 
                    className="rounded-xl overflow-hidden border-2"
                    style={{ borderColor: tier.color }}
                  >
                    <div 
                      className="text-white text-center py-3 font-semibold"
                      style={{ backgroundColor: tier.color }}
                    >
                      {tier.name.toUpperCase()}
                    </div>
                    <div className="p-4 bg-white">
                      <p className="text-sm text-gray-700 mb-2">
                        <span className="font-medium">Min Points:</span> {tier.minPoints.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-700 mb-3">
                        <span className="font-medium">Multiplier:</span> {tier.pointsMultiplier}x
                      </p>
                      <p className="text-sm font-medium text-gray-700 mb-1">Perks:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {tier.perks.map((perk, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-green-500 mt-0.5">•</span>
                            {perk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Points Configuration */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Points Configuration</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-xl p-6 text-center">
                  <h4 className="text-2xl font-bold text-gray-900">1 point</h4>
                  <p className="text-gray-500 mt-1">per $1 spent</p>
                </div>
                <div className="border border-gray-200 rounded-xl p-6 text-center">
                  <h4 className="text-2xl font-bold text-gray-900">100 points</h4>
                  <p className="text-gray-500 mt-1">Referral bonus</p>
                </div>
                <div className="border border-gray-200 rounded-xl p-6 text-center">
                  <h4 className="text-2xl font-bold text-gray-900">50 points</h4>
                  <p className="text-gray-500 mt-1">First visit bonus</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Member Details Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold text-gray-900">{selectedMember.clientName}</h3>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getTierBadgeClass(selectedMember.tier)}`}>
                  {selectedMember.tier.toUpperCase()}
                </span>
              </div>
              <button 
                onClick={() => setSelectedMember(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Contact Info</h4>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-gray-700">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {selectedMember.clientEmail}
                    </p>
                    {selectedMember.clientPhone && (
                      <p className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {selectedMember.clientPhone}
                      </p>
                    )}
                    <p className="flex items-center gap-2 text-gray-700">
                      <Tag className="w-4 h-4 text-gray-400" />
                      Referral Code: <code className="bg-gray-100 px-2 py-1 rounded text-[#AD6269]">{selectedMember.referralCode}</code>
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Stats</h4>
                  <div className="space-y-2">
                    <p className="text-gray-700"><span className="font-medium">Points:</span> {selectedMember.points.toLocaleString()}</p>
                    <p className="text-gray-700"><span className="font-medium">Total Spent:</span> ${selectedMember.totalSpent.toLocaleString()}</p>
                    <p className="text-gray-700"><span className="font-medium">Referrals:</span> {selectedMember.successfulReferrals} / {selectedMember.totalReferrals}</p>
                  </div>
                </div>
              </div>

              {selectedMember.qrCodeUrl && (
                <div className="text-center mb-6">
                  <img 
                    src={selectedMember.qrCodeUrl} 
                    alt="QR Code" 
                    className="w-36 h-36 mx-auto"
                  />
                  <p className="text-gray-500 text-sm mt-2">Scan to use referral code</p>
                </div>
              )}

              {selectedMember.rewards.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Rewards</h4>
                  <div className="space-y-2">
                    {selectedMember.rewards.map(reward => (
                      <div key={reward.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium text-gray-900">{reward.name}</span>
                          {reward.code && <code className="ml-2 bg-gray-200 px-2 py-0.5 rounded text-sm">{reward.code}</code>}
                        </div>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          reward.redeemed ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-800'
                        }`}>
                          {reward.redeemed ? 'Used' : 'Available'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-wrap justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <Button 
                variant="outline"
                onClick={() => downloadCard(selectedMember.id, 'loyalty')}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Loyalty Card
              </Button>
              <Button 
                variant="outline"
                className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                onClick={() => downloadCard(selectedMember.id, 'referral')}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Download Referral Card
              </Button>
              <Button variant="outline" onClick={() => setSelectedMember(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
