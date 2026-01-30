'use client';

import { useState, useEffect } from 'react';
import { DatabaseService } from '@/services/database';
import { Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface BusinessSettings {
  id?: string;
  depositEnabled: boolean;
  processingFeesEnabled: boolean;
  depositPercentage: number;
  taxRate: number;
  cancellationPolicy: string;
  rebookingFee: number;
  businessName: string;
  address: string;
  phone: string;
  email: string;
  createdAt?: any;
  updatedAt?: any;
}

export default function BusinessSettingsManager() {
  const [settings, setSettings] = useState<BusinessSettings>({
    depositEnabled: false, // Deposits disabled by default - full payment required
    processingFeesEnabled: false, // Processing fees disabled by default - business absorbs costs
    depositPercentage: 33.33, // Default 33.33% (equivalent to $200 on $600 service)
    taxRate: 7.75,
    cancellationPolicy: '24 hours notice required',
    rebookingFee: 50,
    businessName: 'A Pretty Girl Matter',
    address: '',
    phone: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settingsData = await DatabaseService.getAll<BusinessSettings>('businessSettings');
      if (settingsData.length > 0) {
        setSettings(settingsData[0]);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);

      const settingsData = {
        ...settings,
        updatedAt: Timestamp.now()
      };

      if (settings.id) {
        // Update existing Firebase document
        await DatabaseService.update('businessSettings', settings.id, settingsData);
        setMessage({ type: 'success', text: 'Settings updated successfully!' });
      } else {
        // Create new Firebase document
        settingsData.createdAt = Timestamp.now();
        const id = await DatabaseService.create('businessSettings', settingsData);
        setSettings(prev => ({ ...prev, id }));
        setMessage({ type: 'success', text: 'Settings created successfully!' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
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
      <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
        <i className="fas fa-cogs text-[#AD6269]"></i>Business Settings
      </h2>

      {message && (
        <div className={`${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'} border px-4 py-3 rounded-lg flex justify-between items-center`}>
          <span><i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} mr-2`}></i>{message.text}</span>
          <button onClick={() => setMessage(null)} className="hover:opacity-70"><i className="fas fa-times"></i></button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Payment Settings */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-[#AD6269]">
            <h5 className="font-semibold text-white flex items-center gap-2">
              <i className="fas fa-credit-card"></i>Payment Settings
            </h5>
          </div>
          <div className="p-6 space-y-4">
            {/* Deposit Toggle */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    <i className="fas fa-toggle-on mr-1 text-[#AD6269]"></i>Enable Deposit Payments
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    {settings.depositEnabled 
                      ? 'Customers pay a deposit now and the remaining balance at their appointment' 
                      : 'Customers pay the full amount at checkout (deposits disabled)'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, depositEnabled: !prev.depositEnabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.depositEnabled ? 'bg-[#AD6269]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.depositEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Processing Fees Toggle */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    <i className="fas fa-receipt mr-1 text-blue-600"></i>Charge Processing Fees to Customer
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    {settings.processingFeesEnabled 
                      ? 'Processing fees (2.9% + $0.30 for cards, 1.9% for Cherry) are added to customer total' 
                      : 'Business absorbs processing fees - customers pay service price only'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, processingFeesEnabled: !prev.processingFeesEnabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.processingFeesEnabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.processingFeesEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={settings.depositEnabled ? '' : 'opacity-50'}>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  <i className="fas fa-percentage mr-1 text-green-600"></i>Deposit Percentage {settings.depositEnabled && '*'}
                </label>
                <div className="flex">
                  <Input
                    type="number"
                    value={settings.depositPercentage}
                    onChange={(e) => setSettings(prev => ({ ...prev, depositPercentage: Number(e.target.value) }))}
                    min="0"
                    max="100"
                    step="0.01"
                    required={settings.depositEnabled}
                    disabled={!settings.depositEnabled}
                    className="rounded-r-none"
                  />
                  <span className="inline-flex items-center px-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {settings.depositEnabled 
                    ? 'Percentage of service price required as deposit' 
                    : 'Enable deposits above to configure this setting'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  <i className="fas fa-calculator mr-1 text-blue-600"></i>Tax Rate *
                </label>
                <div className="flex">
                  <Input
                    type="number"
                    value={settings.taxRate}
                    onChange={(e) => setSettings(prev => ({ ...prev, taxRate: Number(e.target.value) }))}
                    min="0"
                    max="50"
                    step="0.01"
                    required
                    className="rounded-r-none"
                  />
                  <span className="inline-flex items-center px-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Sales tax rate applied to services</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  <i className="fas fa-dollar-sign mr-1 text-yellow-600"></i>Rebooking Fee
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">$</span>
                  <Input
                    type="number"
                    value={settings.rebookingFee}
                    onChange={(e) => setSettings(prev => ({ ...prev, rebookingFee: Number(e.target.value) }))}
                    min="0"
                    step="0.01"
                    className="rounded-l-none"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Fee charged for rescheduling</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  <i className="fas fa-calendar-times mr-1 text-red-600"></i>Cancellation Policy
                </label>
                <Input
                  type="text"
                  value={settings.cancellationPolicy}
                  onChange={(e) => setSettings(prev => ({ ...prev, cancellationPolicy: e.target.value }))}
                  placeholder="24 hours notice required"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-blue-600">
            <h5 className="font-semibold text-white flex items-center gap-2">
              <i className="fas fa-building"></i>Business Information
            </h5>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  <i className="fas fa-store mr-1 text-[#AD6269]"></i>Business Name
                </label>
                <Input
                  type="text"
                  value={settings.businessName}
                  onChange={(e) => setSettings(prev => ({ ...prev, businessName: e.target.value }))}
                  placeholder="A Pretty Girl Matter"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  <i className="fas fa-envelope mr-1 text-green-600"></i>Business Email
                </label>
                <Input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="info@aprettygirlmatter.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  <i className="fas fa-phone mr-1 text-blue-600"></i>Phone Number
                </label>
                <Input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  <i className="fas fa-map-marker-alt mr-1 text-yellow-600"></i>Business Address
                </label>
                <Input
                  type="text"
                  value={settings.address}
                  onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main St, City, State 12345"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button type="submit" className="bg-[#AD6269] hover:bg-[#9d5860] px-8" disabled={saving}>
            {saving ? (
              <><i className="fas fa-spinner fa-spin mr-2"></i>Saving...</>
            ) : (
              <><i className="fas fa-save mr-2"></i>Save Settings</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
