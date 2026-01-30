'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { CouponService } from '../../services/couponService';
import { GiftCardService } from '../../services/giftCardService';
import { GiftCard, CouponCode } from '../../types/coupons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAlertDialog } from '@/components/ui/alert-dialog';
import { Tag, Gift, Plus, Pencil, Trash2, X, CheckCircle } from 'lucide-react';

// Helper function to safely format dates from various sources
const safeFormatDate = (date: any, format: 'localDate' | 'isoDate' = 'localDate'): string => {
  if (!date) return '';
  
  try {
    // Check if it's a Firestore Timestamp
    if (typeof date === 'object' && date !== null && 'toDate' in date && typeof date.toDate === 'function') {
      const jsDate = date.toDate();
      return format === 'localDate' ? jsDate.toLocaleDateString() : jsDate.toISOString().split('T')[0];
    }
    
    // Check if it's a JavaScript Date
    if (date instanceof Date) {
      return format === 'localDate' ? date.toLocaleDateString() : date.toISOString().split('T')[0];
    }
    
    // Check if it's a string that can be parsed as a date
    if (typeof date === 'string') {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        return format === 'localDate' ? parsedDate.toLocaleDateString() : parsedDate.toISOString().split('T')[0];
      }
      return date; // Just return the string if it can't be parsed
    }
    
    // Fallback for unknown formats
    return String(date);
  } catch (error) {
    console.error('Error formatting date:', error, date);
    return '';
  }
};

