'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Plus, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Bot,
  MessageSquare,
  Activity,
  BarChart3,
  RefreshCw,
  Users,
  UserCheck,
  Clock,
  X,
  Eye,
  Edit,
  Trash2,
  Play,
  ArrowRight,
  Save
} from 'lucide-react';
import { toast } from 'sonner';
import EmailConnectionWizard from './EmailConnectionWizard';
import EmailManagementInterface from './EmailManagementInterface';

// Custom Modal Component
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

function Modal({ open, onClose, title, description, children, size = 'md' }: ModalProps) {
  if (!open) return null;
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} mx-4 max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {description && <p className="text-sm text-gray-500">{description}</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {children}
        </div>
      </div>
    </div>
  );
}

interface EmailIntegrationConfig {
  enabled: boolean;
  gmailConnected: boolean;
  outlookConnected: boolean;
  autoResponses: boolean;
  conversationTracking: boolean;
  emailFiltering: boolean;
  syncFrequency: string;
  connectedAccounts: Array<{
    id: string;
    provider: 'google' | 'microsoft';
    email: string;
    status: 'connected' | 'disconnected' | 'error';
    lastSync?: Date;
  }>;
}

interface EmailAnalytics {
  totalEmails: number;
  unreadEmails: number;
  sentEmails: number;
  autoResponses: number;
  conversations: number;
  lastSync: Date;
}

