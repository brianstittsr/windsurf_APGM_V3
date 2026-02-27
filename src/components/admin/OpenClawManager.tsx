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
  Wifi, 
  WifiOff,
  MessageSquare, 
  Phone, 
  Check, 
  AlertCircle, 
  Copy, 
  CheckCircle,
  Activity,
  Settings,
  BarChart3,
  MessageCircle,
  Smartphone,
  Send,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface OpenClawConfig {
  gatewayUrl?: string;
  gatewayPort?: number;
  enabled?: boolean;
  channels?: {
    whatsapp?: { enabled: boolean; paired: boolean };
    telegram?: { enabled: boolean; botToken?: string };
    sms?: { enabled: boolean; provider?: string };
    webchat?: { enabled: boolean };
  };
}

interface GatewayStatus {
  connected: boolean;
  uptime?: number;
  version?: string;
  activeChannels?: string[];
}

interface ConversationLog {
  id: string;
  channel: string;
  customer: string;
  message: string;
  timestamp: Date;
  intent?: string;
}

export default function OpenClawManager() {
  const [activeTab, setActiveTab] = useState<'gateway' | 'channels' | 'skills' | 'logs' | 'analytics'>('gateway');
  const [config, setConfig] = useState<OpenClawConfig>({
    gatewayUrl: 'ws://127.0.0.1',
    gatewayPort: 18789,
    enabled: false,
    channels: {
      whatsapp: { enabled: false, paired: false },
      telegram: { enabled: false },
      sms: { enabled: false },
      webchat: { enabled: true }
    }
  });
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatus>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [logs, setLogs] = useState<ConversationLog[]>([]);

  useEffect(() => {
    loadConfig();
    checkGatewayStatus();
    const interval = setInterval(checkGatewayStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadConfig = async () => {
    try {
      const docRef = doc(getDb(), 'integrationSettings', 'openclaw');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setConfig(docSnap.data() as OpenClawConfig);
      }
    } catch (error) {
      console.error('Error loading OpenClaw config:', error);
      toast.error('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const docRef = doc(getDb(), 'integrationSettings', 'openclaw');
      await setDoc(docRef, {
        ...config,
        updatedAt: new Date()
      });
      toast.success('Configuration saved successfully');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const checkGatewayStatus = async () => {
    try {
      const response = await fetch('/api/openclaw/status');
      if (response.ok) {
        const data = await response.json();
        setGatewayStatus(data);
      } else {
        setGatewayStatus({ connected: false });
      }
    } catch (error) {
      setGatewayStatus({ connected: false });
    }
  };

  const testConnection = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/openclaw/test', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Connection successful!');
        checkGatewayStatus();
      } else {
        toast.error('Connection failed: ' + data.error);
      }
    } catch (error) {
      toast.error('Connection test failed');
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="h-8 w-8 animate-spin text-[#AD6269]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#AD6269]/10 rounded-lg">
          <MessageCircle className="h-6 w-6 text-[#AD6269]" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">OpenClaw Integration</h2>
          <p className="text-sm text-gray-500">Multi-channel AI booking assistant</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {gatewayStatus.connected ? (
            <div className="flex items-center gap-2 text-green-600">
              <Wifi className="h-4 w-4" />
              <span className="text-sm font-medium">Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <WifiOff className="h-4 w-4" />
              <span className="text-sm font-medium">Disconnected</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('gateway')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'gateway'
                ? 'border-[#AD6269] text-[#AD6269]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Gateway Status
            </div>
          </button>
          <button
            onClick={() => setActiveTab('channels')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'channels'
                ? 'border-[#AD6269] text-[#AD6269]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Channels
            </div>
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'skills'
                ? 'border-[#AD6269] text-[#AD6269]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Booking Skills
            </div>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'logs'
                ? 'border-[#AD6269] text-[#AD6269]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Conversation Logs
            </div>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'analytics'
                ? 'border-[#AD6269] text-[#AD6269]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </div>
          </button>
        </div>

        {/* Gateway Status Tab */}
        {activeTab === 'gateway' && (
          <div className="space-y-6">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                <CardTitle className="text-base font-semibold text-gray-900">Gateway Configuration</CardTitle>
                <CardDescription>Configure your OpenClaw Gateway connection</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Prerequisites:</strong> OpenClaw must be installed and running on your server. 
                    Run: <code className="bg-blue-100 px-1 rounded">npm install -g openclaw@latest</code>
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Gateway URL</Label>
                    <Input
                      value={config.gatewayUrl}
                      onChange={(e) => setConfig({ ...config, gatewayUrl: e.target.value })}
                      placeholder="ws://127.0.0.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Gateway Port</Label>
                    <Input
                      type="number"
                      value={config.gatewayPort}
                      onChange={(e) => setConfig({ ...config, gatewayPort: parseInt(e.target.value) })}
                      placeholder="18789"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={config.enabled}
                    onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="enabled" className="cursor-pointer">Enable OpenClaw Integration</Label>
                </div>

                {gatewayStatus.connected && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-green-800 font-medium">
                      <CheckCircle className="h-5 w-5" />
                      Gateway Connected
                    </div>
                    {gatewayStatus.version && (
                      <p className="text-sm text-green-700">Version: {gatewayStatus.version}</p>
                    )}
                    {gatewayStatus.uptime && (
                      <p className="text-sm text-green-700">Uptime: {Math.floor(gatewayStatus.uptime / 3600)}h {Math.floor((gatewayStatus.uptime % 3600) / 60)}m</p>
                    )}
                    {gatewayStatus.activeChannels && gatewayStatus.activeChannels.length > 0 && (
                      <p className="text-sm text-green-700">Active Channels: {gatewayStatus.activeChannels.join(', ')}</p>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={saveConfig}
                    disabled={saving}
                    className="bg-[#AD6269] hover:bg-[#8B4F54]"
                  >
                    {saving ? 'Saving...' : 'Save Configuration'}
                  </Button>
                  <Button
                    onClick={testConnection}
                    disabled={testing}
                    variant="outline"
                  >
                    {testing ? 'Testing...' : 'Test Connection'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                <CardTitle className="text-base font-semibold text-gray-900">Installation Instructions</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">1. Install OpenClaw</h4>
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
npm install -g openclaw@latest
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">2. Initialize Gateway</h4>
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
openclaw onboard --install-daemon
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">3. Start Gateway</h4>
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
openclaw gateway --port 18789 --verbose
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">4. Configure Webhook</h4>
                    <p className="text-sm text-gray-600 mb-2">Add this webhook URL to your OpenClaw config:</p>
                    <div className="flex items-center gap-2">
                      <Input
                        value={`${window.location.origin}/api/openclaw/webhook`}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(`${window.location.origin}/api/openclaw/webhook`, 'Webhook URL')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Channels Tab */}
        {activeTab === 'channels' && (
          <div className="space-y-6">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                <CardTitle className="text-base font-semibold text-gray-900">Messaging Channels</CardTitle>
                <CardDescription>Configure channels for customer communication</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* WhatsApp */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-green-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">WhatsApp</h4>
                        <p className="text-sm text-gray-600">Most popular messaging platform</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.channels?.whatsapp?.enabled}
                      onChange={(e) => setConfig({
                        ...config,
                        channels: {
                          ...config.channels,
                          whatsapp: { ...config.channels?.whatsapp, enabled: e.target.checked }
                        }
                      })}
                      className="rounded border-gray-300"
                    />
                  </div>
                  {config.channels?.whatsapp?.enabled && (
                    <div className="space-y-2 mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        Status: {config.channels.whatsapp.paired ? (
                          <span className="text-green-600 font-medium">✓ Paired</span>
                        ) : (
                          <span className="text-orange-600 font-medium">⚠ Not Paired</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">
                        Run: <code className="bg-gray-100 px-1 rounded">openclaw channels login</code>
                      </p>
                    </div>
                  )}
                </div>

                {/* Telegram */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Send className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">Telegram</h4>
                        <p className="text-sm text-gray-600">Fast and secure messaging</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.channels?.telegram?.enabled}
                      onChange={(e) => setConfig({
                        ...config,
                        channels: {
                          ...config.channels,
                          telegram: { ...config.channels?.telegram, enabled: e.target.checked }
                        }
                      })}
                      className="rounded border-gray-300"
                    />
                  </div>
                  {config.channels?.telegram?.enabled && (
                    <div className="space-y-2 mt-3 pt-3 border-t border-gray-200">
                      <Label>Bot Token</Label>
                      <Input
                        type="password"
                        value={config.channels.telegram.botToken || ''}
                        onChange={(e) => setConfig({
                          ...config,
                          channels: {
                            ...config.channels,
                            telegram: { ...config.channels?.telegram, botToken: e.target.value }
                          }
                        })}
                        placeholder="123456:ABCDEF..."
                      />
                      <p className="text-xs text-gray-500">Get from @BotFather on Telegram</p>
                    </div>
                  )}
                </div>

                {/* SMS */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-purple-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">SMS</h4>
                        <p className="text-sm text-gray-600">Text message support</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.channels?.sms?.enabled}
                      onChange={(e) => setConfig({
                        ...config,
                        channels: {
                          ...config.channels,
                          sms: { ...config.channels?.sms, enabled: e.target.checked }
                        }
                      })}
                      className="rounded border-gray-300"
                    />
                  </div>
                  {config.channels?.sms?.enabled && (
                    <div className="space-y-2 mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        Configure via existing SMS integration (Twilio/GHL)
                      </p>
                    </div>
                  )}
                </div>

                {/* WebChat */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="h-5 w-5 text-[#AD6269]" />
                      <div>
                        <h4 className="font-medium text-gray-900">WebChat</h4>
                        <p className="text-sm text-gray-600">Website chat widget</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.channels?.webchat?.enabled}
                      onChange={(e) => setConfig({
                        ...config,
                        channels: {
                          ...config.channels,
                          webchat: { ...config.channels?.webchat, enabled: e.target.checked }
                        }
                      })}
                      className="rounded border-gray-300"
                    />
                  </div>
                  {config.channels?.webchat?.enabled && (
                    <div className="space-y-2 mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-green-600 font-medium">✓ Active</p>
                      <p className="text-sm text-gray-600">
                        Embed code available in OpenClaw dashboard
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  onClick={saveConfig}
                  disabled={saving}
                  className="bg-[#AD6269] hover:bg-[#8B4F54] w-full"
                >
                  {saving ? 'Saving...' : 'Save Channel Configuration'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                <CardTitle className="text-base font-semibold text-gray-900">Booking Skills</CardTitle>
                <CardDescription>AI skills for automated booking tasks</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {[
                    { name: 'pmu_check_availability', description: 'Check artist availability for booking', enabled: true },
                    { name: 'pmu_book_appointment', description: 'Create new appointment booking', enabled: true },
                    { name: 'pmu_reschedule', description: 'Modify existing appointment', enabled: true },
                    { name: 'pmu_cancel', description: 'Cancel appointment', enabled: true },
                    { name: 'pmu_get_services', description: 'List available PMU services', enabled: true },
                    { name: 'pmu_get_pricing', description: 'Get service pricing information', enabled: true },
                  ].map((skill) => (
                    <div key={skill.name} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 font-mono text-sm">{skill.name}</h4>
                        <p className="text-sm text-gray-600">{skill.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {skill.enabled ? (
                          <span className="text-green-600 text-sm font-medium">✓ Enabled</span>
                        ) : (
                          <span className="text-gray-400 text-sm">Disabled</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                <CardTitle className="text-base font-semibold text-gray-900">Conversation Logs</CardTitle>
                <CardDescription>Recent customer interactions</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {logs.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No conversations yet</p>
                    <p className="text-sm mt-1">Logs will appear here once customers start messaging</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {logs.map((log) => (
                      <div key={log.id} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{log.customer}</span>
                          <span className="text-xs text-gray-500">{log.channel}</span>
                        </div>
                        <p className="text-sm text-gray-700">{log.message}</p>
                        {log.intent && (
                          <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {log.intent}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-[#AD6269]" />
                    <div className="text-2xl font-bold text-gray-900">0</div>
                    <div className="text-sm text-gray-600">Total Messages</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold text-gray-900">0</div>
                    <div className="text-sm text-gray-600">Bookings Created</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <Activity className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold text-gray-900">0%</div>
                    <div className="text-sm text-gray-600">Conversion Rate</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                <CardTitle className="text-base font-semibold text-gray-900">Channel Performance</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-12 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Analytics will appear once you start receiving messages</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