interface CouponFormData {
  code: string;
  description: string;
  type: 'percentage' | 'fixed' | 'free_service' | 'exact_amount' | 'price_override';
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
  const { showAlert, showConfirm, AlertDialogComponent } = useAlertDialog();

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
      showAlert({ title: 'Error', description: 'Please fill in all required fields.', variant: 'destructive' });
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
      showAlert({ title: 'Success', description: 'Coupon created successfully!', variant: 'success' });
      closeCouponModal();
      fetchCoupons();
    } catch (error) {
      console.error('Error creating coupon:', error);
      showAlert({ title: 'Error', description: 'Error creating coupon. Please try again.', variant: 'destructive' });
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
      showAlert({ title: 'Success', description: 'Coupon updated successfully!', variant: 'success' });
      closeCouponModal();
      fetchCoupons();
    } catch (error) {
      console.error('Error updating coupon:', error);
      showAlert({ title: 'Error', description: 'Error updating coupon. Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (couponId: string, couponCode: string) => {
    const confirmed = await showConfirm({
      title: 'Delete Coupon',
      description: `Are you sure you want to delete the coupon "${couponCode}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'destructive'
    });
    if (!confirmed) return;

    try {
      await CouponService.deleteCoupon(couponId);
      showAlert({ title: 'Success', description: 'Coupon deleted successfully!', variant: 'success' });
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      showAlert({ title: 'Error', description: 'Error deleting coupon. Please try again.', variant: 'destructive' });
    }
  };

  // Gift Card CRUD operations
  const handleCreateGiftCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftCardFormData.recipientEmail || !giftCardFormData.recipientName) {
      showAlert({ title: 'Error', description: 'Please fill in all required fields.', variant: 'destructive' });
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
      showAlert({ title: 'Success', description: 'Gift card created successfully!', variant: 'success' });
      closeGiftCardModal();
      fetchGiftCards();
    } catch (error) {
      console.error('Error creating gift card:', error);
      showAlert({ title: 'Error', description: 'Error creating gift card. Please try again.', variant: 'destructive' });
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
      showAlert({ title: 'Success', description: 'Gift card updated successfully!', variant: 'success' });
      closeGiftCardModal();
      fetchGiftCards();
    } catch (error) {
      console.error('Error updating gift card:', error);
      showAlert({ title: 'Error', description: 'Error updating gift card. Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGiftCard = async (giftCardId: string, giftCardCode: string) => {
    const confirmed = await showConfirm({
      title: 'Delete Gift Card',
      description: `Are you sure you want to delete the gift card "${giftCardCode}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'destructive'
    });
    if (!confirmed) return;

    try {
      await GiftCardService.deleteGiftCard(giftCardId);
      showAlert({ title: 'Success', description: 'Gift card deleted successfully!', variant: 'success' });
      fetchGiftCards();
    } catch (error) {
      console.error('Error deleting gift card:', error);
      showAlert({ title: 'Error', description: 'Error deleting gift card. Please try again.', variant: 'destructive' });
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
      expirationDate: safeFormatDate(coupon.expirationDate, 'isoDate'),
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
      expirationDate: safeFormatDate(giftCard.expirationDate, 'isoDate'),
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
      case 'percentage': return 'bg-blue-100 text-blue-800';
      case 'fixed': return 'bg-green-100 text-green-800';
      case 'free_service': return 'bg-yellow-100 text-yellow-800';
      case 'exact_amount': return 'bg-cyan-100 text-cyan-800';
      case 'price_override': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#AD6269]"></div>
        <p className="mt-4 text-gray-500">Loading coupons and gift cards...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Coupons & Gift Cards Management</h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'coupons'
              ? 'bg-[#AD6269] text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('coupons')}
        >
          <Tag className="w-4 h-4" />
          Coupons ({coupons.length})
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'giftcards'
              ? 'bg-[#AD6269] text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('giftcards')}
        >
          <Gift className="w-4 h-4" />
          Gift Cards ({giftCards.length})
        </button>
      </div>

      {/* Coupons Tab */}
      {activeTab === 'coupons' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Coupon Codes</h3>
            <Button 
              onClick={openCreateCouponModal}
              className="bg-[#AD6269] hover:bg-[#9d5860] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Coupon
            </Button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {coupons.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Tag className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">No coupons found.</p>
                <Button 
                  onClick={openCreateCouponModal}
                  className="bg-[#AD6269] hover:bg-[#9d5860] text-white"
                >
                  Add First Coupon
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Value</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Usage</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Expires</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {coupons.map((coupon) => (
                      <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-[#AD6269]">{coupon.code}</code>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{coupon.description}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getCouponTypeBadge(coupon.type)}`}>
                            {coupon.type.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {coupon.type === 'percentage' ? `${coupon.value}%` :
                           coupon.type === 'fixed' ? formatCurrency(coupon.value) :
                           coupon.type === 'free_service' ? 'FREE SERVICE' :
                           formatCurrency(coupon.exactAmount || 0)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{coupon.usageCount}/{coupon.usageLimit || '∞'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {safeFormatDate(coupon.expirationDate)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {coupon.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              onClick={() => openEditCouponModal(coupon)}
                              title="Edit Coupon"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                              title="Delete Coupon"
                            >
                              <Trash2 className="w-4 h-4" />
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
      )}

      {/* Gift Cards Tab */}
      {activeTab === 'giftcards' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Gift Cards</h3>
            <Button 
              onClick={openCreateGiftCardModal}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Gift Card
            </Button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {giftCards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Gift className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">No gift cards found.</p>
                <Button 
                  onClick={openCreateGiftCardModal}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Add First Gift Card
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Recipient</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Initial Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Remaining</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Expires</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {giftCards.map((giftCard) => (
                      <tr key={giftCard.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-green-600">{giftCard.code}</code>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{giftCard.recipientName}</p>
                            <p className="text-sm text-gray-500">{giftCard.recipientEmail}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(giftCard.initialAmount)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(giftCard.remainingAmount)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {safeFormatDate(giftCard.expirationDate)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            giftCard.isRedeemed 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : giftCard.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {giftCard.isRedeemed ? 'Redeemed' : giftCard.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              onClick={() => openEditGiftCardModal(giftCard)}
                              title="Edit Gift Card"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              onClick={() => handleDeleteGiftCard(giftCard.id, giftCard.code)}
                              title="Delete Gift Card"
                            >
                              <Trash2 className="w-4 h-4" />
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
      )}

      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#AD6269]" />
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </h3>
              <button 
                onClick={closeCouponModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={editingCoupon ? handleEditCoupon : handleCreateCoupon}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={couponFormData.code}
                      onChange={(e) => setCouponFormData({ ...couponFormData, code: e.target.value.toUpperCase() })}
                      required
                      disabled={!!editingCoupon}
                      placeholder="SUMMER2024"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                      value={couponFormData.type}
                      onChange={(e) => setCouponFormData({ ...couponFormData, type: e.target.value as any })}
                    >
                      <option value="percentage">Percentage Discount</option>
                      <option value="fixed">Fixed Amount</option>
                      <option value="free_service">Free Service</option>
                      <option value="exact_amount">Exact Amount</option>
                      <option value="price_override">Price Override</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={couponFormData.description}
                    onChange={(e) => setCouponFormData({ ...couponFormData, description: e.target.value })}
                    required
                    placeholder="Summer sale discount"
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {couponFormData.type === 'percentage' ? 'Percentage (%)' : 
                       couponFormData.type === 'exact_amount' ? 'Set Price To ($)' : 
                       couponFormData.type === 'price_override' ? 'New Price ($)' : 'Amount ($)'}
                    </label>
                    <Input
                      type="number"
                      value={couponFormData.type === 'exact_amount' ? couponFormData.exactAmount : couponFormData.value}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        if (couponFormData.type === 'exact_amount') {
                          setCouponFormData({ ...couponFormData, exactAmount: val, value: 0 });
                        } else {
                          setCouponFormData({ ...couponFormData, value: val });
                        }
                      }}
                      disabled={couponFormData.type === 'free_service'}
                      min="0"
                      step={couponFormData.type === 'percentage' ? '1' : '0.01'}
                      className="w-full"
                    />
                    {couponFormData.type === 'exact_amount' && (
                      <p className="text-xs text-gray-500 mt-1">This will set the service price to this exact amount</p>
                    )}
                    {couponFormData.type === 'price_override' && (
                      <p className="text-xs text-gray-500 mt-1">This will override the service price to the amount entered above</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiration Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={couponFormData.expirationDate}
                      onChange={(e) => setCouponFormData({ ...couponFormData, expirationDate: e.target.value })}
                      required
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
                    <Input
                      type="number"
                      value={couponFormData.usageLimit}
                      onChange={(e) => setCouponFormData({ ...couponFormData, usageLimit: parseInt(e.target.value) || 0 })}
                      min="0"
                      placeholder="Leave empty for unlimited"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order Amount ($)</label>
                    <Input
                      type="number"
                      value={couponFormData.minOrderAmount}
                      onChange={(e) => setCouponFormData({ ...couponFormData, minOrderAmount: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Applicable Services (comma-separated)
                  </label>
                  <Input
                    type="text"
                    value={couponFormData.applicableServices}
                    onChange={(e) => setCouponFormData({ ...couponFormData, applicableServices: e.target.value })}
                    placeholder="eyeliner, microblading, lips"
                    className="w-full"
                  />
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={couponFormData.isActive}
                      onChange={(e) => setCouponFormData({ ...couponFormData, isActive: e.target.checked })}
                      className="w-4 h-4 text-[#AD6269] border-gray-300 rounded focus:ring-[#AD6269]"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={couponFormData.removeDepositOption || false}
                      onChange={(e) => setCouponFormData({ ...couponFormData, removeDepositOption: e.target.checked })}
                      className="w-4 h-4 text-[#AD6269] border-gray-300 rounded focus:ring-[#AD6269]"
                    />
                    <span className="text-sm text-gray-700">Remove $50 Deposit Option</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Reduction ($)</label>
                  <Input
                    type="number"
                    value={couponFormData.depositReduction || 0}
                    onChange={(e) => setCouponFormData({ ...couponFormData, depositReduction: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    placeholder="Amount to subtract from deposit"
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <Button variant="outline" type="button" onClick={closeCouponModal}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-[#AD6269] hover:bg-[#9d5860] text-white"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingCoupon ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gift Card Modal */}
      {showGiftCardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Gift className="w-5 h-5 text-green-600" />
                {editingGiftCard ? 'Edit Gift Card' : 'Create New Gift Card'}
              </h3>
              <button 
                onClick={closeGiftCardModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={editingGiftCard ? handleEditGiftCard : handleCreateGiftCard}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Initial Amount ($) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={giftCardFormData.initialAmount}
                      onChange={(e) => setGiftCardFormData({ ...giftCardFormData, initialAmount: parseFloat(e.target.value) || 0 })}
                      required
                      min="0"
                      step="0.01"
                      disabled={!!editingGiftCard}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiration Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={giftCardFormData.expirationDate}
                      onChange={(e) => setGiftCardFormData({ ...giftCardFormData, expirationDate: e.target.value })}
                      required
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recipient Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={giftCardFormData.recipientName}
                      onChange={(e) => setGiftCardFormData({ ...giftCardFormData, recipientName: e.target.value })}
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recipient Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      value={giftCardFormData.recipientEmail}
                      onChange={(e) => setGiftCardFormData({ ...giftCardFormData, recipientEmail: e.target.value })}
                      required
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purchaser Name</label>
                    <Input
                      type="text"
                      value={giftCardFormData.purchaserName}
                      onChange={(e) => setGiftCardFormData({ ...giftCardFormData, purchaserName: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purchaser Email</label>
                    <Input
                      type="email"
                      value={giftCardFormData.purchaserEmail}
                      onChange={(e) => setGiftCardFormData({ ...giftCardFormData, purchaserEmail: e.target.value })}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Personal Message</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    value={giftCardFormData.message}
                    onChange={(e) => setGiftCardFormData({ ...giftCardFormData, message: e.target.value })}
                    rows={3}
                    placeholder="Add a personal message for the recipient..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <Button variant="outline" type="button" onClick={closeGiftCardModal}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingGiftCard ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {editingGiftCard ? 'Update Gift Card' : 'Create Gift Card'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
