'use client';

import { useState, useEffect } from 'react';
import { DatabaseService } from '@/services/database';
import { Timestamp } from 'firebase/firestore';

interface BusinessSettings {
  id?: string;
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
        await DatabaseService.update('businessSettings', settings.id, settingsData);
      } else {
        settingsData.createdAt = Timestamp.now();
        const id = await DatabaseService.create('businessSettings', settingsData);
        setSettings(prev => ({ ...prev, id }));
      }

      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading business settings...</p>
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
                <i className="fas fa-cogs me-3"></i>
                Business Settings
              </h2>
              <p className="card-text mb-0 opacity-75">
                Configure deposit percentages, fees, and business information
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-primary text-white border-0">
              <h5 className="mb-0 fw-bold">
                <i className="fas fa-sliders-h me-2"></i>
                Payment & Business Configuration
              </h5>
            </div>
            <div className="card-body p-4">
              {message && (
                <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
                  <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
                  {message.text}
                  <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
                </div>
              )}

              <form onSubmit={handleSave}>
                <div className="row g-4">
                  {/* Payment Settings */}
                  <div className="col-12">
                    <div className="card border-primary border-2">
                      <div className="card-header bg-primary bg-opacity-10">
                        <h6 className="mb-0 fw-bold text-primary">
                          <i className="fas fa-credit-card me-2"></i>
                          Payment Settings
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">
                              <i className="fas fa-percentage me-1 text-success"></i>
                              Deposit Percentage *
                            </label>
                            <div className="input-group">
                              <input
                                type="number"
                                className="form-control form-control-lg border-2"
                                value={settings.depositPercentage}
                                onChange={(e) => setSettings(prev => ({ ...prev, depositPercentage: Number(e.target.value) }))}
                                min="0"
                                max="100"
                                step="0.01"
                                required
                              />
                              <span className="input-group-text">%</span>
                            </div>
                            <div className="form-text">
                              Percentage of service price required as deposit (e.g., 33.33% of $600 = $200)
                            </div>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">
                              <i className="fas fa-calculator me-1 text-info"></i>
                              Tax Rate *
                            </label>
                            <div className="input-group">
                              <input
                                type="number"
                                className="form-control form-control-lg border-2"
                                value={settings.taxRate}
                                onChange={(e) => setSettings(prev => ({ ...prev, taxRate: Number(e.target.value) }))}
                                min="0"
                                max="50"
                                step="0.01"
                                required
                              />
                              <span className="input-group-text">%</span>
                            </div>
                            <div className="form-text">
                              Sales tax rate applied to services
                            </div>
                          </div>
                        </div>
                        <div className="row g-3 mt-2">
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">
                              <i className="fas fa-dollar-sign me-1 text-warning"></i>
                              Rebooking Fee
                            </label>
                            <div className="input-group">
                              <span className="input-group-text">$</span>
                              <input
                                type="number"
                                className="form-control form-control-lg border-2"
                                value={settings.rebookingFee}
                                onChange={(e) => setSettings(prev => ({ ...prev, rebookingFee: Number(e.target.value) }))}
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div className="form-text">
                              Fee charged for rescheduling appointments
                            </div>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">
                              <i className="fas fa-calendar-times me-1 text-danger"></i>
                              Cancellation Policy
                            </label>
                            <input
                              type="text"
                              className="form-control form-control-lg border-2"
                              value={settings.cancellationPolicy}
                              onChange={(e) => setSettings(prev => ({ ...prev, cancellationPolicy: e.target.value }))}
                              placeholder="24 hours notice required"
                            />
                            <div className="form-text">
                              Cancellation policy description
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Business Information */}
                  <div className="col-12">
                    <div className="card border-info border-2">
                      <div className="card-header bg-info bg-opacity-10">
                        <h6 className="mb-0 fw-bold text-info">
                          <i className="fas fa-building me-2"></i>
                          Business Information
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">
                              <i className="fas fa-store me-1 text-primary"></i>
                              Business Name
                            </label>
                            <input
                              type="text"
                              className="form-control form-control-lg border-2"
                              value={settings.businessName}
                              onChange={(e) => setSettings(prev => ({ ...prev, businessName: e.target.value }))}
                              placeholder="A Pretty Girl Matter"
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">
                              <i className="fas fa-envelope me-1 text-success"></i>
                              Business Email
                            </label>
                            <input
                              type="email"
                              className="form-control form-control-lg border-2"
                              value={settings.email}
                              onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="info@aprettygirlmatter.com"
                            />
                          </div>
                        </div>
                        <div className="row g-3 mt-2">
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">
                              <i className="fas fa-phone me-1 text-info"></i>
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              className="form-control form-control-lg border-2"
                              value={settings.phone}
                              onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder="(555) 123-4567"
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">
                              <i className="fas fa-map-marker-alt me-1 text-warning"></i>
                              Business Address
                            </label>
                            <input
                              type="text"
                              className="form-control form-control-lg border-2"
                              value={settings.address}
                              onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                              placeholder="123 Main St, City, State 12345"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg rounded-pill px-5 shadow"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>Save Settings
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
