'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mic, 
  MessageSquare, 
  Phone, 
  Check, 
  AlertCircle, 
  Copy, 
  CheckCircle,
  Smartphone,
  Volume2,
  Settings,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface AlexaConfig {
  skillId?: string;
  skillName?: string;
  invocationName?: string;
  endpointUrl?: string;
  enabled?: boolean;
}

interface SMSConfig {
  provider?: 'twilio' | 'aws-sns' | 'ghl';
  accountSid?: string;
  authToken?: string;
  phoneNumber?: string;
  enabled?: boolean;
}

interface VoiceCommand {
  id: string;
  command: string;
  intent: string;
  response: string;
  action: string;
}

const defaultCommands: VoiceCommand[] = [
  {
    id: '1',
    command: 'Book an appointment',
    intent: 'BookAppointment',
    response: 'I can help you book an appointment. What service are you interested in?',
    action: 'initiate_booking'
  },
  {
    id: '2',
    command: 'Check availability',
    intent: 'CheckAvailability',
    response: 'Let me check our available time slots. What date are you looking for?',
    action: 'check_availability'
  },
  {
    id: '3',
    command: 'Get service information',
    intent: 'ServiceInfo',
    response: 'We offer permanent makeup services including microblading, lip blushing, and more. Which service would you like to know about?',
    action: 'get_services'
  },
  {
    id: '4',
    command: 'Cancel appointment',
    intent: 'CancelAppointment',
    response: 'I can help you cancel your appointment. Can you provide your booking confirmation number?',
    action: 'cancel_booking'
  },
  {
    id: '5',
    command: 'Get business hours',
    intent: 'BusinessHours',
    response: 'We are open Monday through Friday, 9 AM to 6 PM, and Saturday 10 AM to 4 PM. We are closed on Sundays.',
    action: 'get_hours'
  }
];