export default function OpenClawEmailIntegration() {
  const [activeTab, setActiveTab] = useState<'overview' | 'wizard' | 'management' | 'analytics'>('overview');
  const [emailConfig, setEmailConfig] = useState<EmailIntegrationConfig>({
    enabled: true,
    gmailConnected: false,
    outlookConnected: false,
    autoResponses: true,
    conversationTracking: true,
    emailFiltering: true,
    syncFrequency: '15min',
    connectedAccounts: []
  });
  const [emailAnalytics, setEmailAnalytics] = useState<EmailAnalytics>({
    totalEmails: 0,
    unreadEmails: 0,
    sentEmails: 0,
    autoResponses: 0,
    conversations: 0,
    lastSync: new Date()
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Modal states
  const [wizardModalOpen, setWizardModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  useEffect(() => {
    loadEmailConfiguration();
  }, []);

  const loadEmailConfiguration = async () => {
    try {
      // In a real implementation, this would load from Firestore
      // For now, we'll use mock data
      const mockConfig: EmailIntegrationConfig = {
        enabled: true,
        gmailConnected: true,
        outlookConnected: false,
        autoResponses: true,
        conversationTracking: true,
        emailFiltering: true,
        syncFrequency: '15min',
        connectedAccounts: [
          {
            id: 'google-1',
            provider: 'google',
            email: 'user@gmail.com',
            status: 'connected',
            lastSync: new Date(Date.now() - 5 * 60 * 1000)
          }
        ]
      };

      const mockAnalytics: EmailAnalytics = {
        totalEmails: 156,
        unreadEmails: 23,
        sentEmails: 89,
        autoResponses: 34,
        conversations: 67,
        lastSync: new Date(Date.now() - 5 * 60 * 1000)
      };

      setEmailConfig(mockConfig);
      setEmailAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error loading email configuration:', error);
      toast.error('Failed to load email configuration');
    } finally {
      setLoading(false);
    }
  };

  const saveEmailConfiguration = async () => {
    setSaving(true);
    try {
      // In a real implementation, this would save to Firestore
      console.log('Saving email configuration:', emailConfig);
      toast.success('Email configuration saved successfully');
    } catch (error) {
      console.error('Error saving email configuration:', error);
      toast.error('Failed to save email configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleAccountConnection = (provider: 'google' | 'microsoft', connected: boolean) => {
    setEmailConfig(prev => ({
      ...prev,
      [`${provider}Connected`]: connected,
      connectedAccounts: connected 
        ? [...prev.connectedAccounts, {
            id: `${provider}-${Date.now()}`,
            provider,
            email: `user@${provider === 'google' ? 'gmail' : 'outlook'}.com`,
            status: 'connected',
            lastSync: new Date()
          }]
        : prev.connectedAccounts.filter(acc => acc.provider !== provider)
    }));
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Emails</p>
              <p className="text-2xl font-bold">{emailAnalytics.totalEmails}</p>
            </div>
            <Mail className="w-8 h-8 text-blue-500" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Unread Emails</p>
              <p className="text-2xl font-bold text-orange-600">{emailAnalytics.unreadEmails}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-orange-500" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Auto Responses</p>
              <p className="text-2xl font-bold text-green-600">{emailAnalytics.autoResponses}</p>
            </div>
            <Bot className="w-8 h-8 text-green-500" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Conversations</p>
              <p className="text-2xl font-bold text-purple-600">{emailAnalytics.conversations}</p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </CardContent>
        </Card>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Account Connections
          </CardTitle>
          <CardDescription>
            Manage your connected email accounts for automated email management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className={`border-2 ${emailConfig.gmailConnected ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    emailConfig.gmailConnected ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  <div>
                    <p className="font-medium">Google Gmail</p>
                    <p className="text-sm text-muted-foreground">
                      {emailConfig.gmailConnected ? 'Connected' : 'Not connected'}
                    </p>
                  </div>
                </div>
                <Badge variant={emailConfig.gmailConnected ? 'default' : 'secondary'}>
                  {emailConfig.gmailConnected ? 'Active' : 'Inactive'}
                </Badge>
              </CardContent>
            </Card>

            <Card className={`border-2 ${emailConfig.outlookConnected ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    emailConfig.outlookConnected ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  <div>
                    <p className="font-medium">Microsoft Outlook</p>
                    <p className="text-sm text-muted-foreground">
                      {emailConfig.outlookConnected ? 'Connected' : 'Not connected'}
                    </p>
                  </div>
                </div>
                <Badge variant={emailConfig.outlookConnected ? 'default' : 'secondary'}>
                  {emailConfig.outlookConnected ? 'Active' : 'Inactive'}
                </Badge>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={() => setWizardModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Connect Email Account
            </Button>
            <Button variant="outline" onClick={() => setSettingsModalOpen(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Automation Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Automation Features
          </CardTitle>
          <CardDescription>
            Configure automated email management features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Auto Responses</p>
                <p className="text-sm text-muted-foreground">Automatically respond to inquiries</p>
              </div>
              <Badge variant={emailConfig.autoResponses ? 'default' : 'secondary'}>
                {emailConfig.autoResponses ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Conversation Tracking</p>
                <p className="text-sm text-muted-foreground">Track email conversations</p>
              </div>
              <Badge variant={emailConfig.conversationTracking ? 'default' : 'secondary'}>
                {emailConfig.conversationTracking ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Email Filtering</p>
                <p className="text-sm text-muted-foreground">Filter and categorize emails</p>
              </div>
              <Badge variant={emailConfig.emailFiltering ? 'default' : 'secondary'}>
                {emailConfig.emailFiltering ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Email Activity
          </CardTitle>
          <CardDescription>
            Latest email management activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">Auto response sent</p>
                  <p className="text-sm text-muted-foreground">Appointment inquiry from client@email.com</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">2 min ago</p>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium">Email synced</p>
                  <p className="text-sm text-muted-foreground">Gmail account synchronized</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">5 min ago</p>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Bot className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-medium">Conversation tracked</p>
                  <p className="text-sm text-muted-foreground">Booking conversation updated</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">12 min ago</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Integration Settings</CardTitle>
          <CardDescription>
            Configure your email integration preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sync Frequency</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={emailConfig.syncFrequency}
                onChange={(e) => setEmailConfig(prev => ({ ...prev, syncFrequency: e.target.value }))}
              >
                <option value="5min">Every 5 minutes</option>
                <option value="15min">Every 15 minutes</option>
                <option value="30min">Every 30 minutes</option>
                <option value="1hour">Every hour</option>
                <option value="manual">Manual only</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Automation Features</h4>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Auto Responses</label>
                <p className="text-sm text-muted-foreground">Automatically respond to common inquiries</p>
              </div>
              <input 
                type="checkbox" 
                checked={emailConfig.autoResponses}
                onChange={(e) => setEmailConfig(prev => ({ ...prev, autoResponses: e.target.checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Conversation Tracking</label>
                <p className="text-sm text-muted-foreground">Track email conversations and threads</p>
              </div>
              <input 
                type="checkbox" 
                checked={emailConfig.conversationTracking}
                onChange={(e) => setEmailConfig(prev => ({ ...prev, conversationTracking: e.target.checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Email Filtering</label>
                <p className="text-sm text-muted-foreground">Filter and categorize incoming emails</p>
              </div>
              <input 
                type="checkbox" 
                checked={emailConfig.emailFiltering}
                onChange={(e) => setEmailConfig(prev => ({ ...prev, emailFiltering: e.target.checked }))}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <Button onClick={saveEmailConfiguration} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">OpenClaw Email Integration</h1>
          <p className="text-muted-foreground">
            Manage email connections and automated email workflows
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={emailConfig.enabled ? 'default' : 'secondary'}>
            {emailConfig.enabled ? 'Enabled' : 'Disabled'}
          </Badge>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="wizard">Connection Wizard</TabsTrigger>
          <TabsTrigger value="management">Email Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          {renderOverview()}
        </TabsContent>
        
        <TabsContent value="wizard">
          <Card>
            <CardHeader>
              <CardTitle>Email Connection Wizard</CardTitle>
              <CardDescription>
                Connect your Google and Microsoft email accounts to OpenClaw
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailConnectionWizard />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="management">
          <EmailManagementInterface />
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Email Analytics</CardTitle>
              <CardDescription>
                View email management statistics and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Email analytics dashboard will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Connection Wizard Modal */}
      <Modal
        open={wizardModalOpen}
        onClose={() => setWizardModalOpen(false)}
        title="Email Connection Wizard"
        description="Connect your email accounts to OpenClaw"
        size="xl"
      >
        <EmailConnectionWizard />
      </Modal>

      {/* Settings Modal */}
      <Modal
        open={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        title="Email Integration Settings"
        description="Configure your email integration preferences"
        size="lg"
      >
        {renderSettings()}
      </Modal>
    </div>
  );
}
