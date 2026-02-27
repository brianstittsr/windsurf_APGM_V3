'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

type CalendarProvider = 'gohighlevel' | 'google' | 'both' | 'none';

interface CalendarSettings {
  primaryProvider: CalendarProvider;
  enableGHL: boolean;
  enableGoogle: boolean;
  syncBidirectional: boolean;
}

export default function CalendarProviderSettings() {
  const [settings, setSettings] = useState<CalendarSettings>({
    primaryProvider: 'gohighlevel',
    enableGHL: true,
    enableGoogle: false,
    syncBidirectional: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const docRef = doc(getDb(), 'settings', 'calendarProvider');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setSettings(docSnap.data() as CalendarSettings);
      }
    } catch (error) {
      console.error('Error fetching calendar settings:', error);
      toast.error('Failed to load calendar settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(getDb(), 'settings', 'calendarProvider');
      await setDoc(docRef, {
        ...settings,
        updatedAt: new Date()
      });

      toast.success('Calendar provider settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleProviderChange = (provider: CalendarProvider) => {
    const newSettings = { ...settings, primaryProvider: provider };
    
    // Auto-enable/disable based on selection
    switch (provider) {
      case 'gohighlevel':
        newSettings.enableGHL = true;
        newSettings.enableGoogle = false;
        break;
      case 'google':
        newSettings.enableGHL = false;
        newSettings.enableGoogle = true;
        break;
      case 'both':
        newSettings.enableGHL = true;
        newSettings.enableGoogle = true;
        break;
      case 'none':
        newSettings.enableGHL = false;
        newSettings.enableGoogle = false;
        break;
    }
    
    setSettings(newSettings);
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
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#AD6269]/10 rounded-lg">
          <Calendar className="h-6 w-6 text-[#AD6269]" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Calendar Provider Settings</h2>
          <p className="text-sm text-gray-500">Choose which calendar system to use for bookings and availability</p>
        </div>
      </div>

      {/* Provider Selection */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
          <CardTitle className="text-base font-semibold text-gray-900">Primary Calendar Provider</CardTitle>
          <CardDescription>Select which calendar system will manage your bookings</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* GoHighLevel Option */}
            <button
              onClick={() => handleProviderChange('gohighlevel')}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                settings.primaryProvider === 'gohighlevel'
                  ? 'border-[#AD6269] bg-[#AD6269]/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">GoHighLevel</h3>
                    <p className="text-xs text-gray-500">CRM + Calendar</p>
                  </div>
                </div>
                {settings.primaryProvider === 'gohighlevel' && (
                  <Check className="h-5 w-5 text-[#AD6269]" />
                )}
              </div>
              <p className="text-sm text-gray-600">
                Full CRM integration with automated workflows, contact management, and appointment scheduling.
              </p>
            </button>

            {/* Google Calendar Option */}
            <button
              onClick={() => handleProviderChange('google')}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                settings.primaryProvider === 'google'
                  ? 'border-[#AD6269] bg-[#AD6269]/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Google Calendar</h3>
                    <p className="text-xs text-gray-500">Personal Calendar</p>
                  </div>
                </div>
                {settings.primaryProvider === 'google' && (
                  <Check className="h-5 w-5 text-[#AD6269]" />
                )}
              </div>
              <p className="text-sm text-gray-600">
                Sync with artist's personal Google Calendar for availability and appointment management.
              </p>
            </button>

            {/* Both Option */}
            <button
              onClick={() => handleProviderChange('both')}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                settings.primaryProvider === 'both'
                  ? 'border-[#AD6269] bg-[#AD6269]/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Both Systems</h3>
                    <p className="text-xs text-gray-500">Dual Sync</p>
                  </div>
                </div>
                {settings.primaryProvider === 'both' && (
                  <Check className="h-5 w-5 text-[#AD6269]" />
                )}
              </div>
              <p className="text-sm text-gray-600">
                Sync bookings to both GoHighLevel and Google Calendar simultaneously.
              </p>
            </button>

            {/* None Option */}
            <button
              onClick={() => handleProviderChange('none')}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                settings.primaryProvider === 'none'
                  ? 'border-[#AD6269] bg-[#AD6269]/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Website Only</h3>
                    <p className="text-xs text-gray-500">No External Sync</p>
                  </div>
                </div>
                {settings.primaryProvider === 'none' && (
                  <Check className="h-5 w-5 text-[#AD6269]" />
                )}
              </div>
              <p className="text-sm text-gray-600">
                Manage bookings only through this website without external calendar sync.
              </p>
            </button>
          </div>

          {/* Bidirectional Sync Option */}
          {settings.primaryProvider !== 'none' && (
            <div className="pt-4 border-t border-gray-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.syncBidirectional}
                  onChange={(e) => setSettings({ ...settings, syncBidirectional: e.target.checked })}
                  className="mt-1 h-4 w-4 text-[#AD6269] border-gray-300 rounded focus:ring-[#AD6269]"
                />
                <div>
                  <div className="font-medium text-gray-900">Enable Bidirectional Sync</div>
                  <p className="text-sm text-gray-600">
                    Automatically import events from external calendars to block availability on your website.
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Status Alerts */}
          {settings.primaryProvider === 'gohighlevel' && (
            <Alert className="bg-purple-50 border-purple-200">
              <AlertCircle className="h-4 w-4 text-purple-600" />
              <AlertDescription className="text-purple-800">
                <strong>GoHighLevel Active:</strong> Bookings will sync to GHL CRM with automated workflows and contact management.
              </AlertDescription>
            </Alert>
          )}

          {settings.primaryProvider === 'google' && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Google Calendar Active:</strong> Artists must connect their Google Calendar in the Integrations section.
              </AlertDescription>
            </Alert>
          )}

          {settings.primaryProvider === 'both' && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Dual Sync Active:</strong> Bookings will sync to both systems. Ensure both integrations are configured.
              </AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-[#AD6269] hover:bg-[#9d5860]"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>

      {/* Configuration Status */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
          <CardTitle className="text-base font-semibold text-gray-900">Integration Status</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${settings.enableGHL ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="font-medium text-gray-900">GoHighLevel</span>
            </div>
            <span className="text-sm text-gray-600">
              {settings.enableGHL ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${settings.enableGoogle ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="font-medium text-gray-900">Google Calendar</span>
            </div>
            <span className="text-sm text-gray-600">
              {settings.enableGoogle ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