export default function AlexaSkillsManager() {
  const [activeTab, setActiveTab] = useState<'alexa' | 'sms' | 'commands'>('alexa');
  const [alexaConfig, setAlexaConfig] = useState<AlexaConfig>({});
  const [smsConfig, setSmsConfig] = useState<SMSConfig>({ provider: 'twilio' });
  const [commands, setCommands] = useState<VoiceCommand[]>(defaultCommands);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingAlexa, setTestingAlexa] = useState(false);
  const [testingSMS, setTestingSMS] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const alexaRef = doc(getDb(), 'integrationSettings', 'alexa');
      const smsRef = doc(getDb(), 'integrationSettings', 'sms');

      const [alexaSnap, smsSnap] = await Promise.all([
        getDoc(alexaRef),
        getDoc(smsRef)
      ]);

      if (alexaSnap.exists()) {
        setAlexaConfig(alexaSnap.data() as AlexaConfig);
      }

      if (smsSnap.exists()) {
        setSmsConfig(smsSnap.data() as SMSConfig);
      }
    } catch (error) {
      console.error('Error fetching configs:', error);
      toast.error('Failed to load configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAlexa = async () => {
    setSaving(true);
    try {
      const endpointUrl = `${window.location.origin}/api/alexa/webhook`;
      
      const docRef = doc(getDb(), 'integrationSettings', 'alexa');
      await setDoc(docRef, {
        ...alexaConfig,
        endpointUrl,
        enabled: true,
        updatedAt: new Date()
      });

      toast.success('Alexa configuration saved successfully!');
    } catch (error) {
      console.error('Error saving Alexa config:', error);
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSMS = async () => {
    setSaving(true);
    try {
      const docRef = doc(getDb(), 'integrationSettings', 'sms');
      await setDoc(docRef, {
        ...smsConfig,
        enabled: true,
        updatedAt: new Date()
      });

      toast.success('SMS configuration saved successfully!');
    } catch (error) {
      console.error('Error saving SMS config:', error);
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTestAlexa = async () => {
    setTestingAlexa(true);
    try {
      const response = await fetch('/api/alexa/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: 'TestIntent' })
      });

      if (response.ok) {
        toast.success('Alexa skill is working correctly!');
      } else {
        toast.error('Alexa skill test failed');
      }
    } catch (error) {
      toast.error('Failed to test Alexa skill');
    } finally {
      setTestingAlexa(false);
    }
  };

  const handleTestSMS = async () => {
    setTestingSMS(true);
    try {
      const response = await fetch('/api/sms/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        toast.success('Test SMS sent successfully!');
      } else {
        toast.error('SMS test failed');
      }
    } catch (error) {
      toast.error('Failed to send test SMS');
    } finally {
      setTestingSMS(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopied(null), 2000);
  };

  const endpointUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/alexa/webhook`;

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
          <Mic className="h-6 w-6 text-[#AD6269]" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Alexa Skills & SMS Integration</h2>
          <p className="text-sm text-gray-500">Voice commands and mobile texting for your PMU business</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('alexa')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'alexa'
                ? 'border-[#AD6269] text-[#AD6269]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Alexa Skills
            </div>
          </button>
          <button
            onClick={() => setActiveTab('sms')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'sms'
                ? 'border-[#AD6269] text-[#AD6269]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              SMS/Texting
            </div>
          </button>
          <button
            onClick={() => setActiveTab('commands')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'commands'
                ? 'border-[#AD6269] text-[#AD6269]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Voice Commands
            </div>
          </button>
        </div>

        {/* Alexa Skills Tab */}
        {activeTab === 'alexa' && (
          <div className="space-y-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="text-base font-semibold text-gray-900">Alexa Skill Configuration</CardTitle>
              <CardDescription>Connect your Amazon Alexa skill to enable voice booking</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Prerequisites:</strong> You need an Amazon Developer account and an Alexa skill created in the Alexa Developer Console.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="skillName">Skill Name *</Label>
                  <Input
                    id="skillName"
                    placeholder="PMU Booking Assistant"
                    value={alexaConfig.skillName || ''}
                    onChange={(e) => setAlexaConfig({ ...alexaConfig, skillName: e.target.value })}
                  />
                  <p className="text-xs text-gray-500">The name users will see in the Alexa app</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invocationName">Invocation Name *</Label>
                  <Input
                    id="invocationName"
                    placeholder="beauty booking"
                    value={alexaConfig.invocationName || ''}
                    onChange={(e) => setAlexaConfig({ ...alexaConfig, invocationName: e.target.value })}
                  />
                  <p className="text-xs text-gray-500">Users say "Alexa, open [invocation name]"</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skillId">Skill ID</Label>
                  <Input
                    id="skillId"
                    placeholder="amzn1.ask.skill.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    value={alexaConfig.skillId || ''}
                    onChange={(e) => setAlexaConfig({ ...alexaConfig, skillId: e.target.value })}
                  />
                  <p className="text-xs text-gray-500">Found in Alexa Developer Console</p>
                </div>

                <div className="space-y-2">
                  <Label>Webhook Endpoint URL</Label>
                  <div className="flex gap-2">
                    <Input
                      value={endpointUrl}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(endpointUrl, 'Endpoint URL')}
                    >
                      {copied === 'Endpoint URL' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">Use this URL in your Alexa skill's endpoint configuration</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleSaveAlexa} 
                  disabled={saving || !alexaConfig.skillName || !alexaConfig.invocationName}
                  className="bg-[#AD6269] hover:bg-[#9d5860]"
                >
                  {saving ? 'Saving...' : 'Save Configuration'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleTestAlexa}
                  disabled={testingAlexa || !alexaConfig.skillId}
                >
                  {testingAlexa ? 'Testing...' : 'Test Skill'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Setup Instructions */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="text-base font-semibold text-gray-900">Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700">
                <li>Go to <a href="https://developer.amazon.com/alexa/console/ask" target="_blank" rel="noopener noreferrer" className="text-[#AD6269] hover:underline">Alexa Developer Console</a></li>
                <li>Create a new skill or select existing skill</li>
                <li>Set the invocation name (what users say to activate)</li>
                <li>Configure the endpoint:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>Choose "HTTPS" as endpoint type</li>
                    <li>Paste the webhook URL from above</li>
                    <li>Select "My development endpoint is a sub-domain..."</li>
                  </ul>
                </li>
                <li>Build the interaction model using the intents below</li>
                <li>Test in the Alexa Simulator</li>
                <li>Submit for certification (optional)</li>
              </ol>
            </CardContent>
          </Card>
          </div>
        )}

        {/* SMS/Texting Tab */}
        {activeTab === 'sms' && (
          <div className="space-y-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="text-base font-semibold text-gray-900">SMS Configuration</CardTitle>
              <CardDescription>Enable text message notifications and two-way SMS</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>SMS Provider</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setSmsConfig({ ...smsConfig, provider: 'twilio' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        smsConfig.provider === 'twilio'
                          ? 'border-[#AD6269] bg-[#AD6269]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">Twilio</div>
                      <div className="text-xs text-gray-500 mt-1">Most popular</div>
                    </button>
                    <button
                      onClick={() => setSmsConfig({ ...smsConfig, provider: 'aws-sns' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        smsConfig.provider === 'aws-sns'
                          ? 'border-[#AD6269] bg-[#AD6269]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">AWS SNS</div>
                      <div className="text-xs text-gray-500 mt-1">Enterprise</div>
                    </button>
                    <button
                      onClick={() => setSmsConfig({ ...smsConfig, provider: 'ghl' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        smsConfig.provider === 'ghl'
                          ? 'border-[#AD6269] bg-[#AD6269]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">GoHighLevel</div>
                      <div className="text-xs text-gray-500 mt-1">Integrated</div>
                    </button>
                  </div>
                </div>

                {smsConfig.provider === 'twilio' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="accountSid">Twilio Account SID *</Label>
                      <Input
                        id="accountSid"
                        placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        value={smsConfig.accountSid || ''}
                        onChange={(e) => setSmsConfig({ ...smsConfig, accountSid: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="authToken">Twilio Auth Token *</Label>
                      <Input
                        id="authToken"
                        type="password"
                        placeholder="••••••••••••••••••••••••••••••••"
                        value={smsConfig.authToken || ''}
                        onChange={(e) => setSmsConfig({ ...smsConfig, authToken: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Twilio Phone Number *</Label>
                      <Input
                        id="phoneNumber"
                        placeholder="+1234567890"
                        value={smsConfig.phoneNumber || ''}
                        onChange={(e) => setSmsConfig({ ...smsConfig, phoneNumber: e.target.value })}
                      />
                      <p className="text-xs text-gray-500">Your Twilio phone number in E.164 format</p>
                    </div>
                  </>
                )}

                {smsConfig.provider === 'ghl' && (
                  <Alert className="bg-green-50 border-green-200">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>GoHighLevel SMS:</strong> If you have GoHighLevel configured, SMS will automatically use your GHL phone number and workflows.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleSaveSMS} 
                  disabled={saving}
                  className="bg-[#AD6269] hover:bg-[#9d5860]"
                >
                  {saving ? 'Saving...' : 'Save Configuration'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleTestSMS}
                  disabled={testingSMS}
                >
                  {testingSMS ? 'Sending...' : 'Send Test SMS'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* SMS Features */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="text-base font-semibold text-gray-900">SMS Features</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Booking Confirmations</div>
                    <p className="text-sm text-gray-600 mt-1">Automatic SMS when booking is confirmed</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Appointment Reminders</div>
                    <p className="text-sm text-gray-600 mt-1">24hr and 1hr before appointment</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Two-Way Messaging</div>
                    <p className="text-sm text-gray-600 mt-1">Clients can reply to confirm/reschedule</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Status Updates</div>
                    <p className="text-sm text-gray-600 mt-1">Notify clients of any changes</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        )}

        {/* Voice Commands Tab */}
        {activeTab === 'commands' && (
          <div className="space-y-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="text-base font-semibold text-gray-900">Supported Voice Commands</CardTitle>
              <CardDescription>Commands your Alexa skill will understand</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {commands.map((cmd) => (
                  <div key={cmd.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Mic className="h-4 w-4 text-[#AD6269]" />
                        <span className="font-semibold text-gray-900">{cmd.command}</span>
                      </div>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{cmd.intent}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Response:</strong> "{cmd.response}"
                    </p>
                    <p className="text-xs text-gray-500">
                      <strong>Action:</strong> {cmd.action}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Intent Schema */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="text-base font-semibold text-gray-900">Intent Schema (JSON)</CardTitle>
              <CardDescription>Copy this to your Alexa skill's interaction model</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 z-10"
                  onClick={() => copyToClipboard(JSON.stringify({
                    intents: commands.map(cmd => ({
                      name: cmd.intent,
                      samples: [cmd.command]
                    }))
                  }, null, 2), 'Intent Schema')}
                >
                  {copied === 'Intent Schema' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
{JSON.stringify({
  intents: commands.map(cmd => ({
    name: cmd.intent,
    samples: [cmd.command]
  }))
}, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
          </div>
        )}
      </div>
    </div>
  );
}
