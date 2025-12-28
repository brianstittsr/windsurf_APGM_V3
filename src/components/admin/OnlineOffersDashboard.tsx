'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAlertDialog } from '@/components/ui/alert-dialog';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

interface Offer {
  id: string;
  name: string;
  type: 'discount' | 'bundle' | 'flash-sale' | 'referral' | 'loyalty';
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  code?: string;
  minPurchase?: number;
  maxUses?: number;
  usedCount: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
}

interface ReferralProgram {
  isActive: boolean;
  referrerReward: number;
  refereeDiscount: number;
  totalReferrals: number;
  totalRewards: number;
}

export default function OnlineOffersDashboard() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'offers' | 'flash-sales' | 'referral' | 'create'>('offers');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { showAlert, showConfirm, AlertDialogComponent } = useAlertDialog();

  const [referralProgram, setReferralProgram] = useState<ReferralProgram>({
    isActive: true,
    referrerReward: 25,
    refereeDiscount: 15,
    totalReferrals: 0,
    totalRewards: 0
  });

  // Create form
  const [createForm, setCreateForm] = useState({
    name: '',
    type: 'discount' as Offer['type'],
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 10,
    code: '',
    minPurchase: 0,
    maxUses: 0,
    startDate: '',
    endDate: ''
  });

  // Stats
  const [stats, setStats] = useState({
    totalOffers: 0,
    activeOffers: 0,
    totalRedemptions: 0,
    totalSavings: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const db = getDb();
      const offersRef = collection(db, 'offers');
      const snapshot = await getDocs(query(offersRef, orderBy('createdAt', 'desc')));
      
      const loadedOffers: Offer[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        loadedOffers.push({
          id: doc.id,
          name: data.name || 'Untitled Offer',
          type: data.type || 'discount',
          description: data.description || '',
          discountType: data.discountType || 'percentage',
          discountValue: data.discountValue || 0,
          code: data.code,
          minPurchase: data.minPurchase,
          maxUses: data.maxUses,
          usedCount: data.usedCount || 0,
          startDate: data.startDate,
          endDate: data.endDate,
          isActive: data.isActive !== false,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        });
      });
      setOffers(loadedOffers);

      // Calculate stats
      const activeCount = loadedOffers.filter(o => o.isActive).length;
      const totalUsed = loadedOffers.reduce((sum, o) => sum + o.usedCount, 0);
      const totalSaved = loadedOffers.reduce((sum, o) => {
        if (o.discountType === 'fixed') {
          return sum + (o.discountValue * o.usedCount);
        }
        return sum + (o.usedCount * 50); // Estimate $50 avg for percentage
      }, 0);

      setStats({
        totalOffers: loadedOffers.length,
        activeOffers: activeCount,
        totalRedemptions: totalUsed,
        totalSavings: totalSaved
      });

    } catch (error) {
      console.error('Error loading offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOffer = async () => {
    if (!createForm.name || !createForm.discountValue) {
      await showAlert({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'warning'
      });
      return;
    }

    try {
      const db = getDb();
      const offerData = {
        name: createForm.name,
        type: createForm.type,
        description: createForm.description,
        discountType: createForm.discountType,
        discountValue: createForm.discountValue,
        code: createForm.code || generateCode(),
        minPurchase: createForm.minPurchase || null,
        maxUses: createForm.maxUses || null,
        startDate: createForm.startDate || null,
        endDate: createForm.endDate || null,
        usedCount: 0,
        isActive: true,
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, 'offers'), offerData);

      await showAlert({
        title: 'Offer Created',
        description: `Your offer "${createForm.name}" has been created!`,
        variant: 'success'
      });

      setCreateForm({
        name: '',
        type: 'discount',
        description: '',
        discountType: 'percentage',
        discountValue: 10,
        code: '',
        minPurchase: 0,
        maxUses: 0,
        startDate: '',
        endDate: ''
      });
      setActiveTab('offers');
      loadData();
    } catch (error) {
      console.error('Error creating offer:', error);
      await showAlert({
        title: 'Error',
        description: 'Failed to create offer',
        variant: 'destructive'
      });
    }
  };

  const toggleOfferStatus = async (offerId: string, currentStatus: boolean) => {
    try {
      const db = getDb();
      await updateDoc(doc(db, 'offers', offerId), {
        isActive: !currentStatus
      });
      setOffers(prev => prev.map(o => 
        o.id === offerId ? { ...o, isActive: !currentStatus } : o
      ));
    } catch (error) {
      console.error('Error toggling offer:', error);
    }
  };

  const deleteOffer = async (offerId: string) => {
    const confirmed = await showConfirm({
      title: 'Delete Offer',
      description: 'Are you sure you want to delete this offer?',
      confirmText: 'Delete',
      variant: 'destructive'
    });

    if (!confirmed) return;

    try {
      const db = getDb();
      await deleteDoc(doc(db, 'offers', offerId));
      setOffers(prev => prev.filter(o => o.id !== offerId));
      await showAlert({
        title: 'Offer Deleted',
        description: 'The offer has been removed.',
        variant: 'success'
      });
    } catch (error) {
      console.error('Error deleting offer:', error);
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    await showAlert({
      title: 'Copied!',
      description: `Code "${code}" copied to clipboard`,
      variant: 'success'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'discount': return 'fas fa-percent';
      case 'bundle': return 'fas fa-box';
      case 'flash-sale': return 'fas fa-bolt';
      case 'referral': return 'fas fa-users';
      case 'loyalty': return 'fas fa-heart';
      default: return 'fas fa-tag';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'discount': return 'bg-green-100 text-green-800';
      case 'bundle': return 'bg-blue-100 text-blue-800';
      case 'flash-sale': return 'bg-orange-100 text-orange-800';
      case 'referral': return 'bg-purple-100 text-purple-800';
      case 'loyalty': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#AD6269]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <i className="fas fa-percent text-[#AD6269]"></i>
            Online Offers
          </h2>
          <p className="text-gray-500 text-sm mt-1">Create and manage promotional offers</p>
        </div>
        <Button
          className="bg-[#AD6269] hover:bg-[#9d5860]"
          onClick={() => setActiveTab('create')}
        >
          <i className="fas fa-plus mr-2"></i>
          Create Offer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="fas fa-tags text-blue-600"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOffers}</p>
              <p className="text-xs text-gray-500">Total Offers</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <i className="fas fa-check-circle text-green-600"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.activeOffers}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <i className="fas fa-ticket-alt text-purple-600"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRedemptions}</p>
              <p className="text-xs text-gray-500">Redemptions</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <i className="fas fa-dollar-sign text-yellow-600"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${stats.totalSavings}</p>
              <p className="text-xs text-gray-500">Total Savings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {[
          { id: 'offers', label: 'All Offers', icon: 'fas fa-tags' },
          { id: 'flash-sales', label: 'Flash Sales', icon: 'fas fa-bolt' },
          { id: 'referral', label: 'Referral Program', icon: 'fas fa-users' },
          { id: 'create', label: 'Create Offer', icon: 'fas fa-plus' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-[#AD6269] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <i className={`${tab.icon} mr-2`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Offers Tab */}
      {activeTab === 'offers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl border border-gray-200 p-12 text-center">
              <i className="fas fa-tags text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-500 mb-4">No offers yet</p>
              <Button
                className="bg-[#AD6269] hover:bg-[#9d5860]"
                onClick={() => setActiveTab('create')}
              >
                Create Your First Offer
              </Button>
            </div>
          ) : (
            offers.map((offer) => (
              <div key={offer.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(offer.type)}`}>
                    <i className={getTypeIcon(offer.type)}></i>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleOfferStatus(offer.id, offer.isActive)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        offer.isActive ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                        offer.isActive ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900">{offer.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{offer.description}</p>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#AD6269]">
                      {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `$${offer.discountValue}`}
                    </span>
                    {offer.code && (
                      <button
                        onClick={() => copyCode(offer.code!)}
                        className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                      >
                        <span className="font-mono font-bold">{offer.code}</span>
                        <i className="fas fa-copy text-gray-400"></i>
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    <i className="fas fa-ticket-alt mr-1"></i>
                    {offer.usedCount} used
                    {offer.maxUses && ` / ${offer.maxUses}`}
                  </span>
                  {offer.endDate && (
                    <span className="text-gray-500">
                      <i className="fas fa-clock mr-1"></i>
                      Expires {new Date(offer.endDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <i className="fas fa-edit mr-1"></i>
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => deleteOffer(offer.id)}
                  >
                    <i className="fas fa-trash"></i>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Flash Sales Tab */}
      {activeTab === 'flash-sales' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <i className="fas fa-bolt"></i>
                  Flash Sale Creator
                </h3>
                <p className="text-white/80 mt-1">Create limited-time offers with countdown timers</p>
              </div>
              <Button className="bg-white text-orange-600 hover:bg-gray-100">
                <i className="fas fa-plus mr-2"></i>
                New Flash Sale
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offers.filter(o => o.type === 'flash-sale').length === 0 ? (
              <div className="col-span-full bg-white rounded-xl border border-gray-200 p-12 text-center">
                <i className="fas fa-bolt text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500 mb-4">No flash sales active</p>
                <p className="text-sm text-gray-400">Create a flash sale to drive urgency and boost conversions</p>
              </div>
            ) : (
              offers.filter(o => o.type === 'flash-sale').map((sale) => (
                <div key={sale.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <i className="fas fa-bolt text-orange-600 text-xl"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{sale.name}</h3>
                      <p className="text-sm text-gray-500">{sale.description}</p>
                    </div>
                  </div>
                  <div className="text-center py-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-[#AD6269]">
                      {sale.discountType === 'percentage' ? `${sale.discountValue}% OFF` : `$${sale.discountValue} OFF`}
                    </p>
                    {sale.endDate && (
                      <p className="text-sm text-gray-500 mt-2">
                        Ends: {new Date(sale.endDate).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Referral Program Tab */}
      {activeTab === 'referral' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <i className="fas fa-users"></i>
                  Referral Program
                </h3>
                <p className="text-white/80 mt-1">Reward customers for bringing in new clients</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Program Active</span>
                <button
                  onClick={() => setReferralProgram(prev => ({ ...prev, isActive: !prev.isActive }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    referralProgram.isActive ? 'bg-white' : 'bg-white/30'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full shadow transform transition-transform ${
                    referralProgram.isActive ? 'translate-x-6 bg-purple-500' : 'translate-x-0.5 bg-white'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Program Settings</h3>
              <div className="space-y-4">
                <div>
                  <Label>Referrer Reward ($)</Label>
                  <Input
                    type="number"
                    value={referralProgram.referrerReward}
                    onChange={(e) => setReferralProgram(prev => ({ ...prev, referrerReward: Number(e.target.value) }))}
                  />
                  <p className="text-xs text-gray-400 mt-1">Amount credited to referring customer</p>
                </div>
                <div>
                  <Label>New Customer Discount (%)</Label>
                  <Input
                    type="number"
                    value={referralProgram.refereeDiscount}
                    onChange={(e) => setReferralProgram(prev => ({ ...prev, refereeDiscount: Number(e.target.value) }))}
                  />
                  <p className="text-xs text-gray-400 mt-1">Discount for referred customers</p>
                </div>
                <Button className="w-full bg-[#AD6269] hover:bg-[#9d5860]">
                  Save Settings
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Program Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-gray-900">{referralProgram.totalReferrals}</p>
                  <p className="text-sm text-gray-500">Total Referrals</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-gray-900">${referralProgram.totalRewards}</p>
                  <p className="text-sm text-gray-500">Rewards Paid</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-800">
                  <i className="fas fa-info-circle mr-2"></i>
                  Share referral links with customers to track their referrals automatically
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Tab */}
      {activeTab === 'create' && (
        <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Create New Offer</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Offer Name *</Label>
              <Input
                id="name"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="e.g., Summer Special"
              />
            </div>

            <div>
              <Label>Offer Type</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[
                  { id: 'discount', label: 'Discount', icon: 'fas fa-percent' },
                  { id: 'bundle', label: 'Bundle', icon: 'fas fa-box' },
                  { id: 'flash-sale', label: 'Flash Sale', icon: 'fas fa-bolt' }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setCreateForm({ ...createForm, type: type.id as any })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      createForm.type === type.id
                        ? 'border-[#AD6269] bg-[#AD6269]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <i className={`${type.icon} text-lg ${createForm.type === type.id ? 'text-[#AD6269]' : 'text-gray-400'}`}></i>
                    <p className="text-sm mt-1">{type.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269]"
                rows={2}
                placeholder="Describe your offer..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Discount Type</Label>
                <select
                  value={createForm.discountType}
                  onChange={(e) => setCreateForm({ ...createForm, discountType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269]"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>
              <div>
                <Label>Discount Value *</Label>
                <Input
                  type="number"
                  value={createForm.discountValue}
                  onChange={(e) => setCreateForm({ ...createForm, discountValue: Number(e.target.value) })}
                  placeholder={createForm.discountType === 'percentage' ? '10' : '25'}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="code">Promo Code (optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  value={createForm.code}
                  onChange={(e) => setCreateForm({ ...createForm, code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER2024"
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  onClick={() => setCreateForm({ ...createForm, code: generateCode() })}
                >
                  Generate
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={createForm.startDate}
                  onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={createForm.endDate}
                  onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minPurchase">Minimum Purchase ($)</Label>
                <Input
                  id="minPurchase"
                  type="number"
                  value={createForm.minPurchase}
                  onChange={(e) => setCreateForm({ ...createForm, minPurchase: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="maxUses">Max Uses (0 = unlimited)</Label>
                <Input
                  id="maxUses"
                  type="number"
                  value={createForm.maxUses}
                  onChange={(e) => setCreateForm({ ...createForm, maxUses: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setActiveTab('offers')}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#AD6269] hover:bg-[#9d5860]"
                onClick={createOffer}
              >
                <i className="fas fa-plus mr-2"></i>
                Create Offer
              </Button>
            </div>
          </div>
        </div>
      )}

      {AlertDialogComponent}
    </div>
  );
}
