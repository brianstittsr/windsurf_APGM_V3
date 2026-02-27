'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Check, AlertCircle, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface GoogleCalendarConfig {
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  enabled?: boolean;
}

import CalendarProviderSettings from './CalendarProviderSettings';

export default function GoogleCalendarIntegration() {
  const [config, setConfig] = useState<GoogleCalendarConfig>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const docRef = doc(getDb(), 'integrationSettings', 'googleCalendar');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setConfig(docSnap.data() as GoogleCalendarConfig);
        if (docSnap.data().clientId && docSnap.data().clientSecret) {
          setStep(4); // Already configured
        }
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      toast.error('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config.clientId || !config.clientSecret) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const redirectUri = `${window.location.origin}/api/auth/google-calendar/callback`;
      
      const docRef = doc(getDb(), 'integrationSettings', 'googleCalendar');
      await setDoc(docRef, {
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        redirectUri,
        enabled: true,
        updatedAt: new Date()
      });

      toast.success('Google Calendar configuration saved successfully!');
      setStep(4);
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTestStatus('testing');
    try {
      const response = await fetch('/api/integrations/google-calendar/test');
      const data = await response.json();
      
      if (response.ok) {
        setTestStatus('success');
        toast.success('Google Calendar connection successful!');
      } else {
        setTestStatus('error');
        toast.error(data.error || 'Connection test failed');
      }
    } catch (error) {
      setTestStatus('error');
      toast.error('Failed to test connection');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopied(null), 2000);
  };

  const redirectUri = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/auth/google-calendar/callback`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#AD6269]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar Provider Settings */}
      <CalendarProviderSettings />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#AD6269]/10 rounded-lg">
          <Calendar className="h-6 w-6 text-[#AD6269]" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Google Calendar Integration</h2>
          <p className="text-sm text-gray-500">Connect your Google Calendar to sync appointments automatically</p>
        </div>
      </div>

      {/* Setup Wizard */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
          <CardTitle className="text-base font-semibold text-gray-900">Setup Wizard</CardTitle>
          <CardDescription>Follow these steps to configure Google Calendar integration</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step >= s ? 'border-[#AD6269] bg-[#AD6269] text-white' : 'border-gray-300 text-gray-400'
                }`}>
                  {step > s ? <Check className="h-5 w-5" /> : s}
                </div>
                {s < 4 && (
                  <div className={`w-24 h-1 mx-2 ${step > s ? 'bg-[#AD6269]' : 'bg-gray-300'}`}></div>
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Create Google Cloud Project */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Step 1: Create Google Cloud Project</h3>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You'll need a Google Cloud account to create OAuth credentials.
                </AlertDescription>
              </Alert>
              
              <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700">
                <li>
                  Go to{' '}
                  <a 
                    href="https://console.cloud.google.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#AD6269] hover:underline inline-flex items-center gap-1"
                  >
                    Google Cloud Console
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>Create a new project or select an existing one</li>
                <li>Enable the Google Calendar API:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>Go to "APIs & Services" → "Library"</li>
                    <li>Search for "Google Calendar API"</li>
                    <li>Click "Enable"</li>
                  </ul>
                </li>
              </ol>

              <Button onClick={() => setStep(2)} className="bg-[#AD6269] hover:bg-[#9d5860]">
                Next: Configure OAuth
              </Button>
            </div>
          )}

          {/* Step 2: Configure OAuth Consent Screen */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Step 2: Configure OAuth Consent Screen</h3>
              
              <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700">
                <li>In Google Cloud Console, go to "APIs & Services" → "OAuth consent screen"</li>
                <li>Select "External" user type (or "Internal" if using Google Workspace)</li>
                <li>Fill in the required information:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>App name: Your business name</li>
                    <li>User support email: Your email</li>
                    <li>Developer contact: Your email</li>
                  </ul>
                </li>
                <li>Add scopes:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li><code className="bg-gray-100 px-2 py-1 rounded text-xs">https://www.googleapis.com/auth/calendar</code></li>
                    <li><code className="bg-gray-100 px-2 py-1 rounded text-xs">https://www.googleapis.com/auth/calendar.events</code></li>
                  </ul>
                </li>
              </ol>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)} className="bg-[#AD6269] hover:bg-[#9d5860]">
                  Next: Create Credentials
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Create OAuth Credentials */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Step 3: Create OAuth Credentials</h3>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Copy this redirect URI - you'll need it in the next step
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Authorized Redirect URI</Label>
                <div className="flex gap-2">
                  <Input 
                    value={redirectUri}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(redirectUri, 'Redirect URI')}
                  >
                    {copied === 'Redirect URI' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700">
                <li>Go to "APIs & Services" → "Credentials"</li>
                <li>Click "Create Credentials" → "OAuth client ID"</li>
                <li>Select "Web application" as the application type</li>
                <li>Name: "PMU Website Calendar Integration"</li>
                <li>Add the redirect URI shown above to "Authorized redirect URIs"</li>
                <li>Click "Create"</li>
                <li>Copy the Client ID and Client Secret</li>
              </ol>

              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="clientId">Client ID *</Label>
                  <Input
                    id="clientId"
                    placeholder="123456789-abc123.apps.googleusercontent.com"
                    value={config.clientId || ''}
                    onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientSecret">Client Secret *</Label>
                  <Input
                    id="clientSecret"
                    type="password"
                    placeholder="GOCSPX-..."
                    value={config.clientSecret || ''}
                    onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button 
                  onClick={handleSave} 
                  disabled={saving || !config.clientId || !config.clientSecret}
                  className="bg-[#AD6269] hover:bg-[#9d5860]"
                >
                  {saving ? 'Saving...' : 'Save & Continue'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Test Connection */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Step 4: Configuration Complete</h3>
              
              <Alert className="bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Google Calendar integration is configured and ready to use!
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Client ID</p>
                    <p className="text-sm text-gray-500 font-mono">{config.clientId?.substring(0, 30)}...</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Client Secret</p>
                    <p className="text-sm text-gray-500">••••••••••••••••</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>

              <div className="pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Next Steps:</h4>
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                  <li>Artists can now connect their Google Calendar from the Artist Availability page</li>
                  <li>Appointments will automatically sync to their connected calendars</li>
                  <li>You can reconfigure these settings anytime by clicking "Reconfigure" below</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                >
                  Reconfigure
                </Button>
                <Button 
                  onClick={handleTest}
                  disabled={testStatus === 'testing'}
                  className="bg-[#AD6269] hover:bg-[#9d5860]"
                >
                  {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                </Button>
              </div>

              {testStatus === 'success' && (
                <Alert className="bg-green-50 border-green-200">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Connection test successful! Google Calendar integration is working properly.
                  </AlertDescription>
                </Alert>
              )}

              {testStatus === 'error' && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    Connection test failed. Please verify your credentials and try again.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documentation Card */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
          <CardTitle className="text-base font-semibold text-gray-900">Documentation</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-3">
          <div className="text-sm text-gray-700 space-y-2">
            <p><strong>How it works:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Each artist can connect their personal Google Calendar</li>
              <li>Bookings are automatically synced to their calendar</li>
              <li>Calendar events are created with client details and service information</li>
              <li>Artists can disconnect their calendar anytime</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
