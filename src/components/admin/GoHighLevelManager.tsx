'use client';

import { useState, useEffect } from 'react';
import { DatabaseService } from '@/services/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Cloud, 
  Globe, 
  Bot, 
  ArrowRight, 
  ArrowLeftRight, 
  Key, 
  MapPin, 
  Calendar, 
  Plug, 
  Save, 
  Play, 
  Pause, 
  RefreshCw, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  Eye, 
  EyeOff,
  Info,
  Users,
  Workflow,
  Clock
} from 'lucide-react';

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
        body: JSON.stringify({ 
          apiKey: settings.apiKey,
          locationId: settings.locationId 
        })
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
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#AD6269]"></div>
        <p className="mt-4 text-gray-500">Loading GoHighLevel settings...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 mb-6 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-3 mb-2">
          <Cloud className="w-7 h-7" />
          GoHighLevel Integration
        </h2>
        <p className="text-white/80">
          Connect your GoHighLevel CRM account and manage contact synchronization
        </p>
      </div>

      {/* BMAD Orchestrator Integration Diagram */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6 overflow-hidden">
        <div className="bg-[#AD6269] text-white px-6 py-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Workflow className="w-5 h-5" />
            BMAD Orchestrator Integration Flow
          </h3>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
            <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 w-full md:w-auto">
              <Globe className="w-8 h-8 text-[#AD6269] mx-auto mb-2" />
              <h4 className="font-semibold text-gray-900">Your Website</h4>
              <p className="text-sm text-gray-500">Booking, Forms, Payments</p>
            </div>
            <ArrowRight className="w-6 h-6 text-gray-400 hidden md:block" />
            <div className="p-4 border border-blue-200 rounded-xl bg-blue-500 text-white w-full md:w-auto">
              <Bot className="w-8 h-8 mx-auto mb-2" />
              <h4 className="font-semibold">BMAD Orchestrator</h4>
              <p className="text-sm text-blue-100">Intelligent Automation</p>
            </div>
            <ArrowLeftRight className="w-6 h-6 text-gray-400 hidden md:block" />
            <div className="p-4 border border-green-200 rounded-xl bg-green-500 text-white w-full md:w-auto">
              <Cloud className="w-8 h-8 mx-auto mb-2" />
              <h4 className="font-semibold">GoHighLevel</h4>
              <p className="text-sm text-green-100">CRM, Workflows, Automation</p>
            </div>
          </div>
          <div className="mt-6">
            <h4 className="text-[#AD6269] font-semibold mb-3">What BMAD Orchestrator Does:</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li><span className="font-medium text-gray-900">Syncs Contacts:</span> Automatically creates/updates contacts in GHL when bookings are made</li>
              <li><span className="font-medium text-gray-900">Triggers Workflows:</span> Initiates GHL workflows for follow-ups, reminders, and campaigns</li>
              <li><span className="font-medium text-gray-900">Manages Appointments:</span> Syncs calendar appointments between your site and GHL</li>
              <li><span className="font-medium text-gray-900">Handles Invoices:</span> Creates and sends invoices through GHL</li>
              <li><span className="font-medium text-gray-900">Tracks Opportunities:</span> Updates pipeline stages based on customer actions</li>
              <li><span className="font-medium text-gray-900">Sends Messages:</span> Automated SMS/email through GHL conversations</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Troubleshooting Section */}
      {testResult?.type === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-red-800 font-semibold flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5" />
                Connection Issue Detected
              </h4>
              <p className="text-red-700 mb-3">{testResult.message}</p>
              <h5 className="text-red-800 font-medium mb-2">Common Issues & Solutions:</h5>
              <ol className="text-sm text-red-700 space-y-1 list-decimal list-inside">
                <li><span className="font-medium">Missing Scopes:</span> Ensure all required scopes are enabled in GHL Private Integration settings</li>
                <li><span className="font-medium">Invalid API Key:</span> Regenerate your API key after enabling scopes</li>
                <li><span className="font-medium">Wrong Integration Type:</span> Use Private Integration, not Agency API</li>
                <li><span className="font-medium">Expired Token:</span> API keys may expire - generate a new one</li>
              </ol>
            </div>
            <button onClick={() => setTestResult(null)} className="text-red-500 hover:text-red-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className={`rounded-xl p-5 text-white ${settings.isEnabled ? 'bg-green-500' : 'bg-yellow-500'}`}>
          <p className="text-sm text-white/80 mb-1">Sync Status</p>
          <h3 className="text-2xl font-bold">{settings.isEnabled ? 'Enabled' : 'Disabled'}</h3>
        </div>
        <div className="bg-blue-500 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 text-sm text-white/80 mb-1">
            <Users className="w-4 h-4" />
            Synced Contacts
          </div>
          <h3 className="text-2xl font-bold">{settings.syncedContacts}</h3>
        </div>
        <div className="bg-[#AD6269] rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 text-sm text-white/80 mb-1">
            <Workflow className="w-4 h-4" />
            Synced Workflows
          </div>
          <h3 className="text-2xl font-bold">{settings.syncedWorkflows}</h3>
        </div>
        <div className="bg-gray-500 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 text-sm text-white/80 mb-1">
            <Clock className="w-4 h-4" />
            Last Sync
          </div>
          <h3 className="text-lg font-bold">
            {settings.lastSync ? new Date(settings.lastSync).toLocaleDateString() : 'Never'}
          </h3>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className={`flex items-center justify-between px-4 py-3 rounded-lg mb-6 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            {message.text}
          </div>
          <button onClick={() => setMessage(null)} className={message.type === 'success' ? 'text-green-500 hover:text-green-700' : 'text-red-500 hover:text-red-700'}>
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Settings Form */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6 overflow-hidden">
        <div className="bg-[#AD6269] text-white px-6 py-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Configuration
          </h3>
        </div>
        <div className="p-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="flex items-center gap-1">
                  <Key className="w-4 h-4 text-red-500" />
                  GoHighLevel API Key *
                </span>
              </label>
              <div className="flex">
                <Input
                  type={showApiKey ? 'text' : 'password'}
                  value={settings.apiKey}
                  onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="Enter your GoHighLevel API Key"
                  required
                  className="rounded-r-none"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="px-4 border border-l-0 border-gray-300 rounded-r-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Get your API Key from GoHighLevel Settings → API Keys
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-[#AD6269]" />
                  GoHighLevel Location ID *
                </span>
              </label>
              <Input
                type="text"
                value={settings.locationId || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, locationId: e.target.value }))}
                placeholder="Enter your GoHighLevel Location ID"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Get your Location ID from GoHighLevel Settings → Business Profile
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-1">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    Use GHL Calendar Availability
                  </h4>
                  <p className="text-sm text-gray-600">
                    When enabled, booking system will use GHL calendar rules and available slots instead of website's built-in availability system.
                  </p>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={settings.useGHLAvailability || false}
                      onChange={(e) => setSettings(prev => ({ ...prev, useGHLAvailability: e.target.checked }))}
                      className="sr-only"
                    />
                    <div className={`w-14 h-7 rounded-full transition-colors ${settings.useGHLAvailability ? 'bg-blue-500' : 'bg-gray-300'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${settings.useGHLAvailability ? 'translate-x-7' : ''}`}></div>
                    </div>
                  </div>
                  <span className="font-semibold text-gray-700">{settings.useGHLAvailability ? 'ON' : 'OFF'}</span>
                </label>
              </div>
              <div className="mt-3 text-sm text-gray-600 space-y-1">
                <p className="flex items-start gap-1">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span><strong>GHL Mode:</strong> Uses calendar booking rules, free slots, and team member availability from GoHighLevel.</span>
                </p>
                <p className="flex items-start gap-1">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Website Mode:</strong> Uses artist availability configured in the Artist Availability tab.</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={saving || syncing}
                className="w-full"
              >
                <Plug className="w-4 h-4 mr-2" />
                Test Connection
              </Button>
              <Button
                type="submit"
                disabled={saving || syncing}
                className="w-full bg-[#AD6269] hover:bg-[#9d5860] text-white"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save API Key
                  </>
                )}
              </Button>
            </div>

            {testResult && testResult.type === 'success' && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                {testResult.message}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Sync Controls */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6 overflow-hidden">
        <div className="bg-green-500 text-white px-6 py-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Synchronization Controls
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleToggleSync}
              disabled={syncing || !settings.apiKey}
              className={`w-full ${settings.isEnabled ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
            >
              {syncing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {settings.isEnabled ? 'Disabling...' : 'Enabling...'}
                </>
              ) : (
                <>
                  {settings.isEnabled ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {settings.isEnabled ? 'Disable Sync' : 'Enable Sync'}
                </>
              )}
            </Button>
            <Button
              onClick={handleFullSync}
              disabled={syncing || !settings.apiKey}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              {syncing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Full Sync Now
                </>
              )}
            </Button>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-700">
              <strong>Full Sync:</strong> Synchronizes all contacts and workflows from GoHighLevel to your database. This may take a few minutes depending on the amount of data.
            </p>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white border border-blue-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
          <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            How to Get Your API Key
          </h3>
        </div>
        <div className="p-6">
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
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
  );
}
