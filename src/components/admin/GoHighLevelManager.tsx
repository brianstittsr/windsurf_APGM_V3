'use client';

import { useState, useEffect } from 'react';
import { DatabaseService } from '@/services/database';

interface CRMSettings {
  id?: string;
  apiKey: string;
  locationId?: string;
  isEnabled: boolean;
  useGHLAvailability?: boolean; // Toggle for using GHL calendar availability
  lastSync?: string;
  syncedContacts: number;
  syncedWorkflows: number;
  errors: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export default function GoHighLevelManager() {
  const [settings, setSettings] = useState<CRMSettings>({
    apiKey: '',
    locationId: '',
    isEnabled: false,
    useGHLAvailability: false,
    syncedContacts: 0,
    syncedWorkflows: 0,
    errors: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settingsData = await DatabaseService.getAll<CRMSettings>('crmSettings');
      if (settingsData.length > 0) {
        setSettings(settingsData[0]);
      }
    } catch (error) {
      console.error('Error loading CRM settings:', error);
      setMessage({ type: 'error', text: 'Failed to load GoHighLevel settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings.apiKey.trim()) {
      setMessage({ type: 'error', text: 'API Key is required' });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      const settingsData = {
        ...settings,
        updatedAt: new Date()
      };

      if (settings.id) {
        await DatabaseService.update('crmSettings', settings.id, settingsData);
        setMessage({ type: 'success', text: 'GoHighLevel settings updated successfully!' });
      } else {
        settingsData.createdAt = new Date();
        const id = await DatabaseService.create('crmSettings', settingsData);
        setSettings(prev => ({ ...prev, id }));
        setMessage({ type: 'success', text: 'GoHighLevel settings created successfully!' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save GoHighLevel settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!settings.apiKey.trim()) {
      setTestResult({ type: 'error', message: 'Please enter an API Key first' });
      return;
    }

    try {
      setTestResult(null);
      
      const response = await fetch('/api/crm/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: settings.apiKey })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const locationCount = data.locationCount || 0;
        setTestResult({ 
          type: 'success', 
          message: `✅ Connection successful! Found ${locationCount} location(s).` 
        });
      } else {
        const errorMsg = data.error || 'Please check your API Key.';
        setTestResult({ 
          type: 'error', 
          message: `❌ ${errorMsg}` 
        });
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      setTestResult({ type: 'error', message: '❌ Error testing connection. Please try again.' });
    }
  };

  const handleToggleSync = async () => {
    try {
      setSyncing(true);
      setMessage(null);

      const response = await fetch('/api/crm/toggle-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !settings.isEnabled })
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({ ...prev, isEnabled: !prev.isEnabled }));
        setMessage({
          type: 'success',
          text: `GoHighLevel sync ${!settings.isEnabled ? 'enabled' : 'disabled'} successfully!`
        });
      } else {
        setMessage({ type: 'error', text: 'Failed to toggle sync' });
      }
    } catch (error) {
      console.error('Error toggling sync:', error);
      setMessage({ type: 'error', text: 'Failed to toggle sync' });
    } finally {
      setSyncing(false);
    }
  };

  const handleFullSync = async () => {
    if (!settings.apiKey.trim()) {
      setMessage({ type: 'error', text: 'Please save API Key first' });
      return;
    }

    try {
      setSyncing(true);
      setMessage(null);

      const response = await fetch('/api/crm/full-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: settings.apiKey })
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({
          ...prev,
          lastSync: new Date().toISOString(),
          syncedContacts: data.syncedContacts || 0,
          syncedWorkflows: data.syncedWorkflows || 0
        }));
        setMessage({ type: 'success', text: 'Full sync completed successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Full sync failed' });
      }
    } catch (error) {
      console.error('Error during full sync:', error);
      setMessage({ type: 'error', text: 'Error during full sync' });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading GoHighLevel settings...</p>
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
                <i className="fas fa-cloud-upload-alt me-3"></i>
                GoHighLevel Integration
              </h2>
              <p className="card-text mb-0 opacity-75">
                Connect your GoHighLevel CRM account and manage contact synchronization
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* BMAD Orchestrator Integration Diagram */}
      <div className="card mb-4 border-primary">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0"><i className="fas fa-sitemap me-2"></i>BMAD Orchestrator Integration Flow</h5>
        </div>
        <div className="card-body">
          <div className="row text-center">
            <div className="col-md-3">
              <div className="p-3 border rounded bg-light">
                <i className="fas fa-globe fa-2x text-primary mb-2"></i>
                <h6>Your Website</h6>
                <small>Booking, Forms, Payments</small>
              </div>
            </div>
            <div className="col-md-1 d-flex align-items-center justify-content-center">
              <i className="fas fa-arrow-right fa-2x text-muted"></i>
            </div>
            <div className="col-md-3">
              <div className="p-3 border rounded bg-info text-white">
                <i className="fas fa-robot fa-2x mb-2"></i>
                <h6>BMAD Orchestrator</h6>
                <small>Intelligent Automation</small>
              </div>
            </div>
            <div className="col-md-1 d-flex align-items-center justify-content-center">
              <i className="fas fa-exchange-alt fa-2x text-muted"></i>
            </div>
            <div className="col-md-3">
              <div className="p-3 border rounded bg-success text-white">
                <i className="fas fa-cloud fa-2x mb-2"></i>
                <h6>GoHighLevel</h6>
                <small>CRM, Workflows, Automation</small>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <h6 className="text-primary">What BMAD Orchestrator Does:</h6>
            <ul className="small">
              <li><strong>Syncs Contacts:</strong> Automatically creates/updates contacts in GHL when bookings are made</li>
              <li><strong>Triggers Workflows:</strong> Initiates GHL workflows for follow-ups, reminders, and campaigns</li>
              <li><strong>Manages Appointments:</strong> Syncs calendar appointments between your site and GHL</li>
              <li><strong>Handles Invoices:</strong> Creates and sends invoices through GHL</li>
              <li><strong>Tracks Opportunities:</strong> Updates pipeline stages based on customer actions</li>
              <li><strong>Sends Messages:</strong> Automated SMS/email through GHL conversations</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Troubleshooting Section */}
      {testResult?.type === 'error' && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <h6 className="alert-heading"><i className="fas fa-exclamation-triangle me-2"></i>Connection Issue Detected</h6>
          <p className="mb-2">{testResult.message}</p>
          <hr />
          <h6>Common Issues & Solutions:</h6>
          <ol className="small mb-0">
            <li><strong>Missing Scopes:</strong> Ensure all required scopes are enabled in GHL Private Integration settings</li>
            <li><strong>Invalid API Key:</strong> Regenerate your API key after enabling scopes</li>
            <li><strong>Wrong Integration Type:</strong> Use Private Integration, not Agency API</li>
            <li><strong>Expired Token:</strong> API keys may expire - generate a new one</li>
          </ol>
          <button type="button" className="btn-close" onClick={() => setTestResult(null)}></button>
        </div>
      )}

      {/* Status Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className={`card text-white ${settings.isEnabled ? 'bg-success' : 'bg-warning'}`}>
            <div className="card-body">
              <h6 className="card-title">Sync Status</h6>
              <h3>{settings.isEnabled ? 'Enabled' : 'Disabled'}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h6 className="card-title">Synced Contacts</h6>
              <h3>{settings.syncedContacts}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h6 className="card-title">Synced Workflows</h6>
              <h3>{settings.syncedWorkflows}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-secondary text-white">
            <div className="card-body">
              <h6 className="card-title">Last Sync</h6>
              <h6>
                {settings.lastSync ? (
                  new Date(settings.lastSync).toLocaleDateString()
                ) : (
                  'Never'
                )}
              </h6>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="row mb-4">
          <div className="col-12">
            <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
              <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
              {message.text}
              <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Form */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-primary text-white border-0">
              <h5 className="mb-0 fw-bold">
                <i className="fas fa-key me-2"></i>
                API Configuration
              </h5>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSave}>
                <div className="row g-4">
                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-lock me-1 text-danger"></i>
                      GoHighLevel API Key *
                    </label>
                    <div className="input-group">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        className="form-control form-control-lg border-2"
                        value={settings.apiKey}
                        onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                        placeholder="Enter your GoHighLevel API Key"
                        required
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        <i className={`fas fa-${showApiKey ? 'eye-slash' : 'eye'}`}></i>
                      </button>
                    </div>
                    <div className="form-text">
                      Get your API Key from GoHighLevel Settings → API Keys
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-map-marker-alt me-1 text-primary"></i>
                      GoHighLevel Location ID *
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg border-2"
                      value={settings.locationId || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, locationId: e.target.value }))}
                      placeholder="Enter your GoHighLevel Location ID"
                      required
                    />
                    <div className="form-text">
                      Get your Location ID from GoHighLevel Settings → Business Profile
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="card bg-light border-2 border-info">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-1 fw-bold">
                              <i className="fas fa-calendar-check me-2 text-info"></i>
                              Use GHL Calendar Availability
                            </h6>
                            <p className="mb-0 small text-muted">
                              When enabled, booking system will use GHL calendar rules and available slots instead of website's built-in availability system.
                            </p>
                          </div>
                          <div className="form-check form-switch ms-3">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              id="useGHLAvailability"
                              checked={settings.useGHLAvailability || false}
                              onChange={(e) => setSettings(prev => ({ ...prev, useGHLAvailability: e.target.checked }))}
                              style={{ width: '3rem', height: '1.5rem' }}
                            />
                            <label className="form-check-label ms-2 fw-bold" htmlFor="useGHLAvailability">
                              {settings.useGHLAvailability ? 'ON' : 'OFF'}
                            </label>
                          </div>
                        </div>
                        <div className="mt-3">
                          <small className="text-muted">
                            <i className="fas fa-info-circle me-1"></i>
                            <strong>GHL Mode:</strong> Uses calendar booking rules, free slots, and team member availability from GoHighLevel.
                            <br />
                            <i className="fas fa-info-circle me-1"></i>
                            <strong>Website Mode:</strong> Uses artist availability configured in the Artist Availability tab.
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row g-3 mt-2">
                  <div className="col-md-6">
                    <button
                      type="button"
                      className="btn btn-outline-info btn-lg w-100"
                      onClick={handleTestConnection}
                      disabled={saving || syncing}
                    >
                      <i className="fas fa-plug me-2"></i>Test Connection
                    </button>
                  </div>
                  <div className="col-md-6">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg w-100"
                      disabled={saving || syncing}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>Save API Key
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {testResult && (
                  <div className={`alert alert-${testResult.type === 'success' ? 'success' : 'danger'} mt-3`}>
                    {testResult.message}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Controls */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-success text-white border-0">
              <h5 className="mb-0 fw-bold">
                <i className="fas fa-sync me-2"></i>
                Synchronization Controls
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-md-6">
                  <button
                    className={`btn btn-${settings.isEnabled ? 'warning' : 'success'} btn-lg w-100`}
                    onClick={handleToggleSync}
                    disabled={syncing || !settings.apiKey}
                  >
                    {syncing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        {settings.isEnabled ? 'Disabling...' : 'Enabling...'}
                      </>
                    ) : (
                      <>
                        <i className={`fas fa-${settings.isEnabled ? 'pause' : 'play'} me-2`}></i>
                        {settings.isEnabled ? 'Disable Sync' : 'Enable Sync'}
                      </>
                    )}
                  </button>
                </div>
                <div className="col-md-6">
                  <button
                    className="btn btn-info btn-lg w-100"
                    onClick={handleFullSync}
                    disabled={syncing || !settings.apiKey}
                  >
                    {syncing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Syncing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sync-alt me-2"></i>Full Sync Now
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="alert alert-info mt-3">
                <i className="fas fa-info-circle me-2"></i>
                <strong>Full Sync:</strong> Synchronizes all contacts and workflows from GoHighLevel to your database. This may take a few minutes depending on the amount of data.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-info border-2">
            <div className="card-header bg-info bg-opacity-10">
              <h6 className="mb-0 fw-bold text-info">
                <i className="fas fa-question-circle me-2"></i>
                How to Get Your API Key
              </h6>
            </div>
            <div className="card-body">
              <ol>
                <li>Log in to your GoHighLevel account</li>
                <li>Navigate to Settings → API Keys</li>
                <li>Create a new API Key or copy an existing one</li>
                <li>Paste the key above and click "Test Connection"</li>
                <li>Once verified, click "Save API Key"</li>
                <li>Enable sync and run "Full Sync Now" to import your contacts</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
